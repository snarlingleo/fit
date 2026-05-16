/* ============================================================
   FitTracker Pro — Défis Hebdomadaires v1.0
   Défis générés automatiquement + suivi + récompenses
   ============================================================ */

const Defis = {

  // ─── BANQUE DE DÉFIS ──────────────────────────────────────
  BANQUE: [

    // ══ VOLUME ══
    {
      id:          'vol_bench_100',
      titre:       '💪 100 reps de Développé couché',
      description: 'Cumule 100 répétitions de bench press cette semaine',
      categorie:   'volume',
      exercice:    'bench_press',
      type:        'reps_cumul',
      cible:       100,
      xp:          300,
      emoji:       '💪',
      difficulte:  2
    },
    {
      id:          'vol_squat_80',
      titre:       '🦵 80 reps de Squat',
      description: 'Cumule 80 répétitions de squat cette semaine',
      categorie:   'volume',
      exercice:    'squat',
      type:        'reps_cumul',
      cible:       80,
      xp:          300,
      emoji:       '🦵',
      difficulte:  2
    },
    {
      id:          'vol_total_5000',
      titre:       '🏋️ 5 tonnes soulevées',
      description: 'Cumule 5000kg de volume total cette semaine',
      categorie:   'volume',
      type:        'volume_total',
      cible:       5000,
      xp:          400,
      emoji:       '🏋️',
      difficulte:  3
    },
    {
      id:          'vol_total_8000',
      titre:       '💥 8 tonnes soulevées',
      description: 'Cumule 8000kg de volume total cette semaine',
      categorie:   'volume',
      type:        'volume_total',
      cible:       8000,
      xp:          600,
      emoji:       '💥',
      difficulte:  4
    },
    {
      id:          'vol_traction_50',
      titre:       '🔗 50 tractions',
      description: 'Cumule 50 répétitions de tractions cette semaine',
      categorie:   'volume',
      exercice:    'tractions',
      type:        'reps_cumul',
      cible:       50,
      xp:          350,
      emoji:       '🔗',
      difficulte:  3
    },
    {
      id:          'vol_curl_120',
      titre:       '💪 120 reps de Curl',
      description: 'Cumule 120 répétitions de curl cette semaine',
      categorie:   'volume',
      exercice:    'curl_halteres',
      type:        'reps_cumul',
      cible:       120,
      xp:          200,
      emoji:       '💪',
      difficulte:  1
    },

    // ══ SÉANCES ══
    {
      id:          'seance_4_semaine',
      titre:       '📅 4 séances cette semaine',
      description: 'Complète 4 séances dans la semaine',
      categorie:   'assiduite',
      type:        'seances_semaine',
      cible:       4,
      xp:          250,
      emoji:       '📅',
      difficulte:  2
    },
    {
      id:          'seance_5_semaine',
      titre:       '🔥 5 séances cette semaine',
      description: 'Complète 5 séances dans la semaine',
      categorie:   'assiduite',
      type:        'seances_semaine',
      cible:       5,
      xp:          400,
      emoji:       '🔥',
      difficulte:  3
    },
    {
      id:          'seance_matin',
      titre:       '🌅 3 séances avant 10h',
      description: 'Complète 3 séances avant 10h du matin',
      categorie:   'assiduite',
      type:        'seances_matin',
      cible:       3,
      xp:          300,
      emoji:       '🌅',
      difficulte:  3
    },
    {
      id:          'seance_full_body',
      titre:       '🔄 2 séances Full Body',
      description: 'Complète 2 séances Full Body cette semaine',
      categorie:   'assiduite',
      type:        'seance_type',
      seanceId:    'full_body',
      cible:       2,
      xp:          250,
      emoji:       '🔄',
      difficulte:  2
    },

    // ══ FORCE / PR ══
    {
      id:          'pr_bench',
      titre:       '🏆 Nouveau PR Développé couché',
      description: 'Bats ton record sur le développé couché',
      categorie:   'force',
      exercice:    'bench_press',
      type:        'nouveau_pr',
      cible:       1,
      xp:          500,
      emoji:       '🏆',
      difficulte:  4
    },
    {
      id:          'pr_squat',
      titre:       '🦵 Nouveau PR Squat',
      description: 'Bats ton record sur le squat',
      categorie:   'force',
      exercice:    'squat',
      type:        'nouveau_pr',
      cible:       1,
      xp:          500,
      emoji:       '🦵',
      difficulte:  4
    },
    {
      id:          'pr_any_3',
      titre:       '🎯 3 nouveaux records',
      description: 'Bats 3 records personnels cette semaine',
      categorie:   'force',
      type:        'prs_semaine',
      cible:       3,
      xp:          600,
      emoji:       '🎯',
      difficulte:  4
    },
    {
      id:          'force_serie_lourde',
      titre:       '💎 Série lourde (5 reps max)',
      description: 'Fais une série de 5 reps ou moins sur n\'importe quel exercice',
      categorie:   'force',
      type:        'serie_lourde',
      cible:       1,
      xp:          200,
      emoji:       '💎',
      difficulte:  3
    },

    // ══ RÉGULARITÉ ══
    {
      id:          'streak_7',
      titre:       '🔥 Streak 7 jours',
      description: 'Maintiens un streak de 7 jours consécutifs',
      categorie:   'regularite',
      type:        'streak',
      cible:       7,
      xp:          500,
      emoji:       '🔥',
      difficulte:  4
    },
    {
      id:          'streak_5',
      titre:       '⚡ Streak 5 jours',
      description: 'Maintiens un streak de 5 jours consécutifs',
      categorie:   'regularite',
      type:        'streak',
      cible:       5,
      xp:          300,
      emoji:       '⚡',
      difficulte:  3
    },
    {
      id:          'pas_absence',
      titre:       '✅ Zéro absence cette semaine',
      description: 'Ne manque aucune séance planifiée cette semaine',
      categorie:   'regularite',
      type:        'zero_absence',
      cible:       1,
      xp:          400,
      emoji:       '✅',
      difficulte:  3
    },

    // ══ BIEN-ÊTRE ══
    {
      id:          'journal_3',
      titre:       '📔 3 entrées journal',
      description: 'Écris 3 entrées dans ton journal cette semaine',
      categorie:   'bienetre',
      type:        'journal_semaine',
      cible:       3,
      xp:          150,
      emoji:       '📔',
      difficulte:  1
    },
    {
      id:          'mesure_semaine',
      titre:       '⚖️ Prendre ses mesures',
      description: 'Enregistre tes mesures corporelles cette semaine',
      categorie:   'bienetre',
      type:        'mesure_semaine',
      cible:       1,
      xp:          100,
      emoji:       '⚖️',
      difficulte:  1
    },
    {
      id:          'rpe_controle',
      titre:       '🎯 RPE maîtrisé',
      description: 'Maintiens un RPE entre 7 et 8.5 sur toutes tes séances',
      categorie:   'bienetre',
      type:        'rpe_controle',
      cible:       1,
      xp:          200,
      emoji:       '🎯',
      difficulte:  2
    },

    // ══ CARDIO ══
    {
      id:          'cardio_3',
      titre:       '🚴 3 sessions cardio',
      description: 'Fais 3 sessions de cardio cette semaine',
      categorie:   'cardio',
      type:        'cardio_semaine',
      cible:       3,
      xp:          200,
      emoji:       '🚴',
      difficulte:  2
    },
    {
      id:          'rameur_15min',
      titre:       '🚣 15 min de rameur',
      description: 'Fais au moins 15 min de rameur en une session',
      categorie:   'cardio',
      exercice:    'rameur',
      type:        'cardio_duree',
      cible:       15,
      xp:          150,
      emoji:       '🚣',
      difficulte:  2
    }
  ],

  // ─── GÉNÉRER DÉFIS DE LA SEMAINE ──────────────────────────
  genererDefis(forceRegen = false) {
    const semaine  = Utils.debutSemaine(Utils.aujourd_hui());
    const cleCache = `ft_defis_${semaine}`;
    const cached   = Utils.storage.get(cleCache, null);

    if (cached && !forceRegen) return cached;

    const profil   = Tracker.getProfil();
    const seances  = Tracker.getTotalSeances();
    const streak   = Tracker.getStreak();

    // Adapter la difficulté au niveau
    const niveauMax =
      seances < 5  ? 1 :
      seances < 20 ? 2 :
      seances < 50 ? 3 : 4;

    // Filtrer par difficulté accessible
    const disponibles = this.BANQUE.filter(
      d => d.difficulte <= niveauMax + 1
    );

    // Sélectionner 4 défis variés (1 par catégorie principale)
    const categories = ['volume','assiduite','force','regularite'];
    const selectionnes = [];

    categories.forEach(cat => {
      const dispo = disponibles.filter(
        d => d.categorie === cat
          && !selectionnes.find(s => s.id === d.id)
      );
      if (dispo.length > 0) {
        const idx = Math.floor(
          (new Date(semaine).getTime() / 1000 / 60 / 60 / 24) % dispo.length
        );
        selectionnes.push(dispo[idx] || dispo[0]);
      }
    });

    // Ajouter 1 défi bonus bien-être
    const bienetre = disponibles.filter(d => d.categorie === 'bienetre');
    if (bienetre.length) selectionnes.push(bienetre[0]);

    // Initialiser la progression
    const defisAvecProgression = selectionnes.map(d => ({
      ...d,
      progression: 0,
      complete:    false,
      semaine
    }));

    Utils.storage.set(cleCache, defisAvecProgression);
    return defisAvecProgression;
  },

  // ─── METTRE À JOUR PROGRESSION ────────────────────────────
  mettreAJourProgression() {
    const semaine  = Utils.debutSemaine(Utils.aujourd_hui());
    const cleCache = `ft_defis_${semaine}`;
    const defis    = Utils.storage.get(cleCache, null);
    if (!defis) return;

    const seances     = Tracker.getSeancesParSemaine();
    const volumeSem   = Tracker.getVolumeSemaine();
    const streak      = Tracker.getStreak();
    const journal     = Tracker.getJournal();
    const mesures     = Tracker.getMesures();
    const prs         = Tracker.getAllPRs();

    // PRs battus cette semaine
    const prsSemaine = Object.values(prs).filter(
      pr => pr.date >= semaine
    ).length;

    const mis_a_jour = defis.map(defi => {
      if (defi.complete) return defi;

      let progression = 0;

      switch(defi.type) {

        case 'seances_semaine':
          progression = seances;
          break;

        case 'volume_total':
          progression = volumeSem;
          break;

        case 'streak':
          progression = streak.count;
          break;

        case 'prs_semaine':
          progression = prsSemaine;
          break;

        case 'nouveau_pr':
          const pr = prs[defi.exercice];
          progression = (pr?.date >= semaine) ? 1 : 0;
          break;

        case 'journal_semaine':
          progression = journal.filter(
            e => e.date >= semaine
          ).length;
          break;

        case 'mesure_semaine':
          progression = mesures.filter(
            m => m.date >= semaine
          ).length;
          break;

        case 'reps_cumul':
          progression = this._calculerRepsCumul(defi.exercice, semaine);
          break;

        case 'zero_absence':
          progression = this._verifierZeroAbsence(semaine) ? 1 : 0;
          break;

        case 'seances_matin':
          progression = this._compterSeancesMatin(semaine);
          break;

        case 'rpe_controle':
          progression = this._verifierRPEControle(semaine) ? 1 : 0;
          break;

        case 'seance_type':
          progression = this._compterSeanceType(defi.seanceId, semaine);
          break;

        case 'serie_lourde':
          progression = this._verifierSerieLourde(semaine) ? 1 : 0;
          break;

        case 'cardio_semaine':
          progression = this._compterCardio(semaine);
          break;
      }

      const complete = progression >= defi.cible;

      // Récompenser si nouvellement complété
      if (complete && !defi.complete) {
        this._recompenser(defi);
      }

      return {
        ...defi,
        progression: Math.min(progression, defi.cible),
        complete
      };
    });

    Utils.storage.set(cleCache, mis_a_jour);
    return mis_a_jour;
  },

  // ─── HELPERS CALCUL ───────────────────────────────────────
  _calculerRepsCumul(exerciceRef, semaine) {
    const hist = Tracker.getHistoriqueExercice(exerciceRef, 200);
    return hist
      .filter(h => h.date >= semaine)
      .reduce((acc, h) => acc + (h.reps || 0), 0);
  },

  _verifierZeroAbsence(semaine) {
    const planning = PLANNING_SEMAINE;
    for (let i = 0; i < 7; i++) {
      const date = Utils.ajouterJours(semaine, i);
      if (date > Utils.aujourd_hui()) break;
      const p = planning[i];
      if (!p?.seanceId) continue;
      const s = Tracker.getSeanceDuJour(date);
      if (!s?.complete) return false;
    }
    return true;
  },

  _compterSeancesMatin(semaine) {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (!cle.startsWith('ft_seance_')) continue;
      const data = JSON.parse(localStorage.getItem(cle));
      if (!data.complete || !data.date || data.date < semaine) continue;
      const heure = new Date(data.debut).getHours();
      if (heure < 10) count++;
    }
    return count;
  },

  _verifierRPEControle(semaine) {
    const seances = Tracker.getHistoriqueSeances(10);
    const sem = seances.filter(s => s.date >= semaine && s.rpesMoyen);
    if (!sem.length) return false;
    return sem.every(s => s.rpesMoyen >= 7 && s.rpesMoyen <= 8.5);
  },

  _compterSeanceType(seanceId, semaine) {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (!cle.startsWith(`ft_seance_`)) continue;
      const data = JSON.parse(localStorage.getItem(cle));
      if (data.complete && data.id === seanceId
          && data.date >= semaine) count++;
    }
    return count;
  },

  _verifierSerieLourde(semaine) {
    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (!cle.startsWith('ft_seance_')) continue;
      const data = JSON.parse(localStorage.getItem(cle));
      if (!data.complete || data.date < semaine) continue;
      const lourde = (data.series || []).find(s => s.reps <= 5 && s.poids > 0);
      if (lourde) return true;
    }
    return false;
  },

  _compterCardio(semaine) {
    const cardioIds = ['rameur','velo'];
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (!cle.startsWith('ft_seance_')) continue;
      const data = JSON.parse(localStorage.getItem(cle));
      if (!data.complete || data.date < semaine) continue;
      const hasCardio = (data.series||[]).some(
        s => cardioIds.includes(s.exerciceRef)
      );
      if (hasCardio) count++;
    }
    return count;
  },

  // ─── RÉCOMPENSER ──────────────────────────────────────────
  _recompenser(defi) {
    setTimeout(() => {
      timerRepos.jouerSon('pr');
      Utils.confetti(3000);
      Utils.vibrerPR();
      Utils.toast(
        `🏆 Défi accompli : ${defi.emoji} ${defi.titre} ! +${defi.xp} XP`,
        'pr', 6000
      );
      Gamification.ajouterXP(defi.xp, `Défi : ${defi.titre}`);
      Utils.storage.set(`ft_defi_done_${defi.id}`, Utils.aujourd_hui());
    }, 500);
  },

  // ─── HISTORIQUE DÉFIS ─────────────────────────────────────
  getHistoriqueDefis(nbSemaines = 4) {
    const historique = [];
    for (let i = 0; i < nbSemaines; i++) {
      const date   = Utils.ajouterJours(Utils.aujourd_hui(), -i * 7);
      const sem    = Utils.debutSemaine(date);
      const defis  = Utils.storage.get(`ft_defis_${sem}`, null);
      if (defis) {
        const completes = defis.filter(d => d.complete).length;
        historique.push({
          semaine:   sem,
          label:     Utils.formatDateCourt(sem),
          defis,
          completes,
          total:     defis.length,
          xpGagne:   defis
            .filter(d => d.complete)
            .reduce((acc, d) => acc + d.xp, 0)
        });
      }
    }
    return historique;
  },

  // ─── RENDER ───────────────────────────────────────────────
  render(container) {
    if (!container) return;

    const defis     = this.mettreAJourProgression()
                   || this.genererDefis();
    const historique = this.getHistoriqueDefis(4);
    const completes  = defis.filter(d => d.complete).length;
    const semaine    = Utils.debutSemaine(Utils.aujourd_hui());
    const finSemaine = Utils.finSemaine(Utils.aujourd_hui());

    container.innerHTML = `

      <!-- Header semaine -->
      <div class="card mb-md"
           style="background:linear-gradient(135deg,
                  rgba(249,239,119,0.15) 0%,
                  rgba(75,75,249,0.15) 100%);
                  border-color:var(--fd-lemon)">
        <div class="flex justify-between items-center">
          <div>
            <div class="card-label" style="color:var(--fd-lemon)">
              🏆 Défis de la semaine
            </div>
            <div style="font-size:.78rem;color:var(--text-muted);
                        margin-top:2px">
              Du ${Utils.formatDateCourt(semaine)}
              au ${Utils.formatDateCourt(finSemaine)}
            </div>
          </div>
          <div style="text-align:center">
            <div style="font-size:1.8rem;font-weight:800;
                        color:var(--fd-lemon)">
              ${completes}/${defis.length}
            </div>
            <div style="font-size:.65rem;color:var(--text-muted)">
              complétés
            </div>
          </div>
        </div>

        <!-- Barre progression globale -->
        <div style="margin-top:var(--space-md)">
          <div class="progress-bar">
            <div class="progress-fill"
                 style="width:${Math.round((completes/defis.length)*100)}%;
                        background:var(--fd-lemon)">
            </div>
          </div>
        </div>

        <!-- XP disponible -->
        <div style="display:flex;justify-content:space-between;
                    margin-top:var(--space-sm);font-size:.72rem">
          <span style="color:var(--text-muted)">
            XP cette semaine
          </span>
          <span style="color:var(--fd-lemon);font-weight:700">
            +${defis.filter(d=>d.complete)
              .reduce((a,d)=>a+d.xp,0)} /
            ${defis.reduce((a,d)=>a+d.xp,0)} XP
          </span>
        </div>
      </div>

      <!-- Défis actifs -->
      <div class="section-title">⚡ Défis en cours</div>

      ${defis.map(defi => {
        const pct = Math.round((defi.progression / defi.cible) * 100);
        const couleur =
          defi.complete      ? 'var(--fd-mint)'    :
          pct >= 50          ? 'var(--fd-lemon)'   :
                               'var(--fd-indigo)';

        return `
          <div class="card mb-md"
               style="${defi.complete
                 ? 'border-color:var(--fd-mint);'
                   + 'background:rgba(139,240,187,0.05)'
                 : ''}">

            <div class="flex items-center gap-md">
              <!-- Emoji + check -->
              <div style="width:48px;height:48px;border-radius:50%;
                          background:${defi.complete
                            ? 'var(--fd-mint)'
                            : 'var(--bg-input)'};
                          display:flex;align-items:center;
                          justify-content:center;font-size:1.4rem;
                          flex-shrink:0">
                ${defi.complete ? '✅' : defi.emoji}
              </div>

              <div style="flex:1">
                <div style="font-weight:700;font-size:.92rem;
                            color:${defi.complete
                              ? 'var(--fd-mint)'
                              : 'var(--text-primary)'}">
                  ${defi.titre}
                </div>
                <div style="font-size:.72rem;color:var(--text-muted);
                            margin-top:2px">
                  ${defi.description}
                </div>

                <!-- Barre progression -->
                <div style="margin-top:var(--space-sm)">
                  <div style="display:flex;justify-content:space-between;
                              font-size:.68rem;margin-bottom:4px">
                    <span style="color:${couleur};font-weight:600">
                      ${defi.progression} / ${defi.cible}
                    </span>
                    <span style="color:var(--fd-lemon);font-weight:700">
                      +${defi.xp} XP
                    </span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill"
                         style="width:${pct}%;
                                background:${couleur}">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            ${defi.complete ? `
              <div style="margin-top:var(--space-sm);
                          text-align:center;
                          font-size:.75rem;
                          color:var(--fd-mint);
                          font-weight:600">
                🎉 Défi accompli !
                ${Utils.storage.get(`ft_defi_done_${defi.id}`)
                  ? `· ${Utils.formatDateCourt(
                      Utils.storage.get(`ft_defi_done_${defi.id}`)
                    )}`
                  : ''}
              </div>` : ''}
          </div>`;
      }).join('')}

      <!-- Bouton régénérer -->
      <button onclick="Defis._confirmerRegen()"
              class="btn-secondary mb-md"
              style="width:100%;font-size:.82rem">
        🔄 Nouveaux défis (reset semaine)
      </button>

      <!-- Historique -->
      ${historique.length > 1 ? `
        <div class="section-title">📊 Historique défis</div>
        ${historique.slice(1).map(sem => `
          <div class="card mb-md">
            <div class="flex justify-between items-center">
              <div>
                <div style="font-weight:600;font-size:.88rem">
                  Semaine du ${sem.label}
                </div>
                <div style="font-size:.72rem;
                            color:var(--text-muted);
                            margin-top:2px">
                  ${sem.completes}/${sem.total} défis
                  · +${sem.xpGagne} XP
                </div>
              </div>
              <div style="font-size:1.5rem">
                ${sem.completes === sem.total ? '🏆'
                  : sem.completes >= sem.total / 2 ? '⭐'
                  : '📊'}
              </div>
            </div>
            <div style="margin-top:var(--space-sm)">
              <div class="progress-bar">
                <div class="progress-fill"
                     style="width:${Math.round(
                       (sem.completes/sem.total)*100
                     )}%;
                     background:var(--fd-lavender)">
                </div>
              </div>
            </div>
          </div>`).join('')}` : ''}
    `;
  },

  // ─── CONFIRMER RÉGÉNÉRATION ───────────────────────────────
  async _confirmerRegen() {
    const ok = await Utils.confirmer(
      'Nouveaux défis ?',
      'Ça va réinitialiser les défis de la semaine. Continuer ?'
    );
    if (!ok) return;
    this.genererDefis(true);
    this.render(document.getElementById('profil-content')
      || document.getElementById('page-content'));
    Utils.toast('🔄 Nouveaux défis générés !', 'success');
  }
};

window.Defis = Defis;
console.log('✅ Defis v1.0 chargé');
