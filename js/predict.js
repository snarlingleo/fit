/* ============================================================
   FitTracker Pro — Predict v3.0
   Prédiction PRs + Analyse + Recommandations + Supersets
   ============================================================ */

const Predict = {

  // ════════════════════════════════════════════════════════
  // CONFIG
  // ════════════════════════════════════════════════════════
  CONFIG: {
    minSeancesPourPredire: 3,
    horizonJours:          30,
    seuilConfiance:        0.55,
    tauxProgressionMoyen:  0.025
  },

  // ════════════════════════════════════════════════════════
  // ANALYSER PROGRESSION
  // ════════════════════════════════════════════════════════
  analyserProgression(exerciceRef) {
    try {
      const hist = Tracker.getHistoriqueExercice(
        exerciceRef, 100
      );
      if (hist.length < this.CONFIG.minSeancesPourPredire) {
        return {
          suffisant: false,
          raison: 'Pas assez de données'
        };
      }

      const data = hist
        .sort((a,b) => (a.date||'').localeCompare(b.date||''))
        .filter(h => (h.rm1||0) > 0);

      if (data.length < 2) return { suffisant:false };

      // Régression linéaire sur le 1RM
      const n    = data.length;
      const xs   = data.map((_,i) => i);
      const ys   = data.map(d => d.rm1);

      const xMoy = xs.reduce((a,b) => a+b, 0) / n;
      const yMoy = ys.reduce((a,b) => a+b, 0) / n;

      const num  = xs.reduce(
        (acc, x, i) => acc + (x-xMoy)*(ys[i]-yMoy), 0
      );
      const den  = xs.reduce(
        (acc, x) => acc + Math.pow(x-xMoy, 2), 0
      );

      const pente  = den !== 0 ? num / den : 0;
      const offset = yMoy - pente * xMoy;

      // R² coefficient de détermination
      const ssRes = ys.reduce(
        (acc, y, i) => acc + Math.pow(y-(pente*i+offset), 2), 0
      );
      const ssTot = ys.reduce(
        (acc, y) => acc + Math.pow(y-yMoy, 2), 0
      );
      const r2 = ssTot !== 0 ? 1 - ssRes/ssTot : 0;

      // Taux progression hebdomadaire
      const d0 = new Date(data[0].date + 'T00:00:00');
      const dN = new Date(
        data[data.length-1].date + 'T00:00:00'
      );
      const semaines = Math.max(
        1, (dN-d0) / (1000*60*60*24*7)
      );

      const rm1Debut  = data[0].rm1;
      const rm1Final  = data[data.length-1].rm1;
      const tauxHebdo = rm1Debut > 0
        ? ((rm1Final - rm1Debut) / rm1Debut) / semaines
        : 0;

      return {
        suffisant:   true,
        data,
        pente, offset,
        r2:          Math.max(0, Math.min(1, r2)),
        confiance:   Math.max(0, Math.min(1, r2)),
        tauxHebdo,
        rm1Actuel:   rm1Final,
        rm1Debut,
        semaines,
        progression: Utils.arrondir(
          rm1Debut > 0
            ? ((rm1Final-rm1Debut)/rm1Debut)*100
            : 0
        )
      };
    } catch(e) {
      return { suffisant:false, raison:'Erreur calcul' };
    }
  },

  // ════════════════════════════════════════════════════════
  // PRÉDIRE PROCHAIN PR
  // ════════════════════════════════════════════════════════
  predireProchainPR(exerciceRef) {
    try {
      const analyse = this.analyserProgression(exerciceRef);
      if (!analyse.suffisant) return null;

      let pr = null, phase = { nom:'Reprise', intensite:0.65 };
      try { pr    = Tracker.getPR(exerciceRef);       } catch(e) {}
      try { phase = Programme.getPhaseActuelle();     } catch(e) {}

      const rm1Actuel = pr?.rm1 || analyse.rm1Actuel;

      // Multiplicateur selon phase
      const mult =
        phase.nom === 'Peak'        ? 1.3 :
        phase.nom === 'Intensité'   ? 1.2 :
        phase.nom === 'Construction'? 1.0 : 0.7;

      const tauxEffectif = Math.max(
        0.005, Math.min(0.08, analyse.tauxHebdo * mult)
      );

      const prochainRM1 = Math.round(
        rm1Actuel * (1 + tauxEffectif)
      );
      const deltaRM1    = prochainRM1 - rm1Actuel;

      const seancesEstimees = Math.max(1, Math.round(
        deltaRM1 / Math.max(0.01, rm1Actuel * tauxEffectif / 2)
      ));

      let seancesParSemaine = 3;
      try {
        seancesParSemaine =
          Tracker.getSeancesParSemaine() || 3;
      } catch(e) {}

      const joursEstimes = Math.round(
        (seancesEstimees / seancesParSemaine) * 7
      );
      const dateEstimee  = Utils.ajouterJours(
        Utils.aujourd_hui(), joursEstimes
      );

      const confiance = Math.min(0.95,
        analyse.confiance * 0.7
        + (analyse.semaines > 4 ? 0.2 : 0.1)
        + (seancesEstimees <= 5 ? 0.1 : 0.05)
      );

      return {
        exerciceRef,
        rm1Actuel,
        rm1Predit:      prochainRM1,
        delta:          deltaRM1,
        seancesEstimees,
        joursEstimes,
        dateEstimee,
        confiance,
        fiabilite:      this._niveauFiabilite(confiance),
        tauxHebdo:      Utils.arrondir(tauxEffectif * 100),
        phase:          phase.nom,
        analyse
      };
    } catch(e) { return null; }
  },

  // ════════════════════════════════════════════════════════
  // PRÉDIRE TOUS LES EXERCICES
  // ════════════════════════════════════════════════════════
  predireTout() {
    try {
      const prs = Tracker.getAllPRs();
      const res = [];

      Object.keys(prs).forEach(ref => {
        try {
          const p = this.predireProchainPR(ref);
          if (p && p.confiance >= this.CONFIG.seuilConfiance) {
            res.push(p);
          }
        } catch(e) {}
      });

      return res.sort((a,b) => b.confiance - a.confiance);
    } catch(e) { return []; }
  },

  // ════════════════════════════════════════════════════════
  // DÉTECTER STAGNATION
  // ════════════════════════════════════════════════════════
  detecterStagnation(exerciceRef) {
    try {
      const hist = Tracker.getHistoriqueExercice(
        exerciceRef, 20
      );
      if (hist.length < 4) return null;

      const recent = hist
        .sort((a,b) =>
          (b.date||'').localeCompare(a.date||'')
        )
        .slice(0, 6);

      const rm1s = recent.map(h => h.rm1).filter(v => v > 0);
      if (rm1s.length < 3) return null;

      const max  = Math.max(...rm1s);
      const min  = Math.min(...rm1s);
      const variation = max > 0 ? (max-min)/max : 0;

      // Régression : derniers 3 < premiers 3 de -3%
      const derniers = rm1s.slice(0, 3);
      const premiers = rm1s.slice(-3);
      const moyDern  = derniers.reduce((a,b)=>a+b,0)/derniers.length;
      const moyPrem  = premiers.reduce((a,b)=>a+b,0)/premiers.length;
      const regression = moyDern < moyPrem * 0.97;

      const stagne = variation < 0.03;

      return {
        stagne,
        regression,
        variation:    Utils.arrondir(variation * 100),
        dureeSeances: recent.length,
        conseils:     this._conseilsStagnation(
          stagne, regression, exerciceRef
        )
      };
    } catch(e) { return null; }
  },

  // ════════════════════════════════════════════════════════
  // ANALYSER FATIGUE
  // ════════════════════════════════════════════════════════
  analyserFatigue() {
    let rpe7j = 0, joursAbs = -1;
    let fatigue = null, seanceSem = 0;

    try { rpe7j     = Tracker.getRPEMoyen7Jours();     } catch(e) {}
    try { joursAbs  = Tracker.getJoursAbsence();       } catch(e) {}
    try { fatigue   = Tracker.getFatigue();            } catch(e) {}
    try { seanceSem = Tracker.getSeancesParSemaine();  } catch(e) {}

    const niveauFat = fatigue?.niveau || 0;

    let score = 100;
    if (rpe7j > 8.5)       score -= 30;
    else if (rpe7j > 7.5)  score -= 15;
    if (niveauFat >= 3)     score -= 25;
    else if (niveauFat >= 2)score -= 10;
    if (seanceSem >= 6)     score -= 20;
    if (joursAbs === 0)     score += 5;
    if (joursAbs >= 1
        && joursAbs <= 2)   score += 10;

    score = Math.max(0, Math.min(100, score));

    const recommandation =
      score >= 80 ? {
        action:  'GO',
        message: 'Tu es en pleine forme ! Parfait pour un PR.',
        couleur: 'var(--fd-mint)',
        emoji:   '🟢'
      } :
      score >= 60 ? {
        action:  'NORMAL',
        message: 'Bonne forme. Séance normale recommandée.',
        couleur: 'var(--fd-lemon)',
        emoji:   '🟡'
      } :
      score >= 40 ? {
        action:  'LEGER',
        message: 'Fatigue détectée. Séance légère conseillée.',
        couleur: 'var(--fd-coral)',
        emoji:   '🟠'
      } : {
        action:  'REPOS',
        message: 'Récupération nécessaire. Repos recommandé.',
        couleur: 'var(--fd-coral)',
        emoji:   '🔴'
      };

    return {
      score,
      rpe7j,
      niveauFatigue: niveauFat,
      seanceSemaine: seanceSem,
      joursAbsence:  joursAbs,
      recommandation
    };
  },

  // ════════════════════════════════════════════════════════
  // RECOMMANDER CHARGE
  // ════════════════════════════════════════════════════════
  recommanderCharge(exerciceRef) {
    try {
      let pr = null;
      let phase = { nom:'Reprise', intensite:0.65 };
      try { pr    = Tracker.getPR(exerciceRef);    } catch(e) {}
      try { phase = Programme.getPhaseActuelle();  } catch(e) {}
      if (!pr?.rm1) return null;

      const fatigue = this.analyserFatigue();

      // Ajuster selon fatigue
      const ajustFatigue =
        fatigue.score >= 80 ? 1.00 :
        fatigue.score >= 60 ? 0.97 :
        fatigue.score >= 40 ? 0.93 : 0.88;

      const chargeBase = pr.rm1 * phase.intensite * ajustFatigue;
      const charge     = Math.round(chargeBase / 2.5) * 2.5;

      const reps =
        phase.nom === 'Reprise'       ? '12-15' :
        phase.nom === 'Construction'  ? '8-12'  :
        phase.nom === 'Intensité'     ? '5-8'   :
        phase.nom === 'Décharge'      ? '15-20' : '3-5';

      const zones = [
        {
          label:   'Échauffement',
          pct:     50,
          charge:  Math.round(pr.rm1 * 0.5 / 2.5) * 2.5,
          series:  1, reps:'15',
          couleur: 'var(--fd-mint)'
        },
        {
          label:   'Activation',
          pct:     65,
          charge:  Math.round(pr.rm1 * 0.65 / 2.5) * 2.5,
          series:  2, reps:'10',
          couleur: 'var(--fd-lemon)'
        },
        {
          label:   'Travail',
          pct:     Math.round(phase.intensite * ajustFatigue * 100),
          charge,
          series:  4, reps,
          couleur: 'var(--fd-indigo)'
        },
        {
          label:   'Intensification',
          pct:     Math.round(phase.intensite * ajustFatigue * 100) + 5,
          charge:  Math.round(charge * 1.05 / 2.5) * 2.5,
          series:  2,
          reps:    reps.split('-')[0],
          couleur: 'var(--fd-lavender)'
        }
      ];

      return {
        exerciceRef,
        rm1:       pr.rm1,
        charge,
        reps,
        phase:     phase.nom,
        intensite: Math.round(phase.intensite * ajustFatigue * 100),
        zones,
        fatigue:   fatigue.recommandation,
        prediction: this.predireProchainPR(exerciceRef)
      };
    } catch(e) { return null; }
  },

  // ════════════════════════════════════════════════════════
  // PRÉDIRE OBJECTIF
  // ════════════════════════════════════════════════════════
  predireObjectif(objectif) {
    try {
      if (!objectif?.valeurCible || !objectif?.valeurActuelle) {
        return null;
      }

      const delta       = objectif.valeurCible - objectif.valeurActuelle;
      const exerciceRef = objectif.exerciceRef;

      if (exerciceRef) {
        const analyse = this.analyserProgression(exerciceRef);
        if (!analyse.suffisant) return null;

        const tauxHebdo = Math.max(0.01, analyse.tauxHebdo);
        const semsEst   = delta /
          Math.max(0.01, objectif.valeurActuelle * tauxHebdo);
        const dateEst   = Utils.ajouterJours(
          Utils.aujourd_hui(), Math.round(semsEst * 7)
        );

        return {
          type:             'force',
          semainesEstimees: Math.max(1, Math.round(semsEst)),
          dateEstimee:      dateEst,
          confiance:        analyse.confiance,
          progression:      Utils.arrondir(
            (objectif.valeurActuelle/objectif.valeurCible)*100
          )
        };
      }

      // Poids corporel — 0.5kg/semaine
      const semsEst = Math.abs(delta) / 0.5;
      const dateEst = Utils.ajouterJours(
        Utils.aujourd_hui(), Math.round(semsEst * 7)
      );

      return {
        type:             'poids',
        semainesEstimees: Math.max(1, Math.round(semsEst)),
        dateEstimee:      dateEst,
        confiance:        0.65,
        progression:      Utils.arrondir(
          (objectif.valeurActuelle/objectif.valeurCible)*100
        )
      };
    } catch(e) { return null; }
  },

  // ════════════════════════════════════════════════════════
  // ANALYSE GLOBALE
  // ════════════════════════════════════════════════════════
  getAnalyseGlobale() {
    const fatigue     = this.analyserFatigue();
    const predictions = this.predireTout().slice(0, 3);

    let seance = null, phase = { nom:'Reprise', emoji:'🌱' };
    try { seance = Programme.getSeanceduJour();  } catch(e) {}
    try { phase  = Programme.getPhaseActuelle(); } catch(e) {}

    // Opportunité PR aujourd'hui
    let opportunitePR = null;
    if (seance && fatigue.score >= 70) {
      const exosSeance = (seance.exercices||[])
        .map(e => e.ref || e);
      for (const ref of exosSeance) {
        try {
          const pred = this.predireProchainPR(ref);
          if (pred && pred.seancesEstimees <= 2) {
            opportunitePR = pred;
            break;
          }
        } catch(e) {}
      }
    }

    // Score global
    let prs = 0, seanceTot = 0;
    try { prs       = Object.keys(Tracker.getAllPRs()).length; } catch(e) {}
    try { seanceTot = Tracker.getTotalSeances();               } catch(e) {}

    const scoreGlobal = Math.min(100, Math.round(
      prs * 8 + seanceTot * 2 + fatigue.score * 0.3
    ));

    return {
      fatigue,
      predictions,
      opportunitePR,
      scoreGlobal,
      phase,
      conseilDuJour: this._conseilDuJour(
        fatigue, opportunitePR, phase
      )
    };
  },

  // ════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════
  render(container) {
    if (!container) return;

    const analyse     = this.getAnalyseGlobale();
    const predictions = this.predireTout();
    const fatigue     = analyse.fatigue;

    let refs = [];
    try { refs = Object.keys(Tracker.getAllPRs()); } catch(e) {}

    container.innerHTML = `

      <!-- Score forme -->
      <div class="card mb-md"
           style="background:linear-gradient(135deg,
                  ${fatigue.recommandation.couleur}22,
                  rgba(75,75,249,0.1));
                  border-color:${fatigue.recommandation.couleur}44">

        <div class="flex justify-between items-center mb-md">
          <div class="card-label">
            ${fatigue.recommandation.emoji} État de forme
          </div>
          <div style="font-size:1.8rem;font-weight:800;
                      color:${fatigue.recommandation.couleur}">
            ${fatigue.score}/100
          </div>
        </div>

        <div class="progress-bar mb-md">
          <div class="progress-fill"
               style="width:${fatigue.score}%;
                      background:${fatigue.recommandation.couleur}">
          </div>
        </div>

        <div style="font-size:.85rem;font-weight:600;
                    color:${fatigue.recommandation.couleur}">
          ${fatigue.recommandation.message}
        </div>

        <div class="stats-grid mt-md">
          <div class="stat-card">
            <span class="stat-value" style="font-size:.95rem">
              ${fatigue.rpe7j > 0 ? fatigue.rpe7j : '—'}
            </span>
            <span class="stat-label">RPE moy. 7j</span>
          </div>
          <div class="stat-card">
            <span class="stat-value" style="font-size:.95rem">
              ${fatigue.seanceSemaine}
            </span>
            <span class="stat-label">Séances/sem</span>
          </div>
          <div class="stat-card">
            <span class="stat-value" style="font-size:.95rem">
              ${fatigue.joursAbsence < 0
                ? '—' : fatigue.joursAbsence + 'j'}
            </span>
            <span class="stat-label">Dernière séance</span>
          </div>
          <div class="stat-card">
            <span class="stat-value" style="font-size:.95rem"
                  style="color:var(--fd-indigo)">
              ${analyse.scoreGlobal}
            </span>
            <span class="stat-label">Score global</span>
          </div>
        </div>
      </div>

      <!-- Conseil du jour -->
      ${analyse.conseilDuJour ? `
        <div class="card mb-md"
             style="border-color:var(--fd-lemon);
                    background:rgba(249,239,119,0.05)">
          <div class="card-label"
               style="color:var(--fd-lemon)">
            💡 Conseil du jour
          </div>
          <p style="font-size:.88rem;
                    margin-top:var(--space-sm);
                    color:var(--text-secondary);
                    line-height:1.5">
            ${analyse.conseilDuJour}
          </p>
        </div>` : ''}

      <!-- Opportunité PR -->
      ${analyse.opportunitePR ? (() => {
        const p  = analyse.opportunitePR;
        const ex = (window.EXERCICES||{})[p.exerciceRef]||{};
        return `
          <div class="card mb-md"
               style="border-color:var(--fd-lemon);
                      background:rgba(249,239,119,0.08)">
            <div class="card-label"
                 style="color:var(--fd-lemon)">
              🎯 Opportunité PR aujourd'hui !
            </div>
            <div style="margin-top:var(--space-md)">
              <div style="font-size:1.1rem;font-weight:700">
                ${ex.emoji||'💪'} ${ex.nom||p.exerciceRef}
              </div>
              <div style="font-size:.82rem;
                          color:var(--text-muted);
                          margin-top:4px">
                Record actuel :
                <strong style="color:var(--fd-indigo)">
                  ${p.rm1Actuel}kg 1RM
                </strong>
                → Objectif :
                <strong style="color:var(--fd-lemon)">
                  ${p.rm1Predit}kg 1RM
                </strong>
              </div>
              <div style="font-size:.78rem;
                          color:var(--fd-mint);
                          margin-top:4px;font-weight:600">
                🔥 Confiance : ${Math.round(p.confiance*100)}%
                · ~${p.joursEstimes} jours si tu n'y vas pas
              </div>
            </div>
          </div>`;
      })() : ''}

      <!-- Charge recommandée -->
      ${refs.length > 0 ? `
        <div class="section-title">
          ⚡ Charge recommandée
        </div>
        <div class="card mb-md">
          <div class="card-label">🔍 Choisir un exercice</div>
          <select id="sel-predict-exo"
                  class="input mt-md"
                  onchange="Predict._renderCharge(
                    this.value)">
            <option value="">-- Exercice --</option>
            ${refs.map(ref => {
              const ex = (window.EXERCICES||{})[ref]||{};
              return `
                <option value="${ref}">
                  ${ex.emoji||'💪'} ${ex.nom||ref}
                </option>`;
            }).join('')}
          </select>
          <div id="detail-charge"
               style="margin-top:var(--space-md)">
          </div>
        </div>` : ''}

      <!-- Supersets recommandés -->
      ${this._renderSupersets()}

      <!-- Prédictions PRs -->
      <div class="section-title">📈 Prédictions prochains PRs</div>

      ${predictions.length === 0 ? `
        <div class="card mb-md"
             style="text-align:center;
                    padding:var(--space-xl)">
          <div style="font-size:2rem;
                      margin-bottom:var(--space-sm)">📊</div>
          <div style="font-size:.88rem;color:var(--text-muted)">
            Pas encore assez de données.<br>
            Continue tes séances, les prédictions arrivent !
          </div>
        </div>` :

        predictions.map(pred => {
          const ex    = (window.EXERCICES||{})[pred.exerciceRef]||{};
          const pct   = Math.round(pred.confiance * 100);
          const cfCoul =
            pct >= 80 ? 'var(--fd-mint)' :
            pct >= 60 ? 'var(--fd-lemon)' : 'var(--fd-lavender)';

          return `
            <div class="card mb-md">
              <div class="flex justify-between items-center mb-md">
                <div style="font-size:1rem;font-weight:700">
                  ${ex.emoji||'💪'} ${ex.nom||pred.exerciceRef}
                </div>
                <div style="font-size:.72rem;font-weight:700;
                            color:${cfCoul};
                            background:${cfCoul}22;
                            padding:4px 10px;
                            border-radius:99px">
                  ${pred.fiabilite} ${pct}%
                </div>
              </div>

              <!-- Barre progression 1RM -->
              <div class="flex items-center justify-between mb-md">
                <div style="text-align:center">
                  <div style="font-size:1.4rem;font-weight:800;
                              color:var(--text-secondary)">
                    ${pred.rm1Actuel}kg
                  </div>
                  <div style="font-size:.65rem;
                              color:var(--text-muted)">
                    1RM actuel
                  </div>
                </div>
                <div style="flex:1;text-align:center;
                            padding:0 var(--space-md)">
                  <div style="font-size:.8rem;
                              color:var(--fd-mint);
                              font-weight:600">
                    +${pred.delta}kg
                  </div>
                  <div style="height:2px;
                              background:linear-gradient(
                                to right,
                                var(--text-muted),
                                var(--fd-lemon));
                              margin:4px 0;
                              border-radius:1px">
                  </div>
                  <div style="font-size:.65rem;
                              color:var(--text-muted)">
                    ~${pred.joursEstimes} jours
                  </div>
                </div>
                <div style="text-align:center">
                  <div style="font-size:1.4rem;font-weight:800;
                              color:var(--fd-lemon)">
                    ${pred.rm1Predit}kg
                  </div>
                  <div style="font-size:.65rem;
                              color:var(--text-muted)">
                    1RM prédit
                  </div>
                </div>
              </div>

              <!-- Détails -->
              <div style="display:grid;
                          grid-template-columns:repeat(3,1fr);
                          gap:var(--space-sm);
                          margin-bottom:var(--space-sm)">
                <div style="text-align:center;
                            padding:var(--space-sm);
                            background:var(--bg-input);
                            border-radius:var(--radius-sm)">
                  <div style="font-size:.82rem;font-weight:700;
                              color:var(--fd-indigo)">
                    ${pred.seancesEstimees}
                  </div>
                  <div style="font-size:.62rem;
                              color:var(--text-muted)">
                    séances
                  </div>
                </div>
                <div style="text-align:center;
                            padding:var(--space-sm);
                            background:var(--bg-input);
                            border-radius:var(--radius-sm)">
                  <div style="font-size:.82rem;font-weight:700;
                              color:var(--fd-mint)">
                    +${pred.tauxHebdo}%/sem
                  </div>
                  <div style="font-size:.62rem;
                              color:var(--text-muted)">
                    progression
                  </div>
                </div>
                <div style="text-align:center;
                            padding:var(--space-sm);
                            background:var(--bg-input);
                            border-radius:var(--radius-sm)">
                  <div style="font-size:.82rem;font-weight:700;
                              color:var(--fd-lavender)">
                    ${Utils.formatDateCourt(pred.dateEstimee)}
                  </div>
                  <div style="font-size:.62rem;
                              color:var(--text-muted)">
                    date estimée
                  </div>
                </div>
              </div>

              <!-- Phase -->
              <div style="font-size:.68rem;
                          color:var(--text-muted);
                          text-align:center">
                Phase ${pred.phase}
                · Taux ${pred.tauxHebdo}%/sem
              </div>

              <!-- Stagnation -->
              ${(() => {
                try {
                  const stag = Predict.detecterStagnation(
                    pred.exerciceRef
                  );
                  if (!stag) return '';
                  if (!stag.stagne && !stag.regression)
                    return '';
                  return `
                    <div style="margin-top:var(--space-sm);
                                padding:var(--space-sm);
                                background:rgba(255,141,150,0.1);
                                border:1px solid rgba(255,141,150,0.3);
                                border-radius:var(--radius-sm);
                                font-size:.75rem">
                      <div style="color:var(--fd-coral);
                                  font-weight:700;
                                  margin-bottom:4px">
                        ${stag.regression
                          ? '⚠️ Régression détectée'
                          : '📊 Stagnation détectée'}
                        (${stag.variation}%)
                      </div>
                      ${stag.conseils.map(c => `
                        <div style="color:var(--text-muted);
                                    margin-top:2px">
                          → ${c}
                        </div>`).join('')}
                    </div>`;
                } catch(e) { return ''; }
              })()}
            </div>`;
        }).join('')}

      <!-- Progression globale -->
      <div class="section-title">🎯 Progression depuis le début</div>
      <div class="card mb-md">
        ${refs.slice(0, 6).map(ref => {
          try {
            const analyse = this.analyserProgression(ref);
            if (!analyse.suffisant) return '';
            const ex  = (window.EXERCICES||{})[ref] || {};
            const prog = analyse.progression;
            const color = prog >= 0
              ? 'var(--fd-mint)' : 'var(--fd-coral)';

            return `
              <div style="padding:var(--space-sm) 0;
                          border-bottom:1px solid
                          var(--border-color)">
                <div class="flex justify-between
                            items-center mb-sm">
                  <span style="font-size:.85rem;
                               font-weight:600">
                    ${ex.emoji||'💪'} ${ex.nom||ref}
                  </span>
                  <span style="font-size:.82rem;
                               font-weight:700;
                               color:${color}">
                    ${prog >= 0 ? '+' : ''}${prog}%
                  </span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill"
                       style="width:${Math.max(5,
                         Math.min(100, 50+prog)
                       )}%;
                       background:${color}">
                  </div>
                </div>
                <div style="display:flex;
                            justify-content:space-between;
                            font-size:.65rem;
                            color:var(--text-muted);
                            margin-top:4px">
                  <span>${analyse.rm1Debut}kg</span>
                  <span>${analyse.semaines}sem</span>
                  <span>${analyse.rm1Actuel}kg</span>
                </div>
              </div>`;
          } catch(e) { return ''; }
        }).join('')}
      </div>

      <!-- Exercices à surveiller -->
      ${this._renderExercicesASurveiller(refs)}
    `;
  },

  // ════════════════════════════════════════════════════════
  // RENDER CHARGE DETAIL
  // ════════════════════════════════════════════════════════
  _renderCharge(ref) {
    const el = document.getElementById('detail-charge');
    if (!el || !ref) return;

    const reco = this.recommanderCharge(ref);
    if (!reco) {
      el.innerHTML = `
        <p style="color:var(--text-muted);font-size:.85rem;
                  text-align:center;padding:var(--space-md)">
          Pas assez de données pour cet exercice.<br>
          Lance quelques séances d'abord !
        </p>`;
      return;
    }

    el.innerHTML = `
      <div style="margin-bottom:var(--space-md)">
        <div style="font-size:.72rem;font-weight:700;
                    text-transform:uppercase;
                    letter-spacing:.06em;
                    color:var(--text-muted);
                    margin-bottom:var(--space-sm)">
          Zones d'entraînement — Phase ${reco.phase}
        </div>
        ${reco.zones.map(zone => `
          <div style="display:flex;align-items:center;
                      justify-content:space-between;
                      padding:var(--space-sm);
                      background:${zone.couleur}11;
                      border-left:3px solid ${zone.couleur};
                      border-radius:0 var(--radius-sm)
                                      var(--radius-sm) 0;
                      margin-bottom:var(--space-xs)">
            <div>
              <div style="font-size:.82rem;font-weight:700;
                          color:${zone.couleur}">
                ${zone.label}
              </div>
              <div style="font-size:.7rem;
                          color:var(--text-muted)">
                ${zone.series} × ${zone.reps} reps
              </div>
            </div>
            <div style="font-size:1.1rem;font-weight:800;
                        color:${zone.couleur};text-align:right">
              ${zone.charge}kg
              <div style="font-size:.65rem;
                          color:var(--text-muted);
                          font-weight:400">
                (${zone.pct}%)
              </div>
            </div>
          </div>`).join('')}
      </div>

      <div style="padding:var(--space-sm);
                  background:${reco.fatigue.couleur}11;
                  border:1px solid ${reco.fatigue.couleur}33;
                  border-radius:var(--radius-sm);
                  font-size:.78rem;
                  color:${reco.fatigue.couleur};
                  margin-bottom:var(--space-sm)">
        ${reco.fatigue.emoji} ${reco.fatigue.message}
      </div>

      ${reco.prediction ? `
        <div style="font-size:.75rem;
                    color:var(--text-muted);
                    text-align:center;
                    padding:var(--space-sm);
                    background:var(--bg-input);
                    border-radius:var(--radius-sm)">
          🎯 Prochain PR estimé :
          <strong style="color:var(--fd-lemon)">
            ${reco.prediction.rm1Predit}kg
          </strong>
          dans ~${reco.prediction.joursEstimes} jours
          (confiance ${Math.round(reco.prediction.confiance*100)}%)
        </div>` : ''}
    `;
  },

  // ════════════════════════════════════════════════════════
  // RENDER SUPERSETS RECOMMANDÉS
  // ════════════════════════════════════════════════════════
  _renderSupersets() {
    try {
      let seanceId = null;
      try {
        const idx = Utils.indexJourSemaine(Utils.aujourd_hui());
        seanceId  = PLANNING_SEMAINE?.[idx]?.seanceId;
      } catch(e) {}

      if (!seanceId) return '';

      let supersets = [];
      try {
        supersets = Programme.getSupersets?.(seanceId) || [];
      } catch(e) {}

      if (!supersets.length) return '';

      return `
        <div class="section-title">⚡ Supersets recommandés</div>
        <div class="card mb-md">
          ${supersets.map(ss => `
            <div style="padding:var(--space-sm) 0;
                        border-bottom:1px solid
                        var(--border-color)">
              <div style="font-size:.82rem;font-weight:700;
                          color:var(--fd-lavender);
                          margin-bottom:var(--space-xs)">
                ${ss.nom}
                <span class="chip chip-lavender"
                      style="margin-left:4px;
                             font-size:.6rem">
                  Superset
                </span>
              </div>
              ${ss.exercices.map((ex, i) => {
                const exo = (window.EXERCICES||{})[ex.ref]||{};
                return `
                  ${i > 0 ? `
                    <div class="superset-connector">
                      <span class="superset-connector-label">
                        + enchaîner
                      </span>
                    </div>` : ''}
                  <div style="display:flex;
                              justify-content:space-between;
                              align-items:center;
                              font-size:.82rem;
                              padding:4px 0">
                    <span>
                      ${exo.emoji||'💪'} ${exo.nom||ex.ref}
                    </span>
                    <span style="color:var(--fd-indigo);
                                 font-weight:600">
                      ${ex.series}×${ex.reps}
                    </span>
                  </div>`;
              }).join('')}
            </div>`).join('')}
          <div style="font-size:.72rem;color:var(--text-muted);
                      text-align:center;margin-top:var(--space-sm)">
            ⏱️ Repos entre exercices : 0s
            · Repos entre sets : 60-90s
          </div>
        </div>`;
    } catch(e) { return ''; }
  },

  // ════════════════════════════════════════════════════════
  // RENDER EXERCICES À SURVEILLER
  // ════════════════════════════════════════════════════════
  _renderExercicesASurveiller(refs) {
    try {
      const alertes = [];

      refs.forEach(ref => {
        try {
          const stag = this.detecterStagnation(ref);
          if (stag && (stag.stagne || stag.regression)) {
            const ex = (window.EXERCICES||{})[ref]||{};
            alertes.push({ ref, ex, stag });
          }
        } catch(e) {}
      });

      if (!alertes.length) return '';

      return `
        <div class="section-title">⚠️ Points d'attention</div>
        <div class="card mb-md"
             style="border-color:rgba(255,141,150,0.3)">
          ${alertes.map(a => `
            <div style="padding:var(--space-sm) 0;
                        border-bottom:1px solid
                        var(--border-color)">
              <div style="display:flex;
                          justify-content:space-between;
                          align-items:center">
                <div style="font-size:.85rem;font-weight:600">
                  ${a.ex.emoji||'💪'} ${a.ex.nom||a.ref}
                </div>
                <span class="chip chip-coral">
                  ${a.stag.regression
                    ? '📉 Régression' : '📊 Stagnation'}
                </span>
              </div>
              <div style="font-size:.75rem;
                          color:var(--text-muted);
                          margin-top:4px">
                Variation : ${a.stag.variation}%
                sur ${a.stag.dureeSeances} séances
              </div>
            </div>`).join('')}
        </div>`;
    } catch(e) { return ''; }
  },

  // ════════════════════════════════════════════════════════
  // HELPERS
  // ════════════════════════════════════════════════════════
  _niveauFiabilite(confiance) {
    if (confiance >= 0.85) return '🟢 Très fiable';
    if (confiance >= 0.70) return '🟡 Fiable';
    if (confiance >= 0.55) return '🟠 Indicatif';
    return '🔴 Incertain';
  },

  _conseilsStagnation(stagne, regression, ref) {
    const c = [];
    if (regression) {
      c.push('Augmente le temps de repos entre séances');
      c.push('Réduis le volume temporairement');
      c.push('Vérifie ta nutrition et ton sommeil');
    } else if (stagne) {
      c.push('Essaie une surcharge progressive (+2.5kg)');
      c.push('Change le nombre de reps ou de séries');
      c.push('Intègre une semaine de décharge');
    }
    return c;
  },

  _conseilDuJour(fatigue, opportunitePR, phase) {
    if (fatigue.recommandation.action === 'REPOS') {
      return '😴 Ton corps a besoin de récupération. '
           + 'Profite de ce repos pour bien manger et bien dormir. '
           + 'La progression continue au repos !';
    }
    if (opportunitePR) {
      const ex = (window.EXERCICES||{})[
        opportunitePR.exerciceRef
      ] || {};
      return `🎯 Tu es proche d'un record sur ${ex.nom||'cet exercice'}. `
           + `Cible ${opportunitePR.rm1Predit}kg aujourd'hui ! `
           + `Confiance : ${Math.round(opportunitePR.confiance*100)}%`;
    }
    if (phase.nom === 'Peak') {
      return '🏆 Tu es en phase Peak ! '
           + 'C\'est le moment de tout donner et de battre des records.';
    }
    if (phase.nom === 'Décharge') {
      return '😴 Semaine de décharge — charges légères, technique parfaite. '
           + 'Ton corps supercompense en ce moment. '
           + 'Le prochain cycle sera encore meilleur !';
    }
    if (fatigue.score >= 80) {
      return '💪 Tu es en pleine forme ! '
           + 'Pousse un peu plus fort aujourd\'hui, '
           + 'c\'est le bon moment pour progresser.';
    }
    return '🎯 Reste régulier et la progression viendra naturellement. '
         + 'Chaque séance compte, même les petites !';
  }
};

window.Predict = Predict;
console.log('✅ Predict v3.0 chargé');
