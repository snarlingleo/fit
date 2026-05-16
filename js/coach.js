/* ============================================================
   FitTracker Pro — Coach IA v2
   Recommandations avancées + messages enrichis
   ============================================================ */

const Coach = {

  // ─── MESSAGE DU JOUR ──────────────────────────────────────
  getMessageDuJour() {
    const humeur  = Tracker.getHumeur();
    const fatigue = Tracker.getFatigue();
    const rpe     = Tracker.getRPEMoyen7Jours();
    const absence = Tracker.getJoursAbsence();
    const infos   = Programme.getInfosProgramme();
    const streak  = Tracker.getStreak();
    const profil  = Tracker.getProfil();
    const nom     = profil.nom || 'Athlète';

    // ── Déload urgent
    if (rpe > 8.5 && rpe > 0) return {
      type: 'deload', emoji: '⚡',
      message: `RPE moyen ${rpe}/10 sur 7 jours ${nom}. Ton système nerveux crie au repos. Cette semaine : -40% des charges. C'est maintenant que la vraie progression se construit.`
    };

    // ── Longue absence
    if (absence >= 7) return {
      type: 'reprise', emoji: '🌱',
      message: `${absence} jours de pause ${nom}. Pas de jugement — on repart. Réduis les charges de 25% cette séance, retrouve les sensations, puis on reprend la progression normale.`
    };

    if (absence >= 3) return {
      type: 'relance', emoji: '🔥',
      message: `3 jours sans séance ${nom}. Le corps attend. Une séance même courte vaut mieux que la perfection reportée. Lance-toi — le premier set est toujours le plus dur.`
    };

    // ── Fatigue élevée
    if (fatigue?.niveau >= 3) return {
      type: 'fatigue', emoji: '😴',
      message: `Tu te sens épuisé ${nom}. Écoute ton corps — technique parfaite sur charges modérées aujourd'hui. La récupération n'est pas de la faiblesse, c'est de la stratégie.`
    };

    // ── Humeur basse
    if (['😒','😤'].includes(humeur?.humeur)) return {
      type: 'motivation', emoji: '💡',
      message: `Pas dans ton assiette ${nom} ? Les champions s'entraînent quand ils n'en ont pas envie. Dans 20 minutes tu seras content d'y être allé. Promis.`
    };

    // ── Super forme
    if (humeur?.humeur === '🔥' && (fatigue?.niveau || 0) <= 1) return {
      type: 'peak', emoji: '🚀',
      message: `Tu es en feu ${nom} ! C'est le moment de tenter un PR. Corps frais, mental affûté — donne tout sur les exercices principaux aujourd'hui !`
    };

    // ── Streak exceptionnel
    if (streak.count >= 14) return {
      type: 'streak', emoji: '🏆',
      message: `${streak.count} jours consécutifs ${nom} ! Tu es dans la zone. Continue à surveiller la récupération pour maintenir cette régularité sans te blesser.`
    };

    // ── Messages par phase
    const msgs = {
      'Reprise': [
        `Phase Reprise ${nom} : la technique prime sur tout. Chaque répétition parfaite aujourd'hui construit la base de tes futurs records. Poids légers, amplitude maximale.`,
        `Semaine de reprise — construis les fondations. Dans quelques semaines tu soulèveras bien plus lourd grâce à ce travail technique d'aujourd'hui.`
      ],
      'Construction': [
        `Phase Construction ${nom} : cherche à dépasser le volume de la semaine dernière. Si tu complètes toutes les séries facilement → augmente de 2.5kg la prochaine fois.`,
        `Volume élevé cette semaine ${nom}. Concentre-toi sur la connexion musculaire plutôt que sur les charges brutes. Qualité + quantité = résultats.`
      ],
      'Intensité': [
        `Phase Intensité ${nom} : charges lourdes, concentration maximale. Échauffement soigné, puis donne tout sur les exercices compound. Les PRs approchent.`,
        `Séances intenses cette semaine ${nom}. Un bon échauffement vaut autant que la séance elle-même. Prépare bien ton corps avant de charger.`
      ],
      'Peak': [
        `Phase Peak ${nom} : tu as accumulé des semaines de travail pour ça. Aujourd'hui tu libères cette énergie. Confiance totale en ton processus.`,
        `C'est la semaine des records ${nom} ! Alimentation soignée, sommeil optimal, et donne absolument tout. Tu es prêt pour ça.`
      ]
    };

    const phase = infos.phase?.nom || 'Reprise';
    const liste = msgs[phase] || msgs['Reprise'];
    return {
      type: 'programme',
      emoji: infos.phase?.emoji || '💡',
      message: Utils.random(liste)
    };
  },

  // ─── CITATION MOTIVATION ──────────────────────────────────
  getCitationDuJour() {
    const citations = [
      { texte: "Le corps accomplit ce que l'esprit croit possible.", auteur: "Napoleon Hill" },
      { texte: "La douleur est temporaire. Abandonner dure toujours.", auteur: "Lance Armstrong" },
      { texte: "Chaque rep que tu fais change ton futur.", auteur: "Unknown" },
      { texte: "La force ne vient pas de la capacité physique mais d'une volonté indomptable.", auteur: "Gandhi" },
      { texte: "Le seul mauvais entraînement est celui qui n'a pas eu lieu.", auteur: "Unknown" },
      { texte: "Tu n'as pas à être extrême, juste consistant.", auteur: "Unknown" },
      { texte: "Les champions ne deviennent pas champions dans la salle — ils y sont simplement reconnus.", auteur: "Joe Frazier" },
      { texte: "Construis ton corps, construis ta confiance.", auteur: "Unknown" },
      { texte: "Souffre maintenant et vis le reste de ta vie en champion.", auteur: "Muhammad Ali" },
      { texte: "La progression n'est pas un accident, c'est un choix quotidien.", auteur: "Unknown" }
    ];

    // Citation du jour basée sur la date (stable toute la journée)
    const index = new Date().getDate() % citations.length;
    return citations[index];
  },

  // ─── WARM-UP DU JOUR ──────────────────────────────────────
  getWarmupDuJour() {
    const indexJour = Utils.indexJourSemaine(Utils.aujourd_hui());
    const planning  = PLANNING_SEMAINE[indexJour];
    const seanceId  = planning?.seanceId;
    return seanceId ? (WARMUP[seanceId] || WARMUP.general) : WARMUP.general;
  },

  // ─── ANALYSE SEMAINE ──────────────────────────────────────
  getAnalyseSemaine() {
    const volume   = Tracker.getVolumeSemaine();
    const seances  = Tracker.getSeancesParSemaine();
    const rpe      = Tracker.getRPEMoyen7Jours();
    const objectif = Utils.storage.get('ft_objectif_seances_semaine', 4);
    const comp     = Stats.getComparaisonSemaines();

    let intensite     = '🟢 Faible';
    let recommendation = 'Augmente l\'intensité ou le volume cette semaine.';
    let couleur        = 'var(--fd-mint)';

    if (rpe >= 9) {
      intensite      = '🔴 Très élevée';
      recommendation = 'Décharge recommandée — réduis les charges de 40%.';
      couleur        = 'var(--fd-coral)';
    } else if (rpe >= 7.5) {
      intensite      = '🟠 Élevée';
      recommendation = 'Maintiens le volume actuel sans augmenter.';
      couleur        = 'var(--fd-lemon)';
    } else if (rpe >= 5.5) {
      intensite      = '🟡 Modérée';
      recommendation = 'Augmentation progressive possible (+5% volume).';
      couleur        = 'var(--fd-lemon)';
    }

    return {
      volume, seances, objectif, rpe,
      intensite, recommendation, couleur,
      deltaVolume: comp.delta,
      objectifAtteint: seances >= objectif
    };
  },

  // ─── SUGGESTION CHARGE ────────────────────────────────────
  suggererCharge(exerciceRef) {
    const pr    = Tracker.getPR(exerciceRef);
    const phase = Programme.getPhaseActuelle();
    if (!pr?.rm1) return null;

    const charge = Math.round(pr.rm1 * phase.intensite / 2.5) * 2.5;
    return {
      charge,
      pourcentage: Math.round(phase.intensite * 100),
      rm1:  pr.rm1,
      phase: phase.nom
    };
  },

  // ─── DÉLOAD AUTOMATIQUE ───────────────────────────────────
  necessiteDeload() {
    const rpe     = Tracker.getRPEMoyen7Jours();
    const fatigue = Tracker.getFatigue();
    const absence = Tracker.getJoursAbsence();

    if (rpe > 0 && rpe >= 8.5)
      return { oui: true, raison: `RPE moyen élevé: ${rpe}/10` };
    if (fatigue?.niveau >= 3)
      return { oui: true, raison: 'Fatigue déclarée maximale' };
    if (absence >= 7)
      return { oui: true, raison: `${absence} jours d'absence` };

    return { oui: false };
  },

  // ─── EXERCICES À ÉVITER ───────────────────────────────────
  getExercicesAEviter() {
    const blessures   = Tracker.getBlessures().filter(b => b.active);
    const aEviter     = new Set();
    const restrictions = {
      'epaule':  ['dev_militaire','bench_press','elev_laterales',
                  'incline_halteres','dips'],
      'genou':   ['squat','presse_cuisses','fentes','leg_extension'],
      'dos_bas': ['soulevé_terre','rowing_barre','squat'],
      'coude':   ['curl_halteres','curl_barre','barre_front','ext_triceps_poulie'],
      'poignet': ['bench_press','curl_barre','barre_front']
    };

    blessures.forEach(b => {
      const zone = b.zone.toLowerCase();
      Object.entries(restrictions).forEach(([k, exos]) => {
        if (zone.includes(k)) exos.forEach(e => aEviter.add(e));
      });
    });

    return [...aEviter];
  },

  // ─── RENDER TAB COACH ─────────────────────────────────────
  renderCoachTab(container) {
    const msg     = this.getMessageDuJour();
    const analyse = this.getAnalyseSemaine();
    const warmup  = this.getWarmupDuJour();
    const deload  = this.necessiteDeload();
    const citation = this.getCitationDuJour();
    const aEviter  = this.getExercicesAEviter();

    container.innerHTML = `

      <!-- Citation du jour -->
      <div class="card mb-md"
           style="border-left:3px solid var(--fd-lemon);
                  background:rgba(249,239,119,0.06)">
        <div style="font-size:.72rem;font-weight:700;
                    text-transform:uppercase;letter-spacing:.08em;
                    color:var(--fd-lemon);margin-bottom:var(--space-sm)">
          💬 Citation du jour
        </div>
        <p style="font-size:.9rem;font-style:italic;
                  line-height:1.6;color:var(--text-primary)">
          "${citation.texte}"
        </p>
        <p style="font-size:.72rem;color:var(--text-muted);
                  margin-top:var(--space-xs)">
          — ${citation.auteur}
        </p>
      </div>

      <!-- Message coach -->
      <div class="coach-card mb-md">
        <div class="coach-header">
          <span class="coach-icon">${msg.emoji}</span>
          <span class="coach-label">Coach du jour</span>
        </div>
        <p class="coach-message">${msg.message}</p>
      </div>

      <!-- Alerte déload -->
      ${deload.oui ? `
        <div class="card mb-md"
             style="border-color:var(--fd-coral);
                    background:rgba(255,141,150,0.08)">
          <div class="card-label" style="color:var(--fd-coral)">
            ⚠️ Décharge recommandée
          </div>
          <p style="font-size:.88rem;color:var(--text-primary);
                    margin-top:var(--space-sm)">
            ${deload.raison}. Réduis les charges de
            <strong>40%</strong> cette semaine.
            La super-compensation se fait pendant la décharge !
          </p>
        </div>` : ''}

      <!-- Exercices à éviter -->
      ${aEviter.length > 0 ? `
        <div class="card mb-md"
             style="border-color:var(--fd-lemon);
                    background:rgba(249,239,119,0.06)">
          <div class="card-label" style="color:var(--fd-lemon)">
            ⚠️ Exercices à éviter (blessures actives)
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-xs);
                      margin-top:var(--space-sm)">
            ${aEviter.map(ref => `
              <span class="chip chip-lemon">
                ${EXERCICES[ref]?.nom || ref}
              </span>`).join('')}
          </div>
        </div>` : ''}

      <!-- Analyse semaine -->
      <div class="card mb-md">
        <div class="card-label">📊 Analyse semaine en cours</div>
        <div style="margin-top:var(--space-sm)">
          ${[
            { label:'Séances',   val:`${analyse.seances}/${analyse.objectif}` },
            { label:'Volume',    val:Utils.formatVolume(analyse.volume)        },
            { label:'RPE moyen', val:analyse.rpe>0?`${analyse.rpe}/10`:'—'    },
            { label:'Intensité', val:analyse.intensite                         },
            { label:'vs S-1',    val:`${analyse.deltaVolume>=0?'+':''}${analyse.deltaVolume}%` }
          ].map(r => `
            <div class="score-row">
              <span class="score-row-label">${r.label}</span>
              <span class="score-row-value">${r.val}</span>
            </div>`).join('')}

          <div class="progress-bar mt-md">
            <div class="progress-fill"
                 style="width:${Math.min(100,(analyse.seances/
                   Math.max(analyse.objectif,1))*100)}%">
            </div>
          </div>
        </div>

        <div style="margin-top:var(--space-md);padding:var(--space-sm);
                    background:var(--fd-indigo-dim);
                    border-radius:var(--radius-sm)">
          <span style="font-size:.82rem;color:var(--fd-lavender)">
            💡 ${analyse.recommendation}
          </span>
        </div>
      </div>

      <!-- Warm-up -->
      <div class="card">
        <div class="card-label">🔥 Warm-up recommandé aujourd'hui</div>
        ${warmup.map((w, i) => `
          <div class="flex items-center gap-md"
               style="padding:var(--space-sm) 0;
                      border-bottom:1px solid var(--border-color)">
            <div style="width:28px;height:28px;border-radius:50%;
                        background:var(--fd-indigo-dim);display:flex;
                        align-items:center;justify-content:center;
                        font-size:.75rem;font-weight:700;
                        color:var(--fd-indigo);flex-shrink:0">
              ${i + 1}
            </div>
            <div style="flex:1">
              <div style="font-size:.88rem;font-weight:600">${w.nom}</div>
              <div style="font-size:.72rem;color:var(--text-muted)">
                ${w.description}
              </div>
            </div>
            <div style="font-size:.78rem;color:var(--fd-mint);font-weight:600">
              ${Utils.formatDuree(w.duree)}
            </div>
          </div>`).join('')}
      </div>
    `;
  }
};

window.Coach = Coach;
console.log('✅ Coach v2 chargé');
