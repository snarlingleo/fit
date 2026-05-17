/* ============================================================
   FitTracker Pro — App.js v2.0
   Router SPA + Init + Pages complètes
   + Séance Express + Défis + Share + Predict + i18n
   + Dashboard amélioré + Apple Music
   ============================================================ */

// ─── ÉTAT GLOBAL ──────────────────────────────────────────────
const AppState = {
  pageCourante:   'home',
  seanceEnCours:  null,
  seanceChoisie:  null,
  exerciceIndex:  0,
  serieActuelle:  1,
  prsSeance:      [],
  thème:          'dark',
  installPrompt:  null,
  expressActif:   false,
  expressIndex:   0,
  expressSerieN:  1,
  expressDebut:   null
};

// ─── INITIALISATION ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🏋️ FitTracker Pro v2.0 — Démarrage');
  await initServiceWorker();
  await afficherSplash();

  // Init i18n en premier
  i18n.init();

  const profil = Tracker.getProfil();
  if (!profil.nom || profil.nom === 'Athlète') {
    afficherOnboarding();
  } else {
    lancerApp();
  }
});

// ─── SERVICE WORKER ───────────────────────────────────────────
async function initServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('./service-worker.js');
    console.log('✅ SW enregistré');

    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      nw.addEventListener('statechange', () => {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          document.getElementById('update-banner')
            ?.classList.remove('hidden');
        }
      });
    });

    document.getElementById('btn-update')
      ?.addEventListener('click', () => {
        reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      });
  } catch(e) {
    console.warn('SW Error:', e);
  }
}

// ─── SPLASH ───────────────────────────────────────────────────
function afficherSplash() {
  return new Promise(resolve => {
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) {
        splash.style.opacity    = '0';
        splash.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
          splash.classList.add('hidden');
          resolve();
        }, 500);
      } else resolve();
    }, 2000);
  });
}

// ─── ONBOARDING ───────────────────────────────────────────────
function afficherOnboarding() {
  document.getElementById('onboarding').classList.remove('hidden');
  document.getElementById('app-wrapper').classList.add('hidden');
  renderOnboardingStep(0);
}

function renderOnboardingStep(step) {
  const wrapper = document.getElementById('onboarding');
  const etapes  = [
    { emoji:'🏋️', titre: t('onboarding.bienvenue'),
      desc: t('onboarding.sous_titre'), action: t('onboarding.commencer') },
    { emoji:'👤', titre: t('onboarding.etape1'), desc:'',
      champ:{ id:'ob-nom', placeholder: t('onboarding.prenom'), type:'text' },
      action: t('onboarding.suivant') },
    { emoji:'⚖️', titre: t('onboarding.etape2'),
      desc:'Pour calculer tes stats et personnaliser ton programme.',
      champs:[
        { id:'ob-poids',  placeholder: t('onboarding.poids'),  type:'number' },
        { id:'ob-taille', placeholder: t('onboarding.taille'), type:'number' }
      ], action: t('onboarding.suivant') },
    { emoji:'🔔', titre:'Activer les rappels ?',
      desc:'Reçois des notifications si tu sautes une séance.',
      action:'Activer', actionAlt:'Plus tard' },
    { emoji:'🚀', titre: t('onboarding.etape4'),
      desc:'Ton programme commence aujourd\'hui. Allons-y !',
      action: t('onboarding.commencer') }
  ];

  const e = etapes[step];
  wrapper.innerHTML = `
    <div class="onboarding-step">
      <div class="onboarding-dots">
        ${etapes.map((_,i) => `
          <div class="dot ${i===step?'active':''}"></div>`).join('')}
      </div>
      <div class="onboarding-emoji">${e.emoji}</div>
      <h2>${e.titre}</h2>
      ${e.desc ? `<p>${e.desc}</p>` : ''}
      ${e.champ ? `
        <input class="input mt-lg" id="${e.champ.id}"
               type="${e.champ.type}"
               placeholder="${e.champ.placeholder}"
               autocomplete="off" />` : ''}
      ${e.champs ? `
        <div class="flex-col gap-sm mt-lg">
          ${e.champs.map(c => `
            <input class="input" id="${c.id}"
                   type="${c.type}"
                   placeholder="${c.placeholder}" />`).join('')}
        </div>` : ''}
      <div style="margin-top:var(--space-xl)">
        <button class="btn-primary"
                onclick="avancerOnboarding(${step})">
          ${e.action}
        </button>
        ${e.actionAlt ? `
          <button class="btn-secondary mt-md"
                  onclick="avancerOnboarding(${step}, true)">
            ${e.actionAlt}
          </button>` : ''}
      </div>
    </div>`;
}

async function avancerOnboarding(step, alt = false) {
  if (step === 1) {
    const nom = document.getElementById('ob-nom')?.value?.trim();
    if (!nom) { Utils.toast('Entre ton prénom !', 'error'); return; }
    Tracker.sauvegarderProfil({ nom });
  }
  if (step === 2) {
    const poids  = parseFloat(document.getElementById('ob-poids')?.value);
    const taille = parseFloat(document.getElementById('ob-taille')?.value);
    if (!poids || !taille) {
      Utils.toast('Remplis tes mesures !', 'error');
      return;
    }
    Tracker.sauvegarderProfil({ poids, taille });
    Tracker.ajouterMesure({ poids, taille });
  }
  if (step === 3 && !alt) {
    await Notifications.init();
  }
  if (step === 4) {
    Programme.setDateDebut(Utils.aujourd_hui());
    Gamification.recompenser('PREMIERE_SEANCE');
    Defis.genererDefis();
    document.getElementById('onboarding').classList.add('hidden');
    lancerApp();
    return;
  }
  renderOnboardingStep(step + 1);
}

// ─── LANCER L'APP ─────────────────────────────────────────────
function lancerApp() {
  document.getElementById('app-wrapper').classList.remove('hidden');

  initHeader();
  initNav();
  initInstallPrompt();
  initTheme();
  initExercicesCustom();
  Notifications.init();
  Utils.verifierBackupAuto();

  // Init nouveaux modules
  Defis.genererDefis();

  const stats = ExerciseGIF.statsCache();
  console.log(`[GIF] Cache: ${stats.cached}/${stats.total}`);
  if (stats.cached < stats.total) {
    setTimeout(() => {
      ExerciseGIF.prechargerTout((current, total) => {
        if (current === total) {
          Utils.toast(`✅ ${total} GIFs chargés !`, 'success', 2000);
        }
      });
    }, 3000);
  }

  const params = new URLSearchParams(window.location.search);
  const page   = params.get('page')   || 'home';
  const action = params.get('action');

  naviguer(action === 'start-session' ? 'training' : page);
  setTimeout(() => Gamification.verifierTrophees(), 2000);
  setTimeout(() => Defis.mettreAJourProgression(), 3000);
}

// ─── HEADER ───────────────────────────────────────────────────
function initHeader() {
  const infos = Programme.getInfosProgramme();
  const sub   = document.getElementById('header-phase');
  if (sub) sub.textContent = infos.label;
  document.getElementById('btn-theme')
    ?.addEventListener('click', toggleTheme);
  document.getElementById('btn-profile-quick')
    ?.addEventListener('click', () => naviguer('profile'));
}

// ─── NAVIGATION ───────────────────────────────────────────────
function initNav() {
  document.querySelectorAll('.nav-item, .nav-center-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page) naviguer(page);
    });
  });
}

function naviguer(page) {
  AppState.pageCourante = page;
  window._pageActive    = page;

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  const infos = Programme.getInfosProgramme();
  const sub   = document.getElementById('header-phase');
  if (sub) sub.textContent = infos.label;

  document.getElementById('page-content')?.scrollTo(0, 0);

  switch(page) {
    case 'home':      renderAccueil();              break;
    case 'training':  renderTraining();             break;
    case 'live':      renderLive();                 break;
    case 'nutrition': Nutrition.render();           break;
    case 'stats':     Stats.render(null,'dashboard'); break;
    case 'profile':   renderProfil();              break;
    case 'express':   renderExpress();             break;
    case 'defis':     renderPageDefis();           break;
    case 'share':     renderPageShare();           break;
    case 'predict':   renderPagePredict();         break;
    default:          renderAccueil();
  }
}

// ─── THÈME ────────────────────────────────────────────────────
function initTheme() {
  appliquerTheme(Utils.storage.get('ft_theme', 'dark'));
}

function toggleTheme() {
  const themes = ['dark', 'light', 'indigo', 'midnight'];
  const actuel = document.documentElement.getAttribute('data-theme');
  const idx    = themes.indexOf(actuel);
  const nouveau = themes[(idx + 1) % themes.length];
  appliquerTheme(nouveau);
}

function appliquerTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  Utils.storage.set('ft_theme', theme);

  document.querySelectorAll('.theme-btn').forEach(btn => {
    const isActif = btn.dataset.theme === theme;
    btn.style.border     = `2px solid ${isActif
      ? 'var(--fd-indigo)' : 'var(--border-color)'}`;
    btn.style.background = isActif
      ? 'var(--fd-indigo-dim)' : 'var(--bg-card)';
  });
}

// ─── INSTALL PROMPT ───────────────────────────────────────────
function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    AppState.installPrompt = e;
    document.getElementById('install-prompt')
      ?.classList.remove('hidden');
  });

  document.getElementById('btn-install')
    ?.addEventListener('click', async () => {
      if (!AppState.installPrompt) return;
      AppState.installPrompt.prompt();
      const result = await AppState.installPrompt.userChoice;
      if (result.outcome === 'accepted')
        Utils.toast('App installée ! 🎉', 'success');
      document.getElementById('install-prompt')
        ?.classList.add('hidden');
    });

  document.getElementById('btn-install-dismiss')
    ?.addEventListener('click', () => {
      document.getElementById('install-prompt')
        ?.classList.add('hidden');
    });
}

// ════════════════════════════════════════════════════════════
// PAGE ACCUEIL — Dashboard amélioré
// ════════════════════════════════════════════════════════════
function renderAccueil() {
  const container = document.getElementById('page-content');
  if (!container) return;

  // ── Données sécurisées
  let profil   = {};
  let infos    = { label:'S1', cycle:1, semaine:1, progression:0,
                   phase:{ nom:'Reprise', emoji:'🌱', numero:1 } };
  let seance   = null;
  let streak   = { count:0, max:0 };
  let score    = { score:50, niveau:'Correct' };
  let humeur   = null;
  let fatigue  = null;
  let coach    = { emoji:'💪', message:'Prêt pour la séance ?' };
  let seanceDJ = 0;
  let objectif = 4;
  let heatmap  = {};
  let analyse  = {
    fatigue: { recommandation: { message:'', emoji:'🟢', couleur:'var(--fd-mint)' } },
    opportunitePR: null
  };
  let defis    = [];
  let playlist = { emoji:'🎵', nom:'Workout', genre:'Mix', description:'', url:'#' };
  let volume   = 0;
  let comp     = { delta: 0 };

  try { profil   = Tracker.getProfil();                   } catch(e) { console.warn('profil',e); }
  try { infos    = Programme.getInfosProgramme();         } catch(e) { console.warn('infos',e); }
  try { seance   = Programme.getProchaineSeance();        } catch(e) { console.warn('seance',e); }
  try { streak   = Tracker.getStreak();                   } catch(e) {}
  try { score    = Tracker.calculerScoreForme();          } catch(e) {}
  try { humeur   = Tracker.getHumeur();                   } catch(e) {}
  try { fatigue  = Tracker.getFatigue();                  } catch(e) {}
  try { coach    = Coach.getMessageDuJour();              } catch(e) {}
  try { seanceDJ = Tracker.getSeancesParSemaine();        } catch(e) {}
  try { objectif = Utils.storage.get('ft_objectif_seances_semaine', 4); } catch(e) {}
  try { heatmap  = Tracker.getHeatmapData(7);            } catch(e) {}
  try { analyse  = Predict.getAnalyseGlobale();          } catch(e) {}
  try { defis    = Defis.mettreAJourProgression() || []; } catch(e) {}
  try { playlist = Share.getPlaylistDuJour();            } catch(e) {}
  try { volume   = Tracker.getVolumeSemaine();           } catch(e) {}
  try { comp     = Stats.getComparaisonSemaines?.() || { delta:0 }; } catch(e) {}

  const defisOk = defis.filter(d => d.complete).length;

  container.innerHTML = `

    <!-- Hero Dashboard -->
    <div class="dashboard-hero mb-md">
      <div class="dashboard-greeting">
        ${Utils.salutation()}, ${profil.nom || 'Athlète'} ${profil.avatar || '💪'}
      </div>
      <div class="dashboard-sub">
        ${infos.label} · Cycle ${infos.cycle}
        · ${infos.phase?.emoji || '🌱'} ${infos.phase?.nom || 'Reprise'}
      </div>

      <div class="dashboard-score">
        <div class="score-ring">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="30"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    stroke-width="6"/>
            <circle cx="36" cy="36" r="30"
                    fill="none"
                    stroke="${score.score >= 80
                      ? 'var(--fd-mint)'
                      : score.score >= 60
                        ? 'var(--fd-lemon)'
                        : 'var(--fd-coral)'}"
                    stroke-width="6"
                    stroke-linecap="round"
                    stroke-dasharray="${2*Math.PI*30}"
                    stroke-dashoffset="${2*Math.PI*30*(1-(score.score||50)/100)}"
                    transform="rotate(-90 36 36)"/>
          </svg>
          <div class="score-ring-text">${score.score || 50}</div>
        </div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:.95rem">
            ${score.niveau || 'En forme'}
          </div>
          <div style="font-size:.72rem;opacity:.7;margin-top:2px">
            ${analyse?.fatigue?.recommandation?.message || ''}
          </div>
          <div style="font-size:.72rem;opacity:.6;margin-top:4px">
            Streak ${streak.count}🔥 · Record ${streak.max}
          </div>
        </div>
      </div>

      <!-- Mini heatmap -->
      <div style="margin-top:var(--space-md)">
        <div style="font-size:.65rem;opacity:.6;
                    margin-bottom:6px;text-transform:uppercase;
                    letter-spacing:.06em">
          Cette semaine
        </div>
        <div class="mini-heatmap">
          ${['L','M','M','J','V','S','D'].map((j, i) => {
            let date  = '';
            let etat  = 'none';
            let isToday = false;
            try {
              date    = Utils.ajouterJours(Utils.debutSemaine(Utils.aujourd_hui()), i);
              etat    = heatmap[date] || 'none';
              isToday = date === Utils.aujourd_hui();
            } catch(e) {}
            return `
              <div style="text-align:center">
                <div style="font-size:.6rem;opacity:.5;margin-bottom:3px">${j}</div>
                <div class="mini-heatmap-cell ${etat} ${isToday?'today':''}"></div>
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="home-quick-actions mb-md">
      ${[
        { icon:'⚡', label:'Express',  action:"naviguer('express')"  },
        { icon:'📊', label:'Stats',    action:"naviguer('stats')"    },
        { icon:'🏆', label:'Défis',    action:"naviguer('defis')"    },
        { icon:'🔮', label:'Predict',  action:"naviguer('predict')"  },
        { icon:'📸', label:'Partager', action:"naviguer('share')"    },
        { icon:'🎵', label:'Musique',  action:"ouvrirPlaylist()"     }
      ].map(a => `
        <button class="quick-action-btn" onclick="${a.action}">
          <span class="quick-action-icon">${a.icon}</span>
          <span class="quick-action-label">${a.label}</span>
        </button>`).join('')}
    </div>

    <!-- Widgets -->
    <div class="widget-grid mb-md">
      <div class="widget-card ${seanceDJ >= objectif ? 'highlight' : ''}">
        <div class="widget-icon">📅</div>
        <div class="widget-value">${seanceDJ}/${objectif}</div>
        <div class="widget-label">Séances</div>
        <div class="widget-trend ${seanceDJ >= objectif ? 'up' : 'flat'}">
          ${seanceDJ >= objectif
            ? '✅ Objectif !'
            : `${objectif-seanceDJ} restante${objectif-seanceDJ>1?'s':''}`}
        </div>
      </div>
      <div class="widget-card">
        <div class="widget-icon">🏋️</div>
        <div class="widget-value">${Utils.formatVolume(volume)}</div>
        <div class="widget-label">Volume</div>
        <div class="widget-trend ${(comp.delta||0) >= 0 ? 'up' : 'down'}">
          ${(comp.delta||0) >= 0 ? '+' : ''}${comp.delta||0}% vs S-1
        </div>
      </div>
      <div class="widget-card">
        <div class="widget-icon">🏆</div>
        <div class="widget-value">
          ${(() => { try { return Object.keys(Tracker.getAllPRs()).length; } catch(e) { return 0; } })()}
        </div>
        <div class="widget-label">Records</div>
        <div class="widget-trend flat">PRs totaux</div>
      </div>
      <div class="widget-card">
        <div class="widget-icon">🎯</div>
        <div class="widget-value">${defisOk}/${defis.length || 0}</div>
        <div class="widget-label">Défis</div>
        <div class="widget-trend ${defisOk > 0 && defisOk === defis.length ? 'up' : 'flat'}">
          ${defisOk > 0 && defisOk === defis.length
            ? '🏆 Complet !'
            : `${(defis.length||0) - defisOk} en cours`}
        </div>
      </div>
    </div>

    <!-- Séance du jour -->
    ${seance ? `
      <div class="next-seance-card mb-md"
           onclick="ouvrirSeance('${seance.id}')">
        <div style="font-size:.65rem;font-weight:700;
                    letter-spacing:.08em;text-transform:uppercase;
                    color:var(--fd-indigo);margin-bottom:6px">
          ${(seance.dansJours||0) === 0
            ? '⚡ Séance du jour'
            : `📅 Dans ${seance.dansJours} jour${seance.dansJours>1?'s':''}`}
        </div>
        <div style="font-size:1.1rem;font-weight:700">
          ${seance.emoji || '💪'} ${seance.nom}
        </div>
        <div style="font-size:.75rem;color:var(--text-muted);margin-top:4px">
          ${seance.exercices?.length || 0} exercices · ~${seance.duree_estimee}min
        </div>
        <div style="margin-top:var(--space-sm)">
          <div class="progress-bar">
            <div class="progress-fill"
                 style="width:${infos.progression||0}%"></div>
          </div>
        </div>
      </div>` : `
      <div class="card mb-md" style="text-align:center">
        <div style="font-size:1.5rem;margin-bottom:4px">😴</div>
        <div style="font-size:.88rem;color:var(--text-muted)">
          Bon repos aujourd'hui !
        </div>
      </div>`}

    <!-- Humeur -->
    <div class="card mb-md">
      <div class="card-label">😊 Humeur du jour</div>
      <div class="humeur-grid mt-md">
        ${['🔥','😊','😐','😒','😤'].map(h => `
          <button class="humeur-btn ${humeur?.humeur===h?'selected':''}"
                  onclick="selectionnerHumeur('${h}')">
            ${h}
          </button>`).join('')}
      </div>
    </div>

    <!-- Fatigue -->
    <div class="card mb-md">
      <div class="card-label">🌡️ Niveau de fatigue</div>
      <div class="flex gap-sm mt-md">
        ${[
          { val:0, label:'Frais',  color:'var(--fd-mint)'       },
          { val:1, label:'OK',     color:'var(--fd-lemon)'      },
          { val:2, label:'Modéré', color:'var(--fd-coral)'      },
          { val:3, label:'Épuisé', color:'rgba(255,141,150,.6)' }
        ].map(f => `
          <button onclick="selectionnerFatigue(${f.val})"
                  style="flex:1;padding:var(--space-sm) 4px;
                         border-radius:var(--radius-md);
                         border:2px solid ${fatigue?.niveau===f.val
                           ? f.color:'var(--border-color)'};
                         background:${fatigue?.niveau===f.val
                           ? f.color+'22':'var(--bg-card)'};
                         color:${fatigue?.niveau===f.val
                           ? f.color:'var(--text-muted)'};
                         font-size:.72rem;font-weight:600;cursor:pointer">
            ${f.label}
          </button>`).join('')}
      </div>
    </div>

    <!-- Apple Music -->
    <div class="apple-music-card mb-md"
         onclick="ouvrirPlaylist()" style="cursor:pointer">
      <div style="display:flex;align-items:center;gap:var(--space-md)">
        <div style="font-size:2rem">${playlist.emoji}</div>
        <div style="flex:1">
          <div style="font-size:.65rem;color:#ff3b30;font-weight:700;
                      text-transform:uppercase;letter-spacing:.06em">
            🎵 Apple Music
          </div>
          <div style="font-weight:700;font-size:.9rem">${playlist.nom}</div>
          <div style="font-size:.72rem;color:var(--text-muted)">${playlist.genre}</div>
        </div>
        <div style="color:#ff3b30;font-weight:700">→</div>
      </div>
    </div>

    <!-- Coach -->
    <div class="coach-tip-card mb-md">
      <div class="flex items-center gap-md mb-sm">
        <div class="coach-tip-avatar">🤖</div>
        <div style="font-size:.75rem;font-weight:700;color:var(--fd-lavender)">
          Coach du jour
        </div>
      </div>
      <p style="font-size:.85rem;color:var(--text-secondary);line-height:1.5">
        ${coach.message || ''}
      </p>
    </div>

    <!-- Défis aperçu -->
    ${defis.length > 0 ? `
      <div class="card mb-md" onclick="naviguer('defis')"
           style="cursor:pointer">
        <div class="flex justify-between items-center">
          <div class="card-label">🏆 Défis semaine</div>
          <span class="chip chip-lemon">${defisOk}/${defis.length}</span>
        </div>
        <div class="progress-bar mt-md">
          <div class="progress-fill"
               style="width:${Math.round((defisOk/Math.max(defis.length,1))*100)}%;
                      background:var(--fd-lemon)">
          </div>
        </div>
      </div>` : ''}

    <!-- Warm-up -->
    <div class="card mb-md" onclick="naviguer('training')"
         style="cursor:pointer">
      <div class="flex justify-between items-center">
        <div>
          <div class="card-label">🌡️ Warm-up suggéré</div>
          <div style="font-size:.88rem;color:var(--text-primary);margin-top:4px">
            ${(() => { try { return Coach.getWarmupDuJour()?.[0]?.nom || '5 min · Cardio léger'; } catch(e) { return '5 min · Cardio léger'; } })()}
          </div>
        </div>
        <span style="color:var(--fd-indigo);font-size:1.2rem">→</span>
      </div>
    </div>
  `;
}

  requestAnimationFrame(() => {
    const canvas = document.getElementById('anneau-semaine');
    if (canvas) {
      Utils.graphiques.anneau(canvas, seanceDJ, objectif, '#4b4bf9');
    }
  });
}

function selectionnerHumeur(h) {
  Tracker.sauvegarderHumeur(h);
  Gamification.ajouterXP(10, 'humeur du jour');
  Utils.vibrerBeep();
  renderAccueil();
}

function selectionnerFatigue(niveau) {
  Tracker.sauvegarderFatigue(niveau);
  Utils.vibrerBeep();
  renderAccueil();
}

function ouvrirPlaylist() {
  const playlist = Share.getPlaylistDuJour();
  window.open(playlist.url, '_blank');
}

// ════════════════════════════════════════════════════════════
// PAGE EXPRESS — Séance 30 minutes
// ════════════════════════════════════════════════════════════
function renderExpress() {
  const container  = document.getElementById('page-content');
  const seance     = Programme.getSeanceduJour();
  const fatigue    = Predict.analyserFatigue();

  // Sélectionner 5 exercices express selon fatigue
  const exercices = _selectionnerExercicesExpress(seance, fatigue);

  container.innerHTML = `

    <!-- Header -->
    <div class="express-header">
      <div class="flex justify-between items-center">
        <button class="btn-icon"
                onclick="naviguer('home')">←</button>
        <div style="text-align:center">
          <div style="font-weight:700">⚡ Séance Express</div>
          <div style="font-size:.72rem;color:var(--text-muted)">
            ~30 minutes · ${exercices.length} exercices
          </div>
        </div>
        <div style="font-size:.82rem;font-weight:700;
                    color:var(--fd-lemon)"
             id="express-chrono">30:00</div>
      </div>

      <!-- Steps -->
      <div class="express-steps mt-md">
        ${exercices.map((_, i) => `
          <div class="express-step" id="step-${i}"></div>`).join('')}
      </div>
    </div>

    <!-- État forme -->
    <div class="card mb-md"
         style="background:${fatigue.recommandation.couleur}11;
                border-color:${fatigue.recommandation.couleur}44">
      <div class="flex items-center gap-md">
        <div style="font-size:1.5rem">
          ${fatigue.recommandation.emoji}
        </div>
        <div>
          <div style="font-size:.82rem;font-weight:700;
                      color:${fatigue.recommandation.couleur}">
            ${fatigue.recommandation.message}
          </div>
          <div style="font-size:.7rem;color:var(--text-muted)">
            Score forme : ${fatigue.score}/100
          </div>
        </div>
      </div>
    </div>

    <!-- Liste exercices -->
    ${exercices.map((exo, i) => {
      const ex  = window.EXERCICES?.[exo.ref] || {};
      const pr  = Tracker.getPR(exo.ref);
      const reco = Predict.recommanderCharge(exo.ref);
      const chargeReco = reco?.charge || (pr?.poids || '?');

      return `
        <div class="express-exo-card" id="express-exo-${i}">
          <div class="flex items-center gap-md">
            <div style="width:44px;height:44px;
                        border-radius:50%;
                        background:var(--bg-input);
                        display:flex;align-items:center;
                        justify-content:center;
                        font-size:1.3rem;flex-shrink:0">
              ${ex.emoji || '💪'}
            </div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:.92rem">
                ${i+1}. ${ex.nom || exo.ref}
              </div>
              <div style="font-size:.72rem;
                          color:var(--fd-mint)">
                ${ex.muscle || ''}
              </div>
              <div style="font-size:.72rem;
                          color:var(--text-muted);
                          margin-top:2px">
                ${exo.series} × ${exo.reps}
                · Repos ${exo.repos}s
              </div>
            </div>
            <div style="text-align:right">
              <div style="font-size:1rem;font-weight:800;
                          color:var(--fd-indigo)">
                ${chargeReco}kg
              </div>
              <div style="font-size:.62rem;
                          color:var(--text-muted)">
                recommandé
              </div>
              ${pr ? `
                <div style="font-size:.6rem;
                            color:var(--fd-lemon)">
                  PR: ${pr.poids}kg
                </div>` : ''}
            </div>
          </div>
        </div>`;
    }).join('')}

    <!-- Bouton démarrer -->
    <button class="btn-primary"
            onclick="demarrerExpress(${JSON.stringify(exercices).replace(/"/g,"'")})"
            style="position:sticky;
                   bottom:calc(var(--nav-height) + var(--space-md));
                   width:100%;margin-top:var(--space-md);
                   box-shadow:0 8px 32px rgba(75,75,249,0.4)">
      ⚡ Démarrer la séance express
    </button>
  `;
}

function _selectionnerExercicesExpress(seance, fatigue) {
  // Si séance du jour dispo → utiliser ses exercices
  if (seance?.exercices?.length >= 4) {
    const intensiteAjust = fatigue.score < 50 ? 0.8 : 1;
    return seance.exercices.slice(0, 5).map(ex => ({
      ...ex,
      repos: Math.round((ex.repos || 90) * intensiteAjust)
    }));
  }

  // Sinon → Full Body express
  const expressDefaut = [
    { ref:'bench_press',     series:3, reps:'10',  repos:60 },
    { ref:'lat_pulldown',    series:3, reps:'12',  repos:60 },
    { ref:'squat',           series:3, reps:'10',  repos:75 },
    { ref:'dev_militaire',   series:3, reps:'10',  repos:60 },
    { ref:'planche',         series:3, reps:'45s', repos:45 }
  ];

  return expressDefaut;
}

function demarrerExpress(exercices) {
  if (typeof exercices === 'string') {
    try { exercices = JSON.parse(exercices.replace(/'/g,'"')); }
    catch(e) { return; }
  }

  AppState.expressActif  = true;
  AppState.expressIndex  = 0;
  AppState.expressSerieN = 1;
  AppState.expressDebut  = Date.now();

  // Démarrer le chrono global
  chronoSeance.demarrer(elapsed => {
    const el    = document.getElementById('express-chrono');
    const reste = Math.max(0, 30*60 - elapsed);
    if (el) el.textContent = Utils.formatDureeMin(reste);
    if (reste <= 0 && AppState.expressActif) {
      terminerExpress(exercices, elapsed);
    }
  });

  Tracker.demarrerSeance('express_' + Utils.aujourd_hui());
  renderExpressExercice(exercices);
}

function renderExpressExercice(exercices) {
  const container = document.getElementById('page-content');
  const idx       = AppState.expressIndex;
  const exo       = exercices[idx];
  const ex        = window.EXERCICES?.[exo?.ref] || {};
  const pr        = Tracker.getPR(exo?.ref);
  const derniere  = Tracker.getDernierePerf('express_' + Utils.aujourd_hui(), exo?.ref);
  const elapsed   = Math.floor((Date.now() - AppState.expressDebut) / 1000);
  const reste     = Math.max(0, 30*60 - elapsed);

  container.innerHTML = `

    <!-- Header express -->
    <div class="express-header">
      <div class="flex justify-between items-center">
        <button class="btn-secondary btn-sm"
                onclick="arreterExpress(${JSON.stringify(exercices).replace(/"/g,"'")})">
          ✕
        </button>
        <div style="text-align:center">
          <div style="font-weight:700">
            ${idx+1}/${exercices.length} · ${ex.emoji || '💪'} ${ex.nom || exo?.ref}
          </div>
          <div style="font-size:.72rem;color:var(--text-muted)">
            Série ${AppState.expressSerieN}/${exo?.series || 3}
          </div>
        </div>
        <div style="font-size:.9rem;font-weight:800;
                    color:${reste < 300
                      ? 'var(--fd-coral)'
                      : 'var(--fd-lemon)'}"
             id="express-chrono">
          ${Utils.formatDureeMin(reste)}
        </div>
      </div>

      <!-- Steps -->
      <div class="express-steps mt-sm">
        ${exercices.map((_, i) => `
          <div class="express-step
               ${i < idx ? 'done' : i === idx ? 'active' : ''}">
          </div>`).join('')}
      </div>
    </div>

    <!-- Exercice actuel -->
    <div style="padding:var(--space-md)">

      <!-- Info exercice -->
      <div class="card mb-md"
           style="text-align:center">
        <div style="font-size:4rem;margin-bottom:8px">
          ${ex.emoji || '💪'}
        </div>
        <div style="font-weight:700;font-size:1.2rem">
          ${ex.nom || exo?.ref}
        </div>
        <div style="font-size:.78rem;color:var(--fd-mint);
                    margin-top:4px">
          ${ex.muscle || ''}
          · ${exo?.series} × ${exo?.reps}
        </div>
        ${pr ? `
          <div style="font-size:.72rem;color:var(--fd-lemon);
                      margin-top:4px">
            🏆 PR: ${pr.poids}kg × ${pr.reps}
          </div>` : ''}
        ${derniere ? `
          <div style="font-size:.7rem;color:var(--text-muted);
                      margin-top:2px">
            Dernière fois: ${derniere.poids}kg × ${derniere.reps}
          </div>` : ''}
      </div>

      <!-- Série indicators -->
      <div style="display:flex;justify-content:center;
                  gap:var(--space-sm);margin-bottom:var(--space-md)">
        ${Array.from({length: exo?.series || 3}, (_, i) => `
          <div style="width:36px;height:36px;border-radius:50%;
                      border:2px solid ${i+1 < AppState.expressSerieN
                        ? 'var(--fd-mint)'
                        : i+1 === AppState.expressSerieN
                          ? 'var(--fd-indigo)'
                          : 'var(--border-color)'};
                      background:${i+1 < AppState.expressSerieN
                        ? 'var(--fd-mint)'
                        : i+1 === AppState.expressSerieN
                          ? 'rgba(75,75,249,0.2)'
                          : 'transparent'};
                      display:flex;align-items:center;
                      justify-content:center;
                      font-size:.8rem;font-weight:700;
                      color:${i+1 <= AppState.expressSerieN
                        ? 'white' : 'var(--text-muted)'}">
            ${i+1 < AppState.expressSerieN ? '✓' : i+1}
          </div>`).join('')}
      </div>

      <!-- Inputs poids + reps -->
      <div class="express-set-input">
        <div class="express-input-group">
          <div class="express-input-label">Poids (kg)</div>
          <input class="express-input-val"
                 id="exp-poids" type="number"
                 value="${derniere?.poids || pr?.poids || ''}"
                 placeholder="0" step="2.5" />
          <div class="express-controls">
            <button class="express-adjust-btn"
                    onclick="ajusterExpressVal('exp-poids',-2.5)">
              -
            </button>
            <button class="express-adjust-btn"
                    onclick="ajusterExpressVal('exp-poids',2.5)">
              +
            </button>
          </div>
        </div>
        <div class="express-input-group">
          <div class="express-input-label">Reps</div>
          <input class="express-input-val"
                 id="exp-reps" type="number"
                 value="${derniere?.reps || ''}"
                 placeholder="0" />
          <div class="express-controls">
            <button class="express-adjust-btn"
                    onclick="ajusterExpressVal('exp-reps',-1)">
              -
            </button>
            <button class="express-adjust-btn"
                    onclick="ajusterExpressVal('exp-reps',1)">
              +
            </button>
          </div>
        </div>
      </div>

      <!-- RPE rapide -->
      <div style="margin:var(--space-md) 0">
        <div style="font-size:.72rem;color:var(--text-muted);
                    margin-bottom:var(--space-sm)">
          Effort ressenti (RPE)
        </div>
        <div style="display:flex;gap:4px">
          ${[6,7,8,9,10].map(v => `
            <button id="rpe-exp-${v}"
                    onclick="selectionnerRPEExpress(${v})"
                    style="flex:1;padding:var(--space-sm);
                           border-radius:var(--radius-sm);
                           border:1px solid var(--border-color);
                           background:var(--bg-input);
                           color:var(--text-muted);
                           font-size:.82rem;font-weight:600;
                           cursor:pointer;transition:all .15s">
              ${v}
            </button>`).join('')}
        </div>
      </div>

      <!-- Bouton valider -->
      <button class="express-btn-next"
              onclick="validerSerieExpress(${JSON.stringify(exercices).replace(/"/g,"'")})">
        ✅ Série ${AppState.expressSerieN}/${exo?.series || 3}
        ${idx+1 < exercices.length || AppState.expressSerieN < (exo?.series||3)
          ? '→ Suite'
          : '🏁 Terminer'}
      </button>
    </div>
  `;

  // Reprendre le chrono
  chronoSeance.arreter();
  AppState.expressDebut = Date.now() - elapsed * 1000;
  chronoSeance.demarrer(el => {
    const chronoEl = document.getElementById('express-chrono');
    const r = Math.max(0, 30*60 - el);
    if (chronoEl) chronoEl.textContent = Utils.formatDureeMin(r);
  });
}

let _rpeExpress = null;

function selectionnerRPEExpress(val) {
  _rpeExpress = val;
  [6,7,8,9,10].forEach(v => {
    const btn = document.getElementById(`rpe-exp-${v}`);
    if (!btn) return;
    btn.style.background = v === val
      ? 'var(--fd-indigo)'
      : 'var(--bg-input)';
    btn.style.color = v === val
      ? 'white'
      : 'var(--text-muted)';
    btn.style.borderColor = v === val
      ? 'var(--fd-indigo)'
      : 'var(--border-color)';
  });
}

function ajusterExpressVal(id, delta) {
  const input = document.getElementById(id);
  if (!input) return;
  const val = parseFloat(input.value) || 0;
  input.value = Math.max(0, val + delta);
}

function validerSerieExpress(exercices) {
  if (typeof exercices === 'string') {
    try { exercices = JSON.parse(exercices.replace(/'/g,'"')); }
    catch(e) { return; }
  }

  const poids = parseFloat(document.getElementById('exp-poids')?.value);
  const reps  = parseInt(document.getElementById('exp-reps')?.value);

  if (!poids || !reps) {
    Utils.toast('Entre le poids et les reps !', 'error');
    document.getElementById('exp-poids')?.classList.add('shake');
    setTimeout(() =>
      document.getElementById('exp-poids')?.classList.remove('shake'), 400
    );
    return;
  }

  const exo    = exercices[AppState.expressIndex];
  const seanceId = 'express_' + Utils.aujourd_hui();

  const result = Tracker.sauvegarderSerie(
    seanceId, exo.ref,
    AppState.expressSerieN,
    reps, poids, _rpeExpress
  );

  _rpeExpress = null;
  Utils.vibrerSuccess();

  if (result.isPR) {
    timerRepos.jouerSon('pr');
    Utils.toast(`🏆 NOUVEAU PR ! ${poids}kg × ${reps}`, 'pr', 3000);
    Gamification.recompenser('PR_BATTU');
  }

  // Série suivante ou exercice suivant
  if (AppState.expressSerieN < (exo.series || 3)) {
    AppState.expressSerieN++;

    // Timer repos rapide (60s max en express)
    const reposExpress = Math.min(exo.repos || 60, 60);
    _lancerReposExpress(reposExpress, () => {
      renderExpressExercice(exercices);
    });

  } else if (AppState.expressIndex + 1 < exercices.length) {
    AppState.expressIndex++;
    AppState.expressSerieN = 1;

    _lancerReposExpress(45, () => {
      renderExpressExercice(exercices);
    });

  } else {
    const duree = chronoSeance.arreter();
    terminerExpress(exercices, duree);
  }
}

function _lancerReposExpress(secondes, callback) {
  const container = document.getElementById('page-content');

  // Overlay repos rapide
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:200;
    background:rgba(9,9,45,0.95);
    display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    gap:var(--space-lg)`;

  overlay.innerHTML = `
    <div style="font-size:.9rem;color:var(--text-muted);
                text-transform:uppercase;letter-spacing:.1em">
      💤 Repos
    </div>
    <div style="font-size:5rem;font-weight:800;
                color:var(--fd-lemon);
                font-variant-numeric:tabular-nums"
         id="repos-express-display">
      ${Utils.formatDureeMin(secondes)}
    </div>
    <button onclick="document.getElementById('overlay-repos-express').remove();
                     (${callback.toString()})();"
            style="padding:var(--space-md) var(--space-xl);
                   background:var(--fd-indigo);
                   border:none;border-radius:var(--radius-full);
                   color:white;font-weight:700;cursor:pointer">
      ⏭ Passer
    </button>`;

  overlay.id = 'overlay-repos-express';
  document.body.appendChild(overlay);

  timerRepos.demarrer(secondes,
    (r) => {
      const el = document.getElementById('repos-express-display');
      if (el) el.textContent = Utils.formatDureeMin(r);
    },
    () => {
      overlay.remove();
      callback();
    }
  );
}

function terminerExpress(exercices, duree) {
  AppState.expressActif = false;
  chronoSeance.arreter();
  timerRepos.arreter();

  Tracker.terminerSeance('express_' + Utils.aujourd_hui());
  Gamification.recompenser('SEANCE_COMPLETE');
  Defis.mettreAJourProgression();
  Utils.confetti(3000);
  Utils.vibrerFin();

  const container = document.getElementById('page-content');
  const volume    = Tracker.getVolumeSemaine();

  container.innerHTML = `
    <div class="express-result">
      <div class="express-result-icon">⚡</div>
      <div class="express-result-titre">
        Séance Express terminée !
      </div>
      <p style="color:var(--text-muted);margin-bottom:var(--space-lg)">
        Bien joué ${Tracker.getProfil().nom || ''} ! 🔥
      </p>

      <div class="express-result-stats">
        <div class="express-result-stat">
          <div class="express-result-val">
            ${Utils.formatDuree(duree)}
          </div>
          <div class="express-result-lbl">Durée</div>
        </div>
        <div class="express-result-stat">
          <div class="express-result-val">
            ${exercices.length}
          </div>
          <div class="express-result-lbl">Exercices</div>
        </div>
        <div class="express-result-stat">
          <div class="express-result-val">
            ${Utils.formatVolume(Tracker.getVolumeSemaine())}
          </div>
          <div class="express-result-lbl">Vol. sem.</div>
        </div>
      </div>

      <div style="margin:var(--space-lg) 0">
        <button class="btn-primary mb-md"
                style="width:100%"
                onclick="naviguer('stats')">
          📊 Voir mes stats
        </button>
        <button class="btn-secondary"
                style="width:100%"
                onclick="naviguer('home')">
          🏠 Accueil
        </button>
      </div>
    </div>
  `;

  setTimeout(() => Gamification.verifierTrophees(), 1000);
}

async function arreterExpress(exercices) {
  const ok = await Utils.confirmer(
    'Arrêter la séance express ?',
    'Ta progression sera sauvegardée.'
  );
  if (!ok) return;
  AppState.expressActif = false;
  chronoSeance.arreter();
  timerRepos.arreter();
  Tracker.terminerSeance('express_' + Utils.aujourd_hui());
  naviguer('home');
}

// ════════════════════════════════════════════════════════════
// PAGE DÉFIS
// ════════════════════════════════════════════════════════════
function renderPageDefis() {
  const container = document.getElementById('page-content');
  container.innerHTML = `<div id="defis-wrapper"></div>`;
  Defis.render(document.getElementById('defis-wrapper'));
}

// ════════════════════════════════════════════════════════════
// PAGE SHARE + APPLE MUSIC
// ════════════════════════════════════════════════════════════
function renderPageShare() {
  const container = document.getElementById('page-content');
  container.innerHTML = `<div id="share-wrapper"></div>`;
  Share.render(document.getElementById('share-wrapper'));
}

// ════════════════════════════════════════════════════════════
// PAGE PREDICT
// ════════════════════════════════════════════════════════════
function renderPagePredict() {
  const container = document.getElementById('page-content');
  container.innerHTML = `<div id="predict-wrapper"></div>`;
  Predict.render(document.getElementById('predict-wrapper'));
}

// ════════════════════════════════════════════════════════════
// PAGE TRAINING
// ════════════════════════════════════════════════════════════
function renderTraining(tab = 'planning', offset = 0) {
  const container = document.getElementById('page-content');
  const tabs = ['planning','exercices','timer','phases','recup'];

  container.innerHTML = `
    <div class="tabs-container">
      ${tabs.map(t => `
        <button class="tab-btn ${tab===t?'active':''}"
                onclick="renderTraining('${t}')">
          ${{
            planning:  '📅 Planning',
            exercices: '🏋️ Exercices',
            timer:     '⏱️ Timer',
            phases:    '📈 Phases',
            recup:     '🧘 Récup'
          }[t]}
        </button>`).join('')}
    </div>
    <div id="training-content"></div>
  `;

  const content = document.getElementById('training-content');
  switch(tab) {
    case 'planning':  renderPlanning(content, offset); break;
    case 'exercices': renderListeExercices(content);   break;
    case 'timer':     renderTimerStandalone(content);  break;
    case 'phases':    renderPhases(content);           break;
    case 'recup':     renderRecup(content);            break;
  }
}

// ── Planning ──────────────────────────────────────────────────
function renderPlanning(el, offset = 0) {
  const semaines = Programme.getSeancesSemaine(offset);
  const infos    = Programme.getInfosProgramme();
  const semNum   = infos.semaine + offset;
  const isCustom = Programme.estPlanningCustom();

  el.innerHTML = `
    <div class="flex items-center justify-between mb-md">
      <button class="btn-icon"
              onclick="renderTraining('planning',${offset-1})">◄</button>
      <div style="text-align:center">
        <div style="font-weight:700;font-size:1rem">
          SEMAINE ${semNum}
        </div>
        <div style="font-size:.72rem;color:var(--text-muted)">
          ${infos.phase.emoji} ${infos.phase.nom}
          ${isCustom
            ? '<span style="color:var(--fd-lemon)"> · ✏️ Custom</span>'
            : ''}
        </div>
      </div>
      <button class="btn-icon"
              onclick="renderTraining('planning',${offset+1})">►</button>
    </div>

    <button class="btn-secondary mb-md"
            style="width:100%;font-size:.82rem"
            onclick="renderProfil('programme')">
      ⚙️ Personnaliser le programme
    </button>

    <div class="card">
      ${semaines.map(jour => `
        <div class="seance-card">
          <span class="seance-day"
                style="${jour.estAujourdhui
                  ? 'color:var(--fd-indigo);font-weight:800' : ''}">
            ${jour.label}
          </span>
          <div class="seance-info">
            ${jour.seance ? `
              <div class="seance-name">
                ${jour.seance.emoji} ${jour.seance.nom}
                ${jour.seance.custom
                  ? '<span style="font-size:.6rem;color:var(--fd-lemon)"> ✏️</span>'
                  : ''}
              </div>
              <div class="seance-meta">
                ${jour.seance.exercices.length} exercices
                · ~${jour.seance.duree_estimee}min
              </div>
            ` : `
              <div class="seance-name"
                   style="color:var(--text-muted)">
                ✨ Récupération
              </div>`}
          </div>
          ${jour.seance ? `
            <button class="badge-seance"
                    onclick="ouvrirSeance('${jour.seance.id}')">
              ${jour.estPasse&&!jour.estAujourdhui ? '📋' : '▶'} Séance
            </button>
          ` : `<span class="badge-repos">Repos</span>`}
        </div>`).join('')}
    </div>`;
}

// ── Liste Exercices ───────────────────────────────────────────
function renderListeExercices(el) {
  const groupes = {};
  Object.entries(EXERCICES).forEach(([ref, ex]) => {
    if (!groupes[ex.muscle]) groupes[ex.muscle] = [];
    groupes[ex.muscle].push({ ref, ...ex });
  });

  el.innerHTML = `
    <div class="card mb-md">
      <input class="input" id="search-ex"
             placeholder="🔍 Rechercher un exercice..."
             oninput="filtrerExercices(this.value)" />
    </div>
    <div id="ex-list">
      ${Object.entries(groupes).map(([muscle, exos]) => `
        <div class="section-title">
          ${exos[0]?.emoji || '💪'} ${muscle}
        </div>
        ${exos.map(ex => {
          const uid = `list_gif_${ex.ref}`;
          return `
            <div class="exercice-card mb-md"
                 onclick="afficherDetailExercice('${ex.ref}')">
              <div class="exercice-header">
                <div id="${uid}"
                     style="width:70px;height:70px;
                            border-radius:var(--radius-md);
                            background:var(--fd-indigo-dim);
                            display:flex;align-items:center;
                            justify-content:center;font-size:1.8rem;
                            flex-shrink:0;overflow:hidden">
                  ${ex.emoji || '💪'}
                </div>
                <div class="exercice-details">
                  <div class="exercice-name">${ex.nom}</div>
                  <div class="exercice-muscle">${ex.muscle}</div>
                  <div class="exercice-volume">${ex.equipement}</div>
                  <div style="font-size:.75rem;margin-top:4px">
                    ${'⭐'.repeat(ex.difficulte || 1)}
                    ${'☆'.repeat(4 - (ex.difficulte || 1))}
                  </div>
                </div>
              </div>
            </div>`;
        }).join('')}
      `).join('')}
    </div>`;

  _observerGIFs();
}

function _observerGIFs() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el  = entry.target;
        const ref = el.dataset.ref;
        if (ref && !el.dataset.loaded) {
          el.dataset.loaded = 'true';
          ExerciseGIF.chargerDans(ref, el.id);
        }
      }
    });
  }, { rootMargin: '100px' });

  document.querySelectorAll('[id^="list_gif_"]').forEach(el => {
    el.dataset.ref = el.id.replace('list_gif_', '');
    observer.observe(el);
  });
}

function filtrerExercices(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('.exercice-card').forEach(card => {
    card.style.display =
      card.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function afficherDetailExercice(ref) {
  const ex  = EXERCICES[ref];
  const pr  = Tracker.getPR(ref);
  if (!ex) return;

  const gifUID  = `modal_gif_${ref}_${Date.now()}`;
  const modal   = document.getElementById('modal-info');
  const content = document.getElementById('modal-info-content');

  content.innerHTML = `
    <div id="${gifUID}"
         style="width:100%;height:200px;display:flex;
                align-items:center;justify-content:center;
                background:var(--fd-indigo-dim);
                border-radius:var(--radius-lg);
                margin-bottom:var(--space-md);
                font-size:4rem;overflow:hidden">
      ${ex.emoji}
    </div>
    <div style="text-align:center;margin-bottom:var(--space-lg)">
      <h3 style="font-size:1.3rem;font-weight:700">${ex.nom}</h3>
      <span class="chip chip-mint">${ex.muscle}</span>
      <span style="margin-left:var(--space-sm)">
        ${'⭐'.repeat(ex.difficulte)}${'☆'.repeat(4-ex.difficulte)}
      </span>
    </div>
    <div class="card mb-md">
      <div class="card-label">📍 Équipement</div>
      <p style="font-size:.9rem;margin-top:var(--space-xs)">
        ${ex.equipement}
      </p>
    </div>
    <div class="card mb-md">
      <div class="card-label">📖 Description</div>
      <p style="font-size:.88rem;line-height:1.6;
                margin-top:var(--space-xs)">
        ${ex.description}
      </p>
    </div>
    <div class="card mb-md">
      <div class="card-label">💡 Conseils</div>
      ${(ex.conseils||[]).map(c => `
        <div style="display:flex;gap:var(--space-sm);
                    padding:4px 0;font-size:.85rem">
          <span style="color:var(--fd-mint)">✓</span>
          <span>${c}</span>
        </div>`).join('')}
    </div>
    ${pr ? `
      <div class="card">
        <div class="card-label">🏆 Record personnel</div>
        <div class="flex justify-between mt-md">
          <div class="text-center">
            <div style="font-size:1.3rem;font-weight:800;
                        color:var(--fd-lemon)">${pr.rm1}kg</div>
            <div style="font-size:.7rem;color:var(--text-muted)">
              1RM estimé
            </div>
          </div>
          <div class="text-center">
            <div style="font-size:1.3rem;font-weight:800;
                        color:var(--fd-indigo)">${pr.poids}kg</div>
            <div style="font-size:.7rem;color:var(--text-muted)">
              Meilleur poids
            </div>
          </div>
          <div class="text-center">
            <div style="font-size:1.3rem;font-weight:800;
                        color:var(--fd-mint)">${pr.reps}</div>
            <div style="font-size:.7rem;color:var(--text-muted)">
              Meilleur reps
            </div>
          </div>
        </div>
      </div>` : ''}
  `;

  modal.classList.remove('hidden');
  document.getElementById('modal-info-close').onclick =
    () => modal.classList.add('hidden');
  modal.querySelector('.modal-overlay').onclick =
    () => modal.classList.add('hidden');

  ExerciseGIF.chargerDans(ref, gifUID);
}

// ── Timer Standalone ──────────────────────────────────────────
let timerDureeBase = 90;

function renderTimerStandalone(el) {
  el.innerHTML = `
    <div class="timer-screen">
      <div class="timer-title">⏱️ Timer Repos</div>
      <div class="timer-presets">
        ${[60,90,120,180].map(s => `
          <button class="preset-btn ${s===90?'active':''}"
                  onclick="selectionnerPreset(${s},this)">
            ${s}s
          </button>`).join('')}
        <button class="preset-btn"
                onclick="demanderCustomTimer()">⚙️</button>
      </div>
      <div class="countdown-ring">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle class="ring-bg" cx="100" cy="100" r="88"
                  stroke-dasharray="${2*Math.PI*88}"/>
          <circle class="ring-fill" id="ring-fill"
                  cx="100" cy="100" r="88"
                  stroke-dasharray="${2*Math.PI*88}"
                  stroke-dashoffset="0"/>
        </svg>
        <div class="countdown-text">
          <div class="countdown-number"
               id="countdown-display">01:30</div>
          <div class="countdown-label"
               id="countdown-label">Prêt</div>
        </div>
      </div>
      <div class="timer-controls mb-md">
        <button class="timer-adjust-btn"
                onclick="timerRepos.ajuster(-30);updateTimerUI()">
          -30s
        </button>
        <button class="btn-primary" id="btn-timer-start"
                onclick="toggleTimer()"
                style="flex:1;max-width:160px">
          ▶ Démarrer
        </button>
        <button class="timer-adjust-btn"
                onclick="timerRepos.ajuster(30);updateTimerUI()">
          +30s
        </button>
      </div>
      <div class="flex gap-md justify-center">
        <label class="toggle-row"
               style="border:none;gap:var(--space-sm)">
          <span style="font-size:.85rem">🔔 Son</span>
          <label class="toggle">
            <input type="checkbox"
                   ${Utils.storage.get('ft_son',true)?'checked':''}
                   onchange="Utils.storage.set('ft_son',this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </label>
        <label class="toggle-row"
               style="border:none;gap:var(--space-sm)">
          <span style="font-size:.85rem">📳 Vibration</span>
          <label class="toggle">
            <input type="checkbox"
                   ${Utils.storage.get('ft_vibration',true)?'checked':''}
                   onchange="Utils.storage.set('ft_vibration',this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </label>
      </div>
    </div>
  `;
  updateTimerUI(90);
}

function selectionnerPreset(s, btn) {
  timerDureeBase = s;
  timerRepos.reset(s);
  document.querySelectorAll('.preset-btn')
    .forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateTimerUI(s);
  const startBtn = document.getElementById('btn-timer-start');
  if (startBtn) startBtn.textContent = '▶ Démarrer';
}

function toggleTimer() {
  const btn = document.getElementById('btn-timer-start');
  if (!timerRepos.isActif()) {
    timerRepos.demarrer(timerDureeBase,
      (r,t) => updateTimerUI(r,t),
      () => {
        updateTimerUI(0, timerDureeBase);
        if (btn) btn.textContent = '▶ Démarrer';
      }
    );
    if (btn) btn.textContent = '⏸ Pause';
  } else {
    timerRepos.pauseReprendre();
    if (btn) btn.textContent =
      timerRepos.enPause ? '▶ Reprendre' : '⏸ Pause';
  }
}

function updateTimerUI(restant = null, total = null) {
  const r   = restant !== null ? restant : timerRepos.restant;
  const t   = total   !== null ? total   :
              (timerRepos.total || timerDureeBase);
  const pct = t > 0 ? r / t : 1;

  const display = document.getElementById('countdown-display');
  const label   = document.getElementById('countdown-label');
  const ring    = document.getElementById('ring-fill');

  if (display) display.textContent = Utils.formatDureeMin(r);
  if (label)   label.textContent   =
    r === 0 ? '✅ C\'est parti !' :
    timerRepos.actif ? 'Repos...' : 'Prêt';
  if (ring) {
    const circ = 2 * Math.PI * 88;
    ring.style.strokeDashoffset = circ * (1 - pct);
    ring.style.stroke =
      r <= 3  ? 'var(--fd-coral)' :
      r <= 10 ? 'var(--fd-lemon)' : 'var(--fd-indigo)';
  }
}

function demanderCustomTimer() {
  const val = prompt('Durée en secondes (ex: 150):');
  if (!val || isNaN(parseInt(val))) return;
  const s = Math.max(10, Math.min(600, parseInt(val)));
  timerDureeBase = s;
  timerRepos.reset(s);
  updateTimerUI(s);
}

// ── Phases ────────────────────────────────────────────────────
function renderPhases(el) {
  const infos  = Programme.getInfosProgramme();
  const phases = [
    { num:1, nom:'Reprise',      emoji:'🌱', desc:'Technique & Adaptation',
      s:'S1-S4',   intensite:'65-70%', color:'var(--fd-mint)'     },
    { num:2, nom:'Construction', emoji:'🏗️', desc:'Volume & Hypertrophie',
      s:'S5-S8',   intensite:'75-80%', color:'var(--fd-indigo)'   },
    { num:3, nom:'Intensité',    emoji:'💥', desc:'Force & Records',
      s:'S9-S12',  intensite:'85-90%', color:'var(--fd-lavender)' },
    { num:4, nom:'Peak',         emoji:'🏆', desc:'Records & Décharge',
      s:'S13-S16', intensite:'95%+',   color:'var(--fd-lemon)'    }
  ];

  el.innerHTML = `
    <div class="card mb-md" style="text-align:center">
      <div class="card-label">
        🔄 Cycle ${infos.cycle} — Semaine ${infos.semaineInCycle}/16
      </div>
      <div style="margin:var(--space-md) 0">
        <div class="progress-bar">
          <div class="progress-fill"
               style="width:${infos.progression}%"></div>
        </div>
        <div style="font-size:.72rem;color:var(--text-muted);margin-top:4px">
          ${infos.progression}% du cycle complété
        </div>
      </div>
    </div>
    ${phases.map(p => `
      <div class="card mb-md"
           style="${p.num === infos.phase.numero
             ? `border-color:${p.color};background:${p.color}15` : ''}">
        <div class="flex items-center gap-md">
          <div style="width:44px;height:44px;border-radius:50%;
                      background:${p.color}22;
                      border:2px solid ${p.color};
                      display:flex;align-items:center;
                      justify-content:center;font-size:1.2rem;
                      flex-shrink:0">
            ${p.num < infos.phase.numero ? '✅' :
              p.num === infos.phase.numero ? p.emoji : '🔒'}
          </div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:.95rem;
                        color:${p.num === infos.phase.numero
                          ? p.color : 'var(--text-primary)'}">
              Phase ${p.num} — ${p.nom}
              ${p.num === infos.phase.numero
                ? '<span style="font-size:.7rem;margin-left:4px">← Actuelle</span>'
                : ''}
            </div>
            <div style="font-size:.75rem;color:var(--text-muted)">
              ${p.desc}
            </div>
            <div style="font-size:.72rem;margin-top:2px">
              <span class="chip chip-indigo">${p.s}</span>
              <span style="color:${p.color};font-weight:600;
                           margin-left:var(--space-sm)">
                ${p.intensite} du max
              </span>
            </div>
          </div>
        </div>
      </div>`).join('')}
  `;
}

// ── Récup ─────────────────────────────────────────────────────
function renderRecup(el) {
  const indexJour  = Utils.indexJourSemaine(Utils.aujourd_hui());
  const planning   = PLANNING_SEMAINE[indexJour];
  const seanceId   = planning?.seanceId;
  const etirements = seanceId ? (ETIREMENTS[seanceId] || []) : [];

  el.innerHTML = `
    <div class="card mb-md">
      <div class="card-label">🧘 Étirements du jour</div>
      ${etirements.length === 0 ? `
        <p style="color:var(--text-muted);padding:var(--space-md);
                  text-align:center">
          Lance une séance pour voir les étirements adaptés.
        </p>` :
        etirements.map(e => `
          <div class="flex items-center gap-md"
               style="padding:var(--space-sm) 0;
                      border-bottom:1px solid var(--border-color)">
            <span style="font-size:1.5rem">${e.gif}</span>
            <div style="flex:1">
              <div style="font-size:.9rem;font-weight:600">
                ${e.nom}
              </div>
            </div>
            <div style="color:var(--fd-mint);font-size:.82rem;
                        font-weight:600">${e.duree}s</div>
          </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-label">💡 Conseils récupération</div>
      ${[
        { emoji:'💧', titre:'Hydratation', desc:'2.5 à 3L d\'eau par jour.'      },
        { emoji:'😴', titre:'Sommeil',     desc:'7 à 9 heures par nuit.'         },
        { emoji:'🍗', titre:'Protéines',   desc:'~2g/kg de poids corporel.'      },
        { emoji:'🧊', titre:'Bain froid',  desc:'2-3 min à 10-15°C post séance.' },
        { emoji:'📱', titre:'Repos actif', desc:'Marche légère les jours off.'   }
      ].map(c => `
        <div style="display:flex;gap:var(--space-md);
                    padding:var(--space-sm) 0;
                    border-bottom:1px solid var(--border-color)">
          <span style="font-size:1.3rem">${c.emoji}</span>
          <div>
            <div style="font-weight:600;font-size:.88rem">${c.titre}</div>
            <div style="font-size:.78rem;color:var(--text-muted);
                        margin-top:2px">${c.desc}</div>
          </div>
        </div>`).join('')}
    </div>`;
}

// ── Ouvrir séance ─────────────────────────────────────────────
function ouvrirSeance(seanceId) {
  const seance = Programme.getSeanceComplete(seanceId);
  if (!seance) return;

  AppState.seanceChoisie = seance;
  const container = document.getElementById('page-content');

  container.innerHTML = `
    <div class="flex items-center gap-md mb-md">
      <button class="btn-icon" onclick="renderTraining()">←</button>
      <div>
        <div style="font-weight:700;font-size:1.1rem">
          ${seance.emoji} ${seance.nom}
        </div>
        <div style="font-size:.75rem;color:var(--text-muted)">
          ${seance.exercices.length} exercices
          · ~${seance.duree_estimee}min
        </div>
      </div>
    </div>

    <div class="card mb-md">
      <div class="card-label">
        🔥 Warm-up (${seance.warmup?.length||0} exercices)
      </div>
      ${(seance.warmup||[]).map(w => `
        <div style="display:flex;justify-content:space-between;
                    padding:var(--space-xs) 0;font-size:.85rem;
                    border-bottom:1px solid var(--border-color)">
          <span>${w.nom}</span>
          <span style="color:var(--fd-mint)">
            ${Utils.formatDuree(w.duree)}
          </span>
        </div>`).join('')}
    </div>

    <div class="card mb-md">
      <div class="card-label">📋 Exercices</div>
      ${seance.exercicesDetails.map((item, i) => {
        const ex  = item.details;
        const pr  = Tracker.getPR(item.ref);
        const pred = Predict.predireProchainPR(item.ref);
        const uid = `preview_gif_${item.ref}_${i}`;
        return `
          <div style="display:flex;gap:var(--space-md);
                      padding:var(--space-md) 0;
                      border-bottom:1px solid var(--border-color);
                      align-items:center">
            <div id="${uid}"
                 style="width:60px;height:60px;
                        border-radius:var(--radius-md);
                        background:var(--fd-indigo-dim);
                        display:flex;align-items:center;
                        justify-content:center;font-size:1.5rem;
                        flex-shrink:0;overflow:hidden">
              ${ex?.emoji||'💪'}
            </div>
            <div style="flex:1">
              <div style="font-weight:600;font-size:.92rem">
                ${i+1}. ${ex?.nom||item.ref}
              </div>
              <div style="font-size:.75rem;color:var(--fd-mint)">
                ${ex?.muscle||''}
              </div>
              <div style="font-size:.75rem;color:var(--text-muted)">
                ${item.series} × ${item.reps}
                · Repos ${item.repos}s
              </div>
              ${pr ? `
                <div style="font-size:.7rem;color:var(--fd-lemon);
                            margin-top:2px">
                  🏆 Record: ${pr.poids}kg × ${pr.reps}
                </div>` : ''}
              ${pred ? `
                <div style="font-size:.68rem;color:var(--fd-mint);
                            margin-top:2px">
                  🔮 PR prédit: ${pred.rm1Predit}kg dans ~${pred.joursEstimes}j
                </div>` : ''}
            </div>
          </div>`;
      }).join('')}
    </div>

    <button class="btn-primary"
            onclick="demarrerNouvelleSeance(AppState.seanceChoisie)"
            style="position:sticky;
                   bottom:calc(var(--nav-height)+var(--space-md))">
      ⚡ Démarrer la séance
    </button>
  `;

  seance.exercicesDetails.forEach((item, i) => {
    setTimeout(() => {
      ExerciseGIF.chargerDans(
        item.ref, `preview_gif_${item.ref}_${i}`
      );
    }, i * 100);
  });
}

// ════════════════════════════════════════════════════════════
// PAGE LIVE
// ════════════════════════════════════════════════════════════
function renderLive() {
  const container = document.getElementById('page-content');
  const seance    = AppState.seanceEnCours;

  if (!seance && !AppState.seanceChoisie) {
    renderSelecteurSeance(container);
    return;
  }
  if (!seance) {
    demarrerNouvelleSeance(AppState.seanceChoisie);
    return;
  }
  renderExerciceActuel(container);
}

function renderSelecteurSeance(container) {
  const seances   = Programme.getAllSeances();
  const prochaine = Programme.getProchaineSeance();

  container.innerHTML = `
    <div style="text-align:center;padding:var(--space-lg) 0;
                margin-bottom:var(--space-md)">
      <div style="font-size:2.5rem;margin-bottom:var(--space-sm)">⚡</div>
      <h2 style="font-size:1.3rem;font-weight:700">
        Quelle séance aujourd'hui ?
      </h2>
      <button class="btn-secondary mt-md"
              onclick="naviguer('express')"
              style="font-size:.82rem">
        ⚡ Séance Express 30min →
      </button>
    </div>

    ${prochaine ? `
      <div class="card card-indigo mb-md"
           onclick="ouvrirSeance('${prochaine.id}')"
           style="cursor:pointer">
        <div style="font-size:.72rem;opacity:.8;margin-bottom:4px">
          ⭐ Recommandée aujourd'hui
        </div>
        <div style="font-size:1.1rem;font-weight:700">
          ${prochaine.emoji} ${prochaine.nom}
        </div>
        <div style="font-size:.78rem;opacity:.8;margin-top:4px">
          ${prochaine.exercices.length} exercices
          · ~${prochaine.duree_estimee}min
        </div>
      </div>` : ''}

    ${seances.map(s => `
      <div class="seance-card"
           onclick="ouvrirSeance('${s.id}')">
        <span style="font-size:1.5rem;margin-right:var(--space-md)">
          ${s.emoji}
        </span>
        <div class="seance-info">
          <div class="seance-name">
            ${s.nom}
            ${s.custom
              ? '<span style="font-size:.6rem;color:var(--fd-lemon)"> ✏️</span>'
              : ''}
          </div>
          <div class="seance-meta">
            ${s.exercices.length} exercices
            · ~${s.duree_estimee}min
          </div>
        </div>
        <span style="color:var(--fd-indigo)">▶</span>
      </div>`).join('')}
  `;
}

function demarrerNouvelleSeance(seance) {
  AppState.seanceEnCours = seance;
  AppState.exerciceIndex = 0;
  AppState.serieActuelle = 1;
  AppState.seanceChoisie = null;
  AppState.prsSeance     = [];

  Tracker.demarrerSeance(seance.id);

  chronoSeance.demarrer(elapsed => {
    const el = document.getElementById('chrono-global');
    if (el) el.textContent = Utils.formatDuree(elapsed);
  });

  renderExerciceActuel(document.getElementById('page-content'));
}

function renderExerciceActuel(container) {
  const seance   = AppState.seanceEnCours;
  if (!seance) return;

  const item     = seance.exercicesDetails[AppState.exerciceIndex];
  const ex       = item?.details;
  const derniere = Tracker.getDernierePerf(seance.id, item?.ref);
  const pred     = Predict.recommanderCharge(item?.ref);
  const gifUID   = `live_gif_${item?.ref}_${Date.now()}`;

  container.innerHTML = `
    <div class="flex items-center justify-between mb-md">
      <button class="btn-secondary btn-sm"
              onclick="confirmerAbandon()">✕ Arrêter</button>
      <div style="text-align:center">
        <div style="font-weight:700;font-size:.9rem">
          ${AppState.exerciceIndex+1}/${seance.exercicesDetails.length}
        </div>
        <div style="font-size:.72rem;color:var(--text-muted)"
             id="chrono-global">00:00</div>
      </div>
      <button class="btn-secondary btn-sm"
              onclick="afficherDetailExercice('${item?.ref}')">
        ℹ️ Info
      </button>
    </div>

    <div class="exercice-card mb-md">
      <div id="${gifUID}"
           style="width:100%;height:220px;display:flex;
                  align-items:center;justify-content:center;
                  background:var(--fd-indigo-dim);
                  border-radius:var(--radius-md) var(--radius-md) 0 0;
                  font-size:4rem;overflow:hidden">
        ${ex?.emoji || '💪'}
      </div>

      <div style="padding:var(--space-md);text-align:center;
                  border-bottom:1px solid var(--border-color)">
        <div style="font-size:1.2rem;font-weight:700">
          ${ex?.nom||item?.ref}
        </div>
        <div style="font-size:.8rem;color:var(--fd-mint);margin-top:4px">
          ${ex?.muscle||''}
        </div>
        <div style="font-size:.75rem;color:var(--text-muted);margin-top:4px">
          ${item?.series} séries × ${item?.reps} reps
          · Repos ${item?.repos}s
        </div>
        ${pred ? `
          <div style="font-size:.72rem;color:var(--fd-lemon);
                      margin-top:4px">
            ⚡ Charge recommandée: <strong>${pred.charge}kg</strong>
            (${pred.intensite}% · ${pred.fatigue.emoji})
          </div>` : ''}
        ${derniere ? `
          <div style="font-size:.72rem;color:var(--fd-lemon);margin-top:4px">
            📊 Dernière fois: ${derniere.poids}kg × ${derniere.reps} reps
          </div>` : ''}
      </div>

      <div style="padding:var(--space-sm) var(--space-md)">
        <div class="series-indicators">
          ${Array.from({length:item?.series||4},(_,i) => `
            <div class="serie-dot ${
              i+1 <  AppState.serieActuelle ? 'done'    :
              i+1 === AppState.serieActuelle ? 'current' : ''}">
              ${i+1 < AppState.serieActuelle ? '✓' : i+1}
            </div>`).join('')}
        </div>
      </div>

      <div style="padding:var(--space-md)">
        <div style="font-size:.85rem;font-weight:600;text-align:center;
                    color:var(--text-secondary);
                    margin-bottom:var(--space-sm)">
          Série ${AppState.serieActuelle} / ${item?.series}
        </div>
        <div class="input-group mb-md">
          <div style="flex:1">
            <div class="input-label" style="text-align:center">
              Poids (kg)
            </div>
            <input class="input" id="inp-poids" type="number"
                   placeholder="${pred?.charge || derniere?.poids||'0'}"
                   value="${pred?.charge || derniere?.poids||''}"
                   step="2.5" />
          </div>
          <div style="flex:1">
            <div class="input-label" style="text-align:center">
              Reps
            </div>
            <input class="input" id="inp-reps" type="number"
                   placeholder="${derniere?.reps||'0'}"
                   value="${derniere?.reps||''}" />
          </div>
        </div>

        <div class="rpe-selector">
          <div class="rpe-label">Effort ressenti (RPE)</div>
          <div class="rpe-grid">
            ${Array.from({length:10},(_,i) => `
              <button class="rpe-btn" data-rpe="${i+1}"
                      onclick="selectionnerRPE(${i+1},this)">
                ${i+1}
              </button>`).join('')}
          </div>
        </div>

        <button class="btn-primary mt-md"
                onclick="validerSerie()">
          ✅ Valider série ${AppState.serieActuelle}
        </button>
      </div>
    </div>

    <div id="zone-repos" class="hidden">
      <div class="card" style="text-align:center;padding:var(--space-xl)">
        <div class="timer-title">💤 Repos</div>
        <div class="countdown-ring"
             style="width:160px;height:160px;margin:var(--space-md) auto">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle class="ring-bg" cx="80" cy="80" r="70"
                    stroke-dasharray="${2*Math.PI*70}"/>
            <circle class="ring-fill" id="live-ring"
                    cx="80" cy="80" r="70"
                    stroke-dasharray="${2*Math.PI*70}"
                    stroke-dashoffset="0"/>
          </svg>
          <div class="countdown-text">
            <div class="countdown-number" id="live-countdown"
                 style="font-size:2.2rem">
              ${Utils.formatDureeMin(item?.repos||90)}
            </div>
            <div class="countdown-label">secondes</div>
          </div>
        </div>
        <div class="timer-controls">
          <button class="timer-adjust-btn"
                  onclick="timerRepos.ajuster(-15);
                           updateLiveTimer()">-15s</button>
          <button class="timer-adjust-btn"
                  onclick="passerRepos()"
                  style="color:var(--fd-mint)">⏭ Passer</button>
          <button class="timer-adjust-btn"
                  onclick="timerRepos.ajuster(15);
                           updateLiveTimer()">+15s</button>
        </div>
      </div>
    </div>
  `;

  ExerciseGIF.chargerDans(item?.ref, gifUID);
}

let rpeActuel = null;

function selectionnerRPE(val, btn) {
  rpeActuel = val;
  document.querySelectorAll('.rpe-btn')
    .forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function validerSerie() {
  const poids = parseFloat(document.getElementById('inp-poids')?.value);
  const reps  = parseInt(document.getElementById('inp-reps')?.value);

  if (!poids || !reps) {
    Utils.toast('Entre le poids et les reps !', 'error');
    return;
  }

  const seance = AppState.seanceEnCours;
  const item   = seance.exercicesDetails[AppState.exerciceIndex];
  const result = Tracker.sauvegarderSerie(
    seance.id, item.ref, AppState.serieActuelle,
    reps, poids, rpeActuel
  );

  rpeActuel = null;
  Utils.vibrerSuccess();

  if (result.isPR) {
    AppState.prsSeance.push({ ref:item.ref, poids, reps });
    timerRepos.jouerSon('pr');
    Utils.toast(`🏆 NOUVEAU PR ! ${poids}kg × ${reps}`, 'pr', 4000);
    Notifications.notifierPR(item.ref, poids, reps);
    Gamification.recompenser('PR_BATTU');
    Defis.mettreAJourProgression();
  }

  if (AppState.serieActuelle < item.series) {
    AppState.serieActuelle++;
    lancerTimerRepos(item.repos, () => {
      renderExerciceActuel(document.getElementById('page-content'));
    });
  } else if (
    AppState.exerciceIndex + 1 < seance.exercicesDetails.length
  ) {
    AppState.exerciceIndex++;
    AppState.serieActuelle = 1;
    lancerTimerRepos(item.repos, () => {
      renderExerciceActuel(document.getElementById('page-content'));
    });
  } else {
    terminerSeance();
  }
}

function lancerTimerRepos(secondes, callback) {
  const zone = document.getElementById('zone-repos');
  if (zone) zone.classList.remove('hidden');
  zone?.scrollIntoView({ behavior:'smooth', block:'center' });

  timerRepos.demarrer(secondes,
    (r,t) => updateLiveTimerValues(r,t),
    () => {
      if (zone) zone.classList.add('hidden');
      if (callback) callback();
    }
  );
}

function updateLiveTimer() {
  updateLiveTimerValues(timerRepos.restant, timerRepos.total);
}

function updateLiveTimerValues(restant, total) {
  const display = document.getElementById('live-countdown');
  const ring    = document.getElementById('live-ring');
  if (display) display.textContent = Utils.formatDureeMin(restant);
  if (ring) {
    const circ = 2 * Math.PI * 70;
    const pct  = total > 0 ? restant / total : 1;
    ring.style.strokeDashoffset = circ * (1 - pct);
    ring.style.stroke =
      restant <= 3  ? 'var(--fd-coral)' :
      restant <= 10 ? 'var(--fd-lemon)' : 'var(--fd-indigo)';
    ring.style.transition = 'stroke-dashoffset 1s linear';
  }
}

function passerRepos() {
  timerRepos.arreter();
  document.getElementById('zone-repos')?.classList.add('hidden');
  renderExerciceActuel(document.getElementById('page-content'));
}

async function confirmerAbandon() {
  const ok = await Utils.confirmer(
    'Arrêter la séance ?',
    'Ta progression actuelle sera sauvegardée.'
  );
  if (!ok) return;
  timerRepos.arreter();
  chronoSeance.arreter();
  Tracker.terminerSeance(AppState.seanceEnCours.id);
  AppState.seanceEnCours = null;
  AppState.prsSeance     = [];
  naviguer('home');
}

function terminerSeance() {
  timerRepos.arreter();
  const duree  = chronoSeance.arreter();
  const seance = AppState.seanceEnCours;
  const data   = Tracker.terminerSeance(seance.id);
  const prs    = [...AppState.prsSeance];

  Gamification.recompenser('SEANCE_COMPLETE');
  Notifications.verifierSemaineParf();
  Defis.mettreAJourProgression();
  Utils.confetti(4000);
  Utils.vibrerFin();

  const container = document.getElementById('page-content');
  const volume    = data?.volumeTotal || 0;
  const series    = data?.series?.length || 0;

  container.innerHTML = `
    <div class="fin-screen">
      <div class="fin-emoji">🎉</div>
      <div class="fin-title">Séance terminée !</div>
      <p style="color:var(--text-secondary);
                margin-bottom:var(--space-lg)">
        Bravo ${Tracker.getProfil().nom||''} ! Incroyable effort.
      </p>
      <div class="fin-stats-grid mb-md">
        <div class="fin-stat">
          <div class="fin-stat-value">
            ${Utils.formatDuree(duree)}
          </div>
          <div class="fin-stat-label">Durée</div>
        </div>
        <div class="fin-stat">
          <div class="fin-stat-value">
            ${Utils.formatVolume(volume)}
          </div>
          <div class="fin-stat-label">Volume</div>
        </div>
        <div class="fin-stat">
          <div class="fin-stat-value">${series}</div>
          <div class="fin-stat-label">Séries</div>
        </div>
      </div>
      ${prs.length > 0 ? `
        <div class="pr-alert mb-md">
          <div class="pr-alert-title">
            🏆 ${prs.length} nouveau${prs.length>1?'x':''}
            record${prs.length>1?'s':''}!
          </div>
          ${prs.map(p => `
            <div class="pr-alert-item">
              <span>🎯</span>
              <span>
                ${EXERCICES[p.ref]?.nom||p.ref}:
                ${p.poids}kg × ${p.reps}
              </span>
            </div>`).join('')}
        </div>` : ''}

      <!-- Partage -->
      <button class="btn-secondary mb-md"
              onclick="Share.partager('semaine')"
              style="width:100%;font-size:.85rem">
        📸 Partager mes stats
      </button>

      <button class="btn-primary mb-md"
              onclick="ajouterJournalPostSeance('${seance.id}')">
        📔 Ajouter une note
      </button>
      <button class="btn-secondary"
              onclick="naviguer('home')">
        🏠 Retour accueil
      </button>
    </div>`;

  AppState.seanceEnCours = null;
  AppState.prsSeance     = [];
  setTimeout(() => Gamification.verifierTrophees(), 1500);
}

function ajouterJournalPostSeance(seanceId) {
  const modal   = document.getElementById('modal-info');
  const content = document.getElementById('modal-info-content');
  content.innerHTML = `
    <h3 style="margin-bottom:var(--space-md)">📔 Note de séance</h3>
    <textarea class="input" id="journal-texte" rows="4"
              placeholder="Comment s'est passée la séance ?"
              style="resize:vertical;min-height:120px"></textarea>
    <button class="btn-primary mt-md"
            onclick="sauvegarderNoteJournal('${seanceId}')">
      💾 Sauvegarder
    </button>`;
  modal.classList.remove('hidden');
  document.getElementById('modal-info-close').onclick =
    () => modal.classList.add('hidden');
}

function sauvegarderNoteJournal(seanceId) {
  const texte =
    document.getElementById('journal-texte')?.value?.trim();
  if (!texte) return;
  Tracker.ajouterEntreeJournal(texte, seanceId);
  Gamification.ajouterXP(25, 'journal');
  Utils.toast('Note sauvegardée !', 'success');
  document.getElementById('modal-info')?.classList.add('hidden');
}

// ════════════════════════════════════════════════════════════
// PAGE PROFIL
// ════════════════════════════════════════════════════════════
function renderProfil(tab = 'moi') {
  const container = document.getElementById('page-content');
  const tabs = [
    'moi','stats','defis','predict','share',
    'journal','objectifs','blessure',
    'coach','custom','programme','outils'
  ];

  container.innerHTML = `
    <div class="tabs-container">
      ${tabs.map(t => `
        <button class="tab-btn ${tab===t?'active':''}"
                onclick="renderProfil('${t}')">
          ${{
            moi:        '👤 Moi',
            stats:      '📊 Stats',
            defis:      '🏆 Défis',
            predict:    '🔮 Predict',
            share:      '📸 Share',
            journal:    '📔 Journal',
            objectifs:  '🎯 Objectifs',
            blessure:   '🩹 Blessure',
            coach:      '🤖 Coach',
            custom:     '🏋️ Mes Exos',
            programme:  '🗓️ Programme',
            outils:     '🔧 Outils'
          }[t]}
        </button>`).join('')}
    </div>
    <div id="profil-content"></div>`;

  const content = document.getElementById('profil-content');
  switch(tab) {
    case 'moi':        renderProfilMoi(content);            break;
    case 'stats':      Stats.render(content,'dashboard');   break;
    case 'defis':      Defis.render(content);               break;
    case 'predict':    Predict.render(content);             break;
    case 'share':      Share.render(content);               break;
    case 'journal':    renderJournal(content);              break;
    case 'objectifs':  renderObjectifs(content);            break;
    case 'blessure':   renderBlessure(content);             break;
    case 'coach':      Coach.renderCoachTab(content);       break;
    case 'custom':     renderExercicesCustom(content);      break;
    case 'programme':  renderProgrammeCustom(content);      break;
    case 'outils':     renderOutils(content);               break;
  }
}

// ════════════════════════════════════════════════════════════
// PROFIL — MOI
// ════════════════════════════════════════════════════════════
function renderProfilMoi(el) {
  const profil  = Tracker.getProfil();
  const mesures = Tracker.getDerniereMesure() || {};
  const xp      = Gamification.getXP();
  const streak  = Tracker.getStreak();
  const avatars = ['💪','🏋️','🔥','⚡','🦁','🐺','🦅','👑','🚀','💎'];

  el.innerHTML = `
    <div class="profil-card mb-md">
      <div style="margin-bottom:var(--space-md)">
        <div style="font-size:3rem;text-align:center;
                    margin-bottom:var(--space-sm)">
          ${profil.avatar||'💪'}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;
                    justify-content:center">
          ${avatars.map(a => `
            <button onclick="changerAvatar('${a}')"
                    data-avatar="${a}"
                    class="avatar-option ${
                      (profil.avatar||'💪').trim()===a.trim()
                        ?'avatar-selected':''}"
                    style="font-size:1.4rem;padding:4px 8px;
                           border-radius:var(--radius-sm);
                           border:2px solid ${
                             (profil.avatar||'💪').trim()===a.trim()
                               ?'var(--fd-lemon)':'transparent'};
                           background:${
                             (profil.avatar||'💪').trim()===a.trim()
                               ?'rgba(249,239,119,0.1)':'transparent'};
                           cursor:pointer;transition:all .2s ease">
              ${a}
            </button>`).join('')}
        </div>
      </div>
      <div class="profil-name">${profil.nom||'Athlète'}</div>
      <div class="profil-level">
        ${xp.niveau.emoji} Niveau ${xp.niveau.numero}
        — ${xp.niveau.nom}
      </div>
      <div style="margin-top:var(--space-md)">
        <div class="flex justify-between"
             style="font-size:.72rem;opacity:.8;margin-bottom:4px">
          <span>${xp.total} XP</span>
          <span>${xp.niveau.xpSuivant} XP</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.2);
                    border-radius:99px;overflow:hidden">
          <div style="height:100%;width:${xp.pourcentage}%;
                      background:white;border-radius:99px;
                      transition:width 1s"></div>
        </div>
      </div>
    </div>

    <div class="stats-grid mb-md">
      <div class="stat-card">
        <span class="stat-value">${Tracker.getTotalSeances()}</span>
        <span class="stat-label">Séances</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${streak.count}🔥</span>
        <span class="stat-label">Streak</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${streak.max}🏆</span>
        <span class="stat-label">Max Streak</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">
          ${Object.keys(Tracker.getAllPRs()).length}
        </span>
        <span class="stat-label">PRs</span>
      </div>
    </div>

    <div class="card mb-md">
      <div class="card-label">⚖️ Mesures corporelles</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;
                  gap:var(--space-sm);margin-top:var(--space-md)">
        ${[
          { id:'m-poids',    label:'Poids (kg)',
            val:mesures.poids   ||profil.poids   ||'' },
          { id:'m-taille',   label:'Taille (cm)',
            val:mesures.taille  ||profil.taille  ||'' },
          { id:'m-bras',     label:'Bras (cm)',
            val:mesures.bras    ||''                   },
          { id:'m-poitrine', label:'Poitrine (cm)',
            val:mesures.poitrine||''                   },
          { id:'m-taille2',  label:'Tour taille (cm)',
            val:mesures.taille2 ||''                   },
          { id:'m-hanches',  label:'Hanches (cm)',
            val:mesures.hanches ||''                   }
        ].map(m => `
          <div>
            <div class="input-label">${m.label}</div>
            <input class="input" id="${m.id}" type="number"
                   placeholder="${m.label}" value="${m.val}" />
          </div>`).join('')}
      </div>
      <button class="btn-primary mt-md"
              onclick="sauvegarderMesures()">
        💾 Sauvegarder
      </button>
    </div>

    <div class="card">
      <div class="card-label">✏️ Modifier profil</div>
      <div class="input-label mt-md">Prénom</div>
      <input class="input" id="edit-nom"
             value="${profil.nom||''}"
             placeholder="Ton prénom" />
      <button class="btn-primary mt-md"
              onclick="sauvegarderProfil()">
        💾 Sauvegarder
      </button>
    </div>`;
}

function changerAvatar(avatar) {
  Tracker.sauvegarderProfil({ avatar });
  document.querySelectorAll('.avatar-option').forEach(btn => {
    btn.style.border      = '2px solid transparent';
    btn.style.background  = 'transparent';
    btn.classList.remove('avatar-selected');
  });
  const btnActif = document.querySelector(
    `.avatar-option[data-avatar="${avatar}"]`
  );
  if (btnActif) {
    btnActif.style.border     = '2px solid var(--fd-lemon)';
    btnActif.style.background = 'rgba(249,239,119,0.1)';
    btnActif.classList.add('avatar-selected');
  }
  Utils.toast('Avatar mis à jour !', 'success');
  Utils.vibrerBeep();
}

function sauvegarderMesures() {
  const data = {
    poids:    parseFloat(document.getElementById('m-poids')?.value)    ||undefined,
    taille:   parseFloat(document.getElementById('m-taille')?.value)   ||undefined,
    bras:     parseFloat(document.getElementById('m-bras')?.value)     ||undefined,
    poitrine: parseFloat(document.getElementById('m-poitrine')?.value) ||undefined,
    taille2:  parseFloat(document.getElementById('m-taille2')?.value)  ||undefined,
    hanches:  parseFloat(document.getElementById('m-hanches')?.value)  ||undefined
  };
  Tracker.ajouterMesure(data);
  if (data.poids)  Tracker.sauvegarderProfil({ poids:data.poids   });
  if (data.taille) Tracker.sauvegarderProfil({ taille:data.taille });
  Utils.toast('Mesures sauvegardées !', 'success');
}

function sauvegarderProfil() {
  const nom = document.getElementById('edit-nom')?.value?.trim();
  if (!nom) return;
  Tracker.sauvegarderProfil({ nom });
  Utils.toast('Profil mis à jour !', 'success');
}

// ════════════════════════════════════════════════════════════
// JOURNAL
// ════════════════════════════════════════════════════════════
function renderJournal(el) {
  const journal = Tracker.getJournal();
  el.innerHTML = `
    <button class="btn-primary mb-md"
            onclick="ajouterEntreeJournal()">
      + Nouvelle note
    </button>
    ${journal.length === 0 ? `
      <div class="card"
           style="text-align:center;padding:var(--space-xl)">
        <div style="font-size:2rem;margin-bottom:var(--space-sm)">
          📔
        </div>
        <p style="color:var(--text-muted)">
          Ton journal est vide.<br>
          Commence à noter tes séances !
        </p>
      </div>` :
      journal.map(e => `
        <div class="journal-entry">
          <div class="journal-date">
            ${Utils.formatDateCourt(e.date)}
          </div>
          ${e.seanceId ? `
            <div class="journal-seance">
              ${SEANCES_BASE[e.seanceId]?.emoji||''}
              ${SEANCES_BASE[e.seanceId]?.nom||e.seanceId}
            </div>` : ''}
          <div class="journal-text">${e.texte}</div>
          <button onclick="supprimerJournal('${e.id}')"
                  style="margin-top:var(--space-sm);
                         background:none;border:none;
                         color:var(--text-muted);
                         font-size:.75rem;cursor:pointer">
            🗑️ Supprimer
          </button>
        </div>`).join('')}`;
}

function ajouterEntreeJournal() {
  const modal   = document.getElementById('modal-info');
  const content = document.getElementById('modal-info-content');
  content.innerHTML = `
    <h3 style="margin-bottom:var(--space-md)">📔 Nouvelle note</h3>
    <textarea class="input" id="new-journal" rows="5"
              placeholder="Tes pensées, sensations, objectifs..."
              style="resize:vertical;min-height:140px"></textarea>
    <button class="btn-primary mt-md"
            onclick="sauvegarderJournal()">
      💾 Sauvegarder
    </button>`;
  modal.classList.remove('hidden');
  document.getElementById('modal-info-close').onclick =
    () => modal.classList.add('hidden');
}

function sauvegarderJournal() {
  const texte =
    document.getElementById('new-journal')?.value?.trim();
  if (!texte) return;
  Tracker.ajouterEntreeJournal(texte);
  Gamification.ajouterXP(25, 'journal');
  Defis.mettreAJourProgression();
  Utils.toast('Note ajoutée !', 'success');
  document.getElementById('modal-info')?.classList.add('hidden');
  renderProfil('journal');
}

async function supprimerJournal(id) {
  const ok = await Utils.confirmer(
    'Supprimer cette note ?',
    'Cette action est irréversible.'
  );
  if (ok) {
    Tracker.supprimerEntreeJournal(id);
    renderProfil('journal');
  }
}

// ════════════════════════════════════════════════════════════
// OBJECTIFS
// ════════════════════════════════════════════════════════════
function renderObjectifs(el) {
  const objectifs = Tracker.getObjectifs();
  el.innerHTML = `
    <button class="btn-primary mb-md"
            onclick="ajouterObjectif()">
      + Nouvel objectif
    </button>
    ${objectifs.length === 0 ? `
      <div class="card"
           style="text-align:center;padding:var(--space-xl)">
        <div style="font-size:2rem">🎯</div>
        <p style="color:var(--text-muted);margin-top:var(--space-sm)">
          Définis tes objectifs pour rester motivé !
        </p>
      </div>` :
      objectifs.map(o => {
        const pct  = Tracker.calculerProgressionObjectif(o);
        const pred = Predict.predireObjectif(o);
        return `
          <div class="objectif-card">
            <div class="objectif-header">
              <span class="objectif-name">
                ${o.emoji||'🎯'} ${o.nom}
              </span>
              <span class="objectif-pct">${pct}%</span>
            </div>
            <div class="progress-bar mb-md">
              <div class="progress-fill"
                   style="width:${pct}%;background:${
                     pct>=100?'var(--fd-mint)':'var(--fd-indigo)'}">
              </div>
            </div>
            <div class="objectif-progress">
              <span>
                Actuel:
                <strong>
                  ${o.valeurActuelle||'?'} ${o.unite||''}
                </strong>
              </span>
              <span>→ ${o.valeurCible} ${o.unite||''}</span>
              ${o.echeance
                ? `<span>📅 ${o.echeance}</span>` : ''}
            </div>
            ${pred ? `
              <div style="font-size:.72rem;color:var(--fd-mint);
                          margin-top:var(--space-sm)">
                🔮 Estimé atteint :
                ${Utils.formatDateCourt(pred.dateEstimee)}
                (~${pred.semainesEstimees} semaines)
              </div>` : ''}
            <div style="margin-top:var(--space-sm)">
              <button class="btn-secondary btn-sm"
                      onclick="mettreAJourObjectif('${o.id}')">
                ✏️ Mettre à jour
              </button>
            </div>
          </div>`;
      }).join('')}`;
}

function ajouterObjectif() {
  const modal   = document.getElementById('modal-info');
  const content = document.getElementById('modal-info-content');
  content.innerHTML = `
    <h3 style="margin-bottom:var(--space-md)">🎯 Nouvel objectif</h3>
    <div class="input-label">Objectif</div>
    <input class="input mb-md" id="obj-nom"
           placeholder="ex: Bench Press 100kg"/>
    <div class="flex gap-sm mb-md">
      <div style="flex:1">
        <div class="input-label">Valeur actuelle</div>
        <input class="input" id="obj-actuel"
               type="number" placeholder="85"/>
      </div>
      <div style="flex:1">
        <div class="input-label">Valeur cible</div>
        <input class="input" id="obj-cible"
               type="number" placeholder="100"/>
      </div>
    </div>
    <div class="flex gap-sm mb-md">
      <div style="flex:1">
        <div class="input-label">Unité</div>
        <input class="input" id="obj-unite" placeholder="kg"/>
      </div>
      <div style="flex:1">
        <div class="input-label">Émoji</div>
        <input class="input" id="obj-emoji"
               placeholder="🏋️" maxlength="2"/>
      </div>
    </div>
    <div class="input-label">Échéance (optionnel)</div>
    <input class="input mb-md" id="obj-date" type="date"/>
    <button class="btn-primary" onclick="sauvegarderObjectif()">
      💾 Ajouter
    </button>`;
  modal.classList.remove('hidden');
  document.getElementById('modal-info-close').onclick =
    () => modal.classList.add('hidden');
}

function sauvegarderObjectif() {
  const nom   = document.getElementById('obj-nom')?.value?.trim();
  const cible = parseFloat(document.getElementById('obj-cible')?.value);
  if (!nom||!cible) {
    Utils.toast('Remplis le nom et la cible !','error');
    return;
  }
  Tracker.ajouterObjectif({
    nom,
    valeurActuelle: parseFloat(
      document.getElementById('obj-actuel')?.value
    ) || 0,
    valeurCible: cible,
    unite:    document.getElementById('obj-unite')?.value || '',
    emoji:    document.getElementById('obj-emoji')?.value || '🎯',
    echeance: document.getElementById('obj-date')?.value  || null
  });
  Utils.toast('Objectif ajouté !','success');
  document.getElementById('modal-info')?.classList.add('hidden');
  renderProfil('objectifs');
}

function mettreAJourObjectif(id) {
  const obj = Tracker.getObjectifs().find(o => o.id === id);
  if (!obj) return;
  const val = prompt(
    `Valeur actuelle pour "${obj.nom}":`,
    obj.valeurActuelle
  );
  if (!val) return;
  Tracker.mettreAJourObjectif(id, {
    valeurActuelle: parseFloat(val)
  });
  if (parseFloat(val) >= obj.valeurCible) {
    Tracker.mettreAJourObjectif(id, { complete: true });
    Utils.confetti(2000);
    Utils.toast('🎉 Objectif atteint !', 'success', 4000);
    Gamification.recompenser('DEFI_SEMAINE');
  }
  renderProfil('objectifs');
}

// ════════════════════════════════════════════════════════════
// BLESSURE
// ════════════════════════════════════════════════════════════
function renderBlessure(el) {
  const blessures = Tracker.getBlessures().filter(b => b.active);
  const zones = [
    'Épaule gauche','Épaule droite','Dos haut','Dos bas',
    'Genou gauche','Genou droit','Coude','Poignet',
    'Cheville','Cou'
  ];

  el.innerHTML = `
    <div class="card mb-md">
      <div class="card-label">🩹 Signaler une douleur</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;
                  gap:var(--space-sm);margin:var(--space-md) 0">
        <div>
          <div class="input-label">Zone</div>
          <select class="input" id="b-zone">
            ${zones.map(z => `<option>${z}</option>`).join('')}
          </select>
        </div>
        <div>
          <div class="input-label">Sévérité</div>
          <select class="input" id="b-severite">
            <option value="legere">🟡 Légère</option>
            <option value="moderee">🟠 Modérée</option>
            <option value="severe">🔴 Sévère</option>
          </select>
        </div>
      </div>
      <textarea class="input mb-md" id="b-notes" rows="2"
                placeholder="Notes..."
                style="resize:none"></textarea>
      <button class="btn-primary" onclick="ajouterBlessure()">
        🩹 Signaler
      </button>
    </div>
    ${blessures.length > 0 ? `
      <div class="section-title">⚠️ Blessures actives</div>
      ${blessures.map(b => `
        <div class="card mb-md"
             style="border-color:var(--fd-coral)">
          <div class="flex justify-between items-center">
            <div>
              <div style="font-weight:600">${b.zone}</div>
              <div style="font-size:.78rem;color:var(--fd-coral)">
                ${b.severite==='severe'  ? '🔴' :
                  b.severite==='moderee' ? '🟠' : '🟡'}
                ${b.severite}
                · depuis ${Utils.formatDateCourt(b.date)}
              </div>
              ${b.notes ? `
                <div style="font-size:.78rem;
                            color:var(--text-muted);
                            margin-top:4px">
                  ${b.notes}
                </div>` : ''}
            </div>
            <button class="btn-secondary btn-sm"
                    onclick="guerirBlessure('${b.id}')">
              ✅ Guéri
            </button>
          </div>
        </div>`).join('')}` : `
      <div class="card"
           style="text-align:center;padding:var(--space-xl)">
        <div style="font-size:2rem">💪</div>
        <p style="color:var(--fd-mint);margin-top:var(--space-sm)">
          Aucune blessure active !
        </p>
      </div>`}`;
}

function ajouterBlessure() {
  const zone     = document.getElementById('b-zone')?.value;
  const severite = document.getElementById('b-severite')?.value;
  const notes    = document.getElementById('b-notes')?.value?.trim();
  if (!zone) return;
  Tracker.ajouterBlessure(zone, severite, notes);
  Utils.toast('Blessure signalée. Sois prudent !', 'info');
  renderProfil('blessure');
}

async function guerirBlessure(id) {
  const ok = await Utils.confirmer('Marquer comme guéri ?', '');
  if (ok) {
    Tracker.guerirBlessure(id);
    Utils.toast('Bien récupéré ! 💪', 'success');
    renderProfil('blessure');
  }
}

// ════════════════════════════════════════════════════════════
// EXERCICES CUSTOM
// ════════════════════════════════════════════════════════════
function getExercicesCustom() {
  return Utils.storage.get('ft_exercices_custom', []);
}

function sauvegarderExercicesCustom(liste) {
  Utils.storage.set('ft_exercices_custom', liste);
  _fusionnerExercicesCustom();
}

function _fusionnerExercicesCustom() {
  const custom = getExercicesCustom();
  custom.forEach(ex => {
    window.EXERCICES[ex.ref] = {
      nom:         ex.nom,
      emoji:       ex.emoji       || '💪',
      muscle:      ex.muscle      || 'Autre',
      equipement:  ex.equipement  || 'Libre',
      description: ex.description || '',
      conseils:    ex.conseils    || [],
      difficulte:  ex.difficulte  || 2,
      custom:      true
    };
  });
}

function initExercicesCustom() {
  _fusionnerExercicesCustom();
}

function renderExercicesCustom(el) {
  const custom = getExercicesCustom();

  el.innerHTML = `
    <button class="btn-primary mb-md w-full"
            onclick="ouvrirFormExercice()">
      ➕ Créer un exercice
    </button>
    ${custom.length === 0 ? `
      <div class="card"
           style="text-align:center;padding:var(--space-xl)">
        <div style="font-size:2rem;margin-bottom:var(--space-sm)">
          🏋️
        </div>
        <p style="color:var(--text-muted);font-size:.88rem">
          Aucun exercice personnalisé.<br>
          Crée tes propres mouvements !
        </p>
      </div>` :
      custom.map(ex => `
        <div class="card mb-md">
          <div class="flex items-center gap-md">
            <div style="font-size:2rem;width:48px;text-align:center">
              ${ex.emoji || '💪'}
            </div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:.95rem">
                ${ex.nom}
              </div>
              <div style="font-size:.75rem;color:var(--fd-mint)">
                ${ex.muscle}
              </div>
              <div style="font-size:.72rem;color:var(--text-muted)">
                ${ex.equipement}
                · ${'⭐'.repeat(ex.difficulte||2)}
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px">
              <button class="btn-secondary btn-sm"
                      onclick="ouvrirFormExercice('${ex.ref}')">
                ✏️
              </button>
              <button class="btn-secondary btn-sm"
                      onclick="supprimerExerciceCustom('${ex.ref}')"
                      style="color:var(--fd-coral)">
                🗑️
              </button>
            </div>
          </div>
        </div>`).join('')}
  `;
}

function ouvrirFormExercice(ref = null) {
  const custom   = getExercicesCustom();
  const existant = ref ? custom.find(e => e.ref === ref) : null;
  const modal    = document.getElementById('modal-info');
  const content  = document.getElementById('modal-info-content');

  const muscles = [
    'Pectoraux','Dos','Épaules','Biceps','Triceps',
    'Abdominaux','Quadriceps','Ischio-jambiers',
    'Mollets','Fessiers','Avant-bras','Autre'
  ];

  content.innerHTML = `
    <h3 style="margin-bottom:var(--space-md)">
      ${existant ? '✏️ Modifier' : '➕ Créer'} un exercice
    </h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;
                gap:var(--space-sm);margin-bottom:var(--space-sm)">
      <div>
        <div class="input-label">Nom *</div>
        <input class="input" id="ex-nom"
               placeholder="ex: Hip Thrust"
               value="${existant?.nom || ''}" />
      </div>
      <div>
        <div class="input-label">Émoji</div>
        <input class="input" id="ex-emoji"
               placeholder="🏋️" maxlength="2"
               value="${existant?.emoji || '💪'}" />
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;
                gap:var(--space-sm);margin-bottom:var(--space-sm)">
      <div>
        <div class="input-label">Muscle *</div>
        <select class="input" id="ex-muscle">
          ${muscles.map(m => `
            <option value="${m}"
              ${existant?.muscle===m?'selected':''}>${m}</option>
          `).join('')}
        </select>
      </div>
      <div>
        <div class="input-label">Difficulté</div>
        <select class="input" id="ex-diff">
          ${[1,2,3,4].map(d => `
            <option value="${d}"
              ${(existant?.difficulte||2)===d?'selected':''}>
              ${'⭐'.repeat(d)} (${d}/4)
            </option>`).join('')}
        </select>
      </div>
    </div>
    <div class="input-label">Équipement</div>
    <input class="input mb-md" id="ex-equip"
           placeholder="ex: Barre + rack"
           value="${existant?.equipement || ''}" />
    <div class="input-label">Description</div>
    <textarea class="input mb-md" id="ex-desc" rows="3"
              placeholder="Décris l'exercice..."
              style="resize:none">${existant?.description||''}</textarea>
    <div class="input-label">Conseils (un par ligne)</div>
    <textarea class="input mb-md" id="ex-conseils" rows="3"
              style="resize:none">${(existant?.conseils||[]).join('\n')}</textarea>
    <button class="btn-primary w-full"
            onclick="sauvegarderFormExercice('${ref||''}')">
      💾 ${existant ? 'Modifier' : 'Créer'}
    </button>
  `;

  modal.classList.remove('hidden');
  document.getElementById('modal-info-close').onclick =
    () => modal.classList.add('hidden');
  modal.querySelector('.modal-overlay').onclick =
    () => modal.classList.add('hidden');
}

function sauvegarderFormExercice(refExistant = '') {
  const nom    = document.getElementById('ex-nom')?.value?.trim();
  const emoji  = document.getElementById('ex-emoji')?.value?.trim() || '💪';
  const muscle = document.getElementById('ex-muscle')?.value;
  const diff   = parseInt(document.getElementById('ex-diff')?.value) || 2;
  const equip  = document.getElementById('ex-equip')?.value?.trim() || '';
  const desc   = document.getElementById('ex-desc')?.value?.trim()  || '';
  const conseils = (document.getElementById('ex-conseils')?.value || '')
    .split('\n').map(c => c.trim()).filter(Boolean);

  if (!nom || !muscle) {
    Utils.toast('Nom et muscle sont obligatoires !', 'error');
    return;
  }

  const custom = getExercicesCustom();

  if (refExistant) {
    const idx = custom.findIndex(e => e.ref === refExistant);
    if (idx >= 0) {
      custom[idx] = {
        ...custom[idx], nom, emoji, muscle,
        difficulte: diff, equipement: equip,
        description: desc, conseils
      };
    }
  } else {
    const ref = 'custom_' +
      nom.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'')
      + '_' + Date.now();
    custom.push({
      ref, nom, emoji, muscle, difficulte: diff,
      equipement: equip, description: desc, conseils,
      dateCreation: Utils.aujourd_hui()
    });
  }

  sauvegarderExercicesCustom(custom);
  Utils.toast(
    refExistant ? '✅ Exercice modifié !' : '✅ Exercice créé !',
    'success'
  );
  document.getElementById('modal-info')?.classList.add('hidden');
  const el = document.getElementById('profil-content');
  if (el) renderExercicesCustom(el);
}

async function supprimerExerciceCustom(ref) {
  const ok = await Utils.confirmer(
    'Supprimer cet exercice ?',
    'Tes données liées seront conservées.'
  );
  if (!ok) return;
  const custom = getExercicesCustom().filter(e => e.ref !== ref);
  sauvegarderExercicesCustom(custom);
  delete window.EXERCICES[ref];
  Utils.toast('Exercice supprimé.', 'info');
  const el = document.getElementById('profil-content');
  if (el) renderExercicesCustom(el);
}

// ════════════════════════════════════════════════════════════
// PROGRAMME CUSTOM
// ════════════════════════════════════════════════════════════
function renderProgrammeCustom(el) {
  const planning  = Programme.getPlanningActuel();
  const toutes    = Programme.getAllSeances();
  const isCustom  = Programme.estPlanningCustom();
  const customs   = Programme.getSeancesCustom();
  const joursNoms = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];

  el.innerHTML = `
    <div class="card mb-md"
         style="background:linear-gradient(135deg,
                rgba(75,75,249,0.2) 0%,
                rgba(191,161,255,0.1) 100%)">
      <div class="flex justify-between items-center">
        <div>
          <div class="card-label">🗓️ Planning hebdomadaire</div>
          <div style="font-size:.75rem;color:var(--text-muted);
                      margin-top:4px">
            ${isCustom
              ? '✏️ Planning personnalisé actif'
              : '📋 Planning par défaut'}
          </div>
        </div>
        ${isCustom ? `
          <button class="btn-secondary btn-sm"
                  onclick="resetPlanningCustom()">
            ↺ Réinitialiser
          </button>` : ''}
      </div>
    </div>

    <div class="card mb-md">
      <div class="card-label mb-md">📅 Modifier le planning</div>
      ${planning.map((p, idx) => `
        <div class="flex items-center gap-md"
             style="padding:var(--space-sm) 0;
                    border-bottom:1px solid var(--border-color)">
          <div style="width:36px;font-size:.78rem;font-weight:700;
                      color:var(--fd-indigo)">
            ${joursNoms[idx].slice(0,3).toUpperCase()}
          </div>
          <div style="flex:1">
            <select class="input"
                    id="planning-jour-${idx}"
                    style="font-size:.8rem;padding:6px 8px">
              <option value="">😴 Repos</option>
              ${toutes.map(s => `
                <option value="${s.id}"
                  ${p.seanceId===s.id?'selected':''}>
                  ${s.emoji} ${s.nom}
                  ${s.custom?' ✏️':''}
                </option>`).join('')}
            </select>
          </div>
        </div>`).join('')}

      <button class="btn-primary mt-md w-full"
              onclick="sauvegarderPlanningCustom()">
        💾 Sauvegarder le planning
      </button>
    </div>

    <div class="card mb-md">
      <div class="flex justify-between items-center mb-md">
        <div class="card-label">💪 Mes séances</div>
        <button class="btn-secondary btn-sm"
                onclick="ouvrirFormSeance()">
          ➕ Créer
        </button>
      </div>

      <div style="font-size:.72rem;font-weight:700;
                  text-transform:uppercase;letter-spacing:.06em;
                  color:var(--text-muted);margin-bottom:var(--space-sm)">
        Séances de base
      </div>
      ${Object.values(SEANCES_BASE).map(s => `
        <div class="flex items-center justify-between"
             style="padding:var(--space-sm) 0;
                    border-bottom:1px solid var(--border-color)">
          <div>
            <div style="font-size:.88rem;font-weight:600">
              ${s.emoji} ${s.nom}
            </div>
            <div style="font-size:.72rem;color:var(--text-muted)">
              ${s.exercices.length} exercices · ${s.duree_estimee}min
            </div>
          </div>
          <button class="btn-secondary btn-sm"
                  onclick="dupliquerSeance('${s.id}')">
            📋 Dupliquer
          </button>
        </div>`).join('')}

      ${Object.keys(customs).length > 0 ? `
        <div style="font-size:.72rem;font-weight:700;
                    text-transform:uppercase;letter-spacing:.06em;
                    color:var(--fd-lemon);
                    margin-top:var(--space-md);
                    margin-bottom:var(--space-sm)">
          Mes séances ✏️
        </div>
        ${Object.values(customs).map(s => `
          <div class="flex items-center justify-between"
               style="padding:var(--space-sm) 0;
                      border-bottom:1px solid var(--border-color)">
            <div>
              <div style="font-size:.88rem;font-weight:600">
                ${s.emoji} ${s.nom}
              </div>
              <div style="font-size:.72rem;color:var(--text-muted)">
                ${s.exercices.length} exercices · ${s.duree_estimee}min
              </div>
            </div>
            <div style="display:flex;gap:4px">
              <button class="btn-secondary btn-sm"
                      onclick="ouvrirFormSeance('${s.id}')">
                ✏️
              </button>
              <button class="btn-secondary btn-sm"
                      onclick="supprimerSeanceCustom('${s.id}')"
                      style="color:var(--fd-coral)">
                🗑️
              </button>
            </div>
          </div>`).join('')}
      ` : ''}
    </div>
  `;
}

function sauvegarderPlanningCustom() {
  const joursNoms = ['LUN','MAR','MER','JEU','VEN','SAM','DIM'];
  const nouveau = joursNoms.map((label, idx) => ({
    jour:     idx,
    label,
    seanceId: document.getElementById(`planning-jour-${idx}`)?.value || null
  }));
  Programme.sauvegarderPlanning(nouveau);
  Utils.toast('✅ Planning sauvegardé !', 'success');
  Utils.vibrerBeep();
  const el = document.getElementById('profil-content');
  if (el) renderProgrammeCustom(el);
}

async function resetPlanningCustom() {
  const ok = await Utils.confirmer(
    'Réinitialiser le planning ?',
    'Le planning par défaut sera restauré.'
  );
  if (!ok) return;
  Programme.resetPlanning();
  Utils.toast('Planning réinitialisé !', 'info');
  const el = document.getElementById('profil-content');
  if (el) renderProgrammeCustom(el);
}

async function dupliquerSeance(id) {
  Programme.dupliquerSeanceBase(id);
  Utils.toast('Séance dupliquée ! Tu peux la modifier.', 'success');
  const el = document.getElementById('profil-content');
  if (el) renderProgrammeCustom(el);
}

async function supprimerSeanceCustom(id) {
  const ok = await Utils.confirmer(
    'Supprimer cette séance ?',
    'Elle sera retirée du planning si nécessaire.'
  );
  if (!ok) return;
  Programme.supprimerSeanceCustom(id);
  Utils.toast('Séance supprimée.', 'info');
  const el = document.getElementById('profil-content');
  if (el) renderProgrammeCustom(el);
}

function ouvrirFormSeance(id = null) {
  const customs  = Programme.getSeancesCustom();
  const existant = id ? customs[id] : null;
  const modal    = document.getElementById('modal-info');
  const content  = document.getElementById('modal-info-content');
  const toutesExos = Object.entries(EXERCICES);

  content.innerHTML = `
    <h3 style="margin-bottom:var(--space-md)">
      ${existant ? '✏️ Modifier' : '➕ Créer'} une séance
    </h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;
                gap:var(--space-sm);margin-bottom:var(--space-sm)">
      <div>
        <div class="input-label">Nom *</div>
        <input class="input" id="s-nom"
               placeholder="ex: Push Day"
               value="${existant?.nom || ''}" />
      </div>
      <div>
        <div class="input-label">Émoji</div>
        <input class="input" id="s-emoji"
               placeholder="💪" maxlength="2"
               value="${existant?.emoji || '💪'}" />
      </div>
    </div>
    <div class="input-label">Durée estimée (min)</div>
    <input class="input mb-md" id="s-duree"
           type="number" placeholder="60"
           value="${existant?.duree_estimee || 60}" />
    <div class="card-label mb-sm">🏋️ Exercices</div>
    <div id="seance-exercices-list">
      ${(existant?.exercices || []).map((ex, i) =>
        _renderLigneExerciceForm(ex, i, toutesExos)
      ).join('')}
    </div>
    <button class="btn-secondary mt-sm mb-md w-full"
            onclick="ajouterLigneExercice()">
      ➕ Ajouter un exercice
    </button>
    <button class="btn-primary w-full"
            onclick="sauvegarderFormSeance('${id || ''}')">
      💾 ${existant ? 'Modifier' : 'Créer'}
    </button>
  `;

  window._seanceLigneCount = existant?.exercices?.length || 0;
  modal.classList.remove('hidden');
  document.getElementById('modal-info-close').onclick =
    () => modal.classList.add('hidden');
  modal.querySelector('.modal-overlay').onclick =
    () => modal.classList.add('hidden');
}

function _renderLigneExerciceForm(ex = null, idx, toutesExos) {
  return `
    <div class="seance-exo-ligne"
         id="exo-ligne-${idx}"
         style="display:grid;
                grid-template-columns:1fr 60px 60px 60px 32px;
                gap:4px;margin-bottom:4px;align-items:center">
      <select class="input" id="exo-ref-${idx}"
              style="font-size:.75rem;padding:6px 4px">
        ${toutesExos.map(([ref, e]) => `
          <option value="${ref}"
            ${ex?.ref===ref?'selected':''}>
            ${e.emoji} ${e.nom}
          </option>`).join('')}
      </select>
      <input class="input" id="exo-series-${idx}"
             type="number" placeholder="Sér."
             value="${ex?.series||3}"
             style="font-size:.75rem;padding:6px 4px;text-align:center"/>
      <input class="input" id="exo-reps-${idx}"
             type="text" placeholder="Reps"
             value="${ex?.reps||'10'}"
             style="font-size:.75rem;padding:6px 4px;text-align:center"/>
      <input class="input" id="exo-repos-${idx}"
             type="number" placeholder="Repos"
             value="${ex?.repos||90}"
             style="font-size:.75rem;padding:6px 4px;text-align:center"/>
      <button onclick="supprimerLigneExercice(${idx})"
              style="background:none;border:none;
                     color:var(--fd-coral);font-size:1rem;
                     cursor:pointer;padding:4px">
        ✕
      </button>
    </div>`;
}

function ajouterLigneExercice() {
  const toutesExos = Object.entries(EXERCICES);
  const idx = window._seanceLigneCount || 0;
  window._seanceLigneCount = idx + 1;
  const liste = document.getElementById('seance-exercices-list');
  if (!liste) return;
  const div = document.createElement('div');
  div.innerHTML = _renderLigneExerciceForm(null, idx, toutesExos);
  liste.appendChild(div.firstElementChild);
}

function supprimerLigneExercice(idx) {
  document.getElementById(`exo-ligne-${idx}`)?.remove();
}

function sauvegarderFormSeance(idExistant = '') {
  const nom   = document.getElementById('s-nom')?.value?.trim();
  const emoji = document.getElementById('s-emoji')?.value?.trim() || '💪';
  const duree = parseInt(document.getElementById('s-duree')?.value) || 60;

  if (!nom) {
    Utils.toast('Entre un nom pour la séance !', 'error');
    return;
  }

  const exercices = [];
  const lignes = document.querySelectorAll('.seance-exo-ligne');
  lignes.forEach(ligne => {
    const id = ligne.id.replace('exo-ligne-', '');
    const ref    = document.getElementById(`exo-ref-${id}`)?.value;
    const series = parseInt(document.getElementById(`exo-series-${id}`)?.value) || 3;
    const reps   = document.getElementById(`exo-reps-${id}`)?.value || '10';
    const repos  = parseInt(document.getElementById(`exo-repos-${id}`)?.value) || 90;
    if (ref) exercices.push({ ref, series, reps, repos });
  });

  if (exercices.length === 0) {
    Utils.toast('Ajoute au moins un exercice !', 'error');
    return;
  }

  const data = { nom, emoji, duree_estimee: duree, exercices };

  if (idExistant) {
    Programme.modifierSeanceCustom(idExistant, data);
    Utils.toast('✅ Séance modifiée !', 'success');
  } else {
    Programme.creerSeanceCustom(data);
    Utils.toast('✅ Séance créée !', 'success');
  }

  document.getElementById('modal-info')?.classList.add('hidden');
  const el = document.getElementById('profil-content');
  if (el) renderProgrammeCustom(el);
}

// ════════════════════════════════════════════════════════════
// OUTILS
// ════════════════════════════════════════════════════════════
function renderOutils(el) {
  const config = Notifications.getConfig();
  const langue = i18n.getLangue();

  el.innerHTML = `

    <!-- Langue -->
    <div class="card mb-md">
      <div class="card-label">🌍 ${t('commun.ok') === 'OK' ? 'Language' : 'Langue'}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;
                  gap:var(--space-md);margin-top:var(--space-md)">
        <button onclick="i18n.setLangue('fr')"
                class="langue-btn ${langue==='fr'?'active':''}">
          <span class="langue-flag">🇫🇷</span>
          <span class="langue-nom">Français</span>
          ${langue==='fr'?'<span class="langue-actif">✅ Actif</span>':''}
        </button>
        <button onclick="i18n.setLangue('en')"
                class="langue-btn ${langue==='en'?'active':''}">
          <span class="langue-flag">🇬🇧</span>
          <span class="langue-nom">English</span>
          ${langue==='en'?'<span class="langue-actif">✅ Active</span>':''}
        </button>
      </div>
    </div>

    <!-- Données -->
    <div class="card mb-md">
      <div class="card-label">💾 Données</div>
      <input type="file" id="file-import" accept=".json"
             style="display:none"
             onchange="handleImport(this)" />
      <div style="display:grid;grid-template-columns:1fr 1fr;
                  gap:var(--space-sm);margin-top:var(--space-md)">
        <button class="btn-secondary"
                onclick="Utils.exporterJSON()">
          📤 Export JSON
        </button>
        <button class="btn-secondary"
                onclick="Utils.exporterCSV()">
          📊 Export CSV
        </button>
        <button class="btn-secondary"
                onclick="importerFichier()">
          📥 Importer
        </button>
        <button class="btn-secondary"
                onclick="genererQRSync()">
          📱 QR Sync
        </button>
        <button class="btn-secondary"
                onclick="Utils.exporterPDF()"
                style="grid-column:span 2">
          📄 Rapport PDF
        </button>
        <button class="btn-secondary"
                onclick="naviguer('share')"
                style="grid-column:span 2">
          📸 Partager mes stats
        </button>
      </div>
      <div style="margin-top:var(--space-md);padding:var(--space-sm);
                  background:var(--bg-input);
                  border-radius:var(--radius-sm)">
        <div style="font-size:.78rem;color:var(--text-secondary);
                    display:flex;justify-content:space-between;
                    align-items:center">
          <span>🎞️ GIFs: ${ExerciseGIF.statsCache().cached}/${ExerciseGIF.statsCache().total}</span>
          <button onclick="rechargerGIFs()"
                  style="background:none;border:none;
                         color:var(--fd-indigo);font-size:.78rem;
                         cursor:pointer;font-weight:600">
            🔄 Recharger
          </button>
        </div>
        <div class="progress-bar" style="margin-top:var(--space-xs)">
          <div class="progress-fill"
               style="width:${ExerciseGIF.statsCache().pct}%"></div>
        </div>
      </div>
      <div style="font-size:.72rem;color:var(--text-muted);
                  margin-top:var(--space-sm)">
        Données: ${Utils.storage.taille()}
      </div>
    </div>

    <!-- Notifications -->
    <div class="card mb-md">
      <div class="card-label">🔔 Notifications</div>
      <div style="margin-top:var(--space-md)">
        ${[
          { id:'rappelQuotidien', label:'Rappel quotidien'  },
          { id:'absence1j',       label:'Absent 1 jour'     },
          { id:'absence2j',       label:'Absent 2 jours'    },
          { id:'absence5j',       label:'Absent 5 jours+'   },
          { id:'streakDanger',    label:'Streak en danger'   },
          { id:'semaineParf',     label:'Semaine parfaite'   },
          { id:'motivationMatin', label:'Motivation matin'   }
        ].map(n => `
          <div class="toggle-row">
            <span class="toggle-label">${n.label}</span>
            <label class="toggle">
              <input type="checkbox"
                     ${config[n.id]?'checked':''}
                     onchange="Notifications.sauvegarderConfig(
                       {'${n.id}':this.checked})">
              <span class="toggle-slider"></span>
            </label>
          </div>`).join('')}
        <div style="margin-top:var(--space-md)">
          <div class="input-label">Heure rappel</div>
          <input class="input" type="time"
                 value="${config.heureRappel}"
                 onchange="Notifications.sauvegarderConfig(
                   {heureRappel:this.value})"/>
        </div>
        <div style="margin-top:var(--space-md)">
          <div class="input-label">Ton des messages</div>
          <select class="input"
                  onchange="Notifications.sauvegarderConfig(
                    {ton:this.value})">
            <option value="motivant"
              ${config.ton==='motivant'?'selected':''}>
              💪 Motivant
            </option>
            <option value="doux"
              ${config.ton==='doux'?'selected':''}>
              🌸 Doux
            </option>
            <option value="severe"
              ${config.ton==='severe'?'selected':''}>
              🔥 Sévère
            </option>
          </select>
        </div>
        <button class="btn-secondary mt-md"
                onclick="Notifications.tester()">
          🔔 Tester une notification
        </button>
      </div>
    </div>

    <!-- Paramètres -->
    <div class="card mb-md">
      <div class="card-label">⚙️ Paramètres</div>
      <div style="margin-bottom:var(--space-md)">
        <div class="input-label">Thème</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);
                    gap:var(--space-xs);margin-top:var(--space-xs)">
          ${[
            { val:'dark',     label:'🌙 Dark'    },
            { val:'light',    label:'☀️ Light'   },
            { val:'indigo',   label:'💜 Indigo'  },
            { val:'midnight', label:'⭐ Midnight' }
          ].map(t => {
            const actuel = document.documentElement
              .getAttribute('data-theme') || 'dark';
            const isActif = actuel === t.val;
            return `
              <button class="theme-btn"
                      data-theme="${t.val}"
                      onclick="appliquerTheme('${t.val}')"
                      style="padding:var(--space-sm) 4px;
                             border-radius:var(--radius-sm);
                             border:2px solid ${isActif
                               ? 'var(--fd-indigo)'
                               : 'var(--border-color)'};
                             background:${isActif
                               ? 'var(--fd-indigo-dim)'
                               : 'var(--bg-card)'};
                             font-size:.7rem;font-weight:600;
                             cursor:pointer;transition:all .2s">
                ${t.label}
              </button>`;
          }).join('')}
        </div>
      </div>
      <div style="margin-bottom:var(--space-md)">
        <div class="input-label">Objectif séances/semaine</div>
        <select class="input"
                onchange="Utils.storage.set(
                  'ft_objectif_seances_semaine',parseInt(this.value))">
          ${[3,4,5].map(n => `
            <option value="${n}"
              ${Utils.storage.get('ft_objectif_seances_semaine',4)===n
                ?'selected':''}>
              ${n} séances
            </option>`).join('')}
        </select>
      </div>
      <div>
        <div class="input-label">Unités de poids</div>
        <select class="input"
                onchange="Utils.storage.set('ft_unite_poids',this.value)">
          <option value="kg"
            ${Utils.storage.get('ft_unite_poids','kg')==='kg'?'selected':''}>
            ⚖️ Kilogrammes (kg)
          </option>
          <option value="lbs"
            ${Utils.storage.get('ft_unite_poids','kg')==='lbs'?'selected':''}>
            🇺🇸 Livres (lbs)
          </option>
        </select>
      </div>
    </div>

    <!-- Danger zone -->
    <div class="card" style="border-color:rgba(255,141,150,0.3)">
      <div class="card-label" style="color:var(--fd-coral)">
        ⚠️ Zone danger
      </div>
      <button class="btn-danger mt-md w-full"
              onclick="resetDonnees()">
        🗑️ Réinitialiser toutes les données
      </button>
    </div>
  `;
}

// ─── OUTILS — Fonctions ───────────────────────────────────────
function rechargerGIFs() {
  ExerciseGIF.viderCache();
  Utils.toast('Cache GIFs vidé — Rechargement...', 'info');
  setTimeout(() => {
    ExerciseGIF.prechargerTout((current, total) => {
      if (current === total) {
        Utils.toast(`✅ ${total} GIFs rechargés !`, 'success', 2000);
      }
    });
  }, 500);
}

function importerFichier() {
  document.getElementById('file-import')?.click();
}

async function handleImport(input) {
  if (!input.files) return;
  await Utils.importerJSON(input.files);
  window.location.reload();
}

async function resetDonnees() {
  const ok = await Utils.confirmer(
    '⚠️ Réinitialiser TOUTES les données ?',
    'Cette action est IRRÉVERSIBLE. Toute ta progression sera perdue.'
  );
  if (!ok) return;
  const ok2 = await Utils.confirmer(
    'Dernière confirmation',
    'Es-tu absolument certain ? Exporte d\'abord tes données.'
  );
  if (!ok2) return;
  Tracker.resetComplet();
  Utils.toast('Données réinitialisées. Rechargement...', 'info');
  setTimeout(() => window.location.reload(), 1500);
}

async function genererQRSync() {
  const data    = Utils.storage.exporter();
  const json    = JSON.stringify(data);
  const modal   = document.getElementById('modal-info');
  const content = document.getElementById('modal-info-content');

  content.innerHTML = `
    <h3 style="margin-bottom:var(--space-md);text-align:center">
      📱 QR Code Sync
    </h3>
    <p style="font-size:.82rem;color:var(--text-muted);
              text-align:center;margin-bottom:var(--space-md)">
      Scanne ce QR sur ton autre appareil.
    </p>
    <div style="text-align:center">
      <canvas id="qr-canvas" width="200" height="200"
              style="border-radius:var(--radius-md);
                     background:white;padding:8px">
      </canvas>
    </div>
    <p style="font-size:.72rem;color:var(--text-muted);
              text-align:center;margin-top:var(--space-md)">
      ${(json.length/1024).toFixed(1)} KB
    </p>`;

  modal.classList.remove('hidden');
  document.getElementById('modal-info-close').onclick =
    () => modal.classList.add('hidden');

  await Utils.genererQR(
    json.substring(0, 500),
    document.getElementById('qr-canvas')
  );
}

console.log('✅ App.js v2.0 chargé — FitTracker Pro complet !');
