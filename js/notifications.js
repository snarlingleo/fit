/* ============================================================
   FitTracker Pro — Notifications
   Rappels, absence, motivation, streak
   ============================================================ */

const Notifications = {

  CONFIG_CLE: 'ft_notifs_config',

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
      vibration:        true
    });
  },

  sauvegarderConfig(updates) {
    const config = { ...this.getConfig(), ...updates };
    Utils.storage.set(this.CONFIG_CLE, config);
    return config;
  },

  // ─── PERMISSION ───────────────────────────────────────────
  async demanderPermission() {
    if (!('Notification' in window)) {
      console.warn('[Notifs] Non supporté');
      return false;
    }
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') {
      Utils.toast('Active les notifications dans les paramètres', 'info');
      return false;
    }
    const result = await Notification.requestPermission();
    return result === 'granted';
  },

  estAutorisee() {
    return 'Notification' in window && Notification.permission === 'granted';
  },

  // ─── ENVOYER ──────────────────────────────────────────────
  async envoyer(titre, message, options = {}) {
    const config = this.getConfig();
    if (!config.active) return;

    const defauts = {
      icon:     './assets/icons/icon-192.png',
      badge:    './assets/icons/icon-72.png',
      vibrate:  config.vibration ? [200, 100, 200] : [],
      tag:      options.tag || 'fittracker',
      renotify: true,
      actions:  options.actions || []
    };

    try {
      if ('serviceWorker' in navigator) {
        const sw = await navigator.serviceWorker.ready;
        await sw.showNotification(titre, {
          body: message, ...defauts, ...options
        });
      } else {
        new Notification(titre, { body: message, icon: defauts.icon });
      }
    } catch(e) {
      console.warn('[Notifs] Erreur envoi:', e);
    }
  },

  // ─── MESSAGES PAR TON ─────────────────────────────────────
  getMessage(type, contexte = {}) {
    const ton = this.getConfig().ton;
    const { jours = 0, streak = 0, nom = 'Athlète', pr = '' } = contexte;

    const messages = {
      absence_1: {
        motivant: [
          `Hé ${nom} ! T'as oublié quelque chose à la salle... tes muscles ! 💪`,
          `Un jour de repos c'est bien. Deux c'est une excuse. 😏`,
          `Ta prochaine séance s'impatiente Champ !`
        ],
        doux: [
          `Coucou ${nom} 😊 Tu nous manques ! La salle t'attend.`,
          `Parfois on a besoin d'un petit rappel. Ta séance est là quand tu veux 🌟`,
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
          `Ton streak de ${streak}j mérite mieux que ça. Allez ! 🔥`,
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
          `${nom}, on ne juge pas. On repart simplement. Doucement mais sûrement 🌟`,
          `${jours} jours de pause, et alors ? Ce qui compte c'est de reprendre 💫`,
          `Chaque grand athlète a eu des pauses. L'important c'est de revenir 🌸`
        ],
        severe: [
          `${jours} JOURS ${nom}. C'est inacceptable. On repart maintenant ou jamais.`,
          `${jours} jours de perdus. Chaque jour de plus te coûte tes gains. STOP. 🔥`,
          `Tu avais un objectif. Tu l'as pas oublié. RETOURNE À LA SALLE. ⚡`
        ]
      },
      streak_danger: {
        motivant: [
          `⚠️ Ton streak de ${streak}j est en danger ${nom} ! Il reste peu de temps.`,
          `🔥 ${streak} jours de streak à protéger ! Tu y vas ?`,
          `Streak de ${streak}j... préserve-le ! Une courte séance suffit.`
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
          `Bonjour ${nom} ! 🌅 Ta séance t'attend. On va cartonner aujourd'hui !`,
          `Nouvelle journée, nouvelles opportunités de progresser ! 💪`,
          `C'est parti ${nom} ! La salle t'attend. Aujourd'hui on bat des records ! 🏆`
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
          `🏆 SEMAINE PARFAITE ${nom} ! 5/5 séances. Incroyable ! +200 XP 🎉`,
          `Tu es INARRÊTABLE ! Semaine 100% complète ! Continue ! 🔥`,
          `Semaine parfaite ${nom} ! C'est comme ça qu'on construit un physique ! 💪`
        ],
        doux: [
          `Bravo ${nom} ! Semaine complète ! Tu peux être fier de toi 🌟`,
          `Quelle belle semaine ${nom} ! Continue, tu es sur la bonne voie 💫`,
          `Semaine parfaite ! Tu le mérites vraiment ${nom} ✨`
        ],
        severe: [
          `SEMAINE PARFAITE. Voilà comment on progresse. Recommence. 🔥`,
          `5/5. C'est le minimum. On garde ce rythme. ⚡`,
          `BIEN. Semaine complète. C'est maintenant la norme. 💥`
        ]
      },
      pr_proche: {
        motivant: [
          `📈 Tu es proche d'un record sur ${pr} ${nom} ! Donne tout aujourd'hui !`,
          `Aujourd'hui pourrait être le jour du PR sur ${pr} ! Tu te sens prêt ? 🏆`,
          `${pr} : tu es à seulement quelques kilos du record ! Force ! 💪`
        ],
        doux: [
          `${nom}, tu progresses bien sur ${pr} 🌟 Tu pourrais battre ton record !`,
          `Tu es proche de ton meilleur sur ${pr}. Essaie si tu te sens bien 💫`,
          `Belle progression sur ${pr} ! Ton record est accessible 🌸`
        ],
        severe: [
          `${pr}. Ton record est à portée. BATS-LE AUJOURD'HUI. 🔥`,
          `PROCHE DU PR sur ${pr}. Pas d'excuse pour rater ça. ⚡`,
          `LE PR SUR ${pr} EST LÀ. PRENDS-LE. 💥`
        ]
      }
    };

    const groupe = messages[type];
    if (!groupe) return `Hey ${nom}, ta séance t'attend !`;
    const liste = groupe[ton] || groupe.motivant;
    return Utils.random(liste);
  },

  // ─── VÉRIFICATION ABSENCE ─────────────────────────────────
  async verifierAbsenceEtNotifier() {
    const config = this.getConfig();
    if (!config.active) return;

    const jours   = Tracker.getJoursAbsence();
    const profil  = Tracker.getProfil();
    const streak  = Tracker.getStreak();
    const contexte = {
      jours,
      streak: streak.count,
      nom: profil.nom || 'Athlète'
    };

    const planning    = PLANNING_SEMAINE[Utils.indexJourSemaine(Utils.aujourd_hui())];
    const estJourRepos = !planning?.seanceId;
    if (estJourRepos) return;

    if (jours >= 5 && config.absence5j) {
      await this.envoyer(
        `😢 ${jours} jours sans séance...`,
        this.getMessage('absence_5', contexte),
        {
          tag: 'absence-5j',
          actions: [
            { action: 'express', title: '⚡ Séance express' },
            { action: 'go',      title: '▶ Je fonce'        }
          ]
        }
      );
    } else if (jours >= 2 && config.absence2j) {
      await this.envoyer(
        `🔥 ${jours} jours sans séance`,
        this.getMessage('absence_2', contexte),
        {
          tag: 'absence-2j',
          actions: [
            { action: 'go',    title: '▶ J\'y vais !' },
            { action: 'later', title: '⏰ Ce soir'    }
          ]
        }
      );
    } else if (jours >= 1 && config.absence1j) {
      await this.envoyer(
        `💪 Ta séance t'attend !`,
        this.getMessage('absence_1', contexte),
        {
          tag: 'absence-1j',
          actions: [{ action: 'go', title: '▶ J\'y vais !' }]
        }
      );
    }
  },

  // ─── RAPPEL QUOTIDIEN ─────────────────────────────────────
  async envoyerRappelQuotidien() {
    const config  = this.getConfig();
    if (!config.active || !config.rappelQuotidien) return;

    const profil  = Tracker.getProfil();
    const seance  = Programme.getProchaineSeance();
    const contexte = { nom: profil.nom || 'Athlète' };

    let message = this.getMessage('rappel_quotidien', contexte);
    if (seance) message += `\n${seance.emoji} ${seance.nom}`;

    await this.envoyer(
      `🌅 Bonjour ${profil.nom || 'Athlète'} !`,
      message,
      {
        tag: 'rappel-quotidien',
        actions: [
          { action: 'go',    title: '💪 On y va !' },
          { action: 'later', title: '⏰ Plus tard'  }
        ]
      }
    );
  },

  // ─── MOTIVATION MATIN ─────────────────────────────────────
  async envoyerMotivationMatin() {
    const config = this.getConfig();
    if (!config.active || !config.motivationMatin) return;

    const citation = Coach.getCitationDuJour();

    await this.envoyer(
      `🌅 Motivation du jour`,
      `"${citation.texte}" — ${citation.auteur}`,
      {
        tag: 'motivation-matin',
        actions: [
          { action: 'go',    title: '💪 C\'est parti !' },
          { action: 'later', title: '☕ Après le café'  }
        ]
      }
    );
  },

  // ─── STREAK EN DANGER ─────────────────────────────────────
  async verifierStreakDanger() {
    const config = this.getConfig();
    if (!config.active || !config.streakDanger) return;

    const streak = Tracker.getStreak();
    if (streak.count < 3) return;

    const heure = Utils.heureActuelle();
    if (heure < 18) return;

    const seanceDuJour = Tracker.getSeanceDuJour();
    if (seanceDuJour?.complete) return;

    const planning = PLANNING_SEMAINE[Utils.indexJourSemaine(Utils.aujourd_hui())];
    if (!planning?.seanceId) return;

    const profil  = Tracker.getProfil();
    const contexte = { streak: streak.count, nom: profil.nom };

    await this.envoyer(
      `⚠️ Streak en danger !`,
      this.getMessage('streak_danger', contexte),
      {
        tag:     'streak-danger',
        vibrate: [300, 100, 300, 100, 300],
        actions: [{ action: 'go', title: '🔥 Je fonce !' }]
      }
    );
  },

  // ─── SEMAINE PARFAITE ─────────────────────────────────────
  async verifierSemaineParf() {
    const config = this.getConfig();
    if (!config.active || !config.semaineParf) return;

    const objectif = Utils.storage.get('ft_objectif_seances_semaine', 4);
    const seances  = Tracker.getSeancesParSemaine();
    if (seances < objectif) return;

    const profil     = Tracker.getProfil();
    const cleNotif   = 'ft_notif_semaine_parf_' +
                       Utils.debutSemaine(Utils.aujourd_hui());
    const dejNotifie = Utils.storage.get(cleNotif, false);
    if (dejNotifie) return;

    await this.envoyer(
      `🏆 Semaine PARFAITE !`,
      this.getMessage('semaine_parfaite', { nom: profil.nom }),
      { tag: 'semaine-parfaite', vibrate: [200,100,200,100,200,100,400] }
    );

    Utils.storage.set(cleNotif, true);
  },

  // ─── NOTIFICATION PR ──────────────────────────────────────
  async notifierPR(exerciceRef, poids, reps) {
    const ex     = EXERCICES[exerciceRef];
    const profil = Tracker.getProfil();

    await this.envoyer(
      `🏆 NOUVEAU RECORD !`,
      `${ex?.nom || exerciceRef} : ${poids}kg × ${reps} reps ! Incroyable ${profil.nom} !`,
      {
        tag:     `pr-${exerciceRef}`,
        vibrate: [200, 100, 200, 100, 400],
        actions: [{ action: 'stats', title: '📊 Voir stats' }]
      }
    );
  },

  // ─── PR PROCHES ───────────────────────────────────────────
  async verifierPRsProches() {
    const config = this.getConfig();
    if (!config.active || !config.prProche) return;

    const prs    = Tracker.getAllPRs();
    const profil = Tracker.getProfil();
    const seance = Programme.getProchaineSeance();
    if (!seance) return;

    for (const exRef of (seance.exercices || [])) {
      const pr = prs[exRef];
      if (!pr?.rm1) continue;

      const phase     = Programme.getPhaseActuelle();
      const chargeObj = Math.round(pr.rm1 * phase.intensite);
      const diff      = pr.rm1 - chargeObj;

      if (diff <= 5 && diff >= 0) {
        const ex = EXERCICES[exRef] || {};
        await this.envoyer(
          `📈 PR en vue !`,
          this.getMessage('pr_proche', {
            nom: profil.nom,
            pr:  ex.nom || exRef
          }),
          {
            tag:     `pr-proche-${exRef}`,
            actions: [{ action: 'go', title: '🏆 Je vise le PR !' }]
          }
        );
        break;
      }
    }
  },

  // ─── VÉRIFICATION AU LANCEMENT ────────────────────────────
  async verifierAuLancement() {
    const config = this.getConfig();
    if (!config.active) return;

    const jours = Tracker.getJoursAbsence();
    const heure = Utils.heureActuelle();

    if (jours >= 2 && heure >= 8 && heure <= 21) {
      await this.verifierAbsenceEtNotifier();
    }

    const dejVerifie = Utils.storage.get(
      'ft_verif_pr_' + Utils.aujourd_hui(), false
    );
    if (!dejVerifie) {
      await this.verifierPRsProches();
      Utils.storage.set('ft_verif_pr_' + Utils.aujourd_hui(), true);
    }
  },

  // ─── PLANIFIER RAPPELS ────────────────────────────────────
  planifierRappels() {
    const config = this.getConfig();
    if (!config.active) return;

    this._intervalVerif = setInterval(async () => {
      const heure     = Utils.heureActuelle();
      const minutes   = new Date().getMinutes();
      const heureConf = parseInt(config.heureRappel.split(':')[0]);
      const minConf   = parseInt(config.heureRappel.split(':')[1]);

      // Rappel quotidien
      if (heure === heureConf && minutes === minConf
          && config.rappelQuotidien) {
        const dejEnvoye = Utils.storage.get(
          'ft_rappel_' + Utils.aujourd_hui(), false
        );
        if (!dejEnvoye) {
          await this.envoyerRappelQuotidien();
          Utils.storage.set('ft_rappel_' + Utils.aujourd_hui(), true);
        }
      }

      // Motivation matin (30 min après rappel)
      if (heure === heureConf && minutes === (minConf + 30) % 60
          && config.motivationMatin) {
        const dejEnvoye = Utils.storage.get(
          'ft_motiv_' + Utils.aujourd_hui(), false
        );
        if (!dejEnvoye) {
          await this.envoyerMotivationMatin();
          Utils.storage.set('ft_motiv_' + Utils.aujourd_hui(), true);
        }
      }

      // Absence (toutes les 2h)
      if (minutes === 0 && heure % 2 === 0) {
        await this.verifierAbsenceEtNotifier();
      }

      // Streak danger (18h-22h)
      if (heure >= 18 && heure <= 22 && minutes === 30) {
        await this.verifierStreakDanger();
      }

      // PR proches (à midi)
      if (heure === 12 && minutes === 0) {
        await this.verifierPRsProches();
      }

    }, 60 * 1000);
  },

  arreterPlanification() {
    if (this._intervalVerif) clearInterval(this._intervalVerif);
  },

  // ─── TEST ─────────────────────────────────────────────────
  async tester() {
    const autorisee = await this.demanderPermission();
    if (!autorisee) {
      Utils.toast('Permission notifications refusée', 'error');
      return false;
    }
    await this.envoyer(
      '✅ Notifications actives !',
      'FitTracker Pro te tiendra informé de tes séances.',
      { tag: 'test' }
    );
    Utils.toast('Notification de test envoyée !', 'success');
    return true;
  },

  // ─── INIT ─────────────────────────────────────────────────
  async init() {
    const config = this.getConfig();
    if (!config.active) return;

    const autorisee = await this.demanderPermission();
    if (autorisee) {
      this.planifierRappels();
      setTimeout(() => this.verifierAuLancement(), 3000);
      console.log('✅ Notifications initialisées');
    }
  }
};

window.Notifications = Notifications;
console.log('✅ Notifications chargé');
