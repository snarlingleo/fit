/* ============================================================
   FitTracker Pro — Tracker
   Suivi progression, PRs, streak, volume, historique
   ============================================================ */

const Tracker = {

  // ─── CLÉS STORAGE ─────────────────────────────────────────
  CLE: {
    SEANCE:    (date, id)         => `ft_seance_${date}_${id}`,
    SERIE:     (date, id, ref, s) => `ft_${date}_${id}_${ref}_s${s}`,
    PR:        (ref)              => `ft_pr_${ref}`,
    STREAK:    ()                 => 'ft_streak',
    HUMEUR:    (date)             => `ft_humeur_${date}`,
    FATIGUE:   (date)             => `ft_fatigue_${date}`,
    RPE_MOY:   (date)             => `ft_rpe_${date}`,
    PROFIL:    ()                 => 'ft_profil',
    MESURES:   ()                 => 'ft_mesures',
    OBJECTIFS: ()                 => 'ft_objectifs',
    BLESSURES: ()                 => 'ft_blessures',
    JOURNAL:   ()                 => 'ft_journal',
    NOTIFS:    ()                 => 'ft_notifs_config',
    XP:        ()                 => 'ft_xp',
    TROPHEES:  ()                 => 'ft_trophees'
  },

  // ─── SÉANCE ───────────────────────────────────────────────
  demarrerSeance(seanceId, date = null) {
    const d    = date || Utils.aujourd_hui();
    const data = {
      id:          seanceId,
      date:        d,
      debut:       Date.now(),
      fin:         null,
      duree:       null,
      series:      [],
      prs:         [],
      volumeTotal: 0,
      rpesMoyen:   null,
      complete:    false
    };
    Utils.storage.set(this.CLE.SEANCE(d, seanceId), data);
    return data;
  },

  terminerSeance(seanceId, date = null) {
    const d    = date || Utils.aujourd_hui();
    const cle  = this.CLE.SEANCE(d, seanceId);
    const data = Utils.storage.get(cle, {});

    if (!data.debut) return null;

    data.fin      = Date.now();
    data.duree    = Math.floor((data.fin - data.debut) / 1000);
    data.complete = true;

    const rpes     = data.series.filter(s => s.rpe).map(s => s.rpe);
    data.rpesMoyen = rpes.length
      ? Utils.arrondir(rpes.reduce((a,b) => a+b, 0) / rpes.length)
      : null;

    Utils.storage.set(cle, data);
    this.mettreAJourStreak(d);
    return data;
  },

  // ─── SÉRIE ────────────────────────────────────────────────
  sauvegarderSerie(seanceId, exerciceRef, serie, reps, poids, rpe = null) {
    const date = Utils.aujourd_hui();
    const cle  = this.CLE.SERIE(date, seanceId, exerciceRef, serie);

    const data = {
      reps:      parseInt(reps)   || 0,
      poids:     parseFloat(poids)|| 0,
      rpe:       rpe ? parseInt(rpe) : null,
      rm1:       Utils.calculer1RM(parseFloat(poids)||0, parseInt(reps)||1),
      timestamp: Date.now()
    };

    Utils.storage.set(cle, data);

    const isPR = this.verifierEtSauvegarderPR(exerciceRef, data);

    const seanceCle  = this.CLE.SEANCE(date, seanceId);
    const seanceData = Utils.storage.get(seanceCle, {});
    if (!seanceData.series) seanceData.series = [];
    seanceData.series.push({ exerciceRef, serie, ...data });
    seanceData.volumeTotal = (seanceData.volumeTotal||0) + (data.poids * data.reps);
    Utils.storage.set(seanceCle, seanceData);

    return { ...data, isPR };
  },

  // ─── RECORDS PERSONNELS ───────────────────────────────────
  verifierEtSauvegarderPR(exerciceRef, { poids, reps, rm1 }) {
    const cle    = this.CLE.PR(exerciceRef);
    const actuel = Utils.storage.get(cle, { poids:0, reps:0, rm1:0 });
    let   nouveau = false;
    const updates = {};

    if (poids > (actuel.poids||0)) { updates.poids = poids; nouveau = true; }
    if (reps  > (actuel.reps ||0)) { updates.reps  = reps;  nouveau = true; }
    if (rm1   > (actuel.rm1  ||0)) { updates.rm1   = rm1;   nouveau = true; }

    if (nouveau) {
      Utils.storage.set(cle, {
        ...actuel, ...updates,
        date:     Utils.aujourd_hui(),
        exercice: exerciceRef
      });
    }

    return nouveau;
  },

  getPR(exerciceRef) {
    return Utils.storage.get(this.CLE.PR(exerciceRef), null);
  },

  getAllPRs() {
    const prs = {};
    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (cle.startsWith('ft_pr_')) {
        const ref = cle.replace('ft_pr_', '');
        prs[ref]  = JSON.parse(localStorage.getItem(cle));
      }
    }
    return prs;
  },

  // ─── HISTORIQUE ───────────────────────────────────────────
  getHistoriqueExercice(exerciceRef, limite = 30) {
    const resultats = [];

    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (cle.includes(`_${exerciceRef}_s`) && cle.startsWith('ft_')) {
        const parts = cle.split('_');
        const date  = parts[1];
        const data  = JSON.parse(localStorage.getItem(cle));
        resultats.push({ date, cle, ...data });
      }
    }

    return resultats
      .sort((a,b) => new Date(b.date) - new Date(a.date))
      .slice(0, limite);
  },

  getDernierePerf(seanceId, exerciceRef) {
    const today     = Utils.aujourd_hui();
    const resultats = [];

    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (cle.includes(`_${seanceId}_${exerciceRef}_s1`)
          && cle.startsWith('ft_')) {
        const parts = cle.split('_');
        const date  = parts[1];
        if (date < today) {
          const data = JSON.parse(localStorage.getItem(cle));
          resultats.push({ date, ...data });
        }
      }
    }

    if (!resultats.length) return null;
    return resultats.sort((a,b) => new Date(b.date) - new Date(a.date))[0];
  },

  getHistoriqueSeances(limite = 50) {
    const seances = [];

    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (cle.startsWith('ft_seance_')) {
        const data = JSON.parse(localStorage.getItem(cle));
        if (data.complete) seances.push(data);
      }
    }

    return seances
      .sort((a,b) => new Date(b.date) - new Date(a.date))
      .slice(0, limite);
  },

  getDerniereSéance() {
    const seances = this.getHistoriqueSeances(1);
    return seances.length ? new Date(seances[0].date).getTime() : null;
  },

  getSeanceDuJour(date = null) {
    const d = date || Utils.aujourd_hui();
    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (cle.startsWith(`ft_seance_${d}`)) {
        return JSON.parse(localStorage.getItem(cle));
      }
    }
    return null;
  },

  // ─── STREAK ───────────────────────────────────────────────
  mettreAJourStreak(date = null) {
    const d      = date || Utils.aujourd_hui();
    const streak = Utils.storage.get(this.CLE.STREAK(), {
      count: 0, dernierJour: null, max: 0
    });

    const hier = Utils.ajouterJours(d, -1);

    if (streak.dernierJour === hier || streak.dernierJour === d) {
      if (streak.dernierJour !== d) streak.count++;
    } else if (streak.dernierJour === null) {
      streak.count = 1;
    } else {
      streak.count = 1;
    }

    streak.dernierJour = d;
    streak.max = Math.max(streak.max, streak.count);
    Utils.storage.set(this.CLE.STREAK(), streak);
    return streak;
  },

  getStreak() {
    return Utils.storage.get(this.CLE.STREAK(), { count:0, max:0 });
  },

  getJoursAbsence() {
    const derniere = this.getDerniereSéance();
    if (!derniere) return -1;
    return Utils.diffJours(
      new Date(derniere).toISOString().split('T')[0],
      Utils.aujourd_hui()
    );
  },

  // ─── HUMEUR & FATIGUE ─────────────────────────────────────
  sauvegarderHumeur(humeur, date = null) {
    const d = date || Utils.aujourd_hui();
    Utils.storage.set(this.CLE.HUMEUR(d), {
      humeur, timestamp: Date.now()
    });
  },

  getHumeur(date = null) {
    const d = date || Utils.aujourd_hui();
    return Utils.storage.get(this.CLE.HUMEUR(d), null);
  },

  sauvegarderFatigue(niveau, date = null) {
    const d = date || Utils.aujourd_hui();
    Utils.storage.set(this.CLE.FATIGUE(d), {
      niveau, timestamp: Date.now()
    });
  },

  getFatigue(date = null) {
    const d = date || Utils.aujourd_hui();
    return Utils.storage.get(this.CLE.FATIGUE(d), null);
  },

  // ─── STATISTIQUES ─────────────────────────────────────────
  getTotalSeances() {
    return this.getHistoriqueSeances(9999).length;
  },

  getVolumeSemaine(dateStr = null) {
    const debut = Utils.debutSemaine(dateStr || Utils.aujourd_hui());
    const fin   = Utils.finSemaine(dateStr   || Utils.aujourd_hui());
    let   total = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (!cle.startsWith('ft_seance_')) continue;
      const data = JSON.parse(localStorage.getItem(cle));
      if (data.date >= debut && data.date <= fin && data.complete) {
        total += data.volumeTotal || 0;
      }
    }

    return total;
  },

  getVolumeParSemaine(nbSemaines = 8) {
    const semaines = [];

    for (let i = nbSemaines - 1; i >= 0; i--) {
      const date  = Utils.ajouterJours(Utils.aujourd_hui(), -i * 7);
      const debut = Utils.debutSemaine(date);
      const label = `S${Utils.semainesDepuis(Programme.getDateDebut()) - i}`;
      const vol   = this.getVolumeSemaine(debut);
      semaines.push({ label, volume: vol, date: debut });
    }

    return semaines;
  },

  getSeancesParSemaine(date = null) {
    const debut = Utils.debutSemaine(date || Utils.aujourd_hui());
    const fin   = Utils.finSemaine(date   || Utils.aujourd_hui());
    let   count = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (!cle.startsWith('ft_seance_')) continue;
      const data = JSON.parse(localStorage.getItem(cle));
      if (data.date >= debut && data.date <= fin && data.complete) count++;
    }

    return count;
  },

  getProgressionExercice(exerciceRef, nbSemaines = 8) {
    const hist       = this.getHistoriqueExercice(exerciceRef, 200);
    const parSemaine = {};

    hist.forEach(h => {
      const semaine = Utils.debutSemaine(h.date);
      if (!parSemaine[semaine] || h.rm1 > parSemaine[semaine].rm1) {
        parSemaine[semaine] = h;
      }
    });

    return Object.entries(parSemaine)
      .sort(([a],[b]) => a.localeCompare(b))
      .slice(-nbSemaines)
      .map(([date, data]) => ({
        date,
        label: Utils.formatDateCourt(date),
        poids: data.poids,
        reps:  data.reps,
        rm1:   data.rm1
      }));
  },

  getRPEMoyen7Jours() {
    const date7j = Utils.ajouterJours(Utils.aujourd_hui(), -7);
    const rpes   = [];

    for (let i = 0; i < localStorage.length; i++) {
      const cle = localStorage.key(i);
      if (!cle.startsWith('ft_seance_')) continue;
      const data = JSON.parse(localStorage.getItem(cle));
      if (data.date >= date7j && data.rpesMoyen) {
        rpes.push(data.rpesMoyen);
      }
    }

    return rpes.length
      ? Utils.arrondir(rpes.reduce((a,b) => a+b, 0) / rpes.length)
      : 0;
  },

  getHeatmapData(nbJours = 84) {
    const data = {};

    for (let i = 0; i < nbJours; i++) {
      const date     = Utils.ajouterJours(Utils.aujourd_hui(), -i);
      const planning = PLANNING_SEMAINE[Utils.indexJourSemaine(date)];
      const seance   = this.getSeanceDuJour(date);

      if (planning && !planning.seanceId) {
        data[date] = 'rest';
      } else if (seance && seance.complete) {
        data[date] = 'done';
      } else if (date < Utils.aujourd_hui()
                 && planning && planning.seanceId) {
        data[date] = 'missed';
      } else {
        data[date] = 'none';
      }
    }

    return data;
  },

  // ─── SCORE FORME ──────────────────────────────────────────
  calculerScoreForme() {
    const joursAbsence   = this.getJoursAbsence();
    const fatigue        = this.getFatigue();
    const niveauFat      = fatigue ? fatigue.niveau : 2;
    const recup          = Math.min(100, Math.max(0,
      100 - (niveauFat * 20) - (Math.max(0, joursAbsence - 1) * 10)
    ));

    const seancesSemaine  = this.getSeancesParSemaine();
    const objectifSemaine = Utils.storage.get('ft_objectif_seances_semaine', 4);
    const assiduite       = Math.min(100,
      Math.round((seancesSemaine / objectifSemaine) * 100)
    );

    const prs         = Object.keys(this.getAllPRs()).length;
    const progression = Math.min(100, prs * 12);

    const score = Math.round(
      recup * 0.4 + assiduite * 0.35 + progression * 0.25
    );

    return {
      score:       Math.max(0, Math.min(100, score)),
      recup,
      assiduite,
      progression,
      niveau: score >= 80 ? '🟢 Excellent' :
              score >= 60 ? '🟡 Bon'       :
              score >= 40 ? '🟠 Moyen'     : '🔴 Bas'
    };
  },

  // ─── PROFIL ───────────────────────────────────────────────
  getProfil() {
    return Utils.storage.get(this.CLE.PROFIL(), {
      nom:       'Athlète',
      poids:     80,
      taille:    175,
      dateDebut: Utils.aujourd_hui(),
      avatar:    '💪'
    });
  },

  sauvegarderProfil(data) {
    const actuel = this.getProfil();
    Utils.storage.set(this.CLE.PROFIL(), { ...actuel, ...data });
  },

  // ─── MESURES ──────────────────────────────────────────────
  getMesures() {
    return Utils.storage.get(this.CLE.MESURES(), []);
  },

  ajouterMesure(mesure) {
    const mesures = this.getMesures();
    mesures.push({
      ...mesure,
      date:      mesure.date || Utils.aujourd_hui(),
      timestamp: Date.now()
    });
    Utils.storage.set(this.CLE.MESURES(), mesures);
    return mesures;
  },

  getDerniereMesure() {
    const mesures = this.getMesures();
    return mesures.length ? mesures[mesures.length - 1] : null;
  },

  // ─── OBJECTIFS ────────────────────────────────────────────
  getObjectifs() {
    return Utils.storage.get(this.CLE.OBJECTIFS(), []);
  },

  ajouterObjectif(objectif) {
    const objectifs = this.getObjectifs();
    objectifs.push({
      ...objectif,
      id:           Date.now().toString(),
      dateCreation: Utils.aujourd_hui(),
      complete:     false
    });
    Utils.storage.set(this.CLE.OBJECTIFS(), objectifs);
  },

  mettreAJourObjectif(id, updates) {
    const objectifs = this.getObjectifs().map(o =>
      o.id === id ? { ...o, ...updates } : o
    );
    Utils.storage.set(this.CLE.OBJECTIFS(), objectifs);
  },

  calculerProgressionObjectif(objectif) {
    if (!objectif.valeurActuelle || !objectif.valeurCible) return 0;
    const pct = (objectif.valeurActuelle / objectif.valeurCible) * 100;
    return Math.min(100, Math.round(pct));
  },

  // ─── JOURNAL ──────────────────────────────────────────────
  getJournal() {
    return Utils.storage.get(this.CLE.JOURNAL(), []);
  },

  ajouterEntreeJournal(texte, seanceId = null) {
    const journal = this.getJournal();
    journal.unshift({
      id:        Date.now().toString(),
      date:      Utils.aujourd_hui(),
      texte,
      seanceId,
      timestamp: Date.now()
    });
    Utils.storage.set(this.CLE.JOURNAL(), journal.slice(0, 200));
  },

  supprimerEntreeJournal(id) {
    const journal = this.getJournal().filter(e => e.id !== id);
    Utils.storage.set(this.CLE.JOURNAL(), journal);
  },

  // ─── BLESSURES ────────────────────────────────────────────
  getBlessures() {
    return Utils.storage.get(this.CLE.BLESSURES(), []);
  },

  ajouterBlessure(zone, severite, notes = '') {
    const blessures = this.getBlessures();
    blessures.push({
      id:       Date.now().toString(),
      zone,
      severite,
      notes,
      date:     Utils.aujourd_hui(),
      active:   true
    });
    Utils.storage.set(this.CLE.BLESSURES(), blessures);
  },

  guerirBlessure(id) {
    const blessures = this.getBlessures().map(b =>
      b.id === id
        ? { ...b, active: false, dateGuerison: Utils.aujourd_hui() }
        : b
    );
    Utils.storage.set(this.CLE.BLESSURES(), blessures);
  },

  // ─── RÉPARTITION MUSCLES ──────────────────────────────────
  getRepartitionMuscles() {
    const seances = this.getHistoriqueSeances(999);
    const muscles = {};

    seances.forEach(s => {
      (s.series || []).forEach(sr => {
        const ex     = window.EXERCICES?.[sr.exerciceRef];
        const muscle = ex?.muscle || 'Autre';
        const vol    = (sr.poids||0) * (sr.reps||0);
        muscles[muscle] = (muscles[muscle] || 0) + vol;
      });
    });

    return Object.entries(muscles)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([muscle, volume]) => ({ muscle, volume }));
  },

  // ─── SÉANCES PAR JOUR DE SEMAINE ──────────────────────────
  getSeancesParJourSemaine() {
    const seances = this.getHistoriqueSeances(999);
    const jours   = [0, 0, 0, 0, 0, 0, 0];

    seances.forEach(s => {
      if (!s.date) return;
      const d   = new Date(s.date);
      const idx = (d.getDay() + 6) % 7;
      jours[idx]++;
    });

    return jours;
  },

  // ─── RPE PAR SEMAINE ──────────────────────────────────────
  getRPEParSemaine(n = 10) {
    const seances  = this.getHistoriqueSeances(999);
    const semaines = {};

    seances.forEach(s => {
      if (!s.rpesMoyen) return;
      const sem = Utils.debutSemaine(s.date);
      if (!semaines[sem]) semaines[sem] = { total:0, count:0 };
      semaines[sem].total += s.rpesMoyen;
      semaines[sem].count++;
    });

    return Object.entries(semaines)
      .sort(([a],[b]) => a.localeCompare(b))
      .slice(-n)
      .map(([date, d]) => ({
        semaine: Utils.formatDateCourt(date),
        rpe:     Math.round((d.total / d.count) * 10) / 10
      }));
  },

  // ─── HISTORIQUE POIDS CORPOREL ────────────────────────────
  getHistoriquePoids(n = 30) {
    return Utils.storage.get('ft_poids_historique', []).slice(-n);
  },

  // ─── AJOUTER POIDS CORPOREL ───────────────────────────────
  ajouterPoids(poids) {
    const historique = Utils.storage.get('ft_poids_historique', []);
    const today      = Utils.aujourd_hui();
    const idx        = historique.findIndex(h => h.date === today);

    if (idx >= 0) {
      historique[idx].poids = poids;
    } else {
      historique.push({ date: today, poids });
    }

    Utils.storage.set('ft_poids_historique', historique);
    return historique;
  },

  // ─── RESET ────────────────────────────────────────────────
  resetComplet() {
    Utils.storage.clear('ft_');
    console.log('[Tracker] Données réinitialisées');
  },

  resetSeules() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const cle = localStorage.key(i);
      if (cle && cle.startsWith('ft_') &&
          !cle.includes('profil')   &&
          !cle.includes('notifs')   &&
          !cle.includes('objectifs')) {
        localStorage.removeItem(cle);
      }
    }
  }

}; // ← FIN de Tracker

window.Tracker = Tracker;
console.log('✅ Tracker chargé');
