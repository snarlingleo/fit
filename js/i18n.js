/* ============================================================
   FitTracker Pro — i18n v3.0
   Internationalisation FR / EN + ES
   + Photos, Supersets, Historique, Auth
   ============================================================ */

const i18n = {

  // ════════════════════════════════════════════════════════
  // LANGUE
  // ════════════════════════════════════════════════════════
  _langue: null,

  getLangue() {
    if (this._langue) return this._langue;
    const saved   = Utils.storage.get('ft_langue', null);
    const browser = navigator.language?.startsWith('fr')
      ? 'fr'
      : navigator.language?.startsWith('es')
        ? 'es'
        : 'en';
    this._langue  = saved || browser;
    return this._langue;
  },

  setLangue(code) {
    this._langue = code;
    Utils.storage.set('ft_langue', code);
    document.documentElement.lang = code;

    const labels = {
      fr: '🇫🇷 Langue : Français',
      en: '🇬🇧 Language: English',
      es: '🇪🇸 Idioma: Español'
    };
    Utils.toast(labels[code] || labels.en, 'success');

    // Refresh page
    try {
      if (window.naviguer) {
        naviguer(window._pageActive || 'home');
      }
    } catch(e) {}
  },

  // ════════════════════════════════════════════════════════
  // TRADUCTION
  // ════════════════════════════════════════════════════════
  t(cle, params = {}) {
    try {
      const lang    = this.getLangue();
      const dico    = this.DICO[lang] || this.DICO.fr;
      const parties = cle.split('.');
      let   valeur  = dico;

      for (const partie of parties) {
        valeur = valeur?.[partie];
        if (valeur === undefined) {
          // Fallback FR
          valeur = this.DICO.fr;
          for (const p of parties) {
            valeur = valeur?.[p];
          }
          break;
        }
      }

      if (typeof valeur !== 'string') return cle;

      // Remplacer {{param}}
      return valeur.replace(
        /\{\{(\w+)\}\}/g,
        (_, k) => params[k] !== undefined
          ? params[k] : `{{${k}}}`
      );
    } catch(e) {
      return cle;
    }
  },

  // ════════════════════════════════════════════════════════
  // DICTIONNAIRE
  // ════════════════════════════════════════════════════════
  DICO: {

    // ══════════════════════════════════════════════════
    // 🇫🇷 FRANÇAIS
    // ══════════════════════════════════════════════════
    fr: {

      nav: {
        home:      'Accueil',
        training:  'Training',
        live:      'Live',
        nutrition: 'Nutrition',
        profile:   'Profil',
        stats:     'Stats',
        express:   'Express',
        defis:     'Défis',
        share:     'Partage',
        predict:   'Predict'
      },

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
        bonne_chance:    'Bonne chance aujourd\'hui !',
        actions_rapides: 'Actions rapides',
        humeur:          'Humeur du jour',
        fatigue:         'Niveau de fatigue',
        frais:           'Frais',
        ok:              'OK',
        modere:          'Modéré',
        epuise:          'Épuisé',
        defi_semaine:    'Défis semaine',
        warmup_suggere:  'Warm-up suggéré'
      },

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
        muscles:         'Muscles ciblés',
        phases:          'Phases',
        recup:           'Récupération',
        warmup:          'Échauffement',
        personnaliser:   'Personnaliser le programme',
        custom:          'Personnalisé',
        superset:        'Superset',
        enchaîner:       'Enchaîner',
        repos_entre:     'Repos entre sets'
      },

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
        notes:           'Notes (optionnel)',
        arreter:         'Arrêter la séance',
        confirmer_arret: 'Arrêter la séance ?',
        progression_gardee: 'Ta progression sera sauvegardée.',
        effort:          'Effort ressenti',
        charge_reco:     'Charge recommandée',
        derniere_perf:   'Dernière fois'
      },

      express: {
        titre:           'Séance Express',
        sous_titre:      '~30 minutes · {{n}} exercices',
        demarrer:        'Démarrer la séance express',
        serie:           'Série {{n}}/{{total}}',
        passer:          'Passer',
        terminer_exp:    'Séance Express terminée !',
        bien_joue:       'Bien joué {{nom}} ! 🔥',
        timer_repos:     '💤 Repos'
      },

      stats: {
        titre:           'Statistiques',
        dashboard:       'Dashboard',
        historique:      'Historique',
        corps:           'Corps',
        photos:          'Photos',
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
        calories:        'Calories/semaine',
        avant_apres:     'Avant / Après',
        ajouter_photo:   'Ajouter une photo',
        galerie:         'Galerie',
        comparaison:     'vs semaine précédente',
        zones_entrainement: 'Zones d\'entraînement',
        notes_exercice:  'Mes notes'
      },

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
        annuler:         'Annuler',
        avatar:          'Avatar',
        mesures:         'Mesures corporelles',
        ajouter_mesure:  'Ajouter une mesure',
        historique_mesures: 'Historique mesures',
        bilan_corporel:  'Bilan corporel',
        depuis_debut:    'Depuis le début',
        synchro_cloud:   'Synchronisé avec le cloud'
      },

      auth: {
        connexion:       'Connexion',
        inscription:     'Inscription',
        email:           'Email',
        mot_de_passe:    'Mot de passe',
        confirmer_mdp:   'Confirmer le mot de passe',
        prenom:          'Prénom',
        se_connecter:    'Se connecter',
        creer_compte:    'Créer un compte',
        mot_de_passe_oublie: 'Mot de passe oublié ?',
        pas_de_compte:   'Pas encore de compte ?',
        deja_compte:     'Déjà un compte ?',
        deconnexion:     'Se déconnecter',
        bienvenue_retour: 'Content de te revoir !',
        synchro_partout: 'Tes données synchronisées partout',
        continuer_local: 'Continuer sans compte',
        email_invalide:  'Email invalide',
        mdp_court:       'Mot de passe trop court (6 min)',
        mdp_different:   'Les mots de passe ne correspondent pas',
        compte_cree:     '✅ Compte créé ! Bienvenue {{nom}} !',
        connexion_ok:    '✅ Connecté ! Bonjour {{nom}} !'
      },

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

      coach: {
        titre:           'Coach IA',
        question:        'Ta question...',
        envoyer:         'Envoyer',
        analyse:         'Analyse de ta semaine',
        recommandations: 'Recommandations',
        citation:        'Citation du jour',
        bonne_forme:     'Tu es en bonne forme !',
        attention:       'Attention',
        bravo:           'Bravo !',
        suggestions:     'Suggestions rapides',
        decharge_reco:   'Décharge recommandée'
      },

      gamification: {
        niveau:          'Niveau {{n}}',
        xp_total:        'XP Total',
        prochain_niveau: '{{n}} XP jusqu\'au prochain niveau',
        trophees:        'Trophées',
        debloque:        'Débloqué',
        verrouille:      'À débloquer',
        nouveau_trophee: '🏆 Nouveau trophée !',
        niveau_up:       '🎉 Niveau {{n}} atteint !',
        comment_gagner:  'Comment gagner des XP',
        immortel:        'Niveau maximum — Immortel !'
      },

      defis: {
        titre:           'Défis de la semaine',
        completes:       '{{n}} complétés',
        en_cours:        'En cours',
        historique:      'Historique',
        accompli:        '🎉 Défi accompli !',
        xp_gagne:        '+{{n}} XP',
        nouveaux_defis:  'Nouveaux défis',
        actualiser:      'Actualiser',
        confirmer_reset: 'Réinitialiser les défis de la semaine ?',
        taux_reussite:   'Taux de réussite',
        semaines_parf:   'Semaines parfaites',
        stats_globales:  'Stats globales'
      },

      partage: {
        titre:           'Partager',
        carte_semaine:   'Résumé semaine',
        carte_pr:        'Mes records',
        carte_streak:    'Mon streak',
        carte_profil:    'Mon profil',
        carte_avant_apres: 'Avant / Après',
        telecharger:     'Télécharger',
        partager:        'Partager',
        apercu:          'Cliquer pour aperçu',
        generation:      '⏳ Génération...',
        succes:          '✅ Image téléchargée !',
        playlist:        'Playlist du jour',
        ouvrir_music:    'Ouvrir dans Apple Music',
        ouvrir_youtube:  'Ouvrir sur YouTube',
        toutes_playlists:'Toutes les playlists'
      },

      predict: {
        titre:           'Prédictions',
        etat_forme:      'État de forme',
        conseil_jour:    'Conseil du jour',
        opportunite_pr:  'Opportunité PR aujourd\'hui !',
        charge_reco:     'Charge recommandée',
        prochains_prs:   'Prédictions prochains PRs',
        progression:     'Progression depuis le début',
        stagnation:      'Stagnation détectée',
        regression:      'Régression détectée',
        fiabilite:       'Fiabilité',
        tres_fiable:     'Très fiable',
        indicatif:       'Indicatif',
        incertain:       'Incertain',
        supersets_reco:  'Supersets recommandés',
        attention:       'Points d\'attention',
        zones_entrain:   'Zones d\'entraînement'
      },

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
        secondes:        'secondes',
        ajouter:         'Ajouter',
        creer:           'Créer',
        exporter:        'Exporter',
        importer:        'Importer',
        reinitialiser:   'Réinitialiser',
        rechercher:      'Rechercher',
        aucun_resultat:  'Aucun résultat',
        total:           'Total',
        moyenne:         'Moyenne',
        record:          'Record',
        nouveau:         'Nouveau',
        actif:           'Actif',
        inactif:         'Inactif'
      },

      messages: {
        bien_joue:       'Bien joué {{nom}} !',
        courage:         'Courage {{nom}}, tu peux le faire !',
        repos_conseil:   'Profite bien de ce jour de repos.',
        streak_danger:   '⚠️ Ton streak de {{n}} jours est en danger !',
        nouveau_pr:      '🏆 Nouveau record sur {{exercice}} !',
        seance_terminee: 'Séance terminée en {{duree}} — {{volume}} soulevés !',
        objectif_proche: 'Tu es proche de ton objectif !',
        decharge:        'Semaine de décharge — récupère bien !',
        bienvenue:       'Bienvenue {{nom}} !',
        retour:          'Content de te revoir {{nom}} !'
      },

      jours: {
        lun: 'Lundi',   mar: 'Mardi',   mer: 'Mercredi',
        jeu: 'Jeudi',   ven: 'Vendredi',sam: 'Samedi',
        dim: 'Dimanche',
        lun_court: 'Lun', mar_court: 'Mar', mer_court: 'Mer',
        jeu_court: 'Jeu', ven_court: 'Ven', sam_court: 'Sam',
        dim_court: 'Dim'
      },

      mois: {
        jan: 'Janvier',  fev: 'Février',    mar: 'Mars',
        avr: 'Avril',    mai: 'Mai',        jun: 'Juin',
        jul: 'Juillet',  aou: 'Août',       sep: 'Septembre',
        oct: 'Octobre',  nov: 'Novembre',   dec: 'Décembre'
      },

      onboarding: {
        bienvenue:  'Bienvenue sur PowerApp !',
        sous_titre: 'Ton coach fitness personnel',
        etape1:     'Dis-nous qui tu es',
        etape2:     'Tes mensurations',
        etape3:     'Active les rappels ?',
        etape4:     'C\'est parti !',
        prenom:     'Ton prénom',
        poids:      'Ton poids (kg)',
        taille:     'Ta taille (cm)',
        objectifs: {
          prise_masse: 'Prise de masse',
          perte_poids: 'Perte de poids',
          seche:       'Sèche',
          force:       'Force',
          endurance:   'Endurance',
          forme:       'Forme générale'
        },
        niveaux: {
          debutant:      'Débutant (< 6 mois)',
          intermediaire: 'Intermédiaire (6 mois — 2 ans)',
          avance:        'Avancé (2 ans +)'
        },
        suivant:    'Suivant',
        commencer:  'Commencer !'
      }
    },

    // ══════════════════════════════════════════════════
    // 🇬🇧 ENGLISH
    // ══════════════════════════════════════════════════
    en: {

      nav: {
        home:      'Home',
        training:  'Training',
        live:      'Live',
        nutrition: 'Nutrition',
        profile:   'Profile',
        stats:     'Stats',
        express:   'Express',
        defis:     'Challenges',
        share:     'Share',
        predict:   'Predict'
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
        bonne_chance:    'Good luck today!',
        actions_rapides: 'Quick actions',
        humeur:          'Today\'s mood',
        fatigue:         'Fatigue level',
        frais:           'Fresh',
        ok:              'OK',
        modere:          'Moderate',
        epuise:          'Exhausted',
        defi_semaine:    'Weekly challenges',
        warmup_suggere:  'Suggested warm-up'
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
        muscles:         'Target muscles',
        phases:          'Phases',
        recup:           'Recovery',
        warmup:          'Warm-up',
        personnaliser:   'Customize program',
        custom:          'Custom',
        superset:        'Superset',
        enchaîner:       'Chain',
        repos_entre:     'Rest between sets'
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
        notes:           'Notes (optional)',
        arreter:         'Stop workout',
        confirmer_arret: 'Stop the workout?',
        progression_gardee: 'Your progress will be saved.',
        effort:          'Perceived effort',
        charge_reco:     'Recommended weight',
        derniere_perf:   'Last time'
      },

      express: {
        titre:           'Express Workout',
        sous_titre:      '~30 minutes · {{n}} exercises',
        demarrer:        'Start express workout',
        serie:           'Set {{n}}/{{total}}',
        passer:          'Skip',
        terminer_exp:    'Express Workout done!',
        bien_joue:       'Great job {{nom}}! 🔥',
        timer_repos:     '💤 Rest'
      },

      stats: {
        titre:           'Statistics',
        dashboard:       'Dashboard',
        historique:      'History',
        corps:           'Body',
        photos:          'Photos',
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
        calories:        'Calories/week',
        avant_apres:     'Before / After',
        ajouter_photo:   'Add a photo',
        galerie:         'Gallery',
        comparaison:     'vs previous week',
        zones_entrainement: 'Training zones',
        notes_exercice:  'My notes'
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
        annuler:         'Cancel',
        avatar:          'Avatar',
        mesures:         'Body measurements',
        ajouter_mesure:  'Add measurement',
        historique_mesures: 'Measurement history',
        bilan_corporel:  'Body report',
        depuis_debut:    'Since the beginning',
        synchro_cloud:   'Synced with cloud'
      },

      auth: {
        connexion:       'Login',
        inscription:     'Sign up',
        email:           'Email',
        mot_de_passe:    'Password',
        confirmer_mdp:   'Confirm password',
        prenom:          'First name',
        se_connecter:    'Log in',
        creer_compte:    'Create account',
        mot_de_passe_oublie: 'Forgot password?',
        pas_de_compte:   'No account yet?',
        deja_compte:     'Already have an account?',
        deconnexion:     'Log out',
        bienvenue_retour: 'Welcome back!',
        synchro_partout: 'Your data synced everywhere',
        continuer_local: 'Continue without account',
        email_invalide:  'Invalid email',
        mdp_court:       'Password too short (6 min)',
        mdp_different:   'Passwords don\'t match',
        compte_cree:     '✅ Account created! Welcome {{nom}}!',
        connexion_ok:    '✅ Logged in! Hello {{nom}}!'
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
        bravo:           'Well done!',
        suggestions:     'Quick suggestions',
        decharge_reco:   'Deload recommended'
      },

      gamification: {
        niveau:          'Level {{n}}',
        xp_total:        'Total XP',
        prochain_niveau: '{{n}} XP to next level',
        trophees:        'Trophies',
        debloque:        'Unlocked',
        verrouille:      'To unlock',
        nouveau_trophee: '🏆 New trophy!',
        niveau_up:       '🎉 Level {{n}} reached!',
        comment_gagner:  'How to earn XP',
        immortel:        'Max level — Immortal!'
      },

      defis: {
        titre:           'Weekly challenges',
        completes:       '{{n}} completed',
        en_cours:        'In progress',
        historique:      'History',
        accompli:        '🎉 Challenge complete!',
        xp_gagne:        '+{{n}} XP',
        nouveaux_defis:  'New challenges',
        actualiser:      'Refresh',
        confirmer_reset: 'Reset this week\'s challenges?',
        taux_reussite:   'Success rate',
        semaines_parf:   'Perfect weeks',
        stats_globales:  'Global stats'
      },

      partage: {
        titre:           'Share',
        carte_semaine:   'Weekly recap',
        carte_pr:        'My records',
        carte_streak:    'My streak',
        carte_profil:    'My profile',
        carte_avant_apres: 'Before / After',
        telecharger:     'Download',
        partager:        'Share',
        apercu:          'Click to preview',
        generation:      '⏳ Generating...',
        succes:          '✅ Image downloaded!',
        playlist:        'Today\'s playlist',
        ouvrir_music:    'Open in Apple Music',
        ouvrir_youtube:  'Open on YouTube',
        toutes_playlists:'All playlists'
      },

      predict: {
        titre:           'Predictions',
        etat_forme:      'Fitness state',
        conseil_jour:    'Tip of the day',
        opportunite_pr:  'PR opportunity today!',
        charge_reco:     'Recommended weight',
        prochains_prs:   'Next PR predictions',
        progression:     'Progression since start',
        stagnation:      'Stagnation detected',
        regression:      'Regression detected',
        fiabilite:       'Reliability',
        tres_fiable:     'Very reliable',
        indicatif:       'Indicative',
        incertain:       'Uncertain',
        supersets_reco:  'Recommended supersets',
        attention:       'Watch points',
        zones_entrain:   'Training zones'
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
        secondes:        'seconds',
        ajouter:         'Add',
        creer:           'Create',
        exporter:        'Export',
        importer:        'Import',
        reinitialiser:   'Reset',
        rechercher:      'Search',
        aucun_resultat:  'No results',
        total:           'Total',
        moyenne:         'Average',
        record:          'Record',
        nouveau:         'New',
        actif:           'Active',
        inactif:         'Inactive'
      },

      messages: {
        bien_joue:       'Well done {{nom}}!',
        courage:         'Keep going {{nom}}, you can do it!',
        repos_conseil:   'Enjoy your rest day.',
        streak_danger:   '⚠️ Your {{n}}-day streak is at risk!',
        nouveau_pr:      '🏆 New record on {{exercice}}!',
        seance_terminee: 'Workout done in {{duree}} — {{volume}} lifted!',
        objectif_proche: 'You\'re close to your goal!',
        decharge:        'Deload week — recover well!',
        bienvenue:       'Welcome {{nom}}!',
        retour:          'Good to see you back {{nom}}!'
      },

      jours: {
        lun: 'Monday',    mar: 'Tuesday',   mer: 'Wednesday',
        jeu: 'Thursday',  ven: 'Friday',    sam: 'Saturday',
        dim: 'Sunday',
        lun_court: 'Mon', mar_court: 'Tue', mer_court: 'Wed',
        jeu_court: 'Thu', ven_court: 'Fri', sam_court: 'Sat',
        dim_court: 'Sun'
      },

      mois: {
        jan: 'January',   fev: 'February',  mar: 'March',
        avr: 'April',     mai: 'May',       jun: 'June',
        jul: 'July',      aou: 'August',    sep: 'September',
        oct: 'October',   nov: 'November',  dec: 'December'
      },

      onboarding: {
        bienvenue:  'Welcome to PowerApp!',
        sous_titre: 'Your personal fitness coach',
        etape1:     'Tell us about you',
        etape2:     'Your measurements',
        etape3:     'Enable reminders?',
        etape4:     'Let\'s go!',
        prenom:     'Your first name',
        poids:      'Your weight (kg)',
        taille:     'Your height (cm)',
        objectifs: {
          prise_masse: 'Muscle gain',
          perte_poids: 'Weight loss',
          seche:       'Cut',
          force:       'Strength',
          endurance:   'Endurance',
          forme:       'General fitness'
        },
        niveaux: {
          debutant:      'Beginner (< 6 months)',
          intermediaire: 'Intermediate (6 months — 2 years)',
          avance:        'Advanced (2 years +)'
        },
        suivant:    'Next',
        commencer:  'Let\'s go!'
      }
    },

    // ══════════════════════════════════════════════════
    // 🇪🇸 ESPAÑOL (partiel — clés principales)
    // ══════════════════════════════════════════════════
    es: {

      nav: {
        home:      'Inicio',
        training:  'Entrenamiento',
        live:      'En vivo',
        nutrition: 'Nutrición',
        profile:   'Perfil',
        stats:     'Estadísticas'
      },

      home: {
        titre:       'Hola',
        demarrer:    'Iniciar entrenamiento',
        repos:       'Día de descanso',
        streak:      '{{n}} días seguidos',
        bonne_chance:'¡Buena suerte hoy!'
      },

      live: {
        valider:        'Confirmar serie',
        terminer:       'Terminar entrenamiento',
        nouveau_pr:     '🏆 ¡Nuevo récord personal!',
        seance_terminee:'¡Entrenamiento completado!'
      },

      commun: {
        oui:       'Sí',
        non:       'No',
        ok:        'OK',
        annuler:   'Cancelar',
        sauvegarder:'Guardar',
        fermer:    'Cerrar',
        erreur:    'Ha ocurrido un error',
        kg:        'kg',
        reps:      'reps',
        series:    'series'
      },

      onboarding: {
        bienvenue:  '¡Bienvenido a PowerApp!',
        sous_titre: 'Tu entrenador personal',
        suivant:    'Siguiente',
        commencer:  '¡Vamos!'
      }
    }
  },

  // ════════════════════════════════════════════════════════
  // RENDER SÉLECTEUR
  // ════════════════════════════════════════════════════════
  renderSelecteur(container) {
    if (!container) return;
    const langue = this.getLangue();

    const langues = [
      { code:'fr', drapeau:'🇫🇷', nom:'Français',  actif:'✅ Actif'   },
      { code:'en', drapeau:'🇬🇧', nom:'English',   actif:'✅ Active'  },
      { code:'es', drapeau:'🇪🇸', nom:'Español',   actif:'✅ Activo'  }
    ];

    container.innerHTML = `
      <div class="card mb-md">
        <div class="card-label">🌍 Langue / Language</div>
        <div style="display:grid;
                    grid-template-columns:repeat(3,1fr);
                    gap:var(--space-md);
                    margin-top:var(--space-md)">
          ${langues.map(l => `
            <button onclick="i18n.setLangue('${l.code}')"
                    style="padding:var(--space-md);
                           border-radius:var(--radius-md);
                           border:2px solid ${langue===l.code
                             ? 'var(--fd-indigo)'
                             : 'var(--border-color)'};
                           background:${langue===l.code
                             ? 'rgba(75,75,249,0.15)'
                             : 'var(--bg-card)'};
                           cursor:pointer;
                           text-align:center;
                           transition:all .2s">
              <div style="font-size:1.8rem">
                ${l.drapeau}
              </div>
              <div style="font-weight:700;margin-top:4px;
                          font-size:.88rem;
                          color:${langue===l.code
                            ? 'var(--fd-indigo)'
                            : 'var(--text-primary)'}">
                ${l.nom}
              </div>
              ${langue===l.code ? `
                <div style="font-size:.62rem;
                            color:var(--fd-mint);
                            margin-top:4px">
                  ${l.actif}
                </div>` : ''}
            </button>`).join('')}
        </div>
      </div>`;
  },

  // ════════════════════════════════════════════════════════
  // UTILITAIRES
  // ════════════════════════════════════════════════════════

  // Vérifier si une clé existe
  existe(cle) {
    try {
      const val = this.t(cle);
      return val !== cle;
    } catch(e) { return false; }
  },

  // Traduire un tableau de clés
  tAll(cles, params = {}) {
    return cles.reduce((acc, cle) => {
      acc[cle] = this.t(cle, params);
      return acc;
    }, {});
  },

  // Formater une date selon la langue
  formatDate(dateStr, format = 'court') {
    try {
      const lang   = this.getLangue();
      const date   = new Date(dateStr + 'T00:00:00');
      const locale = lang === 'fr' ? 'fr-FR'
                   : lang === 'es' ? 'es-ES'
                   : 'en-GB';

      const options = format === 'court'
        ? { day:'numeric', month:'short' }
        : { weekday:'long', day:'numeric', month:'long' };

      return date.toLocaleDateString(locale, options);
    } catch(e) {
      return dateStr;
    }
  },

  // ════════════════════════════════════════════════════════
  // INIT
  // ════════════════════════════════════════════════════════
  init() {
    const langue = this.getLangue();
    document.documentElement.lang = langue;
    console.log(`✅ i18n v3.0 — langue: ${langue}`);
  }
};

// ─── Raccourci global ────────────────────────────────────────
const t = (cle, params) => {
  try { return i18n.t(cle, params); }
  catch(e) { return cle; }
};

window.i18n = i18n;
window.t    = t;

console.log('✅ i18n v3.0 chargé — FR / EN / ES');
