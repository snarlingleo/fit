/* ============================================================
   FitTracker Pro — i18n v1.0
   Internationalisation FR / EN
   ============================================================ */

const i18n = {

  // ─── LANGUE ACTIVE ────────────────────────────────────────
  _langue: null,

  getLangue() {
    if (this._langue) return this._langue;
    const saved    = Utils.storage.get('ft_langue', null);
    const browser  = navigator.language?.startsWith('fr') ? 'fr' : 'en';
    this._langue   = saved || browser;
    return this._langue;
  },

  setLangue(code) {
    this._langue = code;
    Utils.storage.set('ft_langue', code);
    Utils.toast(
      code === 'fr'
        ? '🇫🇷 Langue : Français'
        : '🇬🇧 Language: English',
      'success'
    );
    // Refresh page courante
    if (window.naviguer) naviguer(window._pageActive || 'home');
  },

  // ─── TRADUCTION ───────────────────────────────────────────
  t(cle, params = {}) {
    const lang    = this.getLangue();
    const dico    = this.DICO[lang] || this.DICO.fr;
    const parties = cle.split('.');
    let   valeur  = dico;

    for (const partie of parties) {
      valeur = valeur?.[partie];
      if (valeur === undefined) {
        // Fallback FR si clé manquante en EN
        valeur = this.DICO.fr;
        for (const p of parties) valeur = valeur?.[p];
        break;
      }
    }

    if (typeof valeur !== 'string') return cle;

    // Remplacer les paramètres {{nom}}
    return valeur.replace(/\{\{(\w+)\}\}/g, (_, k) =>
      params[k] !== undefined ? params[k] : `{{${k}}}`
    );
  },

  // ─── DICTIONNAIRE ─────────────────────────────────────────
  DICO: {

    // ══════════════════════════════════════════════════════
    // FRANÇAIS
    // ══════════════════════════════════════════════════════
    fr: {

      // Navigation
      nav: {
        home:      'Accueil',
        training:  'Training',
        live:      'Live',
        nutrition: 'Nutrition',
        profile:   'Profil',
        stats:     'Stats'
      },

      // Accueil
      home: {
        titre:           'Bonjour',
        phase_actuelle:  'Phase actuelle',
        seance_du_jour:  'Séance du jour',
        repos:           'Jour de repos',
        demarrer:        'Démarrer la séance',
        reprendre:       'Reprendre',
        score_forme:     'Score de forme',
        prochaine:       'Prochaine séance',
        dans_jours:      'dans {{n}} jour(s)',
        aujourd_hui:     'Aujourd\'hui',
        semaine:         'Semaine {{n}}',
        cycle:           'Cycle {{n}}',
        streak:          '{{n}} jours de streak',
        volume_semaine:  'Volume cette semaine',
        aucune_seance:   'Aucune séance planifiée',
        conseil_coach:   'Conseil du coach',
        bonne_chance:    'Bonne chance aujourd\'hui !'
      },

      // Training
      training: {
        titre:           'Programme',
        semaine:         'Semaine {{n}}',
        planning:        'Planning hebdomadaire',
        repos:           'Repos',
        seance:          'Séance',
        exercices:       '{{n}} exercices',
        duree_estimee:   '~{{n}} min',
        series:          '{{n}} séries',
        reps:            '{{n}} reps',
        repos_sec:       '{{n}}s repos',
        charge_suggere:  'Charge suggérée',
        record_actuel:   'Record actuel',
        voir_video:      'Voir la vidéo',
        conseils:        'Conseils',
        muscles:         'Muscles ciblés'
      },

      // Live séance
      live: {
        titre:           'Séance en cours',
        warmup:          'Échauffement',
        serie:           'Série {{n}}',
        poids:           'Poids (kg)',
        reps:            'Reps',
        rpe:             'RPE (1-10)',
        valider:         'Valider la série',
        suivant:         'Exercice suivant',
        terminer:        'Terminer la séance',
        repos:           'Repos',
        pause:           'Pause',
        reprendre:       'Reprendre',
        nouveau_pr:      '🏆 Nouveau record !',
        duree:           'Durée',
        volume:          'Volume total',
        bien_joue:       'Bien joué !',
        seance_terminee: 'Séance terminée !',
        etirements:      'Étirements',
        fatigue:         'Niveau de fatigue',
        humeur:          'Humeur du jour',
        notes:           'Notes (optionnel)'
      },

      // Stats
      stats: {
        titre:           'Statistiques',
        dashboard:       'Dashboard',
        corps:           'Corps',
        charges:         'Charges',
        graphiques:      'Graphiques',
        calendrier:      'Calendrier',
        trophees:        'Trophées',
        total_seances:   'Séances totales',
        streak_actuel:   'Streak actuel',
        streak_max:      'Streak maximum',
        volume_semaine:  'Volume semaine',
        records:         'Records',
        score_forme:     'Score de forme',
        progression:     'Progression',
        aucun_pr:        'Aucun record — commence tes séances !',
        top_exercices:   'Top exercices',
        evolution_poids: 'Évolution du poids',
        imc:             'IMC',
        calories:        'Calories/semaine'
      },

      // Profil
      profil: {
        titre:           'Profil',
        mon_profil:      'Mon profil',
        journal:         'Journal',
        objectifs:       'Objectifs',
        blessures:       'Blessures',
        coach:           'Coach',
        exercices:       'Mes exercices',
        programme:       'Programme',
        outils:          'Outils',
        nom:             'Prénom',
        poids:           'Poids (kg)',
        taille:          'Taille (cm)',
        objectif:        'Objectif principal',
        niveau:          'Niveau',
        date_debut:      'Date de début',
        modifier:        'Modifier',
        sauvegarder:     'Sauvegarder',
        annuler:         'Annuler'
      },

      // Nutrition
      nutrition: {
        titre:           'Nutrition',
        calories_jour:   'Calories / jour',
        proteines:       'Protéines',
        glucides:        'Glucides',
        lipides:         'Lipides',
        repas:           'Mes repas',
        petit_dej:       'Petit-déjeuner',
        dejeuner:        'Déjeuner',
        diner:           'Dîner',
        collation:       'Collation',
        ajouter_repas:   'Ajouter un repas',
        liste_courses:   'Liste de courses',
        hydratation:     'Hydratation',
        verres:          '{{n}} verres',
        objectif_eau:    'Objectif : 8 verres / jour',
        conseil_nutri:   'Conseil nutrition'
      },

      // Coach
      coach: {
        titre:           'Coach IA',
        question:        'Pose ta question...',
        envoyer:         'Envoyer',
        analyse:         'Analyse de ta semaine',
        recommandations: 'Recommandations',
        citation:        'Citation du jour',
        bonne_forme:     'Tu es en bonne forme !',
        attention:       'Attention',
        bravo:           'Bravo !'
      },

      // Gamification
      gamification: {
        niveau:          'Niveau {{n}}',
        xp_total:        'XP Total',
        prochain_niveau: '{{n}} XP jusqu\'au prochain niveau',
        trophees:        'Trophées',
        debloque:        'Débloqué',
        verrouille:      'À débloquer',
        nouveau_trophee: '🏆 Nouveau trophée !',
        niveau_up:       '🎉 Niveau {{n}} atteint !'
      },

      // Défis
      defis: {
        titre:           'Défis de la semaine',
        completes:       '{{n}} complétés',
        en_cours:        'En cours',
        historique:      'Historique',
        accompli:        '🎉 Défi accompli !',
        xp_gagne:        '+{{n}} XP',
        nouveaux_defis:  'Nouveaux défis',
        confirmer_reset: 'Réinitialiser les défis de la semaine ?'
      },

      // Partage
      partage: {
        titre:           'Partager',
        carte_semaine:   'Résumé semaine',
        carte_pr:        'Mes records',
        carte_streak:    'Mon streak',
        carte_profil:    'Mon profil',
        telecharger:     'Télécharger',
        partager:        'Partager',
        apercu:          'Cliquer pour aperçu',
        generation:      '⏳ Génération...',
        succes:          '✅ Image téléchargée !',
        playlist:        'Playlist du jour',
        ouvrir_music:    'Ouvrir dans Apple Music'
      },

      // Commun
      commun: {
        oui:             'Oui',
        non:             'Non',
        ok:              'OK',
        annuler:         'Annuler',
        confirmer:       'Confirmer',
        supprimer:       'Supprimer',
        modifier:        'Modifier',
        sauvegarder:     'Sauvegarder',
        fermer:          'Fermer',
        voir_plus:       'Voir plus',
        chargement:      'Chargement...',
        erreur:          'Une erreur est survenue',
        succes:          'Succès !',
        aucun_donnee:    'Aucune donnée',
        semaine:         'Semaine',
        seance:          'Séance',
        seances:         'Séances',
        jours:           'jours',
        kg:              'kg',
        reps:            'reps',
        series:          'séries',
        minutes:         'minutes',
        secondes:        'secondes'
      },

      // Messages coach
      messages: {
        bien_joue:       'Bien joué {{nom}} !',
        courage:         'Courage {{nom}}, tu peux le faire !',
        repos_conseil:   'Profite bien de ce jour de repos.',
        streak_danger:   '⚠️ Ton streak de {{n}} jours est en danger !',
        nouveau_pr:      '🏆 Nouveau record sur {{exercice}} !',
        seance_terminee: 'Séance terminée en {{duree}} — {{volume}} soulevés !',
        objectif_proche: 'Tu es proche de ton objectif !'
      },

      // Jours semaine
      jours: {
        lun: 'Lundi',
        mar: 'Mardi',
        mer: 'Mercredi',
        jeu: 'Jeudi',
        ven: 'Vendredi',
        sam: 'Samedi',
        dim: 'Dimanche',
        lun_court: 'Lun',
        mar_court: 'Mar',
        mer_court: 'Mer',
        jeu_court: 'Jeu',
        ven_court: 'Ven',
        sam_court: 'Sam',
        dim_court: 'Dim'
      },

      // Mois
      mois: {
        jan: 'Janvier',   fev: 'Février',
        mar: 'Mars',       avr: 'Avril',
        mai: 'Mai',        jun: 'Juin',
        jul: 'Juillet',    aou: 'Août',
        sep: 'Septembre',  oct: 'Octobre',
        nov: 'Novembre',   dec: 'Décembre'
      },

      // Onboarding
      onboarding: {
        bienvenue:       'Bienvenue sur FitTracker Pro !',
        sous_titre:      'Ton coach de salle personnel Basic-Fit',
        etape1:          'Dis-nous qui tu es',
        etape2:          'Ton objectif',
        etape3:          'Ton niveau',
        etape4:          'C\'est parti !',
        prenom:          'Ton prénom',
        poids:           'Ton poids (kg)',
        taille:          'Ta taille (cm)',
        objectifs: {
          prise_masse:   'Prise de masse',
          perte_poids:   'Perte de poids',
          seche:         'Sèche',
          force:         'Force',
          endurance:     'Endurance',
          forme:         'Forme générale'
        },
        niveaux: {
          debutant:      'Débutant (< 6 mois)',
          intermediaire: 'Intermédiaire (6 mois — 2 ans)',
          avance:        'Avancé (2 ans +)'
        },
        suivant:         'Suivant',
        commencer:       'Commencer !'
      }
    },

    // ══════════════════════════════════════════════════════
    // ENGLISH
    // ══════════════════════════════════════════════════════
    en: {

      nav: {
        home:      'Home',
        training:  'Training',
        live:      'Live',
        nutrition: 'Nutrition',
        profile:   'Profile',
        stats:     'Stats'
      },

      home: {
        titre:           'Hello',
        phase_actuelle:  'Current phase',
        seance_du_jour:  'Today\'s workout',
        repos:           'Rest day',
        demarrer:        'Start workout',
        reprendre:       'Resume',
        score_forme:     'Fitness score',
        prochaine:       'Next workout',
        dans_jours:      'in {{n}} day(s)',
        aujourd_hui:     'Today',
        semaine:         'Week {{n}}',
        cycle:           'Cycle {{n}}',
        streak:          '{{n}} day streak',
        volume_semaine:  'Volume this week',
        aucune_seance:   'No workout scheduled',
        conseil_coach:   'Coach tip',
        bonne_chance:    'Good luck today!'
      },

      training: {
        titre:           'Program',
        semaine:         'Week {{n}}',
        planning:        'Weekly schedule',
        repos:           'Rest',
        seance:          'Workout',
        exercices:       '{{n}} exercises',
        duree_estimee:   '~{{n}} min',
        series:          '{{n}} sets',
        reps:            '{{n}} reps',
        repos_sec:       '{{n}}s rest',
        charge_suggere:  'Suggested weight',
        record_actuel:   'Current record',
        voir_video:      'Watch video',
        conseils:        'Tips',
        muscles:         'Target muscles'
      },

      live: {
        titre:           'Workout in progress',
        warmup:          'Warm-up',
        serie:           'Set {{n}}',
        poids:           'Weight (kg)',
        reps:            'Reps',
        rpe:             'RPE (1-10)',
        valider:         'Log set',
        suivant:         'Next exercise',
        terminer:        'Finish workout',
        repos:           'Rest',
        pause:           'Pause',
        reprendre:       'Resume',
        nouveau_pr:      '🏆 New personal record!',
        duree:           'Duration',
        volume:          'Total volume',
        bien_joue:       'Nice work!',
        seance_terminee: 'Workout complete!',
        etirements:      'Stretching',
        fatigue:         'Fatigue level',
        humeur:          'Today\'s mood',
        notes:           'Notes (optional)'
      },

      stats: {
        titre:           'Statistics',
        dashboard:       'Dashboard',
        corps:           'Body',
        charges:         'Weights',
        graphiques:      'Charts',
        calendrier:      'Calendar',
        trophees:        'Trophies',
        total_seances:   'Total workouts',
        streak_actuel:   'Current streak',
        streak_max:      'Best streak',
        volume_semaine:  'Weekly volume',
        records:         'Records',
        score_forme:     'Fitness score',
        progression:     'Progression',
        aucun_pr:        'No records yet — start your workouts!',
        top_exercices:   'Top exercises',
        evolution_poids: 'Weight evolution',
        imc:             'BMI',
        calories:        'Calories/week'
      },

      profil: {
        titre:           'Profile',
        mon_profil:      'My profile',
        journal:         'Journal',
        objectifs:       'Goals',
        blessures:       'Injuries',
        coach:           'Coach',
        exercices:       'My exercises',
        programme:       'Program',
        outils:          'Tools',
        nom:             'First name',
        poids:           'Weight (kg)',
        taille:          'Height (cm)',
        objectif:        'Main goal',
        niveau:          'Level',
        date_debut:      'Start date',
        modifier:        'Edit',
        sauvegarder:     'Save',
        annuler:         'Cancel'
      },

      nutrition: {
        titre:           'Nutrition',
        calories_jour:   'Calories / day',
        proteines:       'Proteins',
        glucides:        'Carbs',
        lipides:         'Fats',
        repas:           'My meals',
        petit_dej:       'Breakfast',
        dejeuner:        'Lunch',
        diner:           'Dinner',
        collation:       'Snack',
        ajouter_repas:   'Add a meal',
        liste_courses:   'Shopping list',
        hydratation:     'Hydration',
        verres:          '{{n}} glasses',
        objectif_eau:    'Goal: 8 glasses / day',
        conseil_nutri:   'Nutrition tip'
      },

      coach: {
        titre:           'AI Coach',
        question:        'Ask a question...',
        envoyer:         'Send',
        analyse:         'Weekly analysis',
        recommandations: 'Recommendations',
        citation:        'Quote of the day',
        bonne_forme:     'You\'re in great shape!',
        attention:       'Watch out',
        bravo:           'Well done!'
      },

      gamification: {
        niveau:          'Level {{n}}',
        xp_total:        'Total XP',
        prochain_niveau: '{{n}} XP to next level',
        trophees:        'Trophies',
        debloque:        'Unlocked',
        verrouille:      'To unlock',
        nouveau_trophee: '🏆 New trophy!',
        niveau_up:       '🎉 Level {{n}} reached!'
      },

      defis: {
        titre:           'Weekly challenges',
        completes:       '{{n}} completed',
        en_cours:        'In progress',
        historique:      'History',
        accompli:        '🎉 Challenge complete!',
        xp_gagne:        '+{{n}} XP',
        nouveaux_defis:  'New challenges',
        confirmer_reset: 'Reset this week\'s challenges?'
      },

      partage: {
        titre:           'Share',
        carte_semaine:   'Weekly recap',
        carte_pr:        'My records',
        carte_streak:    'My streak',
        carte_profil:    'My profile',
        telecharger:     'Download',
        partager:        'Share',
        apercu:          'Click to preview',
        generation:      '⏳ Generating...',
        succes:          '✅ Image downloaded!',
        playlist:        'Today\'s playlist',
        ouvrir_music:    'Open in Apple Music'
      },

      commun: {
        oui:             'Yes',
        non:             'No',
        ok:              'OK',
        annuler:         'Cancel',
        confirmer:       'Confirm',
        supprimer:       'Delete',
        modifier:        'Edit',
        sauvegarder:     'Save',
        fermer:          'Close',
        voir_plus:       'See more',
        chargement:      'Loading...',
        erreur:          'An error occurred',
        succes:          'Success!',
        aucun_donnee:    'No data',
        semaine:         'Week',
        seance:          'Workout',
        seances:         'Workouts',
        jours:           'days',
        kg:              'kg',
        reps:            'reps',
        series:          'sets',
        minutes:         'minutes',
        secondes:        'seconds'
      },

      messages: {
        bien_joue:       'Well done {{nom}}!',
        courage:         'Keep going {{nom}}, you can do it!',
        repos_conseil:   'Enjoy your rest day.',
        streak_danger:   '⚠️ Your {{n}}-day streak is at risk!',
        nouveau_pr:      '🏆 New record on {{exercice}}!',
        seance_terminee: 'Workout done in {{duree}} — {{volume}} lifted!',
        objectif_proche: 'You\'re close to your goal!'
      },

      jours: {
        lun: 'Monday',
        mar: 'Tuesday',
        mer: 'Wednesday',
        jeu: 'Thursday',
        ven: 'Friday',
        sam: 'Saturday',
        dim: 'Sunday',
        lun_court: 'Mon',
        mar_court: 'Tue',
        mer_court: 'Wed',
        jeu_court: 'Thu',
        ven_court: 'Fri',
        sam_court: 'Sat',
        dim_court: 'Sun'
      },

      mois: {
        jan: 'January',   fev: 'February',
        mar: 'March',      avr: 'April',
        mai: 'May',        jun: 'June',
        jul: 'July',       aou: 'August',
        sep: 'September',  oct: 'October',
        nov: 'November',   dec: 'December'
      },

      onboarding: {
        bienvenue:       'Welcome to FitTracker Pro!',
        sous_titre:      'Your personal Basic-Fit coach',
        etape1:          'Tell us about you',
        etape2:          'Your goal',
        etape3:          'Your level',
        etape4:          'Let\'s go!',
        prenom:          'Your first name',
        poids:           'Your weight (kg)',
        taille:          'Your height (cm)',
        objectifs: {
          prise_masse:   'Muscle gain',
          perte_poids:   'Weight loss',
          seche:         'Cut',
          force:         'Strength',
          endurance:     'Endurance',
          forme:         'General fitness'
        },
        niveaux: {
          debutant:      'Beginner (< 6 months)',
          intermediaire: 'Intermediate (6 months — 2 years)',
          avance:        'Advanced (2 years +)'
        },
        suivant:         'Next',
        commencer:       'Let\'s go!'
      }
    }
  },

  // ─── RENDER SÉLECTEUR LANGUE ──────────────────────────────
  renderSelecteur(container) {
    if (!container) return;

    const langue = this.getLangue();

    container.innerHTML = `
      <div class="card mb-md">
        <div class="card-label">🌍 Langue / Language</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;
                    gap:var(--space-md);margin-top:var(--space-md)">

          <button onclick="i18n.setLangue('fr')"
                  style="padding:var(--space-md);
                         border-radius:var(--radius-md);
                         border:2px solid ${
                           langue === 'fr'
                             ? 'var(--fd-indigo)'
                             : 'var(--border-color)'
                         };
                         background:${
                           langue === 'fr'
                             ? 'rgba(75,75,249,0.15)'
                             : 'var(--bg-card)'
                         };
                         cursor:pointer;
                         transition:all .2s ease">
            <div style="font-size:2rem">🇫🇷</div>
            <div style="font-weight:700;margin-top:4px;
                        color:${
                          langue === 'fr'
                            ? 'var(--fd-indigo)'
                            : 'var(--text-primary)'
                        }">
              Français
            </div>
            ${langue === 'fr' ? `
              <div style="font-size:.65rem;
                          color:var(--fd-mint);
                          margin-top:4px">
                ✅ Actif
              </div>` : ''}
          </button>

          <button onclick="i18n.setLangue('en')"
                  style="padding:var(--space-md);
                         border-radius:var(--radius-md);
                         border:2px solid ${
                           langue === 'en'
                             ? 'var(--fd-indigo)'
                             : 'var(--border-color)'
                         };
                         background:${
                           langue === 'en'
                             ? 'rgba(75,75,249,0.15)'
                             : 'var(--bg-card)'
                         };
                         cursor:pointer;
                         transition:all .2s ease">
            <div style="font-size:2rem">🇬🇧</div>
            <div style="font-weight:700;margin-top:4px;
                        color:${
                          langue === 'en'
                            ? 'var(--fd-indigo)'
                            : 'var(--text-primary)'
                        }">
              English
            </div>
            ${langue === 'en' ? `
              <div style="font-size:.65rem;
                          color:var(--fd-mint);
                          margin-top:4px">
                ✅ Active
              </div>` : ''}
          </button>
        </div>
      </div>
    `;
  },

  // ─── INIT ─────────────────────────────────────────────────
  init() {
    const langue = this.getLangue();
    document.documentElement.lang = langue;
    console.log(`✅ i18n initialisé — langue: ${langue}`);
  }

};

// ─── Raccourci global ─────────────────────────────────────────
const t = (cle, params) => i18n.t(cle, params);

window.i18n = i18n;
window.t    = t;

console.log('✅ i18n v1.0 chargé — FR / EN');
