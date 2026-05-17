/* ============================================================
   FitTracker Pro — App.js v3.0
   Point d'entrée principal + Navigation + Init + UI
   ============================================================ */

'use strict';

// ════════════════════════════════════════════════════════════
// ÉTAT GLOBAL
// ════════════════════════════════════════════════════════════
window._pageActive    = 'home';
window._pageHistory   = [];
window._seanceActive  = null;
window._timerInterval = null;

// ════════════════════════════════════════════════════════════
// NAVIGATION
// ════════════════════════════════════════════════════════════
function naviguer(page, options = {}) {
  try {
    // Masquer toutes les pages
    document.querySelectorAll('.page').forEach(p => {
      p.classList.remove('active');
      p.style.display = 'none';
    });

    // Mettre à jour nav bas
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const navPages = ['home','training','live','stats','profil'];
    if (navPages.includes(page)) {
      document.getElementById(`nav-${page}`)
        ?.classList.add('active');
    }

    // Afficher la page cible
    const pageEl = document.getElementById(`page-${page}`)
      || document.getElementById('page-home');

    pageEl.classList.add('active');
    pageEl.style.display = 'block';

    // Mettre à jour header
    _updateHeader(page);

    // Scroll en haut
    pageEl.scrollTop = 0;
    window.scrollTo(0, 0);

    // Historique navigation
    if (window._pageActive !== page) {
      window._pageHistory.push(window._pageActive);
      if (window._pageHistory.length > 10) {
        window._pageHistory.shift();
      }
    }
    window._pageActive = page;

    // Rendre le contenu
    _rendreContenu(page, pageEl, options);

    // Fermer le menu si ouvert
    UI.fermerMenu();

  } catch(e) {
    console.error('[App] Erreur navigation:', e);
  }
}

function retourArriere() {
  const prev = window._pageHistory.pop();
  if (prev) naviguer(prev);
  else naviguer('home');
}

// ════════════════════════════════════════════════════════════
// MISE À JOUR HEADER
// ════════════════════════════════════════════════════════════
function _updateHeader(page) {
  const configs = {
    home:         { emoji:'⚡', titre:'PowerApp'    },
    training:     { emoji:'📅', titre:'Programme'   },
    live:         { emoji:'💪', titre:'Séance live' },
    stats:        { emoji:'📊', titre:'Statistiques'},
    profil:       { emoji:'👤', titre:'Profil'      },
    coach:        { emoji:'🤖', titre:'Coach IA'    },
    defis:        { emoji:'🏆', titre:'Défis'       },
    predict:      { emoji:'📈', titre:'Prédictions' },
    share:        { emoji:'📤', titre:'Partage'     },
    gamification: { emoji:'⭐', titre:'Niveaux & XP'},
    history:      { emoji:'📅', titre:'Historique'  },
    photos:       { emoji:'📸', titre:'Photos'      },
    social:       { emoji:'📱', titre:'Réseaux'     },
    supersets:    { emoji:'⚡', titre:'Supersets'   },
    offline:      { emoji:'📵', titre:'Hors-ligne'  },
    settings:     { emoji:'⚙️', titre:'Paramètres'  },
    nutrition:    { emoji:'🥗', titre:'Nutrition'   }
  };

  const cfg = configs[page] || configs.home;

  const emojiEl = document.getElementById('header-emoji');
  const titleEl = document.getElementById('header-title');
  if (emojiEl) emojiEl.textContent = cfg.emoji;
  if (titleEl) titleEl.textContent = cfg.titre;

  // Mettre à jour XP dans le header
  _updateHeaderXP();
}

function _updateHeaderXP() {
  const el = document.getElementById('header-xp');
  if (!el) return;
  try {
    const xp = Gamification.getXP();
    el.innerHTML = `
      <span style="font-size:.72rem;font-weight:700;
                   color:var(--fd-lemon)">
        ${xp.niveau.emoji} Niv.${xp.niveau.numero}
      </span>
      <span style="font-size:.65rem;
                   color:var(--text-muted);
                   margin-left:4px">
        ${xp.total}XP
      </span>`;
  } catch(e) {}
}

// ════════════════════════════════════════════════════════════
// RENDU DES PAGES
// ════════════════════════════════════════════════════════════
function _rendreContenu(page, container, options = {}) {
  try {
    switch(page) {

      case 'home':
        _rendreHome(container);
        break;

      case 'training':
        _rendreTraining(container);
        break;

      case 'live':
        _rendreLive(container, options);
        break;

      case 'stats':
        Stats.render(container);
        break;

      case 'profil':
        _rendreProfil(container);
        break;

      case 'coach':
        Coach.renderCoachTab(container);
        break;

      case 'defis':
        Defis.render(container);
        break;

      case 'predict':
        Predict.render(container);
        break;

      case 'share':
        Share.render(container);
        break;

      case 'gamification':
        Gamification.renderGamificationTab(container);
        break;

      // ✅ NOUVEAUX MODULES v3.0
      case 'history':
        History.render(container);
        break;

      case 'photos':
        Photos.render(container);
        break;

      case 'social':
        Social.render(container);
        break;

      case 'supersets':
        Superset.render(container);
        break;

      case 'offline':
        Offline.render(container);
        break;

      case 'settings':
        _rendreSettings(container);
        break;

      case 'nutrition':
        _rendreNutrition(container);
        break;

      default:
        _rendreHome(container);
    }
  } catch(e) {
    console.error(`[App] Erreur rendu page ${page}:`, e);
    container.innerHTML = `
      <div class="card mt-md"
           style="text-align:center;
                  padding:var(--space-xl)">
        <div style="font-size:2rem">⚠️</div>
        <p style="color:var(--text-muted);
                  margin-top:var(--space-sm)">
          Erreur chargement de la page.<br>
          <button onclick="naviguer('home')"
                  class="btn-secondary mt-md">
            Retour à l'accueil
          </button>
        </p>
      </div>`;
  }
}

// ════════════════════════════════════════════════════════════
// PAGE HOME
// ════════════════════════════════════════════════════════════
function _rendreHome(container) {
  let profil   = { nom:'Athlète', avatar:'💪' };
  let seance   = null, prochaine = null;
  let infos    = { label:'S1', cycle:1, phase:{ emoji:'🌱', nom:'Reprise', couleur:'#8bf0bb' } };
  let streak   = { count:0, max:0 };
  let xp       = { total:0, pourcentage:0, niveau:{ emoji:'💪', numero:1, nom:'Débutant' } };
  let analyse  = { seances:0, objectif:4, volume:0, rpe:0, recommendation:'Continue !' };
  let msg      = { emoji:'💡', message:'Bonne séance !' };
  let defisSem = [];

  try { profil   = Tracker.getProfil();                     } catch(e) {}
  try { seance   = Programme.getSeanceduJour();             } catch(e) {}
  try { prochaine= Programme.getProchaineSeance();          } catch(e) {}
  try { infos    = Programme.getInfosProgramme();           } catch(e) {}
  try { streak   = Tracker.getStreak();                     } catch(e) {}
  try { xp       = Gamification.getXP();                   } catch(e) {}
  try { analyse  = Coach.getAnalyseSemaine();               } catch(e) {}
  try { msg      = Coach.getMessageDuJour();                } catch(e) {}
  try { defisSem = (Defis.mettreAJourProgression()||[])
          .filter(d => !d.complete).slice(0, 2);            } catch(e) {}

  const heure = new Date().getHours();
  const salut = heure < 12 ? 'Bonjour' :
                heure < 18 ? 'Bon après-midi' : 'Bonsoir';

  container.innerHTML = `

    <!-- Salutation -->
    <div style="padding:var(--space-md) 0
                var(--space-sm)">
      <div style="font-size:1.4rem;font-weight:800;
                  color:var(--text-primary)">
        ${salut} ${profil.nom} ${profil.avatar||'💪'}
      </div>
      <div style="font-size:.82rem;
                  color:var(--text-muted);
                  margin-top:2px">
        ${infos.label} · Cycle ${infos.cycle}
        · ${infos.phase.emoji} ${infos.phase.nom}
      </div>
    </div>

    <!-- Streak + XP rapide -->
    <div style="display:grid;
                grid-template-columns:1fr 1fr;
                gap:var(--space-sm);
                margin-bottom:var(--space-md)">
      <div class="card"
           style="text-align:center;cursor:pointer"
           onclick="naviguer('stats')">
        <div style="font-size:1.4rem">🔥</div>
        <div style="font-size:1.5rem;font-weight:800;
                    color:var(--fd-lemon)">
          ${streak.count}
        </div>
        <div style="font-size:.65rem;
                    color:var(--text-muted)">
          Streak actuel
        </div>
      </div>
      <div class="card"
           style="text-align:center;cursor:pointer"
           onclick="naviguer('gamification')">
        <div style="font-size:1.4rem">
          ${xp.niveau.emoji}
        </div>
        <div style="font-size:1.2rem;font-weight:800;
                    color:var(--fd-indigo)">
          Niv.${xp.niveau.numero}
        </div>
        <div style="font-size:.65rem;
                    color:var(--text-muted)">
          ${xp.total} XP
        </div>
      </div>
    </div>

    <!-- Séance du jour -->
    ${seance ? `
      <div class="card mb-md"
           style="border-color:var(--fd-indigo);
                  background:rgba(75,75,249,0.06)">
        <div class="flex justify-between items-center">
          <div>
            <div class="card-label"
                 style="color:var(--fd-indigo)">
              📅 Séance du jour
            </div>
            <div style="font-size:1.1rem;
                        font-weight:700;
                        margin-top:4px">
              ${seance.emoji} ${seance.nom}
            </div>
            <div style="font-size:.75rem;
                        color:var(--text-muted);
                        margin-top:2px">
              ~${seance.duree_estimee}min
              · ${seance.exercices?.length||0} exercices
            </div>
          </div>
          <button onclick="naviguer('live')"
                  class="btn-primary"
                  style="font-size:.82rem;
                         padding:var(--space-sm)
                         var(--space-md)">
            ▶ Démarrer
          </button>
        </div>

        <!-- Muscles -->
        <div style="display:flex;flex-wrap:wrap;
                    gap:4px;margin-top:var(--space-sm)">
          ${(seance.muscles||[]).map(m => `
            <span class="chip chip-indigo"
                  style="font-size:.62rem">
              ${m}
            </span>`).join('')}
        </div>
      </div>` : `
      <div class="card mb-md"
           style="text-align:center;
                  border-color:var(--fd-mint)">
        <div style="font-size:1.5rem;margin-bottom:4px">
          😴
        </div>
        <div style="font-weight:700">
          Jour de repos
        </div>
        ${prochaine ? `
          <div style="font-size:.75rem;
                      color:var(--text-muted);
                      margin-top:4px">
            Prochaine séance :
            ${prochaine.emoji} ${prochaine.nom}
            ${prochaine.dansJours > 0
              ? `dans ${prochaine.dansJours}j`
              : 'demain'}
          </div>` : ''}
      </div>`}

    <!-- Message coach -->
    <div class="card mb-md"
         onclick="naviguer('coach')"
         style="cursor:pointer;
                border-left:3px solid var(--fd-lavender)">
      <div style="font-size:.65rem;font-weight:700;
                  text-transform:uppercase;
                  letter-spacing:.08em;
                  color:var(--fd-lavender);
                  margin-bottom:var(--space-xs)">
        ${msg.emoji} Coach du jour
      </div>
      <p style="font-size:.85rem;
                color:var(--text-secondary);
                line-height:1.5;margin:0">
        ${msg.message}
      </p>
    </div>

    <!-- Stats semaine -->
    <div class="card mb-md">
      <div class="flex justify-between items-center mb-sm">
        <div class="card-label">📊 Cette semaine</div>
        <button onclick="naviguer('stats')"
                style="background:none;border:none;
                       font-size:.72rem;
                       color:var(--fd-indigo);
                       cursor:pointer;font-weight:600">
          Voir tout →
        </button>
      </div>
      <div style="display:grid;
                  grid-template-columns:repeat(3,1fr);
                  gap:var(--space-sm)">
        ${[
          {
            label:'Séances',
            val:`${analyse.seances}/${analyse.objectif}`,
            color:'var(--fd-indigo)'
          },
          {
            label:'Volume',
            val:Utils.formatVolume(analyse.volume),
            color:'var(--fd-mint)'
          },
          {
            label:'RPE moy.',
            val:analyse.rpe > 0
              ? `${analyse.rpe}/10` : '—',
            color:'var(--fd-lemon)'
          }
        ].map(s => `
          <div style="text-align:center;
                      padding:var(--space-sm);
                      background:var(--bg-input);
                      border-radius:var(--radius-sm)">
            <div style="font-size:.92rem;
                        font-weight:800;
                        color:${s.color}">
              ${s.val}
            </div>
            <div style="font-size:.62rem;
                        color:var(--text-muted)">
              ${s.label}
            </div>
          </div>`).join('')}
      </div>
      <div class="progress-bar mt-sm">
        <div class="progress-fill"
             style="width:${Math.min(100,
               Math.round((analyse.seances/
                 Math.max(analyse.objectif,1))*100)
             )}%">
        </div>
      </div>
    </div>

    <!-- Défis en cours -->
    ${defisSem.length > 0 ? `
      <div class="card mb-md"
           onclick="naviguer('defis')"
           style="cursor:pointer">
        <div class="flex justify-between items-center mb-sm">
          <div class="card-label">🏆 Défis en cours</div>
          <span style="font-size:.72rem;
                       color:var(--fd-indigo)">
            Voir tout →
          </span>
        </div>
        ${defisSem.map(d => {
          const pct = Math.round(
            (d.progression/Math.max(d.cible,1))*100
          );
          return `
            <div style="margin-bottom:var(--space-sm)">
              <div class="flex justify-between"
                   style="font-size:.78rem;
                          margin-bottom:4px">
                <span>
                  ${d.emoji} ${d.titre}
                </span>
                <span style="color:var(--fd-lemon);
                             font-weight:700">
                  ${d.progression}/${d.cible}
                </span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill"
                     style="width:${pct}%;
                            background:var(--fd-lemon)">
                </div>
              </div>
            </div>`;
        }).join('')}
      </div>` : ''}

    <!-- Actions rapides -->
    <div class="section-title">⚡ Actions rapides</div>
    <div style="display:grid;
                grid-template-columns:repeat(3,1fr);
                gap:var(--space-sm);
                margin-bottom:var(--space-md)">
      ${[
        { emoji:'📈', label:'Predict', page:'predict' },
        { emoji:'🤖', label:'Coach',   page:'coach'   },
        { emoji:'🏆', label:'Défis',   page:'defis'   },
        { emoji:'📸', label:'Photos',  page:'photos'  },
        { emoji:'📱', label:'Réseaux', page:'social'  },
        { emoji:'📅', label:'Historique', page:'history'}
      ].map(a => `
        <button onclick="naviguer('${a.page}')"
                class="card"
                style="text-align:center;
                       cursor:pointer;
                       border:none;
                       padding:var(--space-md)
                       var(--space-sm)">
          <div style="font-size:1.5rem">
            ${a.emoji}
          </div>
          <div style="font-size:.68rem;
                      font-weight:600;
                      margin-top:4px;
                      color:var(--text-secondary)">
            ${a.label}
          </div>
        </button>`).join('')}
    </div>

    <!-- Humeur + Fatigue du jour -->
    ${_renderHumeurFatigue()}
  `;
}

function _renderHumeurFatigue() {
  let humeur  = null, fatigue = null;
  try { humeur  = Tracker.getHumeur();  } catch(e) {}
  try { fatigue = Tracker.getFatigue(); } catch(e) {}

  if (humeur && fatigue) return '';

  return `
    <div class="card mb-md">
      <div class="card-label">😊 Comment tu te sens ?</div>
      ${!humeur ? `
        <div style="margin-top:var(--space-sm)">
          <div style="font-size:.72rem;
                      color:var(--text-muted);
                      margin-bottom:6px">
            Humeur du jour
          </div>
          <div style="display:flex;gap:8px">
            ${['😒','😐','🙂','😊','🔥'].map(h => `
              <button onclick="App.setHumeur('${h}')"
                      style="flex:1;padding:8px;
                             font-size:1.2rem;
                             background:var(--bg-input);
                             border:1px solid var(--border-color);
                             border-radius:var(--radius-sm);
                             cursor:pointer">
                ${h}
              </button>`).join('')}
          </div>
        </div>` : ''}
      ${!fatigue ? `
        <div style="margin-top:var(--space-sm)">
          <div style="font-size:.72rem;
                      color:var(--text-muted);
                      margin-bottom:6px">
            Niveau de fatigue
          </div>
          <div style="display:flex;gap:6px">
            ${[
              { val:0, label:'Frais', color:'var(--fd-mint)' },
              { val:1, label:'OK',   color:'var(--fd-lemon)' },
              { val:2, label:'Mod.', color:'#ffa500' },
              { val:3, label:'Épuisé',color:'var(--fd-coral)' }
            ].map(f => `
              <button onclick="App.setFatigue(${f.val})"
                      style="flex:1;padding:6px 2px;
                             font-size:.68rem;font-weight:600;
                             background:${f.color}22;
                             color:${f.color};
                             border:1px solid ${f.color}44;
                             border-radius:var(--radius-sm);
                             cursor:pointer">
                ${f.label}
              </button>`).join('')}
          </div>
        </div>` : ''}
    </div>`;
}

// ════════════════════════════════════════════════════════════
// PAGE TRAINING
// ════════════════════════════════════════════════════════════
function _rendreTraining(container) {
  let infos    = { semaine:1, cycle:1, phase:{ nom:'Reprise', emoji:'🌱', couleur:'#8bf0bb', intensite:.65 } };
  let seances  = [];
  let planning = [];

  try { infos   = Programme.getInfosProgramme();          } catch(e) {}
  try { seances = Programme.getAllSeances();               } catch(e) {}
  try { planning= Programme.getSeancesSemaine();          } catch(e) {}

  container.innerHTML = `

    <!-- Infos programme -->
    <div class="card mb-md"
         style="background:linear-gradient(135deg,
                var(--fd-indigo) 0%, #7b2ff7 100%);
                border:none;color:white;
                text-align:center">
      <div style="font-size:2rem">
        ${infos.phase.emoji}
      </div>
      <div style="font-size:1.1rem;font-weight:800;
                  margin-top:4px">
        ${infos.phase.nom}
      </div>
      <div style="font-size:.78rem;opacity:.8;
                  margin-top:2px">
        Semaine ${infos.semaine}
        · Cycle ${infos.cycle}
        · ${Math.round(infos.phase.intensite*100)}% intensité
      </div>

      <!-- Barre cycle -->
      <div style="height:6px;
                  background:rgba(255,255,255,0.2);
                  border-radius:3px;
                  margin-top:var(--space-md);
                  overflow:hidden">
        <div style="height:100%;
                    background:var(--fd-lemon);
                    width:${infos.progression||0}%;
                    border-radius:3px">
        </div>
      </div>
      <div style="font-size:.65rem;opacity:.6;
                  margin-top:4px">
        ${infos.progression||0}% du cycle
      </div>
    </div>

    <!-- Planning semaine -->
    <div class="section-title">📅 Planning semaine</div>
    <div style="display:grid;
                grid-template-columns:repeat(7,1fr);
                gap:3px;margin-bottom:var(--space-md)">
      ${planning.map(jour => `
        <div style="text-align:center;
                    padding:var(--space-sm) 2px;
                    background:${jour.estAujourdhui
                      ? 'var(--fd-indigo)'
                      : jour.seance
                        ? 'rgba(75,75,249,0.15)'
                        : 'var(--bg-input)'};
                    border-radius:var(--radius-sm);
                    cursor:${jour.seance ? 'pointer':'default'}"
             ${jour.seance
               ? `onclick="naviguer('live',
                   { seanceId:'${jour.seance?.id}' })"`
               : ''}>
          <div style="font-size:.6rem;
                      color:${jour.estAujourdhui
                        ? 'white'
                        : 'var(--text-muted)'};
                      font-weight:${jour.estAujourdhui
                        ? '700':'400'}">
            ${jour.label}
          </div>
          <div style="font-size:.9rem;margin-top:2px">
            ${jour.seance
              ? jour.seance.emoji
              : jour.estRepos ? '😴' : '·'}
          </div>
        </div>`).join('')}
    </div>

    <!-- Séances disponibles -->
    <div class="section-title">🏋️ Séances</div>
    ${seances.map(s => _renderCarteSeanceTraining(s))
      .join('')}

    <!-- Supersets -->
    <div class="flex justify-between items-center mt-md mb-sm">
      <div class="section-title" style="margin:0">
        ⚡ Supersets
      </div>
      <button onclick="naviguer('supersets')"
              style="background:none;border:none;
                     font-size:.72rem;
                     color:var(--fd-indigo);
                     cursor:pointer;font-weight:600">
        Gérer →
      </button>
    </div>
    <div class="card"
         style="text-align:center;padding:var(--space-md)">
      <div style="font-size:1.5rem;margin-bottom:4px">⚡</div>
      <div style="font-size:.82rem;color:var(--text-muted)">
        Configure tes supersets pour maximiser ton efficacité
      </div>
      <button onclick="naviguer('supersets')"
              class="btn-secondary mt-md"
              style="font-size:.82rem">
        Voir les supersets
      </button>
    </div>
  `;
}

function _renderCarteSeanceTraining(seance) {
  const warmup    = window.WARMUP?.[seance.id];
  const supersets = Superset.getSupersets(seance.id);

  return `
    <div class="card mb-md">
      <div class="flex justify-between items-center mb-sm">
        <div>
          <div style="font-size:1rem;font-weight:700">
            ${seance.emoji} ${seance.nom}
          </div>
          <div style="font-size:.72rem;
                      color:var(--text-muted);
                      margin-top:2px">
            ~${seance.duree_estimee}min
            · ${seance.exercices?.length||0} exercices
            ${supersets.length > 0
              ? `· ${supersets.length} superset${supersets.length>1?'s':''}`
              : ''}
          </div>
        </div>
        <button onclick="naviguer('live',
                  { seanceId:'${seance.id}' })"
                class="btn-primary"
                style="font-size:.78rem;
                       padding:var(--space-sm)
                       var(--space-md)">
          ▶ Start
        </button>
      </div>

      <!-- Muscles chips -->
      <div style="display:flex;flex-wrap:wrap;gap:4px">
        ${(seance.muscles||[]).map(m => `
          <span class="chip chip-indigo"
                style="font-size:.62rem">
            ${m}
          </span>`).join('')}
      </div>

      <!-- Exercices preview -->
      <div style="margin-top:var(--space-sm);
                  font-size:.75rem;
                  color:var(--text-muted)">
        ${(seance.exercices||[]).slice(0, 4).map(ex => {
          const exo = (window.EXERCICES||{})[ex.ref]||{};
          return `${exo.emoji||'💪'} ${exo.nom||ex.ref}`;
        }).join(' · ')}
        ${(seance.exercices||[]).length > 4
          ? ` · +${(seance.exercices||[]).length - 4}`
          : ''}
      </div>
    </div>`;
}

// ════════════════════════════════════════════════════════════
// PAGE LIVE
// ════════════════════════════════════════════════════════════
function _rendreLive(container, options = {}) {
  const seanceId = options.seanceId
    || Programme.getSeanceduJour()?.id
    || null;

  if (!seanceId) {
    container.innerHTML = `
      <div class="card mt-md"
           style="text-align:center;
                  padding:var(--space-xl)">
        <div style="font-size:3rem">😴</div>
        <div style="font-size:1.1rem;font-weight:700;
                    margin-top:var(--space-md)">
          Jour de repos
        </div>
        <p style="color:var(--text-muted);
                  font-size:.88rem;
                  margin-top:var(--space-sm)">
          Aucune séance planifiée aujourd'hui.
        </p>
        <div style="display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:var(--space-sm);
                    margin-top:var(--space-lg)">
          <button onclick="naviguer('training')"
                  class="btn-secondary">
            📅 Voir le programme
          </button>
          <button onclick="naviguer('live',
                    { seanceId:'full_body' })"
                  class="btn-primary">
            ⚡ Séance express
          </button>
        </div>
      </div>`;
    return;
  }

  // Charger la séance complète
  let seanceComplete = null;
  try {
    seanceComplete = Programme.getSeanceComplete(seanceId);
  } catch(e) {}

  if (!seanceComplete) {
    container.innerHTML = `
      <div class="card mt-md"
           style="text-align:center">
        <p>Séance introuvable.</p>
        <button onclick="naviguer('training')"
                class="btn-secondary mt-md">
          ← Retour
        </button>
      </div>`;
    return;
  }

  // Vérifier séance déjà en cours
  const seanceEnCours = Utils.storage.get(
    `ft_seance_${seanceId}_${Utils.aujourd_hui()}`, null
  );

  container.innerHTML = `
    <div id="live-content">
      ${_renderLiveHeader(seanceComplete)}
      ${_renderWarmup(seanceComplete, seanceId)}
      ${_renderExercicesLive(seanceComplete, seanceId)}
      ${_renderEtirements(seanceComplete)}
    </div>`;
}

function _renderLiveHeader(seance) {
  let charge = null;
  try {
    charge = Predict.analyserFatigue();
  } catch(e) {}

  return `
    <div class="card mb-md"
         style="background:linear-gradient(135deg,
                rgba(75,75,249,0.15),
                rgba(139,240,187,0.05));
                border-color:var(--fd-indigo)">
      <div class="flex justify-between items-center">
        <div>
          <div style="font-size:1.2rem;font-weight:800">
            ${seance.emoji} ${seance.nom}
          </div>
          <div style="font-size:.75rem;
                      color:var(--text-muted);
                      margin-top:2px">
            ~${seance.duree_estimee}min
            · ${seance.exercices?.length||0} exos
          </div>
        </div>
        ${charge ? `
          <div style="text-align:center">
            <div style="font-size:1.2rem;font-weight:700;
                        color:${charge.recommandation.couleur}">
              ${charge.score}/100
            </div>
            <div style="font-size:.6rem;
                        color:var(--text-muted)">
              ${charge.recommandation.emoji} Forme
            </div>
          </div>` : ''}
      </div>
    </div>`;
}

function _renderWarmup(seance, seanceId) {
  const warmup = seance.warmup || [];
  if (!warmup.length) return '';

  return `
    <div class="card mb-md">
      <div class="card-label">🔥 Échauffement</div>
      ${warmup.map((w, i) => `
        <div style="display:flex;align-items:center;
                    gap:var(--space-md);
                    padding:var(--space-sm) 0;
                    border-bottom:1px solid
                    var(--border-color)">
          <div style="width:26px;height:26px;
                      border-radius:50%;
                      background:var(--fd-indigo-dim);
                      display:flex;align-items:center;
                      justify-content:center;
                      font-size:.72rem;font-weight:700;
                      color:var(--fd-indigo);
                      flex-shrink:0">
            ${i+1}
          </div>
          <div style="flex:1">
            <div style="font-size:.85rem;font-weight:600">
              ${w.nom}
            </div>
            <div style="font-size:.7rem;
                        color:var(--text-muted)">
              ${w.description}
            </div>
          </div>
          <div style="font-size:.75rem;
                      color:var(--fd-mint);
                      font-weight:600">
            ${Utils.formatDuree(w.duree)}
          </div>
        </div>`).join('')}
    </div>`;
}

function _renderExercicesLive(seance, seanceId) {
  const exos     = seance.exercicesDetails || [];
  const supersets = seance.supersets || [];

  return `
    <div class="card mb-md">
      <div class="flex justify-between items-center mb-md">
        <div class="card-label">
          🏋️ ${exos.length} exercices
        </div>
        ${supersets.length > 0 ? `
          <span class="chip chip-lavender"
                style="font-size:.65rem">
            ⚡ ${supersets.length} superset${supersets.length>1?'s':''}
          </span>` : ''}
      </div>

      <!-- Supersets si disponibles -->
      ${supersets.length > 0 ? `
        <div style="margin-bottom:var(--space-md)">
          <div style="font-size:.72rem;font-weight:700;
                      color:var(--fd-lavender);
                      margin-bottom:var(--space-sm)">
            ⚡ Supersets disponibles
          </div>
          ${supersets.map(ss => `
            <div style="display:flex;
                        justify-content:space-between;
                        align-items:center;
                        padding:var(--space-sm);
                        background:rgba(191,161,255,0.08);
                        border-radius:var(--radius-sm);
                        margin-bottom:4px">
              <div>
                <span style="font-size:.82rem;
                             font-weight:600;
                             color:var(--fd-lavender)">
                  ${ss.emoji} ${ss.nom}
                </span>
                <div style="font-size:.65rem;
                            color:var(--text-muted)">
                  ${ss.exercices?.length||0} exercices
                </div>
              </div>
              <button onclick="Superset.lancerUI(
                        '${ss.id}','${seanceId}')"
                      style="padding:4px 10px;
                             background:var(--fd-lavender);
                             color:#09092d;border:none;
                             border-radius:var(--radius-full);
                             font-size:.72rem;font-weight:700;
                             cursor:pointer">
                ▶ Lancer
              </button>
            </div>`).join('')}
        </div>` : ''}

      <!-- Liste exercices -->
      ${exos.map((ex, idx) => {
        const exo   = ex.details || {};
        const pr    = _getPRExo(ex.ref);
        const chargeReco = _getChargeReco(ex.ref);

        return `
          <div class="live-exo-card"
               id="live-exo-${idx}"
               style="padding:var(--space-md);
                      background:var(--bg-input);
                      border-radius:var(--radius-md);
                      margin-bottom:var(--space-sm);
                      border:1px solid var(--border-color)">

            <!-- Header exercice -->
            <div class="flex justify-between items-center mb-sm">
              <div>
                <div style="font-weight:700;font-size:.95rem">
                  ${exo.emoji||'💪'} ${exo.nom||ex.ref}
                </div>
                <div style="font-size:.68rem;
                            color:var(--fd-mint)">
                  ${exo.muscle||''}
                </div>
              </div>
              <div style="text-align:right">
                ${pr ? `
                  <div style="font-size:.72rem;
                              color:var(--fd-lemon);
                              font-weight:600">
                    🏆 ${pr.poids}kg×${pr.reps}
                  </div>` : ''}
                ${chargeReco ? `
                  <div style="font-size:.68rem;
                              color:var(--fd-indigo)">
                    💡 ${chargeReco.charge}kg
                    (${chargeReco.pourcentage}%)
                  </div>` : ''}
              </div>
            </div>

            <!-- Séries -->
            ${Array.from({length:ex.series}, (_,s) => `
              <div class="serie-row"
                   id="serie-${idx}-${s}"
                   style="display:grid;
                          grid-template-columns:
                            40px 1fr 1fr 50px auto;
                          gap:var(--space-xs);
                          align-items:center;
                          margin-bottom:4px">
                <div style="font-size:.75rem;
                            font-weight:700;
                            color:var(--text-muted);
                            text-align:center">
                  S${s+1}
                </div>
                <input type="number"
                       class="input"
                       id="poids-${idx}-${s}"
                       placeholder="${chargeReco?.charge||pr?.poids||0}"
                       value="${chargeReco?.charge||pr?.poids||''}"
                       step="2.5"
                       style="padding:6px;font-size:.82rem;
                              text-align:center" />
                <input type="number"
                       class="input"
                       id="reps-${idx}-${s}"
                       placeholder="${ex.reps?.split('-')[0]||10}"
                       style="padding:6px;font-size:.82rem;
                              text-align:center" />
                <input type="number"
                       class="input"
                       id="rpe-${idx}-${s}"
                       placeholder="RPE"
                       min="1" max="10"
                       style="padding:6px;font-size:.78rem;
                              text-align:center" />
                <button onclick="App.validerSerie(
                          '${seanceId}',
                          '${ex.ref}',
                          ${idx}, ${s})"
                        id="btn-serie-${idx}-${s}"
                        style="width:32px;height:32px;
                               border-radius:50%;
                               background:var(--bg-card);
                               border:2px solid var(--border-color);
                               font-size:.9rem;cursor:pointer;
                               display:flex;align-items:center;
                               justify-content:center">
                  ○
                </button>
              </div>`).join('')}

            <!-- Conseils -->
            ${exo.conseils?.length ? `
              <details style="margin-top:var(--space-xs)">
                <summary style="font-size:.68rem;
                                color:var(--text-muted);
                                cursor:pointer">
                  💡 Conseils techniques
                </summary>
                <div style="font-size:.72rem;
                            color:var(--text-muted);
                            margin-top:var(--space-xs);
                            padding-left:var(--space-sm)">
                  ${exo.conseils.map(c =>
                    `<div>• ${c}</div>`
                  ).join('')}
                </div>
              </details>` : ''}
          </div>`;
      }).join('')}

      <!-- Bouton terminer -->
      <button onclick="App.terminerSeance('${seanceId}')"
              class="btn-primary mt-md"
              style="width:100%;font-size:.9rem;
                     padding:var(--space-md)">
        🏁 Terminer la séance
      </button>

      <!-- Bouton arrêter -->
      <button onclick="App.arreterSeance('${seanceId}')"
              class="btn-secondary mt-sm"
              style="width:100%;font-size:.82rem;
                     color:var(--text-muted)">
        ✕ Arrêter
      </button>
    </div>`;
}

function _renderEtirements(seance) {
  const etirements = seance.etirements || [];
  if (!etirements.length) return '';

  return `
    <div class="card mb-md">
      <div class="card-label">🧘 Étirements</div>
      ${etirements.map((e, i) => `
        <div style="display:flex;align-items:center;
                    gap:var(--space-md);
                    padding:var(--space-sm) 0;
                    border-bottom:1px solid
                    var(--border-color)">
          <div style="font-size:1.2rem">
            ${e.gif||'🧘'}
          </div>
          <div style="flex:1">
            <div style="font-size:.85rem;font-weight:600">
              ${e.nom}
            </div>
          </div>
          <div style="font-size:.78rem;
                      color:var(--fd-mint);font-weight:600">
            ${Utils.formatDuree(e.duree)}
          </div>
        </div>`).join('')}
    </div>`;
}

function _getPRExo(ref) {
  try { return Tracker.getPR(ref); }
  catch(e) { return null; }
}

function _getChargeReco(ref) {
  try { return Predict.recommanderCharge(ref); }
  catch(e) { return null; }
}

// ════════════════════════════════════════════════════════════
// PAGE PROFIL
// ════════════════════════════════════════════════════════════
function _rendreProfil(container) {
  let profil = { nom:'Athlète', avatar:'💪', poids:80,
                 taille:175, objectif:'forme' };
  let xp     = { total:0, niveau:{ emoji:'💪', numero:1, nom:'Débutant' } };
  let streak = { count:0, max:0 };
  let total  = 0;
  let trophees = 0;

  try { profil  = Tracker.getProfil();                        } catch(e) {}
  try { xp      = Gamification.getXP();                      } catch(e) {}
  try { streak  = Tracker.getStreak();                        } catch(e) {}
  try { total   = Tracker.getTotalSeances();                  } catch(e) {}
  try { trophees= Gamification.getTrophees()
          .filter(t => t.debloquee).length;                   } catch(e) {}

  container.innerHTML = `

    <!-- Carte profil -->
    <div class="card mb-md"
         style="background:linear-gradient(135deg,
                var(--fd-indigo),#7b2ff7);
                border:none;color:white;
                text-align:center">
      <div style="font-size:3rem;margin-bottom:4px">
        ${profil.avatar||'💪'}
      </div>
      <div style="font-size:1.3rem;font-weight:800">
        ${profil.nom}
      </div>
      <div style="font-size:.82rem;opacity:.8;margin-top:4px">
        ${xp.niveau.emoji} ${xp.niveau.nom}
        · ${xp.total} XP
      </div>

      <div class="stats-grid mt-md"
           style="background:none">
        ${[
          { val:total,       label:'Séances'  },
          { val:streak.count,label:'Streak'   },
          { val:trophees,    label:'Trophées' }
        ].map(s => `
          <div>
            <div style="font-size:1.2rem;font-weight:800">
              ${s.val}
            </div>
            <div style="font-size:.65rem;opacity:.7">
              ${s.label}
            </div>
          </div>`).join('')}
      </div>
    </div>

    <!-- Sections profil -->
    ${[
      { id:'mon_profil', emoji:'👤', label:'Mon profil',   fn:'_renderMonProfil'  },
      { id:'journal',    emoji:'📔', label:'Journal',      fn:'Stats.renderJournal' },
      { id:'objectifs',  emoji:'🎯', label:'Objectifs',    fn:'Stats.renderObjectifs'},
      { id:'blessures',  emoji:'🩹', label:'Blessures',    fn:'Stats.renderBlessures'},
      { id:'coach',      emoji:'🤖', label:'Coach IA',     fn:'Coach.renderCoachTab'},
      { id:'defis',      emoji:'🏆', label:'Défis',        fn:'Defis.render'      },
      { id:'predict',    emoji:'📈', label:'Prédictions',  fn:'Predict.render'    },
      { id:'share',      emoji:'📤', label:'Partage',      fn:'Share.render'      },
      { id:'supersets',  emoji:'⚡', label:'Supersets',    fn:'Superset.render'   },
      { id:'social',     emoji:'📱', label:'Réseaux sociaux',fn:'Social.render'   },
      { id:'offline',    emoji:'📵', label:'Hors-ligne',   fn:'Offline.render'    },
      { id:'gamification',emoji:'⭐',label:'XP & Niveaux', fn:'Gamification.renderGamificationTab'},
      { id:'history',    emoji:'📅', label:'Historique',   fn:'History.render'    },
      { id:'photos',     emoji:'📸', label:'Photos',       fn:'Photos.render'     },
      { id:'settings',   emoji:'⚙️', label:'Paramètres',   fn:'_rendreSettings'   }
    ].map(s => `
      <div class="card mb-md"
           style="cursor:pointer"
           onclick="naviguer('${s.id}')">
        <div class="flex justify-between items-center">
          <div style="display:flex;align-items:center;
                      gap:var(--space-md)">
            <span style="font-size:1.3rem">
              ${s.emoji}
            </span>
            <span style="font-weight:600;font-size:.92rem">
              ${s.label}
            </span>
          </div>
          <span style="color:var(--text-muted);
                       font-size:.9rem">›</span>
        </div>
      </div>`).join('')}

    <!-- Déconnexion / Reset -->
    <div class="card mb-md"
         style="border-color:rgba(255,141,150,0.3)">
      <button onclick="UI.confirmerReset()"
              style="width:100%;background:none;border:none;
                     color:var(--fd-coral);font-size:.85rem;
                     font-weight:600;cursor:pointer;
                     padding:var(--space-sm)">
        🗑️ Réinitialiser toutes les données
      </button>
    </div>
  `;
}

// ════════════════════════════════════════════════════════════
// PAGE SETTINGS
// ════════════════════════════════════════════════════════════
function _rendreSettings(container) {
  let config = {};
  try { config = Notifications.getConfig(); } catch(e) {}

  container.innerHTML = `

    <!-- Langue -->
    <div id="settings-langue"></div>

    <!-- Notifications -->
    <div class="card mb-md">
      <div class="card-label">🔔 Notifications</div>
      ${[
        { cle:'rappelQuotidien', label:'Rappel quotidien' },
        { cle:'absence1j',       label:'Absence 1 jour'   },
        { cle:'streakDanger',    label:'Streak en danger' },
        { cle:'prProche',        label:'PR en vue'        },
        { cle:'semaineParf',     label:'Semaine parfaite' },
        { cle:'finSeance',       label:'Fin de séance'    },
        { cle:'decharge',        label:'Semaine décharge' }
      ].map(n => `
        <div class="score-row">
          <span class="score-row-label"
                style="font-size:.85rem">
            ${n.label}
          </span>
          <label class="toggle"
                 style="position:relative;
                        display:inline-block;
                        width:44px;height:24px">
            <input type="checkbox"
                   ${config[n.cle] ? 'checked':''}
                   onchange="Notifications.sauvegarderConfig(
                     {'${n.cle}': this.checked})"
                   style="opacity:0;width:0;height:0" />
            <span class="toggle-slider"></span>
          </label>
        </div>`).join('')}
      <button onclick="Notifications.tester()"
              class="btn-secondary mt-md"
              style="width:100%;font-size:.82rem">
        🔔 Tester les notifications
      </button>
    </div>

    <!-- Données -->
    <div class="card mb-md">
      <div class="card-label">💾 Données</div>
      <div style="display:grid;
                  grid-template-columns:1fr 1fr;
                  gap:var(--space-sm);
                  margin-top:var(--space-sm)">
        <button onclick="Utils.exporterJSON()"
                class="btn-secondary"
                style="font-size:.78rem">
          📤 Exporter JSON
        </button>
        <button onclick="Utils.importerJSON()"
                class="btn-secondary"
                style="font-size:.78rem">
          📥 Importer JSON
        </button>
      </div>
    </div>

    <!-- Objectif séances/semaine -->
    <div class="card mb-md">
      <div class="card-label">🎯 Objectif séances/semaine</div>
      <div style="margin-top:var(--space-md)">
        <div style="display:flex;gap:var(--space-sm);
                    justify-content:center">
          ${[2,3,4,5,6].map(n => {
            const current = Utils.storage.get(
              'ft_objectif_seances_semaine', 4
            );
            return `
              <button onclick="Utils.storage.set(
                        'ft_objectif_seances_semaine',${n});
                        naviguer('settings')"
                      style="width:44px;height:44px;
                             border-radius:50%;
                             font-weight:700;font-size:.9rem;
                             cursor:pointer;
                             background:${current===n
                               ? 'var(--fd-indigo)'
                               : 'var(--bg-input)'};
                             color:${current===n
                               ? 'white' : 'var(--text-muted)'};
                             border:2px solid ${current===n
                               ? 'var(--fd-indigo)'
                               : 'var(--border-color)'}">
                ${n}
              </button>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Hors-ligne -->
    <div id="offline-content"></div>

    <!-- Version -->
    <div style="text-align:center;font-size:.65rem;
                color:var(--text-muted);
                margin-top:var(--space-md)">
      PowerApp v3.0 · EverGPT<br>
      Build 2025
    </div>
  `;

  // Charger langue + offline
  try {
    i18n.renderSelecteur(
      document.getElementById('settings-langue')
    );
    Offline.render(
      document.getElementById('offline-content')
    );
  } catch(e) {}
}

// ════════════════════════════════════════════════════════════
// ACTIONS SÉANCE
// ════════════════════════════════════════════════════════════
const App = {

  // Valider une série
  validerSerie(seanceId, exoRef, exoIdx, serieIdx) {
    const poids = parseFloat(
      document.getElementById(`poids-${exoIdx}-${serieIdx}`)?.value
    );
    const reps  = parseInt(
      document.getElementById(`reps-${exoIdx}-${serieIdx}`)?.value
    );
    const rpe   = parseFloat(
      document.getElementById(`rpe-${exoIdx}-${serieIdx}`)?.value
    ) || null;

    if (!poids || !reps) {
      Utils.toast('Entre le poids et les reps !', 'error');
      return;
    }

    let result = { isPR:false };
    try {
      result = Tracker.sauvegarderSerie(
        seanceId, exoRef, serieIdx+1, reps, poids, rpe
      );
    } catch(e) {}

    // Marquer la série comme faite
    const btn = document.getElementById(
      `btn-serie-${exoIdx}-${serieIdx}`
    );
    if (btn) {
      btn.textContent = '✅';
      btn.style.background  = 'var(--fd-mint)';
      btn.style.borderColor = 'var(--fd-mint)';
    }

    // Timer repos
    try {
      const seanceInfo = (window.SEANCES_BASE||{})[seanceId];
      const exo = seanceInfo?.exercices?.[exoIdx];
      const reposDuree = exo?.repos || 75;
      timerRepos.demarrer(reposDuree);
    } catch(e) {}

    if (result.isPR) {
      try { timerRepos.jouerSon('pr'); } catch(e) {}
      try { Gamification.recompenser('PR_BATTU'); } catch(e) {}
      try {
        Notifications.notifierPR(exoRef, poids, reps);
      } catch(e) {}
      Utils.toast(
        `🏆 Nouveau record ! ${poids}kg × ${reps}`,
        'pr', 4000
      );
    } else {
      Utils.vibrerSuccess();
      Utils.toast(`✅ Série validée !`, 'success', 1500);
    }

    // XP série
    try {
      Gamification.recompenser('SEANCE_COMPLETE');
    } catch(e) {}

    // Offline queue si hors ligne
    try {
      if (!Offline.estEnLigne()) {
        Offline.ajouterAction('pr_battu', {
          exoRef, poids, reps, rpe,
          date: Utils.aujourd_hui()
        });
      }
    } catch(e) {}
  },

  // Terminer une séance complète
  async terminerSeance(seanceId) {
    try {
      // Stats finales
      const duree  = Tracker.getDureeSeance?.(seanceId) || 0;
      const volume = Tracker.getVolumeSemaine?.() || 0;
      const prs    = Tracker.getPRsSeance?.(seanceId) || 0;
      const seance = (window.SEANCES_BASE||{})[seanceId];
      const nom    = seance?.nom || 'Séance';

      // Marquer séance complète
      try {
        Tracker.terminerSeance(seanceId);
      } catch(e) {}

      // Gamification
      try {
        Gamification.recompenser('SEANCE_COMPLETE');
        Gamification.verifierTrophees();
      } catch(e) {}

      // Défis
      try {
        Defis.mettreAJourProgression();
      } catch(e) {}

      // Notification fin séance
      try {
        Notifications.notifierFinSeance(nom, duree, volume);
      } catch(e) {}

      // Vérifier semaine parfaite
      try {
        Notifications.verifierSemaineParf();
      } catch(e) {}

      // Vérifier décharge
      try {
        if (Programme.isDecharge?.()) {
          Notifications.notifierDecharge();
        }
      } catch(e) {}

      // Offline queue
      try {
        if (!Offline.estEnLigne()) {
          Offline.ajouterAction('seance_complete', {
            seanceId,
            date:   Utils.aujourd_hui(),
            duree, volume
          });
        }
      } catch(e) {}

      // Confetti + son
      Utils.confetti(3000);
      try { timerRepos.jouerSon('pr'); } catch(e) {}
      Utils.vibrer([200,100,200,100,400]);

      // Modal résumé
      _afficherResumSeance(seanceId, duree, volume, prs);

    } catch(e) {
      console.error('[App] Erreur terminer séance:', e);
      naviguer('home');
    }
  },

  // Arrêter en cours de route
  async arreterSeance(seanceId) {
    const ok = await Utils.confirmer(
      'Arrêter la séance ?',
      'Ta progression sera sauvegardée.'
    );
    if (!ok) return;

    try {
      Tracker.terminerSeance?.(seanceId);
    } catch(e) {}

    Utils.toast('Séance arrêtée.', 'info');
    naviguer('home');
  },

  // Humeur / Fatigue depuis home
  setHumeur(humeur) {
    try {
      Tracker.sauvegarderHumeur(humeur);
      Gamification.recompenser('HUMEUR');
      Utils.toast(`Humeur: ${humeur}`, 'success', 1500);
      naviguer('home');
    } catch(e) {}
  },

  setFatigue(niveau) {
    try {
      Tracker.sauvegarderFatigue(niveau);
      Utils.toast('Fatigue enregistrée.', 'success', 1500);
      naviguer('home');
    } catch(e) {}
  }
};

// ════════════════════════════════════════════════════════════
// RÉSUMÉ FIN DE SÉANCE
// ════════════════════════════════════════════════════════════
function _afficherResumSeance(seanceId, duree, volume, prs) {
  const modal   = document.getElementById('modal-info');
  const content = document.getElementById('modal-info-content');
  if (!modal || !content) {
    naviguer('home');
    return;
  }

  const seance = (window.SEANCES_BASE||{})[seanceId]
    || { nom:'Séance', emoji:'💪' };

  content.innerHTML = `
    <div style="text-align:center;
                padding:var(--space-md)">
      <div style="font-size:3rem;margin-bottom:4px">
        🏁
      </div>
      <div style="font-size:1.3rem;font-weight:800;
                  color:var(--fd-mint);
                  margin-bottom:var(--space-sm)">
        Séance terminée !
      </div>
      <div style="font-size:.88rem;
                  color:var(--text-muted);
                  margin-bottom:var(--space-lg)">
        ${seance.emoji} ${seance.nom}
      </div>

      <div class="stats-grid mb-md">
        ${[
          {
            label:'Volume',
            val:Utils.formatVolume(volume),
            color:'var(--fd-mint)'
          },
          {
            label:'Durée',
            val:Utils.formatDuree(duree),
            color:'var(--fd-indigo)'
          },
          {
            label:'Records',
            val:prs,
            color:'var(--fd-lemon)'
          }
        ].map(s => `
          <div class="stat-card">
            <span class="stat-value"
                  style="color:${s.color}">
              ${s.val}
            </span>
            <span class="stat-label">${s.label}</span>
          </div>`).join('')}
      </div>

      <!-- Actions post-séance -->
      <div style="display:grid;
                  grid-template-columns:1fr 1fr;
                  gap:var(--space-sm)">
        <button onclick="
            document.getElementById('modal-info')
              .classList.add('hidden');
            Social._ouvrirTemplate('semaine_story')"
                class="btn-secondary"
                style="font-size:.78rem">
          📱 Partager
        </button>
        <button onclick="
            document.getElementById('modal-info')
              .classList.add('hidden');
            naviguer('home')"
                class="btn-primary"
                style="font-size:.78rem">
          🏠 Accueil
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  document.getElementById('modal-info-close')
    .onclick = () => {
      modal.classList.add('hidden');
      naviguer('home');
    };
}

// ════════════════════════════════════════════════════════════
// UI HELPERS
// ════════════════════════════════════════════════════════════
const UI = {

  toggleMenu() {
    const menu = document.getElementById('app-menu');
    menu?.classList.toggle('hidden');
  },

  fermerMenu() {
    document.getElementById('app-menu')
      ?.classList.add('hidden');
  },

  async confirmerReset() {
    const ok = await Utils.confirmer(
      '⚠️ Réinitialiser ?',
      'Toutes tes données seront supprimées définitivement.'
    );
    if (!ok) return;

    localStorage.clear();
    Utils.toast('Données supprimées.', 'info');
    setTimeout(() => window.location.reload(), 1000);
  }
};

// ════════════════════════════════════════════════════════════
// PAGE NUTRITION (placeholder)
// ════════════════════════════════════════════════════════════
function _rendreNutrition(container) {
  let profil = { poids:80 };
  try { profil = Tracker.getProfil(); } catch(e) {}
  const prot = Math.round((profil.poids||80) * 2);
  const cal  = Math.round((profil.poids||80) * 35);
  const eau  = ((profil.poids||80) * 0.035).toFixed(1);

  container.innerHTML = `
    <div class="card mb-md"
         style="text-align:center;
                border-color:var(--fd-mint)">
      <div style="font-size:2rem">🥗</div>
      <div style="font-weight:700;font-size:1.1rem;
                  margin-top:var(--space-sm)">
        Recommandations nutrition
      </div>
      <div style="font-size:.75rem;
                  color:var(--text-muted);
                  margin-top:4px">
        Basé sur ton profil (${profil.poids||80}kg)
      </div>
    </div>

    ${[
      { emoji:'🥩', label:'Protéines',  val:`${prot}g/jour`,   color:'var(--fd-coral)' },
      { emoji:'🔥', label:'Calories',   val:`~${cal} kcal`,    color:'var(--fd-lemon)' },
      { emoji:'💧', label:'Eau',        val:`${eau}L/jour`,    color:'var(--fd-indigo)'},
      { emoji:'⏰', label:'Repas pré-séance', val:'2-3h avant',color:'var(--fd-mint)'  },
      { emoji:'🥛', label:'Post-séance',val:'Protéines+glucides 30min', color:'var(--fd-lavender)'}
    ].map(r => `
      <div class="card mb-md">
        <div class="flex justify-between items-center">
          <div style="display:flex;align-items:center;
                      gap:var(--space-md)">
            <span style="font-size:1.5rem">
              ${r.emoji}
            </span>
            <div>
              <div style="font-weight:600;
                          font-size:.88rem">
                ${r.label}
              </div>
            </div>
          </div>
          <div style="font-size:.92rem;font-weight:800;
                      color:${r.color}">
            ${r.val}
          </div>
        </div>
      </div>`).join('')}

    <div class="card"
         style="text-align:center;
                padding:var(--space-lg);
                opacity:.6">
      <div style="font-size:1.5rem">🚀</div>
      <div style="font-size:.82rem;
                  color:var(--text-muted);
                  margin-top:var(--space-sm)">
        Module Nutrition complet — Bientôt disponible
      </div>
    </div>
  `;
}

// ════════════════════════════════════════════════════════════
// INIT PRINCIPAL
// ════════════════════════════════════════════════════════════
async function init() {
  try {
    console.log('🚀 PowerApp v3.0 — Init...');

    // 1. i18n
    try { i18n.init(); } catch(e) {}

    // 2. Vérifier onboarding
    const profil = Utils.storage.get('ft_profil', null);
    if (!profil?.nom) {
      _afficherOnboarding();
      return;
    }

    // 3. Afficher l'app
    document.getElementById('splash-screen')
      .style.display = 'none';
    document.getElementById('app-wrapper')
      .style.display = 'flex';

    // 4. Inits modules
    try { Tracker.init?.();        } catch(e) {}
    try { Programme.getDateDebut(); } catch(e) {}

    // 5. Gamification
    try { Gamification.verifierTrophees(); } catch(e) {}

    // 6. Notifications
    try { await Notifications.init(); } catch(e) {}

    // 7. ✅ Offline + PWA
    try { Offline.init();        } catch(e) {}
    try { Offline.initInstall(); } catch(e) {}

    // 8. Vérification comeback
    try {
      const jours = Tracker.getJoursAbsence();
      if (jours >= 7) {
        Utils.storage.set('ft_comeback', true);
        Gamification.verifierTrophees();
      }
    } catch(e) {}

    // 9. Vérifier décharge auto
    try {
      if (Programme.isDecharge?.()) {
        setTimeout(() => {
          Notifications.notifierDecharge();
        }, 5000);
      }
    } catch(e) {}

    // 10. Sync offline queue si en ligne
    try {
      if (Offline.estEnLigne()
          && Offline._pendingQueue?.length > 0) {
        setTimeout(() => Offline.syncPendingQueue(), 4000);
      }
    } catch(e) {}

    // 11. Navigation initiale
    naviguer('home');

    // 12. XP header
    _updateHeaderXP();

    console.log('✅ PowerApp v3.0 — Prêt !');

  } catch(e) {
    console.error('[App] Erreur init:', e);
    // Afficher l'app quand même
    document.getElementById('splash-screen')
      ?.style.setProperty('display', 'none');
    document.getElementById('app-wrapper')
      ?.style.setProperty('display', 'flex');
    naviguer('home');
  }
}

// ════════════════════════════════════════════════════════════
// ONBOARDING
// ════════════════════════════════════════════════════════════
function _afficherOnboarding() {
  document.getElementById('splash-screen')
    .style.display = 'none';
  const ob = document.getElementById('onboarding-screen');
  ob.classList.remove('hidden');

  let etape = 1;
  const data = { nom:'', poids:null, taille:null, objectif:'forme', niveau:'intermediaire' };

  ob.innerHTML = _renderEtapeOnboarding(etape, data);
}

function _renderEtapeOnboarding(etape, data) {
  const etapes = [
    {
      titre:    'Bienvenue sur PowerApp ! 🏋️',
      sousTitre:'Ton coach fitness personnel',
      contenu: `
        <div style="margin-top:var(--space-lg)">
          <div class="input-label">Ton prénom *</div>
          <input class="input mb-md" id="ob-nom"
                 placeholder="ex: Alex"
                 value="${data.nom}"
                 autocomplete="given-name" />
          <div class="input-label">Ton poids (kg)</div>
          <input class="input mb-md" id="ob-poids"
                 type="number"
                 placeholder="ex: 80"
                 value="${data.poids||''}" />
          <div class="input-label">Ta taille (cm)</div>
          <input class="input" id="ob-taille"
                 type="number"
                 placeholder="ex: 178"
                 value="${data.taille||''}" />
        </div>`
    },
    {
      titre:    'Ton objectif 🎯',
      sousTitre:'Qu\'est-ce qui te motive ?',
      contenu: `
        <div style="display:grid;gap:var(--space-sm);
                    margin-top:var(--space-lg)">
          ${[
            { val:'prise_masse', label:'💪 Prise de masse' },
            { val:'perte_poids', label:'⬇️ Perte de poids' },
            { val:'seche',       label:'🔥 Sèche'          },
            { val:'force',       label:'🏋️ Force'           },
            { val:'endurance',   label:'🏃 Endurance'       },
            { val:'forme',       label:'✨ Forme générale'  }
          ].map(o => `
            <button onclick="_selectObj('${o.val}', this)"
                    class="btn-secondary ob-obj"
                    style="${data.objectif===o.val
                      ? 'border-color:var(--fd-indigo);'
                        + 'background:rgba(75,75,249,.15)'
                      : ''}">
              ${o.label}
            </button>`).join('')}
        </div>`
    },
    {
      titre:    'Ton niveau 📊',
      sousTitre:'Pour adapter ton programme',
      contenu: `
        <div style="display:grid;gap:var(--space-sm);
                    margin-top:var(--space-lg)">
          ${[
            { val:'debutant',      label:'🌱 Débutant',       desc:'< 6 mois'      },
            { val:'intermediaire', label:'💪 Intermédiaire',  desc:'6 mois — 2 ans'},
            { val:'avance',        label:'🔥 Avancé',         desc:'2 ans +'       }
          ].map(n => `
            <button onclick="_selectNiv('${n.val}', this)"
                    class="btn-secondary ob-niv"
                    style="text-align:left;
                           ${data.niveau===n.val
                             ? 'border-color:var(--fd-indigo);'
                               + 'background:rgba(75,75,249,.15)'
                             : ''}">
              <div style="font-weight:700">${n.label}</div>
              <div style="font-size:.72rem;
                          color:var(--text-muted)">
                ${n.desc}
              </div>
            </button>`).join('')}
        </div>`
    },
    {
      titre:    'C\'est parti ! 🚀',
      sousTitre:'Ton programme est prêt',
      contenu: `
        <div style="text-align:center;
                    padding:var(--space-xl) 0">
          <div style="font-size:4rem;
                      margin-bottom:var(--space-md)">
            ⚡
          </div>
          <div style="font-size:1.1rem;font-weight:700;
                      margin-bottom:var(--space-sm)">
            Prêt ${data.nom} !
          </div>
          <div style="font-size:.85rem;
                      color:var(--text-muted);
                      line-height:1.6">
            Ton programme personnalisé est configuré.<br>
            Commence ta première séance dès maintenant !
          </div>
        </div>`
    }
  ];

  const e = etapes[etape-1];

  return `
    <div style="max-width:480px;margin:0 auto;
                padding:var(--space-lg)">

      <!-- Progress dots -->
      <div style="display:flex;justify-content:center;
                  gap:8px;margin-bottom:var(--space-lg)">
        ${[1,2,3,4].map(i => `
          <div style="width:${etape===i ? 24:8}px;
                      height:8px;
                      border-radius:4px;
                      background:${etape===i
                        ? 'var(--fd-indigo)'
                        : 'var(--border-color)'};
                      transition:all .3s">
          </div>`).join('')}
      </div>

      <div style="font-size:1.3rem;font-weight:800;
                  margin-bottom:4px">
        ${e.titre}
      </div>
      <div style="font-size:.82rem;
                  color:var(--text-muted);
                  margin-bottom:var(--space-md)">
        ${e.sousTitre}
      </div>

      ${e.contenu}

      <div style="margin-top:var(--space-xl)">
        ${etape < 4 ? `
          <button onclick="_suivantOb(${etape})"
                  class="btn-primary"
                  style="width:100%;font-size:.9rem">
            Suivant →
          </button>` : `
          <button onclick="_terminerOb()"
                  class="btn-primary"
                  style="width:100%;font-size:.9rem">
            🚀 Commencer !
          </button>`}
        ${etape > 1 ? `
          <button onclick="_renderEtapeOb(${etape-1})"
                  class="btn-secondary mt-sm"
                  style="width:100%;font-size:.85rem">
            ← Retour
          </button>` : ''}
      </div>
    </div>`;
}

// Onboarding helpers
let _obData = {
  nom:'', poids:null, taille:null,
  objectif:'forme', niveau:'intermediaire'
};

function _selectObj(val, btn) {
  _obData.objectif = val;
  document.querySelectorAll('.ob-obj').forEach(b => {
    b.style.borderColor = '';
    b.style.background  = '';
  });
  btn.style.borderColor = 'var(--fd-indigo)';
  btn.style.background  = 'rgba(75,75,249,.15)';
}

function _selectNiv(val, btn) {
  _obData.niveau = val;
  document.querySelectorAll('.ob-niv').forEach(b => {
    b.style.borderColor = '';
    b.style.background  = '';
  });
  btn.style.borderColor = 'var(--fd-indigo)';
  btn.style.background  = 'rgba(75,75,249,.15)';
}

function _suivantOb(etapeActuelle) {
  if (etapeActuelle === 1) {
    const nom   = document.getElementById('ob-nom')?.value?.trim();
    const poids = parseFloat(document.getElementById('ob-poids')?.value);
    const taille = parseFloat(document.getElementById('ob-taille')?.value);
    if (!nom) { Utils.toast('Entre ton prénom !', 'error'); return; }
    _obData.nom    = nom;
    _obData.poids  = poids || null;
    _obData.taille = taille || null;
  }
  const ob = document.getElementById('onboarding-screen');
  ob.innerHTML = _renderEtapeOnboarding(etapeActuelle + 1, _obData);
}

function _renderEtapeOb(etape) {
  const ob = document.getElementById('onboarding-screen');
  ob.innerHTML = _renderEtapeOnboarding(etape, _obData);
}

function _terminerOb() {
  try {
    const profil = {
      nom:      _obData.nom || 'Athlète',
      poids:    _obData.poids,
      taille:   _obData.taille,
      objectif: _obData.objectif,
      niveau:   _obData.niveau,
      avatar:   '💪',
      dateDebut: Utils.aujourd_hui()
    };

    Utils.storage.set('ft_profil', profil);
    Programme.setDateDebut(Utils.aujourd_hui());
    Gamification.ajouterXP(200, 'Première séance');

    // Masquer onboarding
    document.getElementById('onboarding-screen')
      .classList.add('hidden');
    document.getElementById('app-wrapper')
      .style.display = 'flex';

    naviguer('home');
    Utils.toast(`Bienvenue ${profil.nom} ! 🎉`, 'success', 4000);
    Utils.confetti(2000);

  } catch(e) {
    console.error('[App] Erreur onboarding:', e);
    window.location.reload();
  }
}

// ════════════════════════════════════════════════════════════
// DÉMARRAGE
// ════════════════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  // Splash screen → 2 secondes minimum
  setTimeout(init, 800);
});

// Gestion du bouton retour
window.addEventListener('popstate', () => {
  retourArriere();
});

// Expositions globales
window.naviguer      = naviguer;
window.retourArriere = retourArriere;
window.App           = App;
window.UI            = UI;

console.log('✅ App.js v3.0 chargé');
