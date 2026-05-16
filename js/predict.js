/* ============================================================
   FitTracker Pro — Predict v1.0
   Prédiction PRs + Analyse progression + Recommandations
   ============================================================ */

const Predict = {

  // ─── CONFIG ───────────────────────────────────────────────
  CONFIG: {
    minSeancesPourPredire: 3,    // minimum de séances pour prédire
    horizonJours:          30,   // prédiction sur 30 jours
    seuilConfiance:        0.6,  // 60% minimum de confiance
    tauxProgressionMoyen:  0.025 // +2.5% par semaine en moyenne
  },

  // ─── ANALYSER PROGRESSION ─────────────────────────────────
  analyserProgression(exerciceRef) {
    const hist = Tracker.getHistoriqueExercice(exerciceRef, 100);
    if (hist.length < this.CONFIG.minSeancesPourPredire) {
      return { suffisant: false, raison: 'Pas assez de données' };
    }

    // Trier par date croissante
    const data = hist
      .sort((a,b) => a.date.localeCompare(b.date))
      .filter(h => h.rm1 > 0);

    if (data.length < 2) return { suffisant: false };

    // Régression linéaire simple sur le 1RM
    const n     = data.length;
    const xs    = data.map((_, i) => i);
    const ys    = data.map(d => d.rm1);

    const xMoy  = xs.reduce((a,b) => a+b, 0) / n;
    const yMoy  = ys.reduce((a,b) => a+b, 0) / n;

    const num   = xs.reduce((acc, x, i) =>
      acc + (x - xMoy) * (ys[i] - yMoy), 0
    );
    const den   = xs.reduce((acc, x) =>
      acc + Math.pow(x - xMoy, 2), 0
    );

    const pente  = den !== 0 ? num / den : 0;
    const offset = yMoy - pente * xMoy;

    // Coefficient de détermination R²
    const ssRes = ys.reduce((acc, y, i) =>
      acc + Math.pow(y - (pente * i + offset), 2), 0
    );
    const ssTot = ys.reduce((acc, y) =>
      acc + Math.pow(y - yMoy, 2), 0
    );
    const r2 = ssTot !== 0 ? 1 - ssRes/ssTot : 0;

    // Taux de progression hebdomadaire
    const premiereDate = new Date(data[0].date);
    const derniereDate = new Date(data[data.length-1].date);
    const semaines = Math.max(1,
      (derniereDate - premiereDate) / (1000*60*60*24*7)
    );
    const tauxHebdo = ((data[data.length-1].rm1 - data[0].rm1)
      / data[0].rm1) / semaines;

    return {
      suffisant:    true,
      data,
      pente,
      offset,
      r2:           Math.max(0, Math.min(1, r2)),
      confiance:    Math.max(0, Math.min(1, r2)),
      tauxHebdo,
      rm1Actuel:    data[data.length-1].rm1,
      rm1Debut:     data[0].rm1,
      semaines,
      progression:  Utils.arrondir(
        ((data[data.length-1].rm1 - data[0].rm1) / data[0].rm1) * 100
      )
    };
  },

  // ─── PRÉDIRE PROCHAIN PR ──────────────────────────────────
  predireProchainPR(exerciceRef) {
    const analyse = this.analyserProgression(exerciceRef);
    if (!analyse.suffisant) return null;

    const pr         = Tracker.getPR(exerciceRef);
    const rm1Actuel  = pr?.rm1 || analyse.rm1Actuel;
    const phase      = Programme.getPhaseActuelle();

    // Ajuster le taux selon la phase
    const multiplicateur =
      phase.nom === 'Peak'        ? 1.3 :
      phase.nom === 'Intensité'   ? 1.2 :
      phase.nom === 'Construction'? 1.0 :
      0.7; // Reprise

    const tauxEffectif = Math.max(
      0.005,
      Math.min(0.08, analyse.tauxHebdo * multiplicateur)
    );

    // Prédire dans combien de séances
    const prochainRM1    = Math.round(rm1Actuel * (1 + tauxEffectif));
    const deltaRM1       = prochainRM1 - rm1Actuel;
    const seancesEstimees = Math.max(1,
      Math.round(deltaRM1 / (rm1Actuel * tauxEffectif / 2))
    );

    // Date estimée
    const seancesParSemaine = Tracker.getSeancesParSemaine() || 3;
    const joursEstimes = Math.round(
      (seancesEstimees / seancesParSemaine) * 7
    );
    const dateEstimee = Utils.ajouterJours(
      Utils.aujourd_hui(), joursEstimes
    );

    // Confiance globale
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
  },

  // ─── PRÉDIRE TOUS LES EXERCICES ───────────────────────────
  predireTout() {
    const prs       = Tracker.getAllPRs();
    const resultats = [];

    Object.keys(prs).forEach(ref => {
      const prediction = this.predireProchainPR(ref);
      if (prediction && prediction.confiance >=
          this.CONFIG.seuilConfiance) {
        resultats.push(prediction);
      }
    });

    return resultats.sort((a,b) =>
      b.confiance - a.confiance
    );
  },

  // ─── DÉTECTER STAGNATION ──────────────────────────────────
  detecterStagnation(exerciceRef) {
    const hist = Tracker.getHistoriqueExercice(exerciceRef, 20);
    if (hist.length < 4) return null;

    const recent = hist
      .sort((a,b) => b.date.localeCompare(a.date))
      .slice(0, 6);

    const rm1s    = recent.map(h => h.rm1).filter(v => v > 0);
    if (rm1s.length < 3) return null;

    const max     = Math.max(...rm1s);
    const min     = Math.min(...rm1s);
    const variation = (max - min) / max;

    // Stagnation si variation < 3% sur 6 dernières séances
    const stagne  = variation < 0.03;

    // Régression si tendance baissière
    const derniers = rm1s.slice(0, 3);
    const premiers = rm1s.slice(-3);
    const moyDern  = derniers.reduce((a,b)=>a+b,0) / derniers.length;
    const moyPrem  = premiers.reduce((a,b)=>a+b,0) / premiers.length;
    const regression = moyDern < moyPrem * 0.97;

    return {
      stagne,
      regression,
      variation:    Utils.arrondir(variation * 100),
      dureeSeances: recent.length,
      conseils:     this._conseilsStagnation(stagne, regression, exerciceRef)
    };
  },

  // ─── ANALYSER FATIGUE & RÉCUPÉRATION ─────────────────────
  analyserFatigue() {
    const rpe7j      = Tracker.getRPEMoyen7Jours();
    const joursAbs   = Tracker.getJoursAbsence();
    const fatigue    = Tracker.getFatigue();
    const seanceSem  = Tracker.getSeancesParSemaine();

    const niveauFat  = fatigue?.niveau || 2;

    // Score récupération (0-100)
    let score = 100;
    if (rpe7j > 8.5)       score -= 30;
    else if (rpe7j > 7.5)  score -= 15;
    if (niveauFat >= 4)     score -= 25;
    else if (niveauFat >= 3)score -= 10;
    if (seanceSem >= 6)     score -= 20;
    if (joursAbs === 0)     score += 10;
    if (joursAbs >= 2)      score += 15;

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

  // ─── RECOMMANDATIONS CHARGE ───────────────────────────────
  recommanderCharge(exerciceRef) {
    const pr      = Tracker.getPR(exerciceRef);
    const phase   = Programme.getPhaseActuelle();
    const fatigue = this.analyserFatigue();

    if (!pr?.rm1) return null;

    // Ajuster selon fatigue
    const ajustFatigue =
      fatigue.score >= 80 ? 1.00 :
      fatigue.score >= 60 ? 0.97 :
      fatigue.score >= 40 ? 0.93 : 0.88;

    const chargeBase = pr.rm1 * phase.intensite * ajustFatigue;

    // Arrondir au 2.5kg le plus proche
    const charge = Math.round(chargeBase / 2.5) * 2.5;

    // Calculer les reps selon la phase
    const reps =
      phase.nom === 'Reprise'       ? '12-15' :
      phase.nom === 'Construction'  ? '8-12'  :
      phase.nom === 'Intensité'     ? '5-8'   : '3-5';

    // Zones d'entraînement
    const zones = [
      {
        label:    'Échauffement',
        pct:      50,
        charge:   Math.round(pr.rm1 * 0.5 / 2.5) * 2.5,
        series:   1, reps: '15', couleur: 'var(--fd-mint)'
      },
      {
        label:    'Activation',
        pct:      65,
        charge:   Math.round(pr.rm1 * 0.65 / 2.5) * 2.5,
        series:   2, reps: '10', couleur: 'var(--fd-lemon)'
      },
      {
        label:    'Travail',
        pct:      Math.round(phase.intensite * ajustFatigue * 100),
        charge,
        series:   4, reps, couleur: 'var(--fd-indigo)'
      },
      {
        label:    'Intensification',
        pct:      Math.round(phase.intensite * ajustFatigue * 100) + 5,
        charge:   Math.round(charge * 1.05 / 2.5) * 2.5,
        series:   2, reps: reps.split('-')[0],
        couleur:  'var(--fd-lavender)'
      }
    ];

    return {
      exerciceRef,
      rm1:      pr.rm1,
      charge,
      reps,
      phase:    phase.nom,
      intensite: Math.round(phase.intensite * ajustFatigue * 100),
      zones,
      fatigue:  fatigue.recommandation,
      prediction: this.predireProchainPR(exerciceRef)
    };
  },

  // ─── PRÉDIRE OBJECTIF ─────────────────────────────────────
  predireObjectif(objectif) {
    if (!objectif.valeurCible || !objectif.valeurActuelle) return null;

    const exerciceRef = objectif.exerciceRef;
    const delta       = objectif.valeurCible - objectif.valeurActuelle;

    if (exerciceRef) {
      // Objectif force — basé sur la progression réelle
      const analyse = this.analyserProgression(exerciceRef);
      if (!analyse.suffisant) return null;

      const tauxHebdo  = Math.max(0.01, analyse.tauxHebdo);
      const semainesEst = delta / (objectif.valeurActuelle * tauxHebdo);
      const dateEst    = Utils.ajouterJours(
        Utils.aujourd_hui(),
        Math.round(semainesEst * 7)
      );

      return {
        type:          'force',
        semainesEstimees: Math.round(semainesEst),
        dateEstimee:   dateEst,
        confiance:     analyse.confiance,
        progression:   Utils.arrondir(
          (objectif.valeurActuelle / objectif.valeurCible) * 100
        )
      };
    }

    // Objectif poids — estimation simple
    const tauxPerte = 0.5; // 0.5kg/semaine
    const semainesEst = Math.abs(delta) / tauxPerte;
    const dateEst = Utils.ajouterJours(
      Utils.aujourd_hui(),
      Math.round(semainesEst * 7)
    );

    return {
      type:          'poids',
      semainesEstimees: Math.round(semainesEst),
      dateEstimee:   dateEst,
      confiance:     0.65,
      progression:   Utils.arrondir(
        (objectif.valeurActuelle / objectif.valeurCible) * 100
      )
    };
  },

  // ─── ANALYSE GLOBALE SEMAINE ──────────────────────────────
  getAnalyseGlobale() {
    const fatigue      = this.analyserFatigue();
    const predictions  = this.predireTout().slice(0, 3);
    const seance       = Programme.getSeanceduJour();
    const phase        = Programme.getPhaseActuelle();

    // Meilleure opportunité de PR aujourd'hui
    let opportunitePR = null;
    if (seance && fatigue.score >= 70) {
      const exosSeance = seance.exercices?.map(e => e.ref) || [];
      for (const ref of exosSeance) {
        const pred = this.predireProchainPR(ref);
        if (pred && pred.seancesEstimees <= 2) {
          opportunitePR = pred;
          break;
        }
      }
    }

    // Score global de progression
    const prs       = Object.keys(Tracker.getAllPRs()).length;
    const seanceTot = Tracker.getTotalSeances();
    const scoreGlobal = Math.min(100, Math.round(
      (prs * 8) + (seanceTot * 2) + fatigue.score * 0.3
    ));

    return {
      fatigue,
      predictions,
      opportunitePR,
      scoreGlobal,
      phase,
      conseilDuJour: this._conseilDuJour(fatigue, opportunitePR, phase)
    };
  },

  // ─── RENDER ───────────────────────────────────────────────
  render(container) {
    if (!container) return;

    const analyse     = this.getAnalyseGlobale();
    const predictions = this.predireTout();
    const fatigue     = analyse.fatigue;
    const refs        = Object.keys(Tracker.getAllPRs());

    container.innerHTML = `

      <!-- Score récupération -->
      <div class="card mb-md"
           style="background:linear-gradient(135deg,
                  ${fatigue.recommandation.couleur}22 0%,
                  rgba(75,75,249,0.1) 100%);
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

        <div style="display:grid;grid-template-columns:repeat(3,1fr);
                    gap:var(--space-sm);margin-top:var(--space-md)">
          <div class="stat-card" style="padding:var(--space-sm)">
            <span class="stat-value" style="font-size:1rem">
              ${fatigue.rpe7j || '—'}
            </span>
            <span class="stat-label">RPE moy. 7j</span>
          </div>
          <div class="stat-card" style="padding:var(--space-sm)">
            <span class="stat-value" style="font-size:1rem">
              ${fatigue.seanceSemaine}
            </span>
            <span class="stat-label">Séances/sem</span>
          </div>
          <div class="stat-card" style="padding:var(--space-sm)">
            <span class="stat-value" style="font-size:1rem">
              ${fatigue.joursAbsence < 0 ? '—' : fatigue.joursAbsence}j
            </span>
            <span class="stat-label">Dernière séance</span>
          </div>
        </div>
      </div>

      <!-- Conseil du jour -->
      ${analyse.conseilDuJour ? `
        <div class="card mb-md"
             style="border-color:var(--fd-lemon);
                    background:rgba(249,239,119,0.05)">
          <div class="card-label" style="color:var(--fd-lemon)">
            💡 Conseil du jour
          </div>
          <p style="font-size:.88rem;margin-top:var(--space-sm);
                    color:var(--text-secondary);line-height:1.5">
            ${analyse.conseilDuJour}
          </p>
        </div>` : ''}

      <!-- Opportunité PR -->
      ${analyse.opportunitePR ? `
        <div class="card mb-md"
             style="border-color:var(--fd-lemon);
                    background:rgba(249,239,119,0.08)">
          <div class="card-label" style="color:var(--fd-lemon)">
            🎯 Opportunité PR aujourd'hui !
          </div>
          <div style="margin-top:var(--space-md)">
            ${(() => {
              const p  = analyse.opportunitePR;
              const ex = window.EXERCICES?.[p.exerciceRef] || {};
              return `
                <div style="font-size:1.1rem;font-weight:700">
                  ${ex.emoji || '💪'} ${ex.nom || p.exerciceRef}
                </div>
                <div style="font-size:.82rem;color:var(--text-muted);
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
                <div style="font-size:.78rem;color:var(--fd-mint);
                            margin-top:4px;font-weight:600">
                  🔥 Confiance : ${Math.round(p.confiance*100)}%
                </div>
              `;
            })()}
          </div>
        </div>` : ''}

      <!-- Recommandation charge -->
      ${refs.length > 0 ? `
        <div class="section-title">⚡ Charge recommandée</div>
        <div class="card mb-md">
          <div class="card-label">🔍 Choisir un exercice</div>
          <select id="sel-predict-exo"
                  class="input mt-md"
                  onchange="Predict._renderCharge(this.value)">
            <option value="">-- Exercice --</option>
            ${refs.map(ref => {
              const ex = window.EXERCICES?.[ref] || {};
              return `
                <option value="${ref}">
                  ${ex.emoji || '💪'} ${ex.nom || ref}
                </option>`;
            }).join('')}
          </select>
          <div id="detail-charge" style="margin-top:var(--space-md)"></div>
        </div>` : ''}

      <!-- Prédictions PRs -->
      <div class="section-title">📈 Prédictions prochains PRs</div>

      ${predictions.length === 0 ? `
        <div class="card mb-md"
             style="text-align:center;padding:var(--space-xl)">
          <div style="font-size:2rem;margin-bottom:var(--space-sm)">
            📊
          </div>
          <div style="font-size:.88rem;color:var(--text-muted)">
            Pas encore assez de données.<br>
            Continue tes séances et les prédictions apparaîtront !
          </div>
        </div>` :

        predictions.map(pred => {
          const ex  = window.EXERCICES?.[pred.exerciceRef] || {};
          const pct = Math.round(pred.confiance * 100);
          const couleurFiab =
            pct >= 80 ? 'var(--fd-mint)'    :
            pct >= 60 ? 'var(--fd-lemon)'   :
                        'var(--fd-lavender)';

          return `
            <div class="card mb-md">
              <div class="flex justify-between items-center mb-md">
                <div style="font-size:1rem;font-weight:700">
                  ${ex.emoji || '💪'} ${ex.nom || pred.exerciceRef}
                </div>
                <div style="font-size:.72rem;font-weight:700;
                            color:${couleurFiab};
                            background:${couleurFiab}22;
                            padding:4px 10px;
                            border-radius:99px">
                  ${pred.fiabilite} ${pct}%
                </div>
              </div>

              <!-- Progression 1RM -->
              <div style="display:flex;align-items:center;
                          justify-content:space-between;
                          margin-bottom:var(--space-md)">
                <div style="text-align:center">
                  <div style="font-size:1.4rem;font-weight:800;
                              color:var(--text-secondary)">
                    ${pred.rm1Actuel}kg
                  </div>
                  <div style="font-size:.65rem;color:var(--text-muted)">
                    1RM actuel
                  </div>
                </div>
                <div style="flex:1;text-align:center">
                  <div style="font-size:.8rem;color:var(--fd-mint);
                              font-weight:600">
                    +${pred.delta}kg
                  </div>
                  <div style="height:2px;
                              background:linear-gradient(
                                to right,
                                var(--text-muted),
                                var(--fd-lemon)
                              );
                              margin:4px 16px;
                              border-radius:1px">
                  </div>
                  <div style="font-size:.65rem;color:var(--text-muted)">
                    ~${pred.joursEstimes} jours
                  </div>
                </div>
                <div style="text-align:center">
                  <div style="font-size:1.4rem;font-weight:800;
                              color:var(--fd-lemon)">
                    ${pred.rm1Predit}kg
                  </div>
                  <div style="font-size:.65rem;color:var(--text-muted)">
                    1RM prédit
                  </div>
                </div>
              </div>

              <!-- Détails -->
              <div style="display:grid;
                          grid-template-columns:1fr 1fr 1fr;
                          gap:var(--space-sm)">
                <div style="text-align:center;
                            padding:var(--space-sm);
                            background:var(--bg-input);
                            border-radius:var(--radius-sm)">
                  <div style="font-size:.82rem;font-weight:700;
                              color:var(--fd-indigo)">
                    ${pred.seancesEstimees}
                  </div>
                  <div style="font-size:.62rem;color:var(--text-muted)">
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
                  <div style="font-size:.62rem;color:var(--text-muted)">
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
                  <div style="font-size:.62rem;color:var(--text-muted)">
                    date estimée
                  </div>
                </div>
              </div>

              <!-- Stagnation -->
              ${(() => {
                const stag = Predict.detecterStagnation(pred.exerciceRef);
                if (!stag) return '';
                if (stag.stagne || stag.regression) {
                  return `
                    <div style="margin-top:var(--space-sm);
                                padding:var(--space-sm);
                                background:rgba(255,141,150,0.1);
                                border:1px solid rgba(255,141,150,0.3);
                                border-radius:var(--radius-sm);
                                font-size:.75rem">
                      <div style="color:var(--fd-coral);font-weight:700;
                                  margin-bottom:4px">
                        ${stag.regression ? '⚠️ Régression détectée' : '📊 Stagnation détectée'}
                      </div>
                      ${stag.conseils.map(c => `
                        <div style="color:var(--text-muted);
                                    margin-top:2px">
                          → ${c}
                        </div>`).join('')}
                    </div>`;
                }
                return '';
              })()}
            </div>`;
        }).join('')}

      <!-- Progression globale -->
      <div class="section-title">🎯 Progression depuis le début</div>
      <div class="card">
        ${refs.slice(0, 6).map(ref => {
          const analyse = this.analyserProgression(ref);
          if (!analyse.suffisant) return '';
          const ex  = window.EXERCICES?.[ref] || {};
          const pct = Math.max(0, Math.min(100,
            Math.round(analyse.confiance * 100)
          ));
          const progressionColor =
            analyse.progression > 0
              ? 'var(--fd-mint)'
              : 'var(--fd-coral)';

          return `
            <div style="padding:var(--space-sm) 0;
                        border-bottom:1px solid var(--border-color)">
              <div class="flex justify-between items-center mb-sm">
                <span style="font-size:.85rem;font-weight:600">
                  ${ex.emoji || '💪'} ${ex.nom || ref}
                </span>
                <span style="font-size:.82rem;font-weight:700;
                             color:${progressionColor}">
                  ${analyse.progression > 0 ? '+' : ''}${analyse.progression}%
                </span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill"
                     style="width:${Math.max(5, Math.min(100,
                       50 + analyse.progression
                     ))}%;
                     background:${progressionColor}">
                </div>
              </div>
              <div style="display:flex;justify-content:space-between;
                          font-size:.65rem;color:var(--text-muted);
                          margin-top:4px">
                <span>${analyse.rm1Debut}kg</span>
                <span>${analyse.semaines} semaines</span>
                <span>${analyse.rm1Actuel}kg</span>
              </div>
            </div>`;
        }).join('')}
      </div>
    `;
  },

  // ─── RENDER CHARGE DETAIL ─────────────────────────────────
  _renderCharge(ref) {
    const el = document.getElementById('detail-charge');
    if (!el || !ref) return;

    const reco = this.recommanderCharge(ref);
    if (!reco) {
      el.innerHTML = `
        <p style="color:var(--text-muted);font-size:.85rem">
          Pas assez de données pour cet exercice.
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
                      border-radius:0 var(--radius-sm) var(--radius-sm) 0;
                      margin-bottom:var(--space-xs)">
            <div>
              <div style="font-size:.82rem;font-weight:700;
                          color:${zone.couleur}">
                ${zone.label}
              </div>
              <div style="font-size:.7rem;color:var(--text-muted)">
                ${zone.series} × ${zone.reps} reps
              </div>
            </div>
            <div style="font-size:1.1rem;font-weight:800;
                        color:${zone.couleur}">
              ${zone.charge}kg
              <span style="font-size:.65rem;
                           color:var(--text-muted);
                           font-weight:400">
                (${zone.pct}%)
              </span>
            </div>
          </div>`).join('')}
      </div>

      <div style="padding:var(--space-sm);
                  background:${reco.fatigue.couleur}11;
                  border:1px solid ${reco.fatigue.couleur}33;
                  border-radius:var(--radius-sm);
                  font-size:.78rem;
                  color:${reco.fatigue.couleur}">
        ${reco.fatigue.emoji} ${reco.fatigue.message}
      </div>

      ${reco.prediction ? `
        <div style="margin-top:var(--space-sm);
                    font-size:.75rem;
                    color:var(--text-muted);
                    text-align:center">
          🎯 Prochain PR estimé :
          <strong style="color:var(--fd-lemon)">
            ${reco.prediction.rm1Predit}kg
          </strong>
          dans ~${reco.prediction.joursEstimes} jours
        </div>` : ''}
    `;
  },

  // ─── HELPERS ──────────────────────────────────────────────
  _niveauFiabilite(confiance) {
    if (confiance >= 0.85) return '🟢 Très fiable';
    if (confiance >= 0.70) return '🟡 Fiable';
    if (confiance >= 0.55) return '🟠 Indicatif';
    return '🔴 Incertain';
  },

  _conseilsStagnation(stagne, regression, ref) {
    const conseils = [];
    if (regression) {
      conseils.push('Augmente le temps de repos entre séances');
      conseils.push('Réduis le volume temporairement');
      conseils.push('Vérifie ta nutrition et ton sommeil');
    } else if (stagne) {
      conseils.push('Essaie une surcharge progressive (+2.5kg)');
      conseils.push('Change le nombre de reps ou de séries');
      conseils.push('Intègre une semaine de décharge');
    }
    return conseils;
  },

  _conseilDuJour(fatigue, opportunitePR, phase) {
    if (fatigue.recommandation.action === 'REPOS') {
      return '😴 Ton corps a besoin de récupération. '
           + 'Profite de ce repos pour bien manger et bien dormir.';
    }
    if (opportunitePR) {
      const ex = window.EXERCICES?.[opportunitePR.exerciceRef] || {};
      return `🎯 Tu es proche d'un record sur ${ex.nom || 'cet exercice'}. `
           + `Cible ${opportunitePR.rm1Predit}kg aujourd'hui !`;
    }
    if (phase.nom === 'Peak') {
      return '🏆 Tu es en phase Peak ! '
           + 'C\'est le moment de tout donner et de battre des records.';
    }
    if (fatigue.score >= 80) {
      return '💪 Tu es en pleine forme ! '
           + 'Pousse un peu plus fort aujourd\'hui, '
           + 'c\'est le bon moment pour progresser.';
    }
    return '🎯 Reste régulier et la progression viendra naturellement. '
         + 'Chaque séance compte !';
  }

};

window.Predict = Predict;
console.log('✅ Predict v1.0 chargé');
