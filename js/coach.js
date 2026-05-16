/* ============================================================
   FitTracker Pro — Coach IA
   Recommandations, messages, analyse
   ============================================================ */

const Coach = {

  // ─── MESSAGE DU JOUR ──────────────────────────────────────
  getMessageDuJour() {
    const humeur   = Tracker.getHumeur();
    const fatigue  = Tracker.getFatigue();
    const rpe      = Tracker.getRPEMoyen7Jours();
    const absence  = Tracker.getJoursAbsence();
    const infos    = Programme.getInfosProgramme();
    const seance   = Programme.getProchaineSeance();

    // Déload recommandé ?
    if (rpe > 8.5 && rpe > 0) {
      return {
        type: 'deload',
        emoji: '⚡',
        message: `Ton RPE moyen sur 7 jours est de ${rpe}/10. Ton corps réclame une semaine de décharge. Réduis les charges de 40% cette semaine — c'est là que la vraie progression se fait.`
      };
    }

    // Longue absence
    if (absence >= 5) {
      return {
        type: 'reprise',
        emoji: '🌱',
        message: `${absence} jours de pause. Pas de panique — on repart doucement. Réduis les charges de 20% pour cette séance et retrouve tes sensations avant de progresser.`
      };
    }

    // Fatigue élevée
    if (fatigue?.niveau >= 3) {
      return {
        type: 'fatigue',
        emoji: '😴',
        message: `Tu te sens très fatigué. Privilégie une bonne exécution technique sur des charges modérées. La récupération fait partie de la progression.`
      };
    }

    // Humeur basse
    if (humeur?.humeur === '😒' || humeur?.humeur === '😤') {
      return {
        type: 'motivation',
        emoji: '💡',
        message: `Pas la grande forme aujourd'hui ? C'est normal. Les meilleures séances sont souvent celles où on y allait sans envie. Lance-toi — tu ne le regretteras pas.`
      };
    }

    // Phase actuelle
    const phase = infos.phase;
    const messages = {
      'Reprise': [
        `Phase Reprise : focus sur la technique. Poids légers, amplitude maximale. Ces séances construisent les bases de tout ce qui suit.`,
        `Semaine de reprise — chaque répétition parfaite compte plus que les kilos. Maîtrise le mouvement avant tout.`
      ],
      'Construction': [
        `Phase Construction : cherche à augmenter le volume progressivement. Si tu complètes toutes les séries sans difficulté, augmente les charges de 2.5kg.`,
        `Volume élevé cette semaine. Ton objectif : dépasser le tonnage de la semaine dernière. Chaque kilo compte !`
      ],
      'Intensité': [
        `Phase Intensité : on pousse fort ! Concentre-toi sur les exercices principaux — bench, squat, soulevé de terre. Les PR approchent.`,
        `Séances lourdes cette semaine. Échauffement soigné, technique irréprochable, et donne tout sur les séries de travail.`
      ],
      'Peak': [
        `Phase Peak : la semaine des records ! Tu as tout construit pour ça. Confiance, bonne alimentation, récupération. C'est le moment.`,
        `Tu es au sommet du cycle. Tes muscles ont absorbé des semaines de travail — aujourd'hui, libère cette énergie !`
      ]
    };

    const msgs = messages[phase?.nom] || messages['Reprise'];
    return {
      type: 'programme',
      emoji: phase?.emoji || '💡',
      message: Utils.random(msgs)
    };
  },

  // ─── WARM-UP DU JOUR ──────────────────────────────────────
  getWarmupDuJour() {
    const seance = Programme.getProchaineSeance();
    if (!seance) return WARMUP.general;
    return WARMUP[seance.id] || WARMUP.general;
  },

  // ─── ANALYSE SEMAINE ──────────────────────────────────────
  getAnalyseSemaine() {
    const volume    = Tracker.getVolumeSemaine();
    const seances   = Tracker.getSeancesParSemaine();
    const rpe       = Tracker.getRPEMoyen7Jours();
    const objectif  = Utils.storage.get('ft_objectif_seances_semaine', 4);

    let recommendation = '';
    let intensite = 'Normale';

    if (rpe >= 9) {
      intensite = '🔴 Très élevée';
      recommendation = 'Décharge recommandée — -40% charges';
    } else if (rpe >= 7) {
      intensite = '🟠 Élevée';
      recommendation = 'Maintien du volume actuel';
    } else if (rpe >= 5) {
      intensite = '🟡 Modérée';
      recommendation = 'Augmentation progressive possible (+5%)';
    } else {
      intensite = '🟢 Faible';
      recommendation = 'Augmenter l\'intensité ou le volume';
    }

    return {
      volume,
      seances,
      objectif,
      rpe,
      intensite,
      recommendation,
      progressionVolume: Stats.getComparaisonSemaines()
    };
  },

  // ─── SUGGESTION CHARGE ────────────────────────────────────
  suggererCharge(exerciceRef) {
    const pr    = Tracker.getPR(exerciceRef);
    const phase = Programme.getPhaseActuelle();

    if (!pr?.rm1) return null;

    const chargeIdeal = Math.round(pr.rm1 * phase.intensite / 2.5) * 2.5;

    return {
      charge:      chargeIdeal,
      pourcentage: Math.round(phase.intensite * 100),
      rm1:         pr.rm1,
      phase:       phase.nom
    };
  },

  // ─── DÉLOAD AUTOMATIQUE ────────────────────────────────────
  necessiteDeload() {
    const rpe    = Tracker.getRPEMoyen7Jours();
    const fatigue = Tracker.getFatigue();
    const absence = Tracker.getJoursAbsence();

    if (rpe > 0 && rpe >= 8.5) return { oui: true, raison: `RPE moyen: ${rpe}/10` };
    if (fatigue?.niveau >= 3)   return { oui: true, raison: 'Fatigue déclarée élevée' };
    if (absence >= 7)           return { oui: true, raison: `${absence} jours d'absence` };

    return { oui: false };
  },

  // ─── EXERCICES À ÉVITER (blessures) ──────────────────────
  getExercicesAEviter() {
    const blessures = Tracker.getBlessures().filter(b => b.active);
    const aEviter   = new Set();

    const restrictions = {
      'epaule':    ['dev_militaire','bench_press','elev_laterales','incline_halteres','dips'],
      'genou':     ['squat','presse_cuisses','fentes','leg_extension'],
      'dos_bas':   ['soulevé_terre','rowing_barre','squat'],
      'coude':     ['curl_halteres','curl_barre','barre_front','ext_triceps_poulie'],
      'poignet':   ['bench_press','curl_barre','barre_front']
    };

    blessures.forEach(b => {
      const zone = b.zone.toLowerCase();
      Object.entries(restrictions).forEach(([k, exos]) => {
        if (zone.includes(k)) exos.forEach(e => aEviter.add(e));
      });
    });

    return [...aEviter];
  },

  // ─── RENDER COACH TAB ─────────────────────────────────────
  renderCoachTab(container) {
    const msg    = this.getMessageDuJour();
    const analyse = this.getAnalyseSemaine();
    const warmup  = this.getWarmupDuJour();
    const deload  = this.necessiteDeload();

    container.innerHTML = `
      <!-- Message du jour -->
      <div class="coach-card mb-md">
        <div class="coach-header">
          <span class="coach-icon">${msg.emoji}</span>
          <span class="coach-label">Coach du jour</span>
        </div>
        <p class="coach-message">${msg.message}</p>
      </div>

      ${deload.oui ? `
        <!-- Alerte déload -->
        <div class="card mb-md" style="border-color:var(--fd-coral);background:rgba(255,141,150,0.08)">
          <div class="card-label" style="color:var(--fd-coral)">⚠️ Décharge recommandée</div>
          <p style="font-size:.88rem;color:var(--text-primary);margin-top:var(--space-sm)">
            ${deload.raison}. Cette semaine, réduis les charges de <strong>40%</strong>.
            C'est pendant la décharge que les muscles super-compensent !
          </p>
        </div>
      ` : ''}

      <!-- Analyse semaine -->
      <div class="card mb-md">
        <div class="card-label">📊 Analyse semaine</div>
        <div style="margin-top:var(--space-sm)">
          <div class="score-row">
            <span class="score-row-label">Séances</span>
            <span class="score-row-value">${analyse.seances}/${analyse.objectif}</span>
          </div>
          <div class="score-row">
            <span class="score-row-label">Volume</span>
            <span class="score-row-value">${Utils.formatVolume(analyse.volume)}</span>
          </div>
          <div class="score-row">
            <span class="score-row-label">RPE moyen</span>
            <span class="score-row-value">${analyse.rpe > 0 ? analyse.rpe + '/10' : '—'}</span>
          </div>
          <div class="score-row">
            <span class="score-row-label">Intensité</span>
            <span class="score-row-value">${analyse.intensite}</span>
          </div>
          <div class="progress-bar mt-md">
            <div class="progress-fill" style="width:${Math.min(100, (analyse.seances/analyse.objectif)*100)}%"></div>
          </div>
        </div>
        <div style="margin-top:var(--space-md);padding:var(--space-sm);background:var(--fd-indigo-dim);border-radius:var(--radius-sm)">
          <span style="font-size:.82rem;color:var(--fd-lavender)">💡 ${analyse.recommendation}</span>
        </div>
      </div>

      <!-- Warm-up -->
      <div class="card">
        <div class="card-label">🔥 Warm-up recommandé</div>
        ${warmup.map((w, i) => `
          <div class="flex items-center gap-md"
               style="padding:var(--space-sm) 0;border-bottom:1px solid var(--border-color)">
            <div style="width:28px;height:28px;border-radius:50%;background:var(--fd-indigo-dim);
                        display:flex;align-items:center;justify-content:center;
                        font-size:.75rem;font-weight:700;color:var(--fd-indigo);flex-shrink:0">
              ${i + 1}
            </div>
            <div>
              <div style="font-size:.88rem;font-weight:600">${w.nom}</div>
              <div style="font-size:.72rem;color:var(--text-muted)">${w.description}</div>
            </div>
            <div style="margin-left:auto;font-size:.78rem;color:var(--fd-mint)">
              ${Utils.formatDuree(w.duree)}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
};

window.Coach = Coach;
console.log('✅ Coach chargé');
