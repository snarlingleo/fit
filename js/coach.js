/* ============================================================
   FitTracker Pro — Coach IA v3
   Messages humains + contextuels + Coach IA avancé
   ============================================================ */

const Coach = {

  // ─── MESSAGE DU JOUR ──────────────────────────────────────
  getMessageDuJour() {
    const humeur   = Tracker.getHumeur();
    const fatigue  = Tracker.getFatigue();
    const rpe      = Tracker.getRPEMoyen7Jours();
    const absence  = Tracker.getJoursAbsence();
    const infos    = Programme.getInfosProgramme();
    const streak   = Tracker.getStreak();
    const profil   = Tracker.getProfil();
    const nom      = profil.nom || 'Athlète';
    const total    = Tracker.getTotalSeances();

    // ── Première fois (jamais de séance)
    if (absence === -1 || total === 0) return {
      type: 'bienvenue', emoji: '👋',
      message: Utils.random([
        `Bienvenue ${nom} ! C'est ta première séance — profites-en pour trouver tes sensations. Pas de pression, juste du plaisir.`,
        `Hey ${nom} ! Prêt pour l'aventure ? Ta première séance commence ici. Vas-y à ton rythme, l'important c'est de commencer.`,
        `${nom}, bienvenue dans FitTracker ! Aujourd'hui marque le début de quelque chose de grand. Lance-toi !`
      ])
    };

    // ── Retour après longue absence (7j+)
    if (absence >= 7) return {
      type: 'reprise', emoji: '🌱',
      message: Utils.random([
        `Bonne reprise ${nom} ! Peu importe la durée de la pause — ce qui compte c'est d'être là aujourd'hui. Réduis les charges de 20%, retrouve les sensations.`,
        `Te revoilà ${nom} ! On ne juge pas les pauses, on célèbre les retours. Commence doucement, le corps va vite se souvenir.`,
        `Content de te revoir ${nom} ! Reprends progressivement — -20% sur les charges cette séance. Dans une semaine tu seras déjà de retour au niveau.`,
        `${nom} est de retour ! La vraie force c'est de revenir après une pause. Prends soin de toi, technique parfaite avant les charges.`
      ])
    };

    // ── Absence 3-6 jours
    if (absence >= 3) return {
      type: 'relance', emoji: '🔥',
      message: Utils.random([
        `Te revoilà ${nom} ! Quelques jours de pause, ça arrive. Le premier set est toujours le plus dur — après ça roule tout seul.`,
        `${nom} de retour ! Le corps attendait ça. Une séance même courte remet tout en route. C'est parti !`,
        `Hé ${nom} ! On repart ensemble. Ton corps a récupéré, maintenant il veut travailler. Lance-toi !`
      ])
    };

    // ── Déload urgent (RPE élevé)
    if (rpe > 8.5 && rpe > 0) return {
      type: 'deload', emoji: '⚡',
      message: `RPE moyen ${rpe}/10 cette semaine ${nom}. Ton corps envoie un signal clair. Aujourd'hui : -40% sur les charges, technique parfaite. C'est maintenant que la vraie progression se construit.`
    };

    // ── Fatigue élevée
    if (fatigue?.niveau >= 3) return {
      type: 'fatigue', emoji: '😴',
      message: Utils.random([
        `Tu te sens épuisé ${nom} — c'est ok. Écoute ton corps : technique parfaite sur charges modérées aujourd'hui. La récupération c'est de la stratégie.`,
        `Fatigue détectée ${nom}. On adapte : charges à -20%, concentration sur la qualité. Un entraînement malin vaut mieux qu'un entraînement épuisant.`
      ])
    };

    // ── Humeur basse
    if (['😒','😤'].includes(humeur?.humeur)) return {
      type: 'motivation', emoji: '💡',
      message: Utils.random([
        `Pas dans ton assiette ${nom} ? Les meilleures séances arrivent parfois quand on s'y attend le moins. Dans 20 min tu seras content d'y être allé.`,
        `${nom}, les champions s'entraînent aussi quand ils n'en ont pas envie. C'est exactement là que la différence se fait.`
      ])
    };

    // ── Super forme
    if (humeur?.humeur === '🔥' && (fatigue?.niveau || 0) <= 1) return {
      type: 'peak', emoji: '🚀',
      message: Utils.random([
        `Tu es en feu ${nom} ! Corps frais, mental affûté — c'est le moment de tenter un PR. Donne absolument tout sur les exercices principaux !`,
        `${nom} en mode peak ! Tout est réuni pour une séance exceptionnelle. Fais confiance à ta préparation et lâche-toi !`
      ])
    };

    // ── Streak exceptionnel
    if (streak.count >= 14) return {
      type: 'streak', emoji: '🏆',
      message: Utils.random([
        `${streak.count} jours consécutifs ${nom} — c'est impressionnant ! Continue à surveiller la récupération pour maintenir cette régularité.`,
        `${streak.count}j de streak ${nom} ! Tu es dans une zone de performance rare. Garde ce rythme, mais écoute ton corps.`
      ])
    };

    // ── Messages par phase
    const msgs = {
      'Reprise': [
        `Phase Reprise ${nom} : la technique prime sur tout. Chaque répétition parfaite aujourd'hui construit la base de tes futurs records.`,
        `Semaine de reprise — construis les fondations. Dans quelques semaines tu soulèveras bien plus lourd grâce à ce travail d'aujourd'hui.`
      ],
      'Construction': [
        `Phase Construction ${nom} : cherche à dépasser le volume de la semaine dernière. Si tu complètes tout facilement → +2.5kg la prochaine fois.`,
        `Volume élevé cette semaine ${nom}. Concentration sur la connexion musculaire. Qualité + quantité = résultats durables.`
      ],
      'Intensité': [
        `Phase Intensité ${nom} : charges lourdes, concentration maximale. Échauffement soigné, puis donne tout sur les exercices compound. Les PRs approchent.`,
        `Séances intenses cette semaine ${nom}. Un bon échauffement vaut autant que la séance elle-même.`
      ],
      'Peak': [
        `Phase Peak ${nom} : tu as accumulé des semaines de travail pour ça. Aujourd'hui tu libères cette énergie. Confiance totale.`,
        `C'est la semaine des records ${nom} ! Alimentation soignée, sommeil optimal — tu es prêt pour ça.`
      ]
    };

    const phase = infos.phase?.nom || 'Reprise';
    const liste = msgs[phase] || msgs['Reprise'];
    return {
      type:    'programme',
      emoji:   infos.phase?.emoji || '💡',
      message: Utils.random(liste)
    };
  },

  // ─── COACH IA — CHAT ──────────────────────────────────────
  _historique: [],

  async envoyerMessage(question) {
    const profil   = Tracker.getProfil();
    const streak   = Tracker.getStreak();
    const absence  = Tracker.getJoursAbsence();
    const rpe      = Tracker.getRPEMoyen7Jours();
    const prs      = Tracker.getAllPRs();
    const fatigue  = Tracker.getFatigue();
    const humeur   = Tracker.getHumeur();
    const seances  = Tracker.getTotalSeances();
    const phase    = Programme.getInfosProgramme();
    const analyse  = this.getAnalyseSemaine();
    const nom      = profil.nom || 'Athlète';

    // ── Contexte complet pour le raisonnement
    const contexte = {
      nom,
      seancesTotales: seances,
      streak:         streak.count,
      joursAbsence:   absence === -1 ? 'jamais de séance' : `${absence} jours`,
      rpe:            rpe > 0 ? `${rpe}/10` : 'pas de données',
      fatigue:        fatigue ? `niveau ${fatigue.niveau}/4` : 'non renseignée',
      humeur:         humeur?.humeur || 'non renseignée',
      phase:          phase?.phase?.nom || 'Reprise',
      volumeSemaine:  Utils.formatVolume(analyse.volume),
      seancesSemaine: `${analyse.seances}/${analyse.objectif}`,
      nbPRs:          Object.keys(prs).length
    };

    // ─── Réponse IA basée sur règles + contexte
    const reponse = this._raisonnerIA(question.toLowerCase(), contexte);

    // Ajouter à l'historique
    this._historique.push(
      { role: 'user',      content: question  },
      { role: 'assistant', content: reponse   }
    );

    // Garder max 20 messages
    if (this._historique.length > 20) {
      this._historique = this._historique.slice(-20);
    }

    return reponse;
  },

  _raisonnerIA(q, ctx) {
    const nom = ctx.nom;

    // ─── PR / Records
    if (q.includes('pr') || q.includes('record') || q.includes('max')) {
      const prs = Tracker.getAllPRs();
      const top = Object.entries(prs)
        .sort((a,b) => (b[1].rm1||0) - (a[1].rm1||0))
        .slice(0, 3)
        .map(([ref, pr]) => {
          const ex = window.EXERCICES?.[ref];
          return `${ex?.nom || ref}: ${pr.poids}kg × ${pr.reps} (~${pr.rm1}kg 1RM)`;
        });

      if (!top.length) return `Tu n'as pas encore de records enregistrés ${nom}. Lance ta première séance pour en créer !`;
      return `Tes meilleurs records actuels ${nom} :\n\n${top.join('\n')}\n\nContinue à progresser — les PRs se construisent séance après séance ! 💪`;
    }

    // ─── Fatigue / Récupération
    if (q.includes('fatigu') || q.includes('récup') || q.includes('repos') || q.includes('douleur')) {
      if (ctx.rpe !== 'pas de données' && parseFloat(ctx.rpe) >= 8) {
        return `Ton RPE moyen est de ${ctx.rpe} — c'est élevé ${nom}. Je recommande :\n\n• Réduire les charges de 30-40%\n• Prioriser le sommeil (7-9h)\n• Augmenter les protéines\n• 1 séance légère max cette semaine\n\nLa super-compensation se fait pendant le repos, pas pendant l'effort.`;
      }
      return `La récupération est une partie intégrante de la progression ${nom}. Règles clés :\n\n• 48h de repos entre les groupes musculaires\n• 7-9h de sommeil\n• Hydratation : 35ml/kg de poids\n• Protéines : 1.6-2.2g/kg\n\nTu sembles bien récupéré. Continue comme ça ! 🌱`;
    }

    // ─── Programme / Plan
    if (q.includes('programme') || q.includes('plan') || q.includes('séance') || q.includes('aujourd')) {
      const phase = ctx.phase;
      const msg = {
        'Reprise':      'Focus sur la technique et les bases. Charges légères, mouvements parfaits.',
        'Construction': 'Augmente progressivement le volume. +2.5kg dès que tu complètes toutes les séries.',
        'Intensité':    'Charges lourdes, faible volume. Priorité aux exercices compound.',
        'Peak':         'Charges maximales. C\'est la semaine des records — donne tout !'
      };
      return `Tu es en phase **${phase}** ${nom}.\n\n${msg[phase] || msg['Reprise']}\n\nCette semaine : ${ctx.seancesSemaine} séances réalisées. Volume : ${ctx.volumeSemaine}. Continue sur cette lancée ! 🔥`;
    }

    // ─── Nutrition
    if (q.includes('manger') || q.includes('nutrition') || q.includes('protéine') || q.includes('calorie') || q.includes('régime')) {
      const poids = Tracker.getProfil().poids || 80;
      const prot  = Math.round(poids * 2);
      const cal   = Math.round(poids * 35);
      return `Recommandations nutritionnelles pour toi ${nom} (${poids}kg) :\n\n• **Protéines** : ${prot}g/jour (2g/kg)\n• **Calories** : ~${cal} kcal/jour\n• **Eau** : ${Math.round(poids * 0.035)}L minimum\n• **Timing** : repas 2h avant séance, protéines dans les 30min après\n\nVa voir l'onglet **Nutrition** pour ton planning repas complet avec recettes E.Leclerc ! 🥗`;
    }

    // ─── Motivation
    if (q.includes('motiv') || q.includes('envie') || q.includes('abandon') || q.includes('dur') || q.includes('difficile')) {
      const msgs = [
        `${nom}, la motivation est une flamme — parfois elle vacille. Mais la discipline, elle, ne faiblit jamais. Tu as déjà ${ctx.seancesTotales} séances derrière toi. C'est une preuve que tu peux le faire.`,
        `Les jours difficiles font les athlètes durables ${nom}. Une séance même à 50% vaut mieux que zéro. Lance-toi juste pour les 10 premières minutes.`,
        `${ctx.streak > 0 ? `${ctx.streak} jours de streak ${nom} !` : `${nom},`} chaque séance que tu fais sans envie est celle qui compte le plus. C'est là que le mental se forge.`
      ];
      return Utils.random(msgs);
    }

    // ─── Streak
    if (q.includes('streak') || q.includes('consécutif') || q.includes('régularité')) {
      if (ctx.streak === 0) return `Ton streak actuel est à 0 ${nom}. Mais chaque légende a commencé à 0 ! Une séance aujourd'hui et c'est parti. 🔥`;
      return `Ton streak actuel : **${ctx.streak} jours** 🔥\n\nC'est ${ctx.streak >= 14 ? 'exceptionnel' : ctx.streak >= 7 ? 'très bien' : 'un bon début'} ${nom} ! La régularité est la clé de la progression. Garde ce rythme.`;
    }

    // ─── Poids / IMC
    if (q.includes('poids') || q.includes('imc') || q.includes('masse') || q.includes('maigrir') || q.includes('grossir')) {
      const profil = Tracker.getProfil();
      const imc    = profil.poids && profil.taille
        ? Utils.calculerIMC(profil.poids, profil.taille)
        : null;
      const cat = imc ? Utils.categorieIMC(imc) : null;

      return `Profil actuel ${nom} :\n\n• Poids : ${profil.poids}kg\n• Taille : ${profil.taille}cm${imc ? `\n• IMC : ${imc} (${cat?.label})` : ''}\n\nNote tes mesures régulièrement dans l'onglet Stats > Corps pour suivre ta progression. L'IMC est un indicateur, pas une vérité absolue — la composition corporelle compte davantage ! 💪`;
    }

    // ─── Exercice spécifique
    if (q.includes('squat') || q.includes('bench') || q.includes('soulevé') || q.includes('tractions') || q.includes('développé')) {
      return `Pour progresser sur cet exercice ${nom}, voici les clés :\n\n• **Technique d'abord** : film-toi pour corriger les défauts\n• **Progression linéaire** : +2.5kg dès que tu complètes toutes les séries\n• **Volume** : 3-5 séries de 5-8 reps pour la force\n• **Fréquence** : 2x/semaine minimum pour progresser vite\n\nConsulte l'onglet **Stats > Charges** pour voir ta progression détaillée sur cet exercice ! 📊`;
    }

    // ─── Absence
    if (ctx.joursAbsence !== 'jamais de séance' && parseInt(ctx.joursAbsence) >= 3) {
      if (q.includes('repart') || q.includes('reprise') || q.includes('retour')) {
        return `Bonne reprise ${nom} ! Voici le plan :\n\n• Séance 1 : -20% sur toutes les charges\n• Séance 2 : retour à 80%\n• Séance 3 : niveau normal\n\nTon corps retrouvera vite ses repères. La mémoire musculaire est de ton côté ! 💪`;
      }
    }

    // ─── Bonjour / Salutations
    if (q.includes('bonjour') || q.includes('salut') || q.includes('hello') || q.includes('hey') || q.includes('coucou')) {
      const salut = Utils.salutation();
      return `${salut} ${nom} ! 👋 Je suis ton Coach IA. Tu peux me demander :\n\n• Tes records et ta progression\n• Des conseils pour ta séance du jour\n• Des recommandations nutrition\n• Comment gérer ta fatigue\n• Comment retrouver la motivation\n\nDe quoi as-tu besoin aujourd'hui ? 💪`;
    }

    // ─── Réponse générique contextuelle
    const reponses = [
      `Bonne question ${nom} ! En ce moment tu es en phase **${ctx.phase}**, avec ${ctx.streak} jours de streak et ${ctx.seancesTotales} séances au compteur. Tu veux des conseils sur un aspect précis : séance du jour, nutrition, récupération, progression ?`,
      `${nom}, je peux t'aider sur : ta progression, tes records, ton programme, la nutrition ou la récupération. Pose-moi une question plus précise et je te donne une réponse sur-mesure ! 🎯`,
      `Pour te donner les meilleurs conseils ${nom}, dis-moi ce sur quoi tu veux travailler : force, volume, perte de poids, récupération ou motivation ?`
    ];
    return Utils.random(reponses);
  },

  // ─── RENDER TAB COACH AVEC CHAT IA ────────────────────────
  renderCoachTab(container) {
    const msg      = this.getMessageDuJour();
    const analyse  = this.getAnalyseSemaine();
    const warmup   = this.getWarmupDuJour();
    const deload   = this.necessiteDeload();
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
      ${deload.oui && deload.raison !== 'jamais' ? `
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

      <!-- COACH IA CHAT -->
      <div class="card mb-md"
           style="border-color:var(--fd-indigo);
                  background:rgba(75,75,249,0.06)">
        <div class="card-label" style="color:var(--fd-indigo)">
          🤖 Coach IA — Pose-moi une question
        </div>

        <!-- Suggestions rapides -->
        <div style="display:flex;flex-wrap:wrap;gap:var(--space-xs);
                    margin-top:var(--space-md);margin-bottom:var(--space-md)">
          ${[
            '💪 Mes records',
            '😴 Récupération',
            '📈 Mon programme',
            '🥗 Nutrition',
            '🔥 Motivation',
            '⚖️ Mon poids'
          ].map(s => `
            <button class="chip chip-indigo"
                    style="cursor:pointer;border:none;"
                    onclick="Coach._suggestionRapide('${s}')">
              ${s}
            </button>`).join('')}
        </div>

        <!-- Historique chat -->
        <div id="coach-chat"
             style="max-height:320px;overflow-y:auto;
                    margin-bottom:var(--space-md);
                    display:flex;flex-direction:column;gap:var(--space-sm)">
          ${this._historique.length === 0 ? `
            <div style="text-align:center;padding:var(--space-lg);
                        color:var(--text-muted);font-size:.85rem">
              👋 Bonjour ! Pose-moi n'importe quelle question
              sur ta progression, nutrition ou récupération.
            </div>` :
            this._historique.map(m => `
              <div style="
                display:flex;
                justify-content:${m.role==='user'?'flex-end':'flex-start'}">
                <div style="
                  max-width:80%;
                  padding:var(--space-sm) var(--space-md);
                  border-radius:${m.role==='user'
                    ? 'var(--radius-md) var(--radius-md) 4px var(--radius-md)'
                    : 'var(--radius-md) var(--radius-md) var(--radius-md) 4px'};
                  background:${m.role==='user'
                    ? 'var(--fd-indigo)'
                    : 'var(--bg-input)'};
                  color:var(--text-primary);
                  font-size:.85rem;
                  line-height:1.6;
                  white-space:pre-wrap">
                  ${m.role==='assistant' ? '🤖 ' : ''}${m.content}
                </div>
              </div>`).join('')}
        </div>

        <!-- Input -->
        <div style="display:flex;gap:var(--space-sm)">
          <input id="coach-input"
                 class="input"
                 style="flex:1"
                 placeholder="Ex: Comment progresser sur le squat ?"
                 onkeydown="if(event.key==='Enter') Coach._envoyerChat()" />
          <button class="btn-primary"
                  style="padding:0 var(--space-md);flex-shrink:0"
                  onclick="Coach._envoyerChat()">
            Envoyer ↗
          </button>
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

    // Scroll chat en bas
    const chat = document.getElementById('coach-chat');
    if (chat) chat.scrollTop = chat.scrollHeight;
  },

  // ─── ENVOYER MESSAGE CHAT ─────────────────────────────────
  async _envoyerChat() {
    const input = document.getElementById('coach-input');
    const chat  = document.getElementById('coach-chat');
    if (!input || !chat) return;

    const question = input.value.trim();
    if (!question) return;

    input.value = '';

    // Bulle utilisateur
    const bulleUser = document.createElement('div');
    bulleUser.style.cssText = 'display:flex;justify-content:flex-end';
    bulleUser.innerHTML = `
      <div style="max-width:80%;padding:var(--space-sm) var(--space-md);
                  border-radius:var(--radius-md) var(--radius-md) 4px var(--radius-md);
                  background:var(--fd-indigo);color:white;
                  font-size:.85rem;line-height:1.6">
        ${question}
      </div>`;
    chat.appendChild(bulleUser);
    chat.scrollTop = chat.scrollHeight;

    // Bulle "en train d'écrire"
    const bulleLoading = document.createElement('div');
    bulleLoading.style.cssText = 'display:flex;justify-content:flex-start';
    bulleLoading.innerHTML = `
      <div style="padding:var(--space-sm) var(--space-md);
                  background:var(--bg-input);border-radius:var(--radius-md);
                  font-size:.85rem;color:var(--text-muted)">
        🤖 ...
      </div>`;
    chat.appendChild(bulleLoading);
    chat.scrollTop = chat.scrollHeight;

    // Réponse IA
    await new Promise(r => setTimeout(r, 600));
    const reponse = await this.envoyerMessage(question);

    bulleLoading.remove();

    // Bulle coach
    const bulleCoach = document.createElement('div');
    bulleCoach.style.cssText = 'display:flex;justify-content:flex-start';
    bulleCoach.innerHTML = `
      <div style="max-width:80%;padding:var(--space-sm) var(--space-md);
                  border-radius:var(--radius-md) var(--radius-md) var(--radius-md) 4px;
                  background:var(--bg-input);color:var(--text-primary);
                  font-size:.85rem;line-height:1.6;white-space:pre-wrap">
        🤖 ${reponse}
      </div>`;
    chat.appendChild(bulleCoach);
    chat.scrollTop = chat.scrollHeight;
  },

  // ─── SUGGESTION RAPIDE ────────────────────────────────────
  _suggestionRapide(texte) {
    const input = document.getElementById('coach-input');
    if (input) {
      input.value = texte.replace(/^[^\w\s]+ ?/, '');
      this._envoyerChat();
    }
  },

  // ─── CITATION DU JOUR ─────────────────────────────────────
  getCitationDuJour() {
    const citations = [
      { texte: "Le corps accomplit ce que l'esprit croit possible.",                             auteur: "Napoleon Hill"    },
      { texte: "La douleur est temporaire. Abandonner dure toujours.",                           auteur: "Lance Armstrong"  },
      { texte: "Chaque rep que tu fais change ton futur.",                                       auteur: "Anonyme"         },
      { texte: "La force vient d'une volonté indomptable, pas d'une capacité physique.",         auteur: "Gandhi"          },
      { texte: "Le seul mauvais entraînement est celui qui n'a pas eu lieu.",                    auteur: "Anonyme"         },
      { texte: "Tu n'as pas à être extrême, juste consistant.",                                  auteur: "Anonyme"         },
      { texte: "Les champions sont reconnus à la salle — ils sont faits ailleurs.",              auteur: "Joe Frazier"     },
      { texte: "Construis ton corps, construis ta confiance.",                                   auteur: "Anonyme"         },
      { texte: "Souffre maintenant et vis le reste de ta vie en champion.",                      auteur: "Muhammad Ali"    },
      { texte: "La progression n'est pas un accident, c'est un choix quotidien.",               auteur: "Anonyme"         }
    ];
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

    let intensite      = '🟢 Faible';
    let recommendation = 'Augmente l\'intensité ou le volume cette semaine.';

    if (rpe >= 9) {
      intensite      = '🔴 Très élevée';
      recommendation = 'Décharge recommandée — réduis les charges de 40%.';
    } else if (rpe >= 7.5) {
      intensite      = '🟠 Élevée';
      recommendation = 'Maintiens le volume actuel sans augmenter.';
    } else if (rpe >= 5.5) {
      intensite      = '🟡 Modérée';
      recommendation = 'Augmentation progressive possible (+5% volume).';
    }

    return {
      volume, seances, objectif, rpe,
      intensite, recommendation,
      deltaVolume:    comp.delta,
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
      rm1:   pr.rm1,
      phase: phase.nom
    };
  },

  // ─── DÉLOAD AUTOMATIQUE ───────────────────────────────────
  necessiteDeload() {
    const rpe     = Tracker.getRPEMoyen7Jours();
    const fatigue = Tracker.getFatigue();
    const absence = Tracker.getJoursAbsence();

    // Pas de déload pour un nouvel utilisateur
    if (absence === -1) return { oui: false };

    if (rpe > 0 && rpe >= 8.5)
      return { oui: true, raison: `RPE moyen élevé : ${rpe}/10` };
    if (fatigue?.niveau >= 3)
      return { oui: true, raison: 'Fatigue déclarée maximale' };

    return { oui: false };
  },

  // ─── EXERCICES À ÉVITER ───────────────────────────────────
  getExercicesAEviter() {
    const blessures    = Tracker.getBlessures().filter(b => b.active);
    const aEviter      = new Set();
    const restrictions = {
      'epaule':  ['dev_militaire','bench_press','elev_laterales','incline_halteres','dips'],
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
  }
};

window.Coach = Coach;
console.log('✅ Coach IA v3 chargé');
