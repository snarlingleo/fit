/* ============================================================
   FitTracker Pro — Coach IA v3.0
   Messages intelligents + Chat + Analyse + Warm-up
   + Supersets + Décharge auto + Citations
   ============================================================ */

const Coach = {

  // ════════════════════════════════════════════════════════
  // MESSAGE DU JOUR
  // ════════════════════════════════════════════════════════
  getMessageDuJour() {
    let humeur   = null, fatigue  = null;
    let rpe      = 0,    absence  = -1;
    let infos    = { phase:{ nom:'Reprise', emoji:'💡' } };
    let streak   = { count:0, max:0 };
    let nom      = 'Athlète';
    let total    = 0;

    try { humeur  = Tracker.getHumeur();              } catch(e) {}
    try { fatigue = Tracker.getFatigue();             } catch(e) {}
    try { rpe     = Tracker.getRPEMoyen7Jours();      } catch(e) {}
    try { absence = Tracker.getJoursAbsence();        } catch(e) {}
    try { infos   = Programme.getInfosProgramme();    } catch(e) {}
    try { streak  = Tracker.getStreak();              } catch(e) {}
    try { nom     = Tracker.getProfil().nom||'Athlète'; } catch(e) {}
    try { total   = Tracker.getTotalSeances();        } catch(e) {}

    // Première séance
    if (absence === -1 || total === 0) {
      return {
        type: 'bienvenue', emoji: '👋',
        message: Utils.random([
          `Bienvenue ${nom} ! C'est ta première séance — profites-en pour trouver tes sensations. Pas de pression, juste du plaisir.`,
          `Hey ${nom} ! Prêt pour l'aventure ? Ta première séance commence ici. Vas-y à ton rythme.`,
          `${nom}, bienvenue dans PowerApp ! Aujourd'hui marque le début de quelque chose de grand. Lance-toi !`
        ])
      };
    }

    // Longue absence
    if (absence >= 7) {
      return {
        type: 'reprise', emoji: '🌱',
        message: Utils.random([
          `Bonne reprise ${nom} ! Peu importe la durée de la pause — ce qui compte c'est d'être là aujourd'hui. Réduis les charges de 20%.`,
          `Te revoilà ${nom} ! On ne juge pas les pauses, on célèbre les retours. Commence doucement.`,
          `${nom} est de retour ! La vraie force c'est de revenir après une pause. -20% sur les charges aujourd'hui.`
        ])
      };
    }

    // Absence courte
    if (absence >= 3) {
      return {
        type: 'relance', emoji: '🔥',
        message: Utils.random([
          `Te revoilà ${nom} ! Quelques jours de pause, ça arrive. Le premier set est toujours le plus dur.`,
          `${nom} de retour ! Le corps attendait ça. Une séance même courte remet tout en route.`,
          `Hé ${nom} ! On repart ensemble. Ton corps a récupéré, maintenant il veut travailler.`
        ])
      };
    }

    // RPE élevé — décharge nécessaire
    if (rpe > 0 && rpe >= 8.5) {
      return {
        type: 'deload', emoji: '⚡',
        message: `RPE moyen ${rpe}/10 cette semaine ${nom}. Ton corps envoie un signal clair. Aujourd'hui : -40% sur les charges, technique parfaite.`
      };
    }

    // Fatigue déclarée max
    if ((fatigue?.niveau || 0) >= 3) {
      return {
        type: 'fatigue', emoji: '😴',
        message: Utils.random([
          `Tu te sens épuisé ${nom} — c'est ok. Écoute ton corps : technique parfaite sur charges modérées aujourd'hui.`,
          `Fatigue détectée ${nom}. On adapte : charges à -20%, concentration sur la qualité.`,
          `${nom}, corps fatigué = séance technique. Léger, parfait, conscient.`
        ])
      };
    }

    // Mauvaise humeur
    if (['😒','😤'].includes(humeur?.humeur)) {
      return {
        type: 'motivation', emoji: '💡',
        message: Utils.random([
          `Pas dans ton assiette ${nom} ? Les meilleures séances arrivent parfois quand on s'y attend le moins.`,
          `${nom}, les champions s'entraînent aussi quand ils n'en ont pas envie. C'est là que la différence se fait.`,
          `Mauvaise journée ? Parfait. Transforme-la en énergie ${nom}. La salle attend.`
        ])
      };
    }

    // Mode peak — tout est au vert
    if (humeur?.humeur === '🔥'
        && (fatigue?.niveau || 0) <= 1) {
      return {
        type: 'peak', emoji: '🚀',
        message: Utils.random([
          `Tu es en feu ${nom} ! Corps frais, mental affûté — c'est le moment de tenter un PR !`,
          `${nom} en mode peak ! Tout est réuni pour une séance exceptionnelle. Vas chercher un record.`,
          `Parfait alignement ${nom} — humeur top, fatigue basse. C'est le jour pour repousser tes limites !`
        ])
      };
    }

    // Décharge automatique semaine 16
    try {
      if (Programme.isDecharge()) {
        return {
          type: 'decharge', emoji: '😴',
          message: `Semaine de décharge ${nom} ! C'est planifié — charges à 55%, focus technique. Ton corps va supercompenser pour le prochain cycle. 💪`
        };
      }
    } catch(e) {}

    // Streak exceptionnel
    if (streak.count >= 14) {
      return {
        type: 'streak', emoji: '🏆',
        message: Utils.random([
          `${streak.count} jours consécutifs ${nom} — c'est impressionnant ! Continue sur cette lancée.`,
          `${streak.count}j de streak ${nom} ! Tu es dans une zone de performance rare. Respect.`
        ])
      };
    }

    // Message selon phase
    const msgs = {
      'Reprise': [
        `Phase Reprise ${nom} : la technique prime sur tout. Construis les fondations.`,
        `Semaine de reprise — chaque rep parfait vaut 10 reps approximatifs.`
      ],
      'Construction': [
        `Phase Construction ${nom} : cherche à dépasser le volume de la semaine dernière.`,
        `Volume élevé cette semaine ${nom}. Concentration sur la connexion musculaire.`
      ],
      'Intensité': [
        `Phase Intensité ${nom} : charges lourdes, concentration maximale. PRs en vue.`,
        `Séances intenses cette semaine ${nom}. Un bon échauffement vaut autant que la séance.`
      ],
      'Peak': [
        `Phase Peak ${nom} : tu as accumulé des semaines de travail pour ça. Donne tout.`,
        `C'est la semaine des records ${nom} ! Tu es prêt pour ça. Attaque.`
      ],
      'Décharge': [
        `Semaine de décharge ${nom}. Laisse le corps assimiler et supercompenser.`,
        `Décharge active ${nom} — léger, technique, récupération maximale.`
      ]
    };

    const phase = infos.phase?.nom || 'Reprise';
    return {
      type:    'programme',
      emoji:   infos.phase?.emoji || '💡',
      message: Utils.random(msgs[phase] || msgs['Reprise'])
    };
  },

  // ════════════════════════════════════════════════════════
  // COACH IA CHAT
  // ════════════════════════════════════════════════════════
  _historique: [],

  async envoyerMessage(question) {
    let nom = 'Athlète', seances = 0;
    let streak = { count:0 }, absence = -1;
    let rpe = 0, fatigue = null, humeur = null;
    let prs = {}, phase = { phase:{ nom:'Reprise' } };
    let volume = 0;

    try { nom     = Tracker.getProfil().nom || 'Athlète'; } catch(e) {}
    try { seances = Tracker.getTotalSeances();             } catch(e) {}
    try { streak  = Tracker.getStreak();                  } catch(e) {}
    try { absence = Tracker.getJoursAbsence();            } catch(e) {}
    try { rpe     = Tracker.getRPEMoyen7Jours();          } catch(e) {}
    try { fatigue = Tracker.getFatigue();                 } catch(e) {}
    try { humeur  = Tracker.getHumeur();                  } catch(e) {}
    try { prs     = Tracker.getAllPRs();                  } catch(e) {}
    try { phase   = Programme.getInfosProgramme();        } catch(e) {}
    try { volume  = Tracker.getVolumeSemaine();           } catch(e) {}

    const ctx = {
      nom,
      seancesTotales: seances,
      streak:         streak.count,
      joursAbsence:   absence === -1
        ? 'jamais' : `${absence} jours`,
      rpe:            rpe > 0 ? `${rpe}/10` : 'aucune donnée',
      fatigue:        fatigue
        ? `niveau ${fatigue.niveau}/4` : 'non renseignée',
      humeur:         humeur?.humeur || 'non renseignée',
      phase:          phase?.phase?.nom || 'Reprise',
      volume:         Utils.formatVolume(volume),
      nbPRs:          Object.keys(prs).length
    };

    const reponse = this._raisonnerIA(
      question.toLowerCase(), ctx, prs
    );

    this._historique.push(
      { role:'user',      content:question },
      { role:'assistant', content:reponse  }
    );

    if (this._historique.length > 30) {
      this._historique = this._historique.slice(-30);
    }

    return reponse;
  },

  _raisonnerIA(q, ctx, prs = {}) {
    const nom = ctx.nom;

    // ── Records
    if (q.includes('pr') || q.includes('record')
        || q.includes('max') || q.includes('meilleur')) {
      const top = Object.entries(prs)
        .filter(([,v]) => v.rm1 > 0)
        .sort((a,b) => (b[1].rm1||0) - (a[1].rm1||0))
        .slice(0, 5)
        .map(([ref, pr]) => {
          const ex = window.EXERCICES?.[ref];
          return `  • ${ex?.nom||ref}: ${pr.poids}kg × ${pr.reps} (~${pr.rm1}kg 1RM)`;
        });
      if (!top.length)
        return `Tu n'as pas encore de records enregistrés ${nom}. Lance ta première séance !`;
      return `Tes meilleurs records ${nom} 🏆\n\n${top.join('\n')}\n\n${ctx.nbPRs} records au total — continue à progresser 💪`;
    }

    // ── Fatigue / Récupération
    if (q.includes('fatigu') || q.includes('récup')
        || q.includes('repos') || q.includes('douleur')
        || q.includes('mal') || q.includes('épuisé')) {
      if (ctx.rpe !== 'aucune donnée'
          && parseFloat(ctx.rpe) >= 8) {
        return `Ton RPE moyen est de ${ctx.rpe} — c'est élevé ${nom} ⚠️\n\nConseils urgents :\n  • Réduire les charges de 30-40%\n  • Prioriser le sommeil (7-9h)\n  • Augmenter les protéines\n  • 1 séance légère max cette semaine\n\nLa récupération = progression !`;
      }
      return `La récupération est la moitié de l'entraînement ${nom} :\n\n  • 48h entre groupes musculaires\n  • 7-9h de sommeil (essentiel)\n  • Hydratation : 35ml/kg/jour\n  • Protéines : 1.6-2.2g/kg\n  • Bain froid 2-3min après séance intense\n\nTon corps se construit au repos, pas à la salle 💤`;
    }

    // ── Programme / Séance
    if (q.includes('programme') || q.includes('plan')
        || q.includes('séance') || q.includes('aujourd')
        || q.includes('faire') || q.includes('entraîn')) {
      const phaseMsg = {
        'Reprise':      '🌱 Focus technique et bases. Charges légères, mouvements parfaits.',
        'Construction': '🏗️ Volume élevé. +2.5kg dès que tu complètes toutes les séries.',
        'Intensité':    '💥 Charges lourdes, faible volume. Priorité aux compound.',
        'Peak':         '🏆 Charges maximales — semaine des records. Donne tout !',
        'Décharge':     '😴 Charges légères 55%. Récupération et technique.'
      };
      return `Tu es en phase **${ctx.phase}** ${nom}.\n\n${phaseMsg[ctx.phase]||phaseMsg['Reprise']}\n\nVolume cette semaine : ${ctx.volume}\nStreak actuel : ${ctx.streak} jours 🔥`;
    }

    // ── Nutrition
    if (q.includes('manger') || q.includes('nutrition')
        || q.includes('protéine') || q.includes('calorie')
        || q.includes('régime') || q.includes('nourriture')) {
      let poids = 80;
      try { poids = Tracker.getProfil().poids || 80; }
      catch(e) {}
      const prot = Math.round(poids * 2);
      const cal  = Math.round(poids * 35);
      const eau  = (poids * 0.035).toFixed(1);
      return `Recommandations pour toi ${nom} (${poids}kg) 🥗\n\n  • Protéines : ${prot}g/jour minimum\n  • Calories : ~${cal} kcal/jour\n  • Eau : ${eau}L minimum\n  • Repas complet 2-3h avant séance\n  • Post-séance : protéines + glucides dans 30min\n\nNote : ajuste selon ton objectif (prise de masse = +300 kcal, sèche = -300 kcal) 🎯`;
    }

    // ── Motivation
    if (q.includes('motiv') || q.includes('envie')
        || q.includes('abandon') || q.includes('dur')
        || q.includes('difficile') || q.includes('arrêt')) {
      return Utils.random([
        `${nom}, ${ctx.seancesTotales} séances derrière toi — c'est la preuve que tu peux le faire. La discipline ne faiblit jamais.\n\n"Le seul mauvais entraînement est celui qui n'a pas eu lieu."`,
        `Les jours difficiles font les athlètes durables ${nom}. Une séance à 50% vaut mieux que zéro.\n\nTon streak de ${ctx.streak} jours le prouve — tu n'es pas du genre à abandonner.`,
        `${nom}, chaque séance sans envie est celle qui compte le plus. C'est là que le caractère se forge.\n\n${ctx.seancesTotales} séances, ${ctx.streak} jours de streak — tu n'es pas un débutant. Tu sais que ça passe. 💪`
      ]);
    }

    // ── Streak
    if (q.includes('streak') || q.includes('consécutif')
        || q.includes('régularité') || q.includes('série')) {
      if (ctx.streak === 0)
        return `Ton streak est à 0 ${nom}. Mais chaque légende a commencé à 0 ! Une séance aujourd'hui et c'est parti 🔥`;
      return `Ton streak : **${ctx.streak} jours** 🔥\n\nC'est ${ctx.streak >= 21 ? 'exceptionnel — tu es dans le top 1%' : ctx.streak >= 14 ? 'excellent' : ctx.streak >= 7 ? 'très bien' : 'un bon début'} ${nom} !\n\nRecord perso : ${Tracker.getStreak?.()?.max || ctx.streak} jours. Continue ! 💪`;
    }

    // ── Poids corporel / IMC
    if (q.includes('poids') || q.includes('imc')
        || q.includes('masse') || q.includes('maigrir')
        || q.includes('grossir') || q.includes('corporel')) {
      let profil = {};
      try { profil = Tracker.getProfil(); } catch(e) {}
      const imc = profil.poids && profil.taille
        ? Utils.calculerIMC(profil.poids, profil.taille)
        : null;
      const cat = imc ? Utils.categorieIMC(imc) : null;
      return `Profil corporel ${nom} ⚖️\n\n  • Poids : ${profil.poids||'?'}kg\n  • Taille : ${profil.taille||'?'}cm${imc ? `\n  • IMC : ${imc} (${cat?.label})` : ''}\n\nNote tes mesures régulièrement dans Stats > Corps pour suivre ta progression dans le temps 📊`;
    }

    // ── Exercices spécifiques
    if (q.includes('squat') || q.includes('bench')
        || q.includes('soulevé') || q.includes('tractions')
        || q.includes('développé') || q.includes('rowing')) {
      return `Conseils progression ${nom} 📈\n\n  • Technique d'abord : filme-toi pour te corriger\n  • +2.5kg dès que tu complètes toutes les séries\n  • 3-5 séries de 3-6 reps pour la force\n  • 3-4 séries de 8-12 reps pour le volume\n  • 2x minimum par semaine\n\nVoir Stats > Charges pour ta progression graphique 📊`;
    }

    // ── Supersets
    if (q.includes('superset') || q.includes('bi-set')
        || q.includes('enchaîner') || q.includes('gaintime')) {
      return `Les supersets ${nom} ⚡\n\n  • Agoniste-Antagoniste : Bench + Rowing (excellent !)\n  • Même muscle : Curl + Curl marteau\n  • Non-compétitif : Pec + Mollets\n\nAvantages :\n  ✅ Gain de temps (-30%)\n  ✅ Densité d'entraînement ↑\n  ✅ Cardio inclus\n\n⚠️ Moins adapté pour les exercices lourds (squat, soulevé)`;
    }

    // ── PR / Progrès
    if (q.includes('progress') || q.includes('améliorer')
        || q.includes('plateau') || q.includes('stagne')) {
      return `Briser un plateau ${nom} 🚀\n\n  1. Varie le rep range (ex: 5×5 au lieu de 3×10)\n  2. Ajoute une série supplémentaire\n  3. Change l'ordre des exercices\n  4. Semaine de décharge si RPE > 8\n  5. Améliore ton sommeil (≥7h)\n  6. Augmente les protéines\n\nLa progression n'est pas linéaire — c'est normal. Continue ! 💪`;
    }

    // ── Bonjour / Salutation
    if (q.includes('bonjour') || q.includes('salut')
        || q.includes('hello') || q.includes('hey')
        || q.includes('coucou') || q.includes('bonsoir')) {
      return `${Utils.salutation()} ${nom} ! 👋\n\nJe suis ton Coach IA PowerApp.\n\nTu peux me demander :\n  💪 Tes records et ta progression\n  📅 Des conseils pour ta séance du jour\n  🥗 Des recommandations nutrition\n  😴 Comment gérer ta fatigue\n  🔥 Comment retrouver la motivation\n  📊 Analyser ta semaine\n\nDe quoi as-tu besoin ? 🎯`;
    }

    // ── Fallback
    return Utils.random([
      `Bonne question ${nom} ! En phase **${ctx.phase}**, ${ctx.streak} jours de streak, ${ctx.seancesTotales} séances au compteur.\n\nJe peux t'aider sur : séance du jour, records, nutrition, récupération ou motivation. Précise ! 🎯`,
      `${nom}, dis-moi ce sur quoi tu veux travailler :\n  💪 Force / PRs\n  📈 Volume\n  😴 Récupération\n  🥗 Nutrition\n  🔥 Motivation\n\nQuel est ton objectif aujourd'hui ?`,
      `Pour te donner les meilleurs conseils ${nom}, j'ai besoin de plus de détails. Force, volume, perte de poids, récupération ou motivation ?`
    ]);
  },

  // ════════════════════════════════════════════════════════
  // RENDER COACH TAB
  // ════════════════════════════════════════════════════════
  renderCoachTab(container) {
    if (!container) return;

    let msg      = { emoji:'💡', message:'Prêt pour la séance ?' };
    let analyse  = { seances:0, objectif:4, volume:0, rpe:0, intensite:'🟢 Faible', recommendation:'Continue !', deltaVolume:0 };
    let warmup   = [];
    let deload   = { oui:false };
    let citation = { texte:'La progression est un choix.', auteur:'Anonyme' };
    let aEviter  = [];
    let nom      = 'Athlète';

    try { msg      = this.getMessageDuJour();      } catch(e) {}
    try { analyse  = this.getAnalyseSemaine();     } catch(e) {}
    try { warmup   = this.getWarmupDuJour();       } catch(e) {}
    try { deload   = this.necessiteDeload();       } catch(e) {}
    try { citation = this.getCitationDuJour();     } catch(e) {}
    try { aEviter  = this.getExercicesAEviter();   } catch(e) {}
    try { nom      = Tracker.getProfil().nom||'Athlète'; } catch(e) {}

    container.innerHTML = `

      <!-- Citation -->
      <div class="card mb-md"
           style="border-left:3px solid var(--fd-lemon);
                  background:rgba(249,239,119,0.06)">
        <div style="font-size:.72rem;font-weight:700;
                    text-transform:uppercase;
                    letter-spacing:.08em;
                    color:var(--fd-lemon);
                    margin-bottom:var(--space-sm)">
          💬 Citation du jour
        </div>
        <p style="font-size:.9rem;font-style:italic;
                  line-height:1.6;
                  color:var(--text-primary)">
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

      <!-- Décharge recommandée -->
      ${deload.oui ? `
        <div class="card mb-md"
             style="border-color:var(--fd-coral);
                    background:rgba(255,141,150,0.08)">
          <div class="card-label" style="color:var(--fd-coral)">
            ⚠️ Décharge recommandée
          </div>
          <p style="font-size:.88rem;margin-top:var(--space-sm);
                    color:var(--text-secondary)">
            ${deload.raison}.<br>
            Réduis les charges de <strong>40%</strong>
            et concentre-toi sur la technique.
          </p>
        </div>` : ''}

      <!-- Exercices à éviter -->
      ${aEviter.length > 0 ? `
        <div class="card mb-md"
             style="border-color:var(--fd-lemon);
                    background:rgba(249,239,119,0.06)">
          <div class="card-label" style="color:var(--fd-lemon)">
            ⚠️ Exercices déconseillés (blessures actives)
          </div>
          <div style="display:flex;flex-wrap:wrap;
                      gap:var(--space-xs);
                      margin-top:var(--space-sm)">
            ${aEviter.map(ref => `
              <span class="chip chip-lemon">
                ${(window.EXERCICES||{})[ref]?.nom||ref}
              </span>`).join('')}
          </div>
        </div>` : ''}

      <!-- Analyse semaine -->
      <div class="card mb-md">
        <div class="card-label">📊 Analyse de la semaine</div>
        <div style="margin-top:var(--space-sm)">
          ${[
            { label:'Séances',   val:`${analyse.seances}/${analyse.objectif}` },
            { label:'Volume',    val:Utils.formatVolume(analyse.volume)        },
            { label:'RPE moyen', val:analyse.rpe>0 ? `${analyse.rpe}/10`:'—'  },
            { label:'Intensité', val:analyse.intensite                         },
            { label:'vs S-1',    val:`${(analyse.deltaVolume||0)>=0?'+':''}${analyse.deltaVolume||0}%` }
          ].map(r => `
            <div class="score-row">
              <span class="score-row-label">${r.label}</span>
              <span class="score-row-value"
                    style="font-size:.85rem;font-weight:600">
                ${r.val}
              </span>
            </div>`).join('')}

          <div class="progress-bar mt-md">
            <div class="progress-fill"
                 style="width:${Math.min(100,
                   Math.round((analyse.seances/Math.max(analyse.objectif,1))*100)
                 )}%"></div>
          </div>
        </div>
        <div style="margin-top:var(--space-md);
                    padding:var(--space-sm);
                    background:var(--fd-indigo-dim);
                    border-radius:var(--radius-sm)">
          <span style="font-size:.82rem;color:var(--fd-lavender)">
            💡 ${analyse.recommendation}
          </span>
        </div>
      </div>

      <!-- Coach IA Chat -->
      <div class="card mb-md"
           style="border-color:var(--fd-indigo);
                  background:rgba(75,75,249,0.04)">
        <div class="card-label" style="color:var(--fd-indigo)">
          🤖 Coach IA — Pose-moi une question
        </div>

        <!-- Suggestions rapides -->
        <div style="display:flex;flex-wrap:wrap;gap:6px;
                    margin-top:var(--space-md);
                    margin-bottom:var(--space-md)">
          ${[
            { label:'💪 Mes records',   q:'Mes records'    },
            { label:'😴 Récupération',  q:'Récupération'   },
            { label:'📈 Programme',     q:'Mon programme'  },
            { label:'🥗 Nutrition',     q:'Nutrition'      },
            { label:'🔥 Motivation',    q:'Motivation'     },
            { label:'⚡ Supersets',     q:'Supersets'      }
          ].map(s => `
            <button onclick="Coach._suggestionRapide('${s.q}')"
                    style="padding:6px 10px;
                           border-radius:99px;
                           border:1px solid var(--fd-indigo);
                           background:rgba(75,75,249,0.12);
                           color:var(--fd-lavender);
                           font-size:.72rem;font-weight:600;
                           cursor:pointer;
                           white-space:nowrap;
                           transition:all .15s">
              ${s.label}
            </button>`).join('')}
        </div>

        <!-- Historique chat -->
        <div id="coach-chat"
             style="min-height:100px;max-height:360px;
                    overflow-y:auto;
                    margin-bottom:var(--space-md);
                    display:flex;flex-direction:column;
                    gap:var(--space-sm);
                    padding:var(--space-xs)">
          ${this._historique.length === 0 ? `
            <div data-initial="true"
                 style="text-align:center;
                        padding:var(--space-lg);
                        color:var(--text-muted);
                        font-size:.85rem;
                        line-height:1.8">
              🤖 ${Utils.salutation()} ${nom} ! 👋<br><br>
              Je peux t'aider avec :<br>
              💪 Tes records et progression<br>
              📅 Conseils séance du jour<br>
              🥗 Nutrition personnalisée<br>
              😴 Gestion de la fatigue<br>
              🔥 Retrouver la motivation<br><br>
              De quoi as-tu besoin ? 🎯
            </div>` :
            this._historique.map(m => `
              <div style="display:flex;
                          justify-content:${m.role==='user'
                            ? 'flex-end':'flex-start'}">
                <div style="max-width:82%;
                            padding:10px 14px;
                            border-radius:${m.role==='user'
                              ? '16px 16px 4px 16px'
                              : '16px 16px 16px 4px'};
                            background:${m.role==='user'
                              ? 'var(--fd-indigo)'
                              : 'var(--bg-input)'};
                            color:${m.role==='user'
                              ? 'white'
                              : 'var(--text-primary)'};
                            font-size:.85rem;
                            line-height:1.6;
                            white-space:pre-wrap;
                            word-break:break-word">
                  ${m.role==='assistant' ? '🤖 ' : ''}${m.content}
                </div>
              </div>`).join('')}
        </div>

        <!-- Input -->
        <div style="display:grid;
                    grid-template-columns:1fr auto;
                    gap:var(--space-sm);
                    align-items:center">
          <input id="coach-input"
                 type="text"
                 class="input"
                 style="border-radius:var(--radius-full);
                        -webkit-appearance:none"
                 placeholder="Ta question..."
                 autocomplete="off"
                 autocorrect="off"
                 autocapitalize="sentences"
                 onkeydown="if(event.key==='Enter'){
                   event.preventDefault();
                   Coach._envoyerChat();
                 }" />
          <button onclick="Coach._envoyerChat()"
                  style="height:44px;padding:0 16px;
                         background:var(--fd-indigo);
                         color:white;border:none;
                         border-radius:var(--radius-full);
                         font-size:.85rem;font-weight:700;
                         cursor:pointer;white-space:nowrap;
                         -webkit-tap-highlight-color:transparent">
            Envoyer ↗
          </button>
        </div>
      </div>

      <!-- Warm-up -->
      <div class="card">
        <div class="card-label">🔥 Warm-up recommandé</div>
        ${(warmup||[]).map((w, i) => `
          <div style="display:flex;align-items:center;
                      gap:var(--space-md);
                      padding:var(--space-sm) 0;
                      border-bottom:1px solid var(--border-color)">
            <div style="width:28px;height:28px;
                        border-radius:50%;
                        background:var(--fd-indigo-dim);
                        display:flex;align-items:center;
                        justify-content:center;
                        font-size:.75rem;font-weight:700;
                        color:var(--fd-indigo);
                        flex-shrink:0">
              ${i+1}
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:.88rem;font-weight:600">
                ${w.nom}
              </div>
              <div style="font-size:.72rem;
                          color:var(--text-muted)">
                ${w.description}
              </div>
            </div>
            <div style="font-size:.78rem;
                        color:var(--fd-mint);
                        font-weight:600;
                        flex-shrink:0">
              ${Utils.formatDuree(w.duree)}
            </div>
          </div>`).join('')}
      </div>
    `;

    // Scroll chat en bas
    const chat = document.getElementById('coach-chat');
    if (chat) chat.scrollTop = chat.scrollHeight;
  },

  // ════════════════════════════════════════════════════════
  // CHAT — ENVOI MESSAGE
  // ════════════════════════════════════════════════════════
  async _envoyerChat() {
    const input = document.getElementById('coach-input');
    const chat  = document.getElementById('coach-chat');
    if (!input || !chat) return;

    const question = input.value.trim();
    if (!question) return;

    input.value = '';
    input.focus();

    // Supprimer message initial
    const initMsg = chat.querySelector('[data-initial]');
    if (initMsg) initMsg.remove();

    // Bulle utilisateur
    const bulleUser = document.createElement('div');
    bulleUser.style.cssText =
      'display:flex;justify-content:flex-end';
    bulleUser.innerHTML = `
      <div style="max-width:82%;padding:10px 14px;
                  border-radius:16px 16px 4px 16px;
                  background:var(--fd-indigo);color:white;
                  font-size:.85rem;line-height:1.6;
                  word-break:break-word">
        ${question}
      </div>`;
    chat.appendChild(bulleUser);
    chat.scrollTop = chat.scrollHeight;

    // Bulle loading
    const bulleLoad = document.createElement('div');
    bulleLoad.style.cssText =
      'display:flex;justify-content:flex-start';
    bulleLoad.innerHTML = `
      <div style="padding:10px 14px;
                  background:var(--bg-input);
                  border-radius:16px 16px 16px 4px;
                  font-size:.85rem;color:var(--text-muted)">
        🤖 <span style="display:inline-block;
             width:12px;height:12px;
             border:2px solid rgba(255,255,255,0.2);
             border-top-color:var(--fd-indigo);
             border-radius:50%;
             animation:spin .8s linear infinite;
             vertical-align:middle;margin-left:4px"></span>
      </div>`;
    chat.appendChild(bulleLoad);
    chat.scrollTop = chat.scrollHeight;

    // Délai naturel
    await new Promise(r => setTimeout(r, 600 + Math.random()*400));

    let reponse = '';
    try {
      reponse = await this.envoyerMessage(question);
    } catch(e) {
      reponse = 'Désolé, une erreur est survenue. Réessaie ! 🤖';
    }

    bulleLoad.remove();

    // Bulle réponse
    const bulleCoach = document.createElement('div');
    bulleCoach.style.cssText =
      'display:flex;justify-content:flex-start';
    bulleCoach.innerHTML = `
      <div style="max-width:82%;padding:10px 14px;
                  border-radius:16px 16px 16px 4px;
                  background:var(--bg-input);
                  color:var(--text-primary);
                  font-size:.85rem;line-height:1.6;
                  white-space:pre-wrap;word-break:break-word">
        🤖 ${reponse}
      </div>`;
    chat.appendChild(bulleCoach);
    chat.scrollTop = chat.scrollHeight;

    try { Utils.vibrerBeep(); } catch(e) {}
  },

  // ════════════════════════════════════════════════════════
  // SUGGESTION RAPIDE
  // ════════════════════════════════════════════════════════
  _suggestionRapide(texte) {
    const input = document.getElementById('coach-input');
    if (input) {
      input.value = texte;
      this._envoyerChat();
    }
  },

  // ════════════════════════════════════════════════════════
  // CITATIONS
  // ════════════════════════════════════════════════════════
  getCitationDuJour() {
    const citations = [
      { texte:"Le corps accomplit ce que l'esprit croit possible.",          auteur:"Napoleon Hill"    },
      { texte:"La douleur est temporaire. Abandonner dure toujours.",        auteur:"Lance Armstrong"  },
      { texte:"Chaque rep que tu fais change ton futur.",                    auteur:"Anonyme"          },
      { texte:"La force vient d'une volonté indomptable.",                   auteur:"Gandhi"           },
      { texte:"Le seul mauvais entraînement est celui qui n'a pas eu lieu.", auteur:"Anonyme"          },
      { texte:"Tu n'as pas à être extrême, juste consistant.",               auteur:"Anonyme"          },
      { texte:"Les champions sont faits à la salle — reconnus ailleurs.",    auteur:"Joe Frazier"      },
      { texte:"Construis ton corps, construis ta confiance.",                auteur:"Anonyme"          },
      { texte:"Souffre maintenant et vis le reste de ta vie en champion.",   auteur:"Muhammad Ali"     },
      { texte:"La progression n'est pas un accident, c'est un choix.",       auteur:"Anonyme"          },
      { texte:"Les limites n'existent que dans l'esprit.",                   auteur:"Arnold Schwarzenegger" },
      { texte:"Ce que l'on fait en secret se voit en public.",               auteur:"Anonyme"          },
      { texte:"La discipline est le pont entre les objectifs et les résultats.", auteur:"Jim Rohn"     },
      { texte:"Ton futur te remerciera pour les efforts d'aujourd'hui.",     auteur:"Anonyme"          },
      { texte:"Ne compte pas les jours, fais que les jours comptent.",       auteur:"Muhammad Ali"     }
    ];
    const idx = new Date().getDate() % citations.length;
    return citations[idx];
  },

  // ════════════════════════════════════════════════════════
  // WARM-UP DU JOUR
  // ════════════════════════════════════════════════════════
  getWarmupDuJour() {
    try {
      const indexJour = Utils.indexJourSemaine(
        Utils.aujourd_hui()
      );
      const planning  = PLANNING_SEMAINE?.[indexJour];
      const seanceId  = planning?.seanceId;
      return seanceId
        ? (WARMUP?.[seanceId] || WARMUP?.general || [])
        : (WARMUP?.general || []);
    } catch(e) {
      return [];
    }
  },

  // ════════════════════════════════════════════════════════
  // ANALYSE SEMAINE
  // ════════════════════════════════════════════════════════
  getAnalyseSemaine() {
    let volume = 0, seances = 0, rpe = 0;
    let objectif = 4, comp = { delta:0 };

    try { volume   = Tracker.getVolumeSemaine();        } catch(e) {}
    try { seances  = Tracker.getSeancesParSemaine();    } catch(e) {}
    try { rpe      = Tracker.getRPEMoyen7Jours();       } catch(e) {}
    try { objectif = Utils.storage.get(
            'ft_objectif_seances_semaine', 4);           } catch(e) {}
    try { comp     = Tracker.getComparaisonSemaines();  } catch(e) {}

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
    } else if (seances >= objectif) {
      intensite      = '🟢 Bonne';
      recommendation = 'Objectif séances atteint ! Maintiens ce rythme.';
    }

    return {
      volume, seances, objectif, rpe,
      intensite, recommendation,
      deltaVolume:     comp.delta || 0,
      objectifAtteint: seances >= objectif
    };
  },

  // ════════════════════════════════════════════════════════
  // SUGGESTION CHARGE
  // ════════════════════════════════════════════════════════
  suggererCharge(exerciceRef) {
    try {
      const pr    = Tracker.getPR(exerciceRef);
      const phase = Programme.getPhaseActuelle();
      if (!pr?.rm1) return null;
      const charge = Math.round(
        pr.rm1 * phase.intensite / 2.5
      ) * 2.5;
      return {
        charge,
        pourcentage: Math.round(phase.intensite * 100),
        rm1:         pr.rm1,
        phase:       phase.nom
      };
    } catch(e) { return null; }
  },

  // ════════════════════════════════════════════════════════
  // DÉLOAD RECOMMANDÉ
  // ════════════════════════════════════════════════════════
  necessiteDeload() {
    try {
      const rpe     = Tracker.getRPEMoyen7Jours();
      const fatigue = Tracker.getFatigue();
      const absence = Tracker.getJoursAbsence();

      if (absence === -1) return { oui:false };

      if (rpe > 0 && rpe >= 8.5)
        return {
          oui:true,
          raison:`RPE moyen élevé : ${rpe}/10`
        };
      if ((fatigue?.niveau || 0) >= 3)
        return {
          oui:true,
          raison:'Fatigue déclarée maximale'
        };

      // Décharge automatique semaine 16
      if (Programme.isDecharge?.())
        return {
          oui:true,
          raison:'Semaine de décharge planifiée (S16)'
        };

      return { oui:false };
    } catch(e) {
      return { oui:false };
    }
  },

  // ════════════════════════════════════════════════════════
  // EXERCICES À ÉVITER
  // ════════════════════════════════════════════════════════
  getExercicesAEviter() {
    try {
      const blessures = Tracker.getBlessures()
        .filter(b => b.active);
      const aEviter   = new Set();
      const restrictions = {
        'epaule':  ['dev_militaire','bench_press',
                    'elev_laterales','dips'],
        'genou':   ['squat','presse_cuisses',
                    'fentes','leg_extension'],
        'dos':     ['soulevé_terre','rowing_barre','squat'],
        'coude':   ['curl_halteres','curl_barre',
                    'ext_triceps_poulie'],
        'poignet': ['bench_press','curl_barre'],
        'cheville':['squat','fentes','mollets'],
        'cou':     ['dev_militaire','rowing_barre']
      };

      blessures.forEach(b => {
        const zone = b.zone.toLowerCase();
        Object.entries(restrictions).forEach(([k, exos]) => {
          if (zone.includes(k)) {
            exos.forEach(e => aEviter.add(e));
          }
        });
      });

      return [...aEviter];
    } catch(e) { return []; }
  }
};

window.Coach = Coach;
console.log('✅ Coach IA v3.0 chargé');
