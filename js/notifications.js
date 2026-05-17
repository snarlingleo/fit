/* ============================================================
   FitTracker Pro — Notifications v3.0
   Rappels + Absence + Streak + PR + Motivation + Cloud
   ============================================================ */

const Notifications = {

  CONFIG_CLE: 'ft_notifs_config',

  // ════════════════════════════════════════════════════════
  // CONFIGURATION
  // ════════════════════════════════════════════════════════
  getConfig() {
    return Utils.storage.get(this.CONFIG_CLE, {
      active:           true,
      rappelQuotidien:  true,
      heureRappel:      '07:30',
      absence1j:        true,
      absence2j:        true,
      absence5j:        true,
      streakDanger:     true,
      motivationMatin:  true,
      prProche:         true,
      semaineParf:      true,
      ton:              'motivant',
      son:              true,
      vibration:        true,
      // Nouvelles options v3
      finSeance:        true,
      nouveauPR:        true,
      trophee:          true,
      decharge:         true
    });
  },

  sauvegarderConfig(updates) {
    const config = { ...this.getConfig(), ...updates };
    Utils.storage.set(this.CONFIG_CLE, config);
    return config;
  },

  // ════════════════════════════════════════════════════════
  // PERMISSION
  // ════════════════════════════════════════════════════════
  async demanderPermission() {
    if (!('Notification' in window)) {
      console.warn('[Notifs] Non supporté sur cet appareil');
      return false;
    }
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') {
      Utils.toast(
        '🔔 Active les notifications dans les paramètres',
        'info', 4000
      );
      return false;
    }
    try {
      const result = await Notification.requestPermission();
      return result === 'granted';
    } catch(e) {
      return false;
    }
  },

  estAutorisee() {
    return 'Notification' in window
      && Notification.permission === 'granted';
  },

  // ════════════════════════════════════════════════════════
  // ENVOYER
  // ════════════════════════════════════════════════════════
  async envoyer(titre, message, options = {}) {
    const config = this.getConfig();
    if (!config.active) return;
    if (!this.estAutorisee()) return;

    const defauts = {
      icon:     './assets/icons/icon-192.png',
      badge:    './assets/icons/icon-72.png',
      vibrate:  config.vibration ? [200, 100, 200] : [],
      tag:      options.tag || 'powerapp',
      renotify: true,
      actions:  options.actions || []
    };

    try {
      if ('serviceWorker' in navigator) {
        const sw = await navigator.serviceWorker.ready;
        await sw.showNotification(titre, {
          body: message,
          ...defauts,
          ...options
        });
      } else {
        new Notification(titre, {
          body: message,
          icon: defauts.icon
        });
      }
    } catch(e) {
      console.warn('[Notifs] Erreur envoi:', e);
    }
  },

  // ════════════════════════════════════════════════════════
  // MESSAGES PAR TON
  // ════════════════════════════════════════════════════════
  getMessage(type, contexte = {}) {
    const ton = this.getConfig().ton;
    const {
      jours  = 0,
      streak = 0,
      nom    = 'Athlète',
      pr     = '',
      seance = ''
    } = contexte;

    const messages = {

      absence_1: {
        motivant: [
          `Hé ${nom} ! T'as oublié quelque chose à la salle... tes muscles ! 💪`,
          `Un jour de repos c'est bien. Deux c'est une excuse. 😏`,
          `Ta prochaine séance s'impatiente Champ ! Tu viens ? 🏋️`
        ],
        doux: [
          `Coucou ${nom} 😊 Tu nous manques ! La salle t'attend.`,
          `Parfois on a besoin d'un petit rappel. Ta séance est là 🌟`,
          `Hey, tout va bien ? Ta séance reste disponible à tout moment 💫`
        ],
        severe: [
          `${nom} ! UNE séance manquée. C'est UNE de trop. On y va. 🔥`,
          `Les excuses ne construisent pas de muscles. La salle, maintenant. ⚡`,
          `Chaque jour sans entraînement est un jour de régression. BOUGE ! 💥`
        ]
      },

      absence_2: {
        motivant: [
          `2 jours sans sueur ${nom}... la flemme s'installe vite ! 😅`,
          `Ton streak de ${streak}j mérite mieux. Allez ! 🔥`,
          `45 minutes et tu repars comme une fusée 🚀`
        ],
        doux: [
          `${nom}, 2 jours de pause c'est ok. Mais là c'est l'heure de reprendre 💪`,
          `On sait que c'est parfois difficile. Même une courte séance compte ! 🌟`,
          `Retourner après une pause c'est le vrai défi. Tu peux le faire ! ✨`
        ],
        severe: [
          `2 jours ${nom}. 48H. Aucune excuse valable. On repart. MAINTENANT.`,
          `Ton corps commence à oublier. Rappelle-lui qui est le patron. 💥`,
          `2 jours perdus. Ne fais pas de 3. SALLE. AUJOURD'HUI. 🔥`
        ]
      },

      absence_5: {
        motivant: [
          `${jours} jours ${nom}... relançons la machine doucement ! 🌱`,
          `Le plus dur c'est de remettre les baskets. Après ça roule ! 👟`,
          `Ton futur toi te remerciera d'y aller aujourd'hui. 💪`
        ],
        doux: [
          `${nom}, on ne juge pas. On repart simplement. Doucement 🌟`,
          `${jours} jours de pause, et alors ? Ce qui compte c'est de reprendre 💫`,
          `Chaque grand athlète a eu des pauses. L'important c'est de revenir 🌸`
        ],
        severe: [
          `${jours} JOURS ${nom}. C'est inacceptable. On repart maintenant.`,
          `${jours} jours perdus. Chaque jour de plus te coûte tes gains. STOP. 🔥`,
          `Tu avais un objectif. Tu l'as pas oublié. RETOURNE À LA SALLE. ⚡`
        ]
      },

      streak_danger: {
        motivant: [
          `⚠️ Ton streak de ${streak}j est en danger ${nom} !`,
          `🔥 ${streak} jours de streak à protéger ! Tu y vas ?`,
          `Streak de ${streak}j... une courte séance suffit pour le garder.`
        ],
        doux: [
          `${nom}, ton beau streak de ${streak} jours peut encore être sauvé 🌟`,
          `Plus que quelques heures pour garder ton streak. Tu le fais ? 💫`,
          `${streak} jours c'est trop précieux à perdre. Allez ! ✨`
        ],
        severe: [
          `STREAK EN DANGER ${nom} ! ${streak}j à protéger. TU Y VAS OU PAS ?! 🔥`,
          `${streak} jours. Tout perdre en une nuit. Décide maintenant. ⚡`,
          `TON STREAK DE ${streak}J. MAINTENANT. 💥`
        ]
      },

      rappel_quotidien: {
        motivant: [
          `Bonjour ${nom} ! 🌅 Ta séance t'attend. On va cartonner !`,
          `Nouvelle journée, nouvelles opportunités de progresser ! 💪`,
          `C'est parti ${nom} ! Aujourd'hui on bat des records ! 🏆`
        ],
        doux: [
          `Bonjour ${nom} 😊 Prêt pour ta séance du jour ?`,
          `Belle journée pour s'entraîner ${nom} ! Tu vas assurer 🌟`,
          `Coucou ${nom} ! Ta séance est planifiée. Bonne chance 💫`
        ],
        severe: [
          `${nom}. Séance du jour. Pas d'excuse. On y va. 🔥`,
          `La salle t'attend ${nom}. Tu es attendu. Présent ? ⚡`,
          `JOUR D'ENTRAÎNEMENT ${nom}. DEBOUT. SALLE. MAINTENANT. 💥`
        ]
      },

      semaine_parfaite: {
        motivant: [
          `🏆 SEMAINE PARFAITE ${nom} ! Toutes les séances complètes. +300 XP !`,
          `Tu es INARRÊTABLE ! Semaine 100% complète ! Continue ! 🔥`,
          `Semaine parfaite ${nom} ! C'est comme ça qu'on construit un physique ! 💪`
        ],
        doux: [
          `Bravo ${nom} ! Semaine complète ! Tu peux être fier 🌟`,
          `Quelle belle semaine ${nom} ! Continue, tu es sur la bonne voie 💫`,
          `Semaine parfaite ! Tu le mérites vraiment ${nom} ✨`
        ],
        severe: [
          `SEMAINE PARFAITE. Voilà comment on progresse. Recommence. 🔥`,
          `Toutes les séances. C'est le minimum requis. On garde ce rythme. ⚡`,
          `BIEN. Semaine complète. C'est maintenant la norme. 💥`
        ]
      },

      pr_proche: {
        motivant: [
          `📈 Tu es proche d'un record sur ${pr} ${nom} !`,
          `Aujourd'hui pourrait être le jour du PR sur ${pr} ! 🏆`,
          `${pr} : tu es à seulement quelques kilos du record ! 💪`
        ],
        doux: [
          `${nom}, tu progresses bien sur ${pr} 🌟 Record accessible !`,
          `Tu es proche de ton meilleur sur ${pr}. Essaie si tu te sens bien 💫`,
          `Belle progression sur ${pr} ! Le record est à portée 🌸`
        ],
        severe: [
          `${pr}. Ton record est à portée. BATS-LE AUJOURD'HUI. 🔥`,
          `PROCHE DU PR sur ${pr}. Pas d'excuse pour rater ça. ⚡`,
          `LE PR SUR ${pr} EST LÀ. PRENDS-LE. 💥`
        ]
      },

      fin_seance: {
        motivant: [
          `💪 Séance terminée ${nom} ! Tu assures grave. Récupère bien !`,
          `GG ${nom} ! Encore une séance dans la boîte. Respects 🏆`,
          `BEAST MODE activé ${nom} ! Séance faite. Corps qui progresse ! 🔥`
        ],
        doux: [
          `Bravo ${nom} ! Séance terminée, profite de ta récupération 🌟`,
          `Belle séance ${nom} ! Ton corps te remerciera 💫`,
          `Fière de toi ${nom} ! Séance accomplie ✨`
        ],
        severe: [
          `Séance faite. Bien. La suivante est dans X jours. Prépare-toi.`,
          `C'était pas parfait mais c'était fait. Améliore demain. 🎯`,
          `Séance terminée. Récupère. La prochaine doit être meilleure. 🔥`
        ]
      },

      decharge: {
        motivant: [
          `😴 Semaine de décharge ${nom} ! Ton corps va supercompenser. Charges légères !`,
          `Décharge planifiée ${nom} ! -40% charges. Tu vas exploser le prochain cycle ! 🚀`,
          `Semaine de récup ${nom} ! Technique parfaite, charges légères. C'est stratégique ! 💡`
        ],
        doux: [
          `${nom}, cette semaine on récupère. Charges légères, technique parfaite 🌟`,
          `Semaine de décharge ! Profites-en pour parfaire ta technique 💫`,
          `Ton corps mérite cette semaine de récup ${nom} ✨`
        ],
        severe: [
          `DÉCHARGE. -40% charges. Pas de négociation. C'est planifié. 🎯`,
          `Semaine légère IMPOSÉE. Récupère pour mieux exploser ensuite. ⚡`,
          `DÉCHARGE OBLIGATOIRE. Ignorer = surmenage = régression. Obéis. 💥`
        ]
      }
    };

    const groupe = messages[type];
    if (!groupe) {
      return `Hey ${nom}, ta séance t'attend ! 💪`;
    }
    const liste = groupe[ton] || groupe.motivant;
    return Utils.random(liste);
  },

  // ════════════════════════════════════════════════════════
  // VÉRIFICATIONS
  // ════════════════════════════════════════════════════════

  async verifierAbsenceEtNotifier() {
    const config = this.getConfig();
    if (!config.active) return;

    let jours = -1, nom = 'Athlète', streak = 0;
    try { jours  = Tracker.getJoursAbsence();    } catch(e) {}
    try { nom    = Tracker.getProfil().nom||'Athlète'; } catch(e) {}
    try { streak = Tracker.getStreak().count;    } catch(e) {}

    // Ne pas notifier les jours de repos
    try {
      const planning = PLANNING_SEMAINE?.[
        Utils.indexJourSemaine(Utils.aujourd_hui())
      ];
      if (!planning?.seanceId) return;
    } catch(e) {}

    const ctx = { jours, streak, nom };

    if (jours >= 5 && config.absence5j) {
      await this.envoyer(
        `😢 ${jours} jours sans séance...`,
        this.getMessage('absence_5', ctx),
        {
          tag: 'absence-5j',
          actions: [
            { action:'express', title:'⚡ Séance express' },
            { action:'go',      title:'▶ Je fonce'       }
          ]
        }
      );
    } else if (jours >= 2 && config.absence2j) {
      await this.envoyer(
        `🔥 ${jours} jours sans séance`,
        this.getMessage('absence_2', ctx),
        {
          tag: 'absence-2j',
          actions: [
            { action:'go',    title:'▶ J\'y vais !' },
            { action:'later', title:'⏰ Ce soir'    }
          ]
        }
      );
    } else if (jours >= 1 && config.absence1j) {
      await this.envoyer(
        `💪 Ta séance t'attend !`,
        this.getMessage('absence_1', ctx),
        {
          tag: 'absence-1j',
          actions: [
            { action:'go', title:'▶ J\'y vais !' }
          ]
        }
      );
    }
  },

  async envoyerRappelQuotidien() {
    const config = this.getConfig();
    if (!config.active || !config.rappelQuotidien) return;

    let nom = 'Athlète', seance = null;
    try { nom    = Tracker.getProfil().nom || 'Athlète'; } catch(e) {}
    try { seance = Programme.getProchaineSeance();        } catch(e) {}

    let message = this.getMessage('rappel_quotidien', { nom });
    if (seance) {
      message += `\n${seance.emoji} ${seance.nom} — ~${seance.duree_estimee}min`;
    }

    await this.envoyer(
      `🌅 Bonjour ${nom} !`,
      message,
      {
        tag: 'rappel-quotidien',
        actions: [
          { action:'go',    title:'💪 On y va !' },
          { action:'later', title:'⏰ Plus tard'  }
        ]
      }
    );
  },

  async envoyerMotivationMatin() {
    const config = this.getConfig();
    if (!config.active || !config.motivationMatin) return;

    let citation = { texte:'La progression est un choix.', auteur:'Anonyme' };
    try { citation = Coach.getCitationDuJour(); } catch(e) {}

    await this.envoyer(
      `🌅 Citation du jour`,
      `"${citation.texte}" — ${citation.auteur}`,
      {
        tag: 'motivation-matin',
        actions: [
          { action:'go',    title:'💪 C\'est parti !' },
          { action:'later', title:'☕ Après le café'  }
        ]
      }
    );
  },

  async verifierStreakDanger() {
    const config = this.getConfig();
    if (!config.active || !config.streakDanger) return;

    let streak = { count:0 };
    try { streak = Tracker.getStreak(); } catch(e) {}
    if (streak.count < 3) return;

    const heure = Utils.heureActuelle();
    if (heure < 18) return;

    // Séance déjà faite aujourd'hui ?
    try {
      const seanceDuJour = Tracker.getSeanceDuJour();
      if (seanceDuJour?.complete) return;
    } catch(e) {}

    // Jour d'entraînement ?
    try {
      const planning = PLANNING_SEMAINE?.[
        Utils.indexJourSemaine(Utils.aujourd_hui())
      ];
      if (!planning?.seanceId) return;
    } catch(e) {}

    let nom = 'Athlète';
    try { nom = Tracker.getProfil().nom || 'Athlète'; } catch(e) {}

    await this.envoyer(
      `⚠️ Streak en danger !`,
      this.getMessage('streak_danger', {
        streak: streak.count, nom
      }),
      {
        tag:     'streak-danger',
        vibrate: [300, 100, 300, 100, 300],
        actions: [{ action:'go', title:'🔥 Je fonce !' }]
      }
    );
  },

  async verifierSemaineParf() {
    const config = this.getConfig();
    if (!config.active || !config.semaineParf) return;

    let objectif = 4, seances = 0, nom = 'Athlète';
    try { objectif = Utils.storage.get(
            'ft_objectif_seances_semaine', 4); } catch(e) {}
    try { seances = Tracker.getSeancesParSemaine();   } catch(e) {}
    try { nom     = Tracker.getProfil().nom||'Athlète'; } catch(e) {}

    if (seances < objectif) return;

    const cleNotif = 'ft_notif_semaine_parf_' +
      Utils.debutSemaine(Utils.aujourd_hui());
    if (Utils.storage.get(cleNotif, false)) return;

    await this.envoyer(
      `🏆 Semaine PARFAITE !`,
      this.getMessage('semaine_parfaite', { nom }),
      {
        tag:     'semaine-parfaite',
        vibrate: [200,100,200,100,200,100,400]
      }
    );

    Utils.storage.set(cleNotif, true);

    // XP + tracking
    try {
      Gamification.recompenser('SEMAINE_PARF');
      const total = Utils.storage.get('ft_semaines_parf', 0);
      Utils.storage.set('ft_semaines_parf', total + 1);
    } catch(e) {}
  },

  async notifierPR(exerciceRef, poids, reps) {
    const config = this.getConfig();
    if (!config.active || !config.nouveauPR) return;

    let ex = {}, nom = 'Athlète';
    try { ex  = (window.EXERCICES||{})[exerciceRef] || {}; } catch(e) {}
    try { nom = Tracker.getProfil().nom || 'Athlète';      } catch(e) {}

    await this.envoyer(
      `🏆 NOUVEAU RECORD !`,
      `${ex.nom||exerciceRef} : ${poids}kg × ${reps} reps ! Incroyable ${nom} !`,
      {
        tag:     `pr-${exerciceRef}`,
        vibrate: [200, 100, 200, 100, 400],
        actions: [{ action:'stats', title:'📊 Voir stats' }]
      }
    );
  },

  async notifierFinSeance(seanceNom, duree, volume) {
    const config = this.getConfig();
    if (!config.active || !config.finSeance) return;

    let nom = 'Athlète';
    try { nom = Tracker.getProfil().nom || 'Athlète'; } catch(e) {}

    await this.envoyer(
      `✅ Séance terminée !`,
      `${seanceNom} — ${Utils.formatDuree(duree)} · ${Utils.formatVolume(volume)} · ${this.getMessage('fin_seance', { nom })}`,
      {
        tag:     'fin-seance',
        vibrate: [100, 50, 100],
        actions: [
          { action:'stats',  title:'📊 Mes stats' },
          { action:'share',  title:'📸 Partager'  }
        ]
      }
    );
  },

  async notifierDecharge() {
    const config = this.getConfig();
    if (!config.active || !config.decharge) return;

    let nom = 'Athlète';
    try { nom = Tracker.getProfil().nom || 'Athlète'; } catch(e) {}

    // N'envoyer qu'une fois par semaine
    const cle = 'ft_notif_decharge_' +
      Utils.debutSemaine(Utils.aujourd_hui());
    if (Utils.storage.get(cle, false)) return;

    await this.envoyer(
      `😴 Semaine de décharge !`,
      this.getMessage('decharge', { nom }),
      { tag:'decharge', vibrate:[100,50,100] }
    );

    Utils.storage.set(cle, true);
  },

  async verifierPRsProches() {
    const config = this.getConfig();
    if (!config.active || !config.prProche) return;

    let prs = {}, seance = null, nom = 'Athlète';
    try { prs    = Tracker.getAllPRs();            } catch(e) {}
    try { seance = Programme.getProchaineSeance(); } catch(e) {}
    try { nom    = Tracker.getProfil().nom||'Athlète'; } catch(e) {}
    if (!seance) return;

    for (const exRef of (seance.exercices || [])) {
      const pr = prs[exRef?.ref || exRef];
      if (!pr?.rm1) continue;

      let phase = { intensite:0.75 };
      try { phase = Programme.getPhaseActuelle(); } catch(e) {}

      const chargeObj = Math.round(pr.rm1 * phase.intensite);
      const diff      = pr.rm1 - chargeObj;

      if (diff <= 5 && diff >= 0) {
        const ex = (window.EXERCICES||{})[exRef?.ref||exRef] || {};
        await this.envoyer(
          `📈 PR en vue !`,
          this.getMessage('pr_proche', { nom, pr:ex.nom||exRef }),
          {
            tag:     `pr-proche-${exRef}`,
            actions: [{ action:'go', title:'🏆 Je vise le PR !' }]
          }
        );
        break; // Une seule notif à la fois
      }
    }
  },

  // ════════════════════════════════════════════════════════
  // VÉRIFICATION AU LANCEMENT
  // ════════════════════════════════════════════════════════
  async verifierAuLancement() {
    const config = this.getConfig();
    if (!config.active) return;

    const heure = Utils.heureActuelle();
    let jours = -1;
    try { jours = Tracker.getJoursAbsence(); } catch(e) {}

    // Notifier si absence + heures raisonnables
    if (jours >= 2 && heure >= 8 && heure <= 21) {
      await this.verifierAbsenceEtNotifier();
    }

    // Vérifier PRs proches (une fois par jour)
    const dejVerifPR = Utils.storage.get(
      'ft_verif_pr_' + Utils.aujourd_hui(), false
    );
    if (!dejVerifPR) {
      await this.verifierPRsProches();
      Utils.storage.set(
        'ft_verif_pr_' + Utils.aujourd_hui(), true
      );
    }

    // Décharge si semaine 16
    try {
      if (Programme.isDecharge?.()) {
        await this.notifierDecharge();
      }
    } catch(e) {}
  },

  // ════════════════════════════════════════════════════════
  // PLANIFICATION
  // ════════════════════════════════════════════════════════
  planifierRappels() {
    const config = this.getConfig();
    if (!config.active) return;

    // Nettoyer l'ancien intervalle si existe
    this.arreterPlanification();

    const [heureConf, minConf] = (config.heureRappel||'07:30')
      .split(':').map(Number);

    this._intervalVerif = setInterval(async () => {
      const now     = new Date();
      const heure   = now.getHours();
      const minutes = now.getMinutes();

      // Rappel quotidien
      if (heure === heureConf && minutes === minConf
          && config.rappelQuotidien) {
        const cle = 'ft_rappel_' + Utils.aujourd_hui();
        if (!Utils.storage.get(cle, false)) {
          await this.envoyerRappelQuotidien();
          Utils.storage.set(cle, true);
        }
      }

      // Motivation matin (30 min après rappel)
      const minuteMotiv = (minConf + 30) % 60;
      const heureMotiv  = minConf + 30 >= 60
        ? heureConf + 1 : heureConf;
      if (heure === heureMotiv && minutes === minuteMotiv
          && config.motivationMatin) {
        const cle = 'ft_motiv_' + Utils.aujourd_hui();
        if (!Utils.storage.get(cle, false)) {
          await this.envoyerMotivationMatin();
          Utils.storage.set(cle, true);
        }
      }

      // Absence (vérification toutes les 2h)
      if (minutes === 0 && heure % 2 === 0
          && heure >= 8 && heure <= 20) {
        await this.verifierAbsenceEtNotifier();
      }

      // Streak danger (entre 18h et 22h)
      if (heure >= 18 && heure <= 22 && minutes === 30) {
        await this.verifierStreakDanger();
      }

      // PRs proches (à midi)
      if (heure === 12 && minutes === 0) {
        await this.verifierPRsProches();
      }

      // Semaine parfaite (check le soir)
      if (heure === 21 && minutes === 0) {
        await this.verifierSemaineParf();
      }

    }, 60 * 1000); // Toutes les minutes

    console.log('[Notifs] Planification active');
  },

  arreterPlanification() {
    if (this._intervalVerif) {
      clearInterval(this._intervalVerif);
      this._intervalVerif = null;
    }
  },

  // ════════════════════════════════════════════════════════
  // TEST
  // ════════════════════════════════════════════════════════
  async tester() {
    const autorisee = await this.demanderPermission();
    if (!autorisee) {
      Utils.toast(
        '❌ Permission notifications refusée', 'error'
      );
      return false;
    }

    let nom = 'Athlète';
    try { nom = Tracker.getProfil().nom || 'Athlète'; } catch(e) {}

    await this.envoyer(
      '✅ Notifications PowerApp actives !',
      `${nom}, tu recevras tes rappels et notifications ici.`,
      { tag:'test' }
    );

    Utils.toast('🔔 Notification de test envoyée !', 'success');
    return true;
  },

  // ════════════════════════════════════════════════════════
  // INIT
  // ════════════════════════════════════════════════════════
  async init() {
    const config = this.getConfig();
    if (!config.active) return;

    const autorisee = await this.demanderPermission();
    if (autorisee) {
      this.planifierRappels();
      setTimeout(() => this.verifierAuLancement(), 4000);
      console.log('✅ Notifications v3.0 initialisées');
    } else {
      console.log('[Notifs] Permissions non accordées');
    }
  },

  // ════════════════════════════════════════════════════════
  // UTILITAIRES
  // ════════════════════════════════════════════════════════

  // Résumé des notifications envoyées aujourd'hui
  getStatsDuJour() {
    const today  = Utils.aujourd_hui();
    const stats  = {};
    const cles   = [
      'ft_rappel_', 'ft_motiv_',
      'ft_verif_pr_', 'ft_notif_semaine_parf_',
      'ft_notif_decharge_'
    ];

    cles.forEach(cle => {
      stats[cle.replace('ft_','').replace('_','')] =
        Utils.storage.get(cle + today, false);
    });

    return stats;
  },

  // Reset des notifs du jour (dev)
  _resetNotifsJour() {
    const today = Utils.aujourd_hui();
    [
      'ft_rappel_', 'ft_motiv_',
      'ft_verif_pr_', 'ft_notif_semaine_parf_',
      'ft_notif_decharge_'
    ].forEach(cle => Utils.storage.remove(cle + today));
    Utils.toast('Notifs du jour réinitialisées', 'info');
  }
};

window.Notifications = Notifications;
console.log('✅ Notifications v3.0 chargé');
