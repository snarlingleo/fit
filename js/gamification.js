/* ============================================================
   FitTracker Pro — Gamification v3.0
   XP + Niveaux + Trophées + Défis + Badges + Cloud sync
   ============================================================ */

const Gamification = {

  // ════════════════════════════════════════════════════════
  // NIVEAUX
  // ════════════════════════════════════════════════════════
  NIVEAUX: [
    { numero:1, nom:'Débutant',     emoji:'🌱', xpMin:0,     xpSuivant:500   },
    { numero:2, nom:'Apprenti',     emoji:'💪', xpMin:500,   xpSuivant:1200  },
    { numero:3, nom:'Confirmé',     emoji:'🏃', xpMin:1200,  xpSuivant:2500  },
    { numero:4, nom:'Athlète',      emoji:'⚡', xpMin:2500,  xpSuivant:5000  },
    { numero:5, nom:'Expert',       emoji:'🔥', xpMin:5000,  xpSuivant:10000 },
    { numero:6, nom:'Élite',        emoji:'💎', xpMin:10000, xpSuivant:20000 },
    { numero:7, nom:'Légende',      emoji:'👑', xpMin:20000, xpSuivant:50000 },
    { numero:8, nom:'Immortel',     emoji:'⭐', xpMin:50000, xpSuivant:99999 }
  ],

  // ════════════════════════════════════════════════════════
  // TROPHÉES
  // ════════════════════════════════════════════════════════
  TROPHEES_DEF: [

    // ── Premiers pas ──────────────────────────────────────
    {
      id:'first_session',
      nom:'Première séance',
      emoji:'🎯', xp:100,
      description:'Terminer sa première séance',
      categorie:'debut',
      condition: d => d.totalSeances >= 1
    },
    {
      id:'first_pr',
      nom:'Premier record',
      emoji:'🏆', xp:150,
      description:'Battre un premier PR',
      categorie:'debut',
      condition: d => d.totalPRs >= 1
    },
    {
      id:'first_week',
      nom:'Première semaine',
      emoji:'📅', xp:200,
      description:'Compléter 4 séances en une semaine',
      categorie:'debut',
      condition: d => d.seancesParSemaine >= 4
    },
    {
      id:'first_journal',
      nom:'Premiers mots',
      emoji:'📔', xp:75,
      description:'Écrire dans le journal',
      categorie:'debut',
      condition: d => d.totalJournal >= 1
    },
    {
      id:'first_photo',
      nom:'Première photo',
      emoji:'📸', xp:100,
      description:'Ajouter une photo de progression',
      categorie:'debut',
      condition: d => d.totalPhotos >= 1
    },

    // ── Streak ────────────────────────────────────────────
    {
      id:'streak_3',
      nom:'3 jours d\'affilée',
      emoji:'🔥', xp:100,
      description:'Streak de 3 jours',
      categorie:'streak',
      condition: d => d.streak >= 3
    },
    {
      id:'streak_7',
      nom:'Une semaine pleine',
      emoji:'🔥', xp:200,
      description:'Streak de 7 jours',
      categorie:'streak',
      condition: d => d.streak >= 7
    },
    {
      id:'streak_14',
      nom:'2 semaines non-stop',
      emoji:'🔥', xp:350,
      description:'Streak de 14 jours',
      categorie:'streak',
      condition: d => d.streak >= 14
    },
    {
      id:'streak_30',
      nom:'Mois de fer',
      emoji:'💎', xp:600,
      description:'Streak de 30 jours',
      categorie:'streak',
      condition: d => d.streak >= 30
    },
    {
      id:'streak_60',
      nom:'Machine de guerre',
      emoji:'⚡', xp:1000,
      description:'Streak de 60 jours',
      categorie:'streak',
      condition: d => d.streak >= 60
    },
    {
      id:'streak_100',
      nom:'Centurion du fitness',
      emoji:'👑', xp:2000,
      description:'Streak de 100 jours',
      categorie:'streak',
      condition: d => d.streak >= 100
    },

    // ── Séances ───────────────────────────────────────────
    {
      id:'sessions_5',
      nom:'5 séances',
      emoji:'💪', xp:100,
      description:'5 séances totales',
      categorie:'seances',
      condition: d => d.totalSeances >= 5
    },
    {
      id:'sessions_10',
      nom:'10 séances',
      emoji:'💪', xp:150,
      description:'10 séances totales',
      categorie:'seances',
      condition: d => d.totalSeances >= 10
    },
    {
      id:'sessions_25',
      nom:'25 séances',
      emoji:'🏋️', xp:300,
      description:'25 séances totales',
      categorie:'seances',
      condition: d => d.totalSeances >= 25
    },
    {
      id:'sessions_50',
      nom:'50 séances',
      emoji:'🎖️', xp:500,
      description:'50 séances totales',
      categorie:'seances',
      condition: d => d.totalSeances >= 50
    },
    {
      id:'sessions_100',
      nom:'Centurion',
      emoji:'💯', xp:1000,
      description:'100 séances totales',
      categorie:'seances',
      condition: d => d.totalSeances >= 100
    },
    {
      id:'sessions_200',
      nom:'Légende vivante',
      emoji:'👑', xp:2000,
      description:'200 séances totales',
      categorie:'seances',
      condition: d => d.totalSeances >= 200
    },
    {
      id:'sessions_500',
      nom:'Immortel',
      emoji:'⭐', xp:5000,
      description:'500 séances totales',
      categorie:'seances',
      condition: d => d.totalSeances >= 500
    },

    // ── PRs ───────────────────────────────────────────────
    {
      id:'prs_3',
      nom:'Premiers records',
      emoji:'🏅', xp:150,
      description:'3 records personnels',
      categorie:'prs',
      condition: d => d.totalPRs >= 3
    },
    {
      id:'prs_5',
      nom:'Collectionneur',
      emoji:'🏅', xp:200,
      description:'5 records personnels',
      categorie:'prs',
      condition: d => d.totalPRs >= 5
    },
    {
      id:'prs_10',
      nom:'Record Man',
      emoji:'🎯', xp:400,
      description:'10 records personnels',
      categorie:'prs',
      condition: d => d.totalPRs >= 10
    },
    {
      id:'prs_20',
      nom:'Maître des records',
      emoji:'👑', xp:800,
      description:'20 records personnels',
      categorie:'prs',
      condition: d => d.totalPRs >= 20
    },

    // ── Force ─────────────────────────────────────────────
    {
      id:'bench_80',
      nom:'Pecto de feu',
      emoji:'🔥', xp:300,
      description:'Développé couché 80kg',
      categorie:'force',
      condition: d => (d.prs['bench_press']?.poids||0) >= 80
    },
    {
      id:'bench_100',
      nom:'Club des 100',
      emoji:'💎', xp:600,
      description:'Développé couché 100kg',
      categorie:'force',
      condition: d => (d.prs['bench_press']?.poids||0) >= 100
    },
    {
      id:'bench_120',
      nom:'Pectoraux d\'élite',
      emoji:'💥', xp:1000,
      description:'Développé couché 120kg',
      categorie:'force',
      condition: d => (d.prs['bench_press']?.poids||0) >= 120
    },
    {
      id:'squat_100',
      nom:'Jambes d\'acier',
      emoji:'🦵', xp:600,
      description:'Squat 100kg',
      categorie:'force',
      condition: d => (d.prs['squat']?.poids||0) >= 100
    },
    {
      id:'squat_140',
      nom:'Squat King',
      emoji:'👑', xp:1000,
      description:'Squat 140kg',
      categorie:'force',
      condition: d => (d.prs['squat']?.poids||0) >= 140
    },
    {
      id:'deadlift_100',
      nom:'Terre ferme',
      emoji:'🏋️', xp:600,
      description:'Soulevé de terre 100kg',
      categorie:'force',
      condition: d => (d.prs['soulevé_terre']?.poids||0) >= 100
    },
    {
      id:'deadlift_140',
      nom:'Force brute',
      emoji:'💥', xp:1000,
      description:'Soulevé de terre 140kg',
      categorie:'force',
      condition: d => (d.prs['soulevé_terre']?.poids||0) >= 140
    },
    {
      id:'deadlift_180',
      nom:'Titan',
      emoji:'⭐', xp:2000,
      description:'Soulevé de terre 180kg',
      categorie:'force',
      condition: d => (d.prs['soulevé_terre']?.poids||0) >= 180
    },
    {
      id:'ohp_60',
      nom:'Épaules de fer',
      emoji:'💪', xp:300,
      description:'Développé militaire 60kg',
      categorie:'force',
      condition: d => (d.prs['dev_militaire']?.poids||0) >= 60
    },

    // ── Programme ─────────────────────────────────────────
    {
      id:'phase_1',
      nom:'Phase 1 terminée',
      emoji:'🌱', xp:400,
      description:'Compléter la Phase Reprise',
      categorie:'programme',
      condition: d => d.phasesTerminees >= 1
    },
    {
      id:'cycle_1',
      nom:'Cycle complet',
      emoji:'🏆', xp:1000,
      description:'Compléter un cycle de 16 semaines',
      categorie:'programme',
      condition: d => d.cyclesTermines >= 1
    },
    {
      id:'cycle_3',
      nom:'Triplé',
      emoji:'🎖️', xp:2500,
      description:'Compléter 3 cycles',
      categorie:'programme',
      condition: d => d.cyclesTermines >= 3
    },

    // ── Volume ────────────────────────────────────────────
    {
      id:'volume_10T',
      nom:'10 tonnes',
      emoji:'💎', xp:300,
      description:'Atteindre 10 tonnes de volume total',
      categorie:'volume',
      condition: d => d.volumeTotal >= 10000
    },
    {
      id:'volume_100T',
      nom:'100 tonnes',
      emoji:'👑', xp:1000,
      description:'Atteindre 100 tonnes de volume total',
      categorie:'volume',
      condition: d => d.volumeTotal >= 100000
    },

    // ── Spéciaux ──────────────────────────────────────────
    {
      id:'comeback',
      nom:'Le Retour',
      emoji:'🦅', xp:200,
      description:'Reprendre après 7+ jours d\'absence',
      categorie:'special',
      condition: d => d.comeback
    },
    {
      id:'journal_10',
      nom:'Chroniqueur',
      emoji:'📔', xp:150,
      description:'10 entrées dans le journal',
      categorie:'special',
      condition: d => d.totalJournal >= 10
    },
    {
      id:'journal_50',
      nom:'Mémorialiste',
      emoji:'📚', xp:400,
      description:'50 entrées dans le journal',
      categorie:'special',
      condition: d => d.totalJournal >= 50
    },
    {
      id:'objectif_atteint',
      nom:'Objectif accompli',
      emoji:'🎯', xp:500,
      description:'Atteindre un objectif personnel',
      categorie:'special',
      condition: d => d.objectifsAtteints >= 1
    },
    {
      id:'perfect_week',
      nom:'Semaine parfaite',
      emoji:'✨', xp:300,
      description:'Compléter toutes les séances planifiées',
      categorie:'special',
      condition: d => d.semaineParf >= 1
    },
    {
      id:'photos_5',
      nom:'Photographe',
      emoji:'📸', xp:200,
      description:'5 photos de progression',
      categorie:'special',
      condition: d => d.totalPhotos >= 5
    },
    {
      id:'express_10',
      nom:'Speed Runner',
      emoji:'⚡', xp:250,
      description:'10 séances express',
      categorie:'special',
      condition: d => d.seancesExpress >= 10
    }
  ],

  // ════════════════════════════════════════════════════════
  // XP
  // ════════════════════════════════════════════════════════
  getXP() {
    const total  = Utils.storage.get('ft_xp_total', 0);
    const niveau = this.getNiveau(total);
    const xpNiv  = total - niveau.xpMin;
    const range  = Math.max(
      niveau.xpSuivant - niveau.xpMin, 1
    );
    const pct = Math.min(100, Math.round(
      (xpNiv / range) * 100
    ));
    return { total, niveau, pourcentage:pct };
  },

  getNiveau(xp) {
    let actuel = this.NIVEAUX[0];
    for (const n of this.NIVEAUX) {
      if (xp >= n.xpMin) actuel = n;
    }
    return actuel;
  },

  ajouterXP(montant, raison = '') {
    try {
      const avant  = Utils.storage.get('ft_xp_total', 0);
      const apres  = avant + montant;
      Utils.storage.set('ft_xp_total', apres);

      const nivAvant = this.getNiveau(avant);
      const nivApres = this.getNiveau(apres);

      // Level up !
      if (nivApres.numero > nivAvant.numero) {
        try {
          timerRepos.jouerSon('pr');
          Utils.vibrer([200,100,200,100,400]);
          Utils.confetti(4000);
        } catch(e) {}

        setTimeout(() => {
          Utils.toast(
            `🎉 NIVEAU ${nivApres.numero} — ${nivApres.emoji} ${nivApres.nom} !`,
            'success', 6000
          );
        }, 300);

      } else if (raison && montant >= 50) {
        Utils.toast(
          `+${montant} XP — ${raison}`, 'info', 2000
        );
      }

      // Sync cloud
      if (window.CloudDB) {
        setTimeout(() => CloudDB.syncDonnees(), 1000);
      }

      return apres;
    } catch(e) { return 0; }
  },

  // ════════════════════════════════════════════════════════
  // TROPHÉES
  // ════════════════════════════════════════════════════════
  getTrophees() {
    const debloquees = Utils.storage.get('ft_trophees', []);
    return this.TROPHEES_DEF.map(t => ({
      ...t,
      debloquee:     debloquees.includes(t.id),
      dateDeblocage: Utils.storage.get(
        `ft_trophy_date_${t.id}`, null
      )
    }));
  },

  verifierTrophees() {
    try {
      const debloquees = Utils.storage.get('ft_trophees', []);

      // Collecter les données
      let totalSeances = 0, totalPRs = 0, streak = 0;
      let seancesParSemaine = 0, prs = {};
      let totalJournal = 0, objectifsAtteints = 0;
      let comeback = false, phasesTerminees = 0;
      let cyclesTermines = 0, volumeTotal = 0;
      let totalPhotos = 0, semaineParf = 0;
      let seancesExpress = 0;

      try { totalSeances      = Tracker.getTotalSeances();                } catch(e) {}
      try { prs               = Tracker.getAllPRs();                      } catch(e) {}
      try { totalPRs          = Object.keys(prs).length;                 } catch(e) {}
      try { streak            = Tracker.getStreak().count;               } catch(e) {}
      try { seancesParSemaine = Tracker.getSeancesParSemaine();          } catch(e) {}
      try { totalJournal      = Tracker.getJournal().length;             } catch(e) {}
      try {
        objectifsAtteints = Tracker.getObjectifs()
          .filter(o => o.complete).length;
      } catch(e) {}
      try { comeback          = Utils.storage.get('ft_comeback', false); } catch(e) {}
      try { phasesTerminees   = Utils.storage.get('ft_phases_terminees', 0); } catch(e) {}
      try { cyclesTermines    = Utils.storage.get('ft_cycles_termines', 0);  } catch(e) {}
      try { semaineParf       = Utils.storage.get('ft_semaines_parf', 0);    } catch(e) {}
      try { totalPhotos       = Tracker.getPhotos?.()?.length || 0;          } catch(e) {}

      // Calcul volume total
      try {
        const seancesHist = Tracker.getHistoriqueSeances(9999);
        volumeTotal = seancesHist.reduce(
          (a,s) => a + (s.volumeTotal||0), 0
        );
      } catch(e) {}

      // Séances express
      try {
        seancesExpress = Tracker.getHistoriqueSeances(9999)
          .filter(s => s.id?.includes('express')).length;
      } catch(e) {}

      const donnees = {
        totalSeances, totalPRs, streak,
        seancesParSemaine, prs, totalJournal,
        objectifsAtteints, comeback, phasesTerminees,
        cyclesTermines, volumeTotal, totalPhotos,
        semaineParf, seancesExpress
      };

      const nouveaux = [];

      this.TROPHEES_DEF.forEach(t => {
        if (debloquees.includes(t.id)) return;
        try {
          if (t.condition(donnees)) {
            debloquees.push(t.id);
            nouveaux.push(t);
            Utils.storage.set(
              `ft_trophy_date_${t.id}`,
              Utils.aujourd_hui()
            );
          }
        } catch(e) {}
      });

      if (nouveaux.length > 0) {
        Utils.storage.set('ft_trophees', debloquees);
        nouveaux.forEach((t, i) => {
          setTimeout(() => {
            try { timerRepos.jouerSon('pr'); } catch(e) {}
            Utils.toast(
              `🏆 Trophée : ${t.emoji} ${t.nom} — +${t.xp} XP`,
              'pr', 5000
            );
            this.ajouterXP(t.xp, `Trophée ${t.nom}`);
          }, i * 1500);
        });
      }

      return nouveaux;
    } catch(e) {
      return [];
    }
  },

  // ════════════════════════════════════════════════════════
  // ACTIONS XP
  // ════════════════════════════════════════════════════════
  XP_ACTIONS: {
    SEANCE_COMPLETE:  100,
    PR_BATTU:          50,
    STREAK_7:         150,
    DEFI_SEMAINE:     200,
    JOURNAL:           25,
    HUMEUR:            10,
    SEMAINE_PARF:     300,
    PREMIERE_SEANCE:  200,
    PHOTO_AJOUTEE:     30,
    OBJECTIF_ATTEINT: 250,
    MESURE_CORPORELLE: 20,
    SUPERSET_COMPLETE:  15
  },

  recompenser(action) {
    try {
      const montant = this.XP_ACTIONS[action] || 0;
      if (montant > 0) {
        this.ajouterXP(
          montant,
          action.toLowerCase().replace(/_/g,' ')
        );
      }
      setTimeout(() => {
        try { this.verifierTrophees(); } catch(e) {}
      }, 500);
    } catch(e) {}
  },

  // ════════════════════════════════════════════════════════
  // RENDER — TROPHÉES TAB
  // ════════════════════════════════════════════════════════
  renderGamificationTab(container) {
    if (!container) return;

    const xp         = this.getXP();
    const trophees   = this.getTrophees();
    const debloquees = trophees.filter(t =>  t.debloquee);
    const verrous    = trophees.filter(t => !t.debloquee);

    // Grouper les trophées débloqués par catégorie
    const categories = {
      debut:      { label:'🎯 Premiers pas',  items:[] },
      streak:     { label:'🔥 Streak',         items:[] },
      seances:    { label:'💪 Séances',        items:[] },
      prs:        { label:'🏆 Records',        items:[] },
      force:      { label:'🏋️ Force',          items:[] },
      volume:     { label:'📊 Volume',         items:[] },
      programme:  { label:'📅 Programme',      items:[] },
      special:    { label:'✨ Spéciaux',       items:[] }
    };

    container.innerHTML = `

      <!-- Niveau + XP -->
      <div class="card mb-md"
           style="background:linear-gradient(135deg,
                  var(--fd-indigo) 0%, #7b2ff7 100%);
                  border:none;text-align:center;
                  color:white">
        <div style="font-size:2.5rem;margin-bottom:4px">
          ${xp.niveau.emoji}
        </div>
        <div style="font-size:1.3rem;font-weight:800">
          Niveau ${xp.niveau.numero} — ${xp.niveau.nom}
        </div>
        <div style="font-size:.78rem;opacity:.8;
                    margin-top:4px">
          ${xp.total.toLocaleString()} XP total
        </div>

        <div style="margin:var(--space-md) 0">
          <div style="display:flex;justify-content:space-between;
                      font-size:.68rem;opacity:.7;margin-bottom:6px">
            <span>${xp.niveau.xpMin} XP</span>
            <span>${xp.pourcentage}%</span>
            <span>${xp.niveau.xpSuivant} XP</span>
          </div>
          <div style="height:8px;
                      background:rgba(255,255,255,0.2);
                      border-radius:99px;overflow:hidden">
            <div style="height:100%;width:${xp.pourcentage}%;
                        background:var(--fd-lemon);
                        border-radius:99px;
                        transition:width 1s ease">
            </div>
          </div>
        </div>

        ${xp.niveau.numero < 8 ? `
          <div style="font-size:.72rem;opacity:.7">
            ${(xp.niveau.xpSuivant - xp.total)
              .toLocaleString()} XP jusqu'au niveau suivant
          </div>` : `
          <div style="font-size:.72rem;
                      color:var(--fd-lemon);
                      font-weight:700">
            ⭐ Niveau maximum — Immortel !
          </div>`}
      </div>

      <!-- Stats trophées -->
      <div class="stats-grid mb-md">
        <div class="stat-card">
          <span class="stat-value" style="color:var(--fd-lemon)">
            ${debloquees.length}
          </span>
          <span class="stat-label">Débloqués</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">
            ${trophees.length}
          </span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" style="color:var(--fd-mint)">
            ${Math.round(
              (debloquees.length/trophees.length)*100
            )}%
          </span>
          <span class="stat-label">Complété</span>
        </div>
        <div class="stat-card">
          <span class="stat-value" style="color:var(--fd-indigo)">
            ${xp.total.toLocaleString()}
          </span>
          <span class="stat-label">XP Total</span>
        </div>
      </div>

      <!-- Barre progression trophées -->
      <div class="card mb-md">
        <div class="flex justify-between"
             style="font-size:.78rem;margin-bottom:var(--space-sm)">
          <span style="font-weight:600">
            🏆 Progression trophées
          </span>
          <span style="color:var(--text-muted)">
            ${debloquees.length} / ${trophees.length}
          </span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill"
               style="width:${Math.round(
                 (debloquees.length/Math.max(trophees.length,1))*100
               )}%;background:var(--fd-lemon)">
          </div>
        </div>
      </div>

      <!-- Trophées débloqués -->
      ${debloquees.length > 0 ? `
        <div class="card-label mb-sm">
          🏆 Trophées débloqués (${debloquees.length})
        </div>
        <div style="display:grid;
                    grid-template-columns:repeat(3,1fr);
                    gap:var(--space-sm);
                    margin-bottom:var(--space-md)">
          ${debloquees.map(t => `
            <div style="background:rgba(249,239,119,0.08);
                        border:1px solid rgba(249,239,119,0.3);
                        border-radius:var(--radius-md);
                        padding:var(--space-md) var(--space-xs);
                        text-align:center;
                        transition:transform .2s">
              <div style="font-size:1.8rem;margin-bottom:4px">
                ${t.emoji}
              </div>
              <div style="font-size:.62rem;font-weight:700;
                          color:var(--fd-lemon);
                          line-height:1.3">
                ${t.nom}
              </div>
              <div style="font-size:.58rem;
                          color:var(--fd-mint);
                          margin-top:2px">
                +${t.xp} XP
              </div>
              ${t.dateDeblocage ? `
                <div style="font-size:.52rem;
                            color:var(--text-muted);
                            margin-top:2px">
                  ${Utils.formatDateCourt(t.dateDeblocage)}
                </div>` : ''}
            </div>`).join('')}
        </div>` : `
        <div class="card mb-md"
             style="text-align:center;padding:var(--space-xl)">
          <div style="font-size:2rem;
                      margin-bottom:var(--space-sm)">🔒</div>
          <p style="color:var(--text-muted);font-size:.88rem">
            Aucun trophée débloqué pour l'instant.<br>
            Lance ta première séance !
          </p>
          <button class="btn-primary mt-md"
                  onclick="naviguer('live')"
                  style="width:auto;padding:var(--space-sm) var(--space-lg)">
            ⚡ Commencer
          </button>
        </div>`}

      <!-- Trophées verrouillés -->
      <div class="card-label mb-sm">
        🔒 À débloquer (${verrous.length})
      </div>
      <div style="display:grid;
                  grid-template-columns:repeat(3,1fr);
                  gap:var(--space-sm);
                  margin-bottom:var(--space-md)">
        ${verrous.map(t => `
          <div title="${t.description}"
               style="background:var(--bg-card);
                      border:1px solid var(--border-color);
                      border-radius:var(--radius-md);
                      padding:var(--space-md) var(--space-xs);
                      text-align:center;
                      opacity:.4;filter:grayscale(1)">
            <div style="font-size:1.8rem;margin-bottom:4px">
              ${t.emoji}
            </div>
            <div style="font-size:.62rem;font-weight:700;
                        color:var(--text-secondary);
                        line-height:1.3">
              ${t.nom}
            </div>
            <div style="font-size:.58rem;
                        color:var(--text-muted);
                        margin-top:2px">
              +${t.xp} XP
            </div>
            <div style="font-size:.52rem;
                        color:var(--text-muted);
                        margin-top:4px;line-height:1.3">
              ${t.description}
            </div>
          </div>`).join('')}
      </div>

      <!-- Comment gagner des XP -->
      <div class="card">
        <div class="card-label">⚡ Comment gagner des XP</div>
        <div style="margin-top:var(--space-sm)">
          ${Object.entries(this.XP_ACTIONS).map(([action, xp]) => `
            <div class="score-row">
              <span class="score-row-label"
                    style="font-size:.82rem">
                ${this._labelAction(action)}
              </span>
              <span style="font-size:.82rem;font-weight:700;
                           color:var(--fd-lemon)">
                +${xp} XP
              </span>
            </div>`).join('')}
        </div>
      </div>
    `;
  },

  _labelAction(action) {
    const labels = {
      SEANCE_COMPLETE:  '💪 Séance complétée',
      PR_BATTU:         '🏆 Record personnel battu',
      STREAK_7:         '🔥 Streak de 7 jours',
      DEFI_SEMAINE:     '🎯 Défi semaine accompli',
      JOURNAL:          '📔 Entrée journal',
      HUMEUR:           '😊 Humeur du jour',
      SEMAINE_PARF:     '✨ Semaine parfaite',
      PREMIERE_SEANCE:  '🎯 Première séance',
      PHOTO_AJOUTEE:    '📸 Photo progression',
      OBJECTIF_ATTEINT: '🎯 Objectif atteint',
      MESURE_CORPORELLE:'⚖️ Mesure corporelle',
      SUPERSET_COMPLETE:'⚡ Superset complété'
    };
    return labels[action]
      || action.toLowerCase().replace(/_/g,' ');
  },

  // ════════════════════════════════════════════════════════
  // UTILITAIRES
  // ════════════════════════════════════════════════════════

  // Compter XP total accumulé par catégorie
  getXPParCategorie() {
    const trophees = this.getTrophees()
      .filter(t => t.debloquee);
    const par = {};
    trophees.forEach(t => {
      const cat = t.categorie || 'autre';
      par[cat] = (par[cat] || 0) + t.xp;
    });
    return par;
  },

  // Prochain trophée débloquable
  getProchainTrophee() {
    const trophees = this.getTrophees()
      .filter(t => !t.debloquee);
    // Trier par XP (les plus proches en valeur d'abord)
    return trophees.sort((a,b) => a.xp - b.xp)[0] || null;
  },

  // Reset XP (dev only)
  _resetXP() {
    Utils.storage.set('ft_xp_total', 0);
    Utils.storage.set('ft_trophees', []);
    Utils.toast('XP réinitialisé.', 'info');
  }

}; // ← FIN Gamification

window.Gamification = Gamification;
console.log('✅ Gamification v3.0 chargé');
