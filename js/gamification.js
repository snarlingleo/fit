/* ============================================================
   FitTracker Pro — Gamification v2
   XP, Niveaux, Trophées, Badges, Confetti
   ============================================================ */

const Gamification = {

  NIVEAUX: [
    { numero:1, nom:'Débutant',    emoji:'🌱', xpMin:0,     xpSuivant:500   },
    { numero:2, nom:'Apprenti',    emoji:'💪', xpMin:500,   xpSuivant:1200  },
    { numero:3, nom:'Confirmé',    emoji:'🏃', xpMin:1200,  xpSuivant:2500  },
    { numero:4, nom:'Athlète',     emoji:'⚡', xpMin:2500,  xpSuivant:5000  },
    { numero:5, nom:'Expert',      emoji:'🔥', xpMin:5000,  xpSuivant:10000 },
    { numero:6, nom:'Élite',       emoji:'💎', xpMin:10000, xpSuivant:20000 },
    { numero:7, nom:'Légende',     emoji:'👑', xpMin:20000, xpSuivant:99999 }
  ],

  TROPHEES_DEF: [
    // ── Premiers pas
    { id:'first_session',  nom:'Première séance',     emoji:'🎯', xp:100,
      description:'Terminer sa première séance',
      condition: d => d.totalSeances >= 1 },
    { id:'first_pr',       nom:'Premier record',      emoji:'🏆', xp:150,
      description:'Battre un premier PR',
      condition: d => d.totalPRs >= 1 },
    { id:'first_week',     nom:'Première semaine',    emoji:'📅', xp:200,
      description:'Compléter 4 séances en une semaine',
      condition: d => d.seancesParSemaine >= 4 },

    // ── Streak
    { id:'streak_3',       nom:'3 jours d\'affilée',  emoji:'🔥', xp:100,
      description:'Streak de 3 jours',
      condition: d => d.streak >= 3 },
    { id:'streak_7',       nom:'Une semaine pleine',   emoji:'🔥', xp:200,
      description:'Streak de 7 jours',
      condition: d => d.streak >= 7 },
    { id:'streak_14',      nom:'2 semaines non-stop',  emoji:'🔥', xp:350,
      description:'Streak de 14 jours',
      condition: d => d.streak >= 14 },
    { id:'streak_30',      nom:'Mois de fer',          emoji:'💎', xp:600,
      description:'Streak de 30 jours',
      condition: d => d.streak >= 30 },
    { id:'streak_60',      nom:'Machine de guerre',    emoji:'⚡', xp:1000,
      description:'Streak de 60 jours',
      condition: d => d.streak >= 60 },
    { id:'streak_100',     nom:'Centurion du fitness', emoji:'👑', xp:2000,
      description:'Streak de 100 jours',
      condition: d => d.streak >= 100 },

    // ── Séances
    { id:'sessions_5',     nom:'5 séances',            emoji:'💪', xp:100,
      description:'5 séances totales',
      condition: d => d.totalSeances >= 5 },
    { id:'sessions_10',    nom:'10 séances',            emoji:'💪', xp:150,
      description:'10 séances totales',
      condition: d => d.totalSeances >= 10 },
    { id:'sessions_25',    nom:'25 séances',            emoji:'🏋️', xp:300,
      description:'25 séances totales',
      condition: d => d.totalSeances >= 25 },
    { id:'sessions_50',    nom:'50 séances',            emoji:'🎖️', xp:500,
      description:'50 séances totales',
      condition: d => d.totalSeances >= 50 },
    { id:'sessions_100',   nom:'Centurion',             emoji:'💯', xp:1000,
      description:'100 séances totales',
      condition: d => d.totalSeances >= 100 },
    { id:'sessions_200',   nom:'Légende vivante',       emoji:'👑', xp:2000,
      description:'200 séances totales',
      condition: d => d.totalSeances >= 200 },

    // ── PRs
    { id:'prs_3',          nom:'Premiers records',      emoji:'🏅', xp:150,
      description:'3 records personnels',
      condition: d => d.totalPRs >= 3 },
    { id:'prs_5',          nom:'Collectionneur',        emoji:'🏅', xp:200,
      description:'5 records personnels',
      condition: d => d.totalPRs >= 5 },
    { id:'prs_10',         nom:'Record Man',            emoji:'🎯', xp:400,
      description:'10 records personnels',
      condition: d => d.totalPRs >= 10 },
    { id:'prs_20',         nom:'Maître des records',    emoji:'👑', xp:800,
      description:'20 records personnels',
      condition: d => d.totalPRs >= 20 },

    // ── Force
    { id:'bench_80',       nom:'Pecto de feu',          emoji:'🔥', xp:300,
      description:'Développé couché 80kg',
      condition: d => (d.prs['bench_press']?.poids||0) >= 80 },
    { id:'bench_100',      nom:'Club des 100',          emoji:'💎', xp:600,
      description:'Développé couché 100kg',
      condition: d => (d.prs['bench_press']?.poids||0) >= 100 },
    { id:'squat_100',      nom:'Jambes d\'acier',       emoji:'🦵', xp:600,
      description:'Squat 100kg',
      condition: d => (d.prs['squat']?.poids||0) >= 100 },
    { id:'deadlift_100',   nom:'Terre ferme',           emoji:'🏋️', xp:600,
      description:'Soulevé de terre 100kg',
      condition: d => (d.prs['soulevé_terre']?.poids||0) >= 100 },
    { id:'deadlift_140',   nom:'Force brute',           emoji:'💥', xp:1000,
      description:'Soulevé de terre 140kg',
      condition: d => (d.prs['soulevé_terre']?.poids||0) >= 140 },

    // ── Programme
    { id:'phase_1',        nom:'Phase 1 terminée',      emoji:'🌱', xp:400,
      description:'Compléter la Phase Reprise',
      condition: d => d.phasesTerminees >= 1 },
    { id:'cycle_1',        nom:'Cycle complet',         emoji:'🏆', xp:1000,
      description:'Compléter un cycle de 16 semaines',
      condition: d => d.cyclesTermines >= 1 },

    // ── Spéciaux
    { id:'comeback',       nom:'Le Retour',             emoji:'🦅', xp:200,
      description:'Reprendre après 7+ jours d\'absence',
      condition: d => d.comeback },
    { id:'journal_10',     nom:'Chroniqueur',           emoji:'📔', xp:150,
      description:'10 entrées dans le journal',
      condition: d => d.totalJournal >= 10 },
    { id:'objectif_atteint',nom:'Objectif accompli',   emoji:'🎯', xp:500,
      description:'Atteindre un objectif personnel',
      condition: d => d.objectifsAtteints >= 1 }
  ],

  // ─── XP ───────────────────────────────────────────────────
  getXP() {
    const total  = Utils.storage.get('ft_xp_total', 0);
    const niveau = this.getNiveau(total);
    const xpNiv  = total - niveau.xpMin;
    const range  = niveau.xpSuivant - niveau.xpMin;
    const pct    = Math.min(100, Math.round((xpNiv / range) * 100));
    return { total, niveau, pourcentage: pct };
  },

  getNiveau(xp) {
    let actuel = this.NIVEAUX[0];
    for (const n of this.NIVEAUX) {
      if (xp >= n.xpMin) actuel = n;
    }
    return actuel;
  },

  ajouterXP(montant, raison = '') {
    const avant  = Utils.storage.get('ft_xp_total', 0);
    const apres  = avant + montant;
    Utils.storage.set('ft_xp_total', apres);

    const nivAvant = this.getNiveau(avant);
    const nivApres = this.getNiveau(apres);

    if (nivApres.numero > nivAvant.numero) {
      timerRepos.jouerSon('levelup');
      Utils.vibrer([200,100,200,100,400]);
      Utils.confetti(3000);
      setTimeout(() => {
        Utils.toast(
          `🎉 NIVEAU ${nivApres.numero} — ${nivApres.emoji} ${nivApres.nom} !`,
          'success', 5000
        );
      }, 500);
    } else if (raison && montant >= 50) {
      Utils.toast(`+${montant} XP — ${raison}`, 'info', 2000);
    }

    return apres;
  },

  // ─── TROPHÉES ─────────────────────────────────────────────
  getTrophees() {
    const debloquees = Utils.storage.get('ft_trophees', []);
    return this.TROPHEES_DEF.map(t => ({
      ...t,
      debloquee:     debloquees.includes(t.id),
      dateDeblocage: Utils.storage.get(`ft_trophy_date_${t.id}`, null)
    }));
  },

  verifierTrophees() {
    const debloquees = Utils.storage.get('ft_trophees', []);
    const streak     = Tracker.getStreak();
    const prs        = Tracker.getAllPRs();
    const journal    = Tracker.getJournal();
    const objectifs  = Tracker.getObjectifs();

    const donnees = {
      totalSeances:      Tracker.getTotalSeances(),
      totalPRs:          Object.keys(prs).length,
      streak:            streak.count,
      seancesParSemaine: Tracker.getSeancesParSemaine(),
      prs,
      totalJournal:      journal.length,
      objectifsAtteints: objectifs.filter(o => o.complete).length,
      comeback:          Utils.storage.get('ft_comeback', false),
      phasesTerminees:   Utils.storage.get('ft_phases_terminees', 0),
      cyclesTermines:    Utils.storage.get('ft_cycles_termines', 0)
    };

    const nouveaux = [];

    this.TROPHEES_DEF.forEach(t => {
      if (debloquees.includes(t.id)) return;
      try {
        if (t.condition(donnees)) {
          debloquees.push(t.id);
          nouveaux.push(t);
          Utils.storage.set(`ft_trophy_date_${t.id}`, Utils.aujourd_hui());
        }
      } catch(e) {}
    });

    if (nouveaux.length > 0) {
      Utils.storage.set('ft_trophees', debloquees);
      nouveaux.forEach((t, i) => {
        setTimeout(() => {
          timerRepos.jouerSon('pr');
          Utils.toast(
            `🏆 Trophée : ${t.emoji} ${t.nom} — +${t.xp} XP`,
            'pr', 5000
          );
          this.ajouterXP(t.xp, `Trophée ${t.nom}`);
        }, i * 1500);
      });
    }

    return nouveaux;
  },

  // ─── ACTIONS XP ───────────────────────────────────────────
  XP_ACTIONS: {
    SEANCE_COMPLETE:  100,
    PR_BATTU:          50,
    STREAK_7:         150,
    DEFI_SEMAINE:     200,
    JOURNAL:           25,
    HUMEUR:            10,
    SEMAINE_PARF:     300,
    PREMIERE_SEANCE:  200
  },

  recompenser(action) {
    const montant = this.XP_ACTIONS[action] || 0;
    if (montant > 0) {
      this.ajouterXP(montant, action.toLowerCase().replace(/_/g,' '));
    }
    setTimeout(() => this.verifierTrophees(), 500);
  },

  // ─── RENDER GAMIFICATION TAB ──────────────────────────────
  renderGamificationTab(container) {
    const xp         = this.getXP();
    const trophees   = this.getTrophees();
    const debloquees = trophees.filter(t =>  t.debloquee);
    const verrous    = trophees.filter(t => !t.debloquee);

    container.innerHTML = `

      <!-- XP + Niveau -->
      <div class="card mb-md"
           style="background:linear-gradient(135deg,
                  var(--fd-indigo) 0%, #7b2ff7 100%);
                  border:none;text-align:center">
        <div style="font-size:2rem;margin-bottom:4px">
          ${xp.niveau.emoji}
        </div>
        <div style="font-size:1.2rem;font-weight:800">
          Niveau ${xp.niveau.numero} — ${xp.niveau.nom}
        </div>
        <div style="font-size:.78rem;opacity:.8;margin-top:4px">
          ${xp.total} XP total
        </div>

        <div style="margin-top:var(--space-md)">
          <div style="display:flex;justify-content:space-between;
                      font-size:.68rem;opacity:.7;margin-bottom:6px">
            <span>${xp.niveau.xpMin} XP</span>
            <span>${xp.pourcentage}%</span>
            <span>${xp.niveau.xpSuivant} XP</span>
          </div>
          <div style="height:8px;background:rgba(255,255,255,0.2);
                      border-radius:99px;overflow:hidden">
            <div style="height:100%;width:${xp.pourcentage}%;
                        background:var(--fd-lemon);
                        border-radius:99px;
                        transition:width 1s ease">
            </div>
          </div>
        </div>

        ${xp.niveau.numero < 7 ? `
          <div style="margin-top:var(--space-md);
                      font-size:.72rem;opacity:.7">
            ${xp.niveau.xpSuivant - xp.total} XP
            jusqu'au niveau suivant
          </div>` : `
          <div style="margin-top:var(--space-md);
                      font-size:.72rem;color:var(--fd-lemon)">
            👑 Niveau maximum atteint !
          </div>`}
      </div>

      <!-- Compteur trophées -->
      <div class="stats-grid mb-md">
        <div class="stat-card">
          <span class="stat-value">${debloquees.length}</span>
          <span class="stat-label">Débloqués</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${trophees.length}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">
            ${Math.round((debloquees.length / trophees.length) * 100)}%
          </span>
          <span class="stat-label">Complété</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${xp.total}</span>
          <span class="stat-label">XP Total</span>
        </div>
      </div>

      <!-- Trophées débloqués -->
      ${debloquees.length > 0 ? `
        <div class="card-label mb-sm">
          🏆 Trophées débloqués (${debloquees.length})
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);
                    gap:var(--space-sm);margin-bottom:var(--space-md)">
          ${debloquees.map(t => `
            <div style="background:rgba(249,239,119,0.08);
                        border:1px solid rgba(249,239,119,0.3);
                        border-radius:var(--radius-md);
                        padding:var(--space-md) var(--space-sm);
                        text-align:center">
              <div style="font-size:1.8rem;margin-bottom:4px">
                ${t.emoji}
              </div>
              <div style="font-size:.65rem;font-weight:700;
                          color:var(--fd-lemon)">
                ${t.nom}
              </div>
              <div style="font-size:.6rem;color:var(--text-muted);
                          margin-top:2px">
                +${t.xp} XP
              </div>
              ${t.dateDeblocage ? `
                <div style="font-size:.55rem;color:var(--text-muted);
                            margin-top:2px">
                  ${Utils.formatDateCourt(t.dateDeblocage)}
                </div>` : ''}
            </div>`).join('')}
        </div>` : `
        <div class="card mb-md"
             style="text-align:center;padding:var(--space-xl)">
          <div style="font-size:2rem;margin-bottom:var(--space-sm)">🔒</div>
          <div style="font-size:.88rem;color:var(--text-muted)">
            Aucun trophée débloqué pour l'instant.
            <br>Commence tes séances !
          </div>
        </div>`}

      <!-- Trophées verrouillés -->
      <div class="card-label mb-sm">
        🔒 À débloquer (${verrous.length})
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);
                  gap:var(--space-sm);margin-bottom:var(--space-md)">
        ${verrous.map(t => `
          <div style="background:var(--bg-card);
                      border:1px solid var(--border-color);
                      border-radius:var(--radius-md);
                      padding:var(--space-md) var(--space-sm);
                      text-align:center;
                      opacity:0.4;filter:grayscale(1)">
            <div style="font-size:1.8rem;margin-bottom:4px">
              ${t.emoji}
            </div>
            <div style="font-size:.65rem;font-weight:700;
                        color:var(--text-secondary)">
              ${t.nom}
            </div>
            <div style="font-size:.6rem;color:var(--text-muted);
                        margin-top:2px">
              +${t.xp} XP
            </div>
            <div style="font-size:.55rem;color:var(--text-muted);
                        margin-top:4px;line-height:1.3">
              ${t.description}
            </div>
          </div>`).join('')}
      </div>

      <!-- Actions XP -->
      <div class="card">
        <div class="card-label">⚡ Comment gagner des XP</div>
        ${Object.entries(this.XP_ACTIONS).map(([action, xp]) => `
          <div class="score-row">
            <span class="score-row-label">
              ${action.toLowerCase().replace(/_/g,' ')}
            </span>
            <span class="score-row-value"
                  style="color:var(--fd-lemon)">
              +${xp} XP
            </span>
          </div>`).join('')}
      </div>
    `;
  }

}; // ← FIN de Gamification

window.Gamification = Gamification;
console.log('✅ Gamification v2 chargé');
