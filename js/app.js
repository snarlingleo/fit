/* ============================================================
   FitTracker Pro — App.js
   Router SPA + Init + Pages complètes
   ============================================================ */

// ─── ÉTAT GLOBAL ──────────────────────────────────────────────
const AppState = {
  pageCourante:   'home',
  seanceEnCours:  null,
  exerciceIndex:  0,
  serieActuelle:  1,
  thème:          'dark',
  installPrompt:  null
};

// ─── INITIALISATION ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🏋️ FitTracker Pro — Démarrage');

  // Service Worker
  await initServiceWorker();

  // Splash screen
  await afficherSplash();

  // Premier lancement ?
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
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          document.getElementById('update-banner')?.classList.remove('hidden');
        }
      });
    });

    document.getElementById('btn-update')?.addEventListener('click', () => {
      reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    });

  } catch(e) {
    console.warn('SW Error:', e);
  }
}

// ─── SPLASH SCREEN ────────────────────────────────────────────
function afficherSplash() {
  return new Promise(resolve => {
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) {
        splash.style.opacity = '0';
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
let onboardingStep = 0;

function afficherOnboarding() {
  const wrapper    = document.getElementById('onboarding');
  const appWrapper = document.getElementById('app-wrapper');

  wrapper.classList.remove('hidden');
  appWrapper.classList.add('hidden');

  renderOnboardingStep(0);
}

function renderOnboardingStep(step) {
  onboardingStep = step;
  const wrapper  = document.getElementById('onboarding');

  const etapes = [
    {
      emoji: '🏋️',
      titre: 'Bienvenue sur FitTracker Pro',
      desc:  'Ton coach personnel pour la salle Basic-Fit. Programme long terme, suivi complet, notifications intelligentes.',
      action: 'Commencer'
    },
    {
      emoji: '👤',
      titre: 'Comment tu t\'appelles ?',
      desc:  '',
      champ: { id: 'ob-nom', placeholder: 'Ton prénom', type: 'text' },
      action: 'Continuer'
    },
    {
      emoji: '⚖️',
      titre: 'Tes mesures',
      desc:  'Pour calculer tes stats et personnaliser ton programme.',
      champs: [
        { id: 'ob-poids',  placeholder: 'Poids (kg)',   type: 'number' },
        { id: 'ob-taille', placeholder: 'Taille (cm)',  type: 'number' }
      ],
      action: 'Continuer'
    },
    {
      emoji: '🔔',
      titre: 'Activer les rappels ?',
      desc:  'Reçois des notifications si tu sautes une séance. Tu peux modifier ça plus tard.',
      action: 'Activer',
      actionAlt: 'Plus tard'
    },
    {
      emoji: '🚀',
      titre: 'Tout est prêt !',
      desc:  'Ton programme commence aujourd\'hui. Allons-y !',
      action: 'Lancer l\'app'
    }
  ];

  const e = etapes[step];

  wrapper.innerHTML = `
    <div class="onboarding-step">
      <div class="onboarding-dots">
        ${etapes.map((_,i) => `<div class="dot ${i===step?'active':''}"></div>`).join('')}
      </div>

      <div class="onboarding-emoji">${e.emoji}</div>
      <h2>${e.titre}</h2>
      ${e.desc ? `<p>${e.desc}</p>` : ''}

      ${e.champ ? `
        <input class="input mt-lg" id="${e.champ.id}"
               type="${e.champ.type}" placeholder="${e.champ.placeholder}"
               autocomplete="off" />
      ` : ''}

      ${e.champs ? `
        <div class="flex-col gap-sm mt-lg">
          ${e.champs.map(c => `
            <input class="input" id="${c.id}"
                   type="${c.type}" placeholder="${c.placeholder}" />
          `).join('')}
        </div>
      ` : ''}

      <div style="margin-top:var(--space-xl)">
        <button class="btn-primary" onclick="avancerOnboarding(${step})">
          ${e.action}
        </button>
        ${e.actionAlt ? `
          <button class="btn-secondary mt-md"
                  onclick="avancerOnboarding(${step}, true)">
            ${e.actionAlt}
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

async function avancerOnboarding(step, alt = false) {
  // Sauvegarder selon l'étape
  if (step === 1) {
    const nom = document.getElementById('ob-nom')?.value?.trim();
    if (!nom) { Utils.toast('Entre ton prénom !', 'error'); return; }
    Tracker.sauvegarderProfil({ nom });
  }

  if (step === 2) {
    const poids  = parseFloat(document.getElementById('ob-poids')?.value);
    const taille = parseFloat(document.getElementById('ob-taille')?.value);
    if (!poids || !taille) { Utils.toast('Remplis tes mesures !', 'error'); return; }
    Tracker.sauvegarderProfil({ poids, taille });
    Tracker.ajouterMesure({ poids, taille });
  }

  if (step === 3 && !alt) {
    await Notifications.init();
  }

  if (step === 4) {
    // Fin onboarding
    Programme.setDateDebut(Utils.aujourd_hui());
    Gamification.recompenser('PREMIERE_SEANCE');
    document.getElementById('onboarding').classList.add('hidden');
    lancerApp();
    return;
  }

  renderOnboardingStep(step + 1);
}

// ─── LANCER L'APP ─────────────────────────────────────────────
function lancerApp() {
  const appWrapper = document.getElementById('app-wrapper');
  appWrapper.classList.remove('hidden');

  initHeader();
  initNav();
  initInstallPrompt();
  initTheme();

  // Notifications
  Notifications.init();

  // ── Précharger les GIFs en arrière-plan ──────────────────
  const stats = ExerciseGIF.statsCache();
  console.log(`[GIF] Cache: ${stats.cached}/${stats.total} GIFs`);

  if (stats.cached < stats.total) {
    // Précharger silencieusement après 3 secondes
    setTimeout(() => {
      ExerciseGIF.prechargerTout((current, total) => {
        // Optionnel : afficher progression
        if (current === total) {
          Utils.toast(`✅ ${total} GIFs exercices chargés !`, 'success', 2000);
        }
      });
    }, 3000);
  }

  // Vérifier URL params
  const params = new URLSearchParams(window.location.search);
  const page   = params.get('page') || 'home';
  const action = params.get('action');

  if (action === 'start-session') {
    naviguer('training');
  } else {
    naviguer(page);
  }

  // Vérifier trophées au démarrage
  setTimeout(() => Gamification.verifierTrophees(), 2000);
}

// ─── HEADER ───────────────────────────────────────────────────
function initHeader() {
  const infos = Programme.getInfosProgramme();
  const sub   = document.getElementById('header-phase');
  if (sub) sub.textContent = infos.label;

  document.getElementById('btn-theme')?.addEventListener('click', toggleTheme);
  document.getElementById('btn-profile-quick')?.addEventListener('click',
    () => naviguer('profile'));
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

  // Mettre à jour nav
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  // Mettre à jour header
  const infos = Programme.getInfosProgramme();
  const sub   = document.getElementById('header-phase');
  if (sub) sub.textContent = infos.label;

  // Scroll top
  document.getElementById('page-content')?.scrollTo(0, 0);

  // Rendu page
  switch(page) {
    case 'home':     renderAccueil();   break;
    case 'training': renderTraining();  break;
    case 'live':     renderLive();      break;
    case 'stats':    Stats.render();    break;
    case 'profile':  renderProfil();    break;
    default:         renderAccueil();
  }
}

// ─── THÈME ────────────────────────────────────────────────────
function initTheme() {
  const theme = Utils.storage.get('ft_theme', 'dark');
  appliquerTheme(theme);
}

function toggleTheme() {
  const actuel   = document.documentElement.getAttribute('data-theme');
  const nouveau  = actuel === 'dark' ? 'light' : 'dark';
  appliquerTheme(nouveau);
  Utils.storage.set('ft_theme', nouveau);
}

function appliquerTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('btn-theme');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  AppState.thème = theme;
}

// ─── INSTALL PROMPT ───────────────────────────────────────────
function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    AppState.installPrompt = e;
    const banner = document.getElementById('install-prompt');
    if (banner) banner.classList.remove('hidden');
  });

  document.getElementById('btn-install')?.addEventListener('click', async () => {
    if (!AppState.installPrompt) return;
    AppState.installPrompt.prompt();
    const result = await AppState.installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      Utils.toast('App installée ! 🎉', 'success');
    }
    document.getElementById('install-prompt')?.classList.add('hidden');
  });

  document.getElementById('btn-install-dismiss')?.addEventListener('click', () => {
    document.getElementById('install-prompt')?.classList.add('hidden');
  });
}

// ════════════════════════════════════════════════════════════
// PAGE ACCUEIL
// ════════════════════════════════════════════════════════════
function renderAccueil() {
  const container = document.getElementById('page-content');
  const profil    = Tracker.getProfil();
  const infos     = Programme.getInfosProgramme();
  const seance    = Programme.getProchaineSeance();
  const streak    = Tracker.getStreak();
  const score     = Tracker.calculerScoreForme();
  const humeur    = Tracker.getHumeur();
  const fatigue   = Tracker.getFatigue();
  const coach     = Coach.getMessageDuJour();
  const defi      = getDefiSemaine();
  const seanceDJ  = Tracker.getSeancesParSemaine();
  const objectif  = Utils.storage.get('ft_objectif_seances_semaine', 4);

  container.innerHTML = `
    <!-- Carte hero -->
    <div class="card card-indigo mb-md" style="position:relative;overflow:hidden">
      <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;
                  background:rgba(255,255,255,0.05);border-radius:50%"></div>
      <div style="position:absolute;bottom:-40px;right:20px;width:80px;height:80px;
                  background:rgba(255,255,255,0.04);border-radius:50%"></div>

      <div style="font-size:.8rem;opacity:.8;margin-bottom:4px">
        ${Utils.salutation()} 👋
      </div>
      <div style="font-size:1.8rem;font-weight:800;margin-bottom:var(--space-md)">
        ${profil.nom || 'Athlète'}
      </div>

      ${seance ? `
        <div style="background:rgba(255,255,255,0.12);border-radius:var(--radius-md);
                    padding:var(--space-md);cursor:pointer"
             onclick="naviguer('training')">
          <div style="font-size:.65rem;font-weight:700;letter-spacing:.08em;
                      text-transform:uppercase;opacity:.7;margin-bottom:4px">
            ${seance.dansJours === 0 ? "Séance du jour" : `Dans ${seance.dansJours} jour${seance.dansJours>1?'s':''}`}
          </div>
          <div style="font-size:1rem;font-weight:700">
            ${seance.emoji} ${seance.nom}
          </div>
          <div style="font-size:.75rem;opacity:.7;margin-top:2px">
            ${infos.label} · ~${seance.duree_estimee}min
          </div>
        </div>

        <!-- Barre progression cycle -->
        <div style="margin-top:var(--space-md)">
          <div class="flex justify-between" style="font-size:.7rem;opacity:.7;margin-bottom:4px">
            <span>Cycle ${infos.cycle} · ${infos.phase.nom}</span>
            <span>${infos.progression}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${infos.progression}%"></div>
          </div>
        </div>
      ` : `
        <div style="font-size:.9rem;opacity:.8">🎉 Programme terminé ! Un nouveau cycle commence.</div>
      `}
    </div>

    <!-- Humeur du jour -->
    <div class="card mb-md">
      <div class="card-label">😊 Humeur du jour</div>
      <div class="humeur-grid mt-md">
        ${['🔥','😊','😐','😒','😤'].map(h => `
          <button class="humeur-btn ${humeur?.humeur === h ? 'selected' : ''}"
                  onclick="selectionnerHumeur('${h}')">
            ${h}
          </button>`).join('')}
      </div>
    </div>

    <!-- Stats rapides -->
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
        <span class="stat-value">S${infos.semaine}</span>
        <span class="stat-label">Semaine</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">${infos.progression}%</span>
        <span class="stat-label">Cycle</span>
      </div>
    </div>

    <!-- Anneau progression jour -->
    <div class="card mb-md">
      <div class="flex items-center justify-between">
        <div>
          <div class="card-label">🎯 Objectif semaine</div>
          <div style="font-size:1.4rem;font-weight:800;color:var(--fd-indigo);margin-top:4px">
            ${seanceDJ}/${objectif} séances
          </div>
          <div style="font-size:.78rem;color:var(--text-muted)">
            ${objectif - seanceDJ > 0
              ? `${objectif - seanceDJ} séance${objectif-seanceDJ>1?'s':''} restante${objectif-seanceDJ>1?'s':''}`
              : '✅ Objectif atteint !'}
          </div>
        </div>
        <div style="position:relative;width:80px;height:80px">
          <canvas id="anneau-semaine" width="80" height="80"></canvas>
          <div style="position:absolute;inset:0;display:flex;align-items:center;
                      justify-content:center;font-size:1.1rem;font-weight:800;
                      color:var(--fd-indigo)">
            ${Math.round((seanceDJ/objectif)*100)}%
          </div>
        </div>
      </div>
    </div>

    <!-- Score Forme -->
    <div class="score-forme-card mb-md">
      <div class="flex justify-between items-center mb-md">
        <div class="card-label">⚡ Score Forme</div>
        <span class="chip chip-${
          score.score >= 80 ? 'mint' : score.score >= 60 ? 'lemon' :
          score.score >= 40 ? 'coral' : 'coral'}">${score.niveau}</span>
      </div>
      <div class="score-forme-content">
        <div class="score-circle">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle class="ring-bg" cx="40" cy="40" r="34" />
            <circle class="ring-fill" cx="40" cy="40" r="34"
              stroke-dasharray="${2 * Math.PI * 34}"
              stroke-dashoffset="${2 * Math.PI * 34 * (1 - score.score/100)}"
              style="transition:stroke-dashoffset 1s ease;transform:rotate(-90deg);transform-origin:center" />
          </svg>
          <div class="score-number">
            ${score.score}
            <span class="score-sub">/100</span>
          </div>
        </div>
        <div class="score-details">
          ${[
            { label:'💤 Récup',    val: score.recup },
            { label:'📅 Assiduité',val: score.assiduite },
            { label:'📈 Progres.', val: score.progression }
          ].map(r => `
            <div class="score-row">
              <span class="score-row-label">${r.label}</span>
              <span class="score-row-value">${r.val}%</span>
            </div>
          `).join('')}
          <div class="progress-bar mt-md">
            <div class="progress-fill" style="width:${score.score}%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Coach message -->
    <div class="coach-card mb-md">
      <div class="coach-header">
        <span class="coach-icon">${coach.emoji}</span>
        <span class="coach-label">Coach du jour</span>
      </div>
      <p class="coach-message">${coach.message}</p>
    </div>

    <!-- Défi semaine -->
    <div class="card mb-md">
      <div class="flex justify-between items-center">
        <div class="card-label">🎯 Défi semaine</div>
        <span class="chip chip-indigo">${seanceDJ}/${objectif}</span>
      </div>
      <p style="font-size:.9rem;color:var(--text-primary);margin:var(--space-sm) 0">
        ${defi.description}
      </p>
      <div class="progress-bar">
        <div class="progress-fill"
             style="width:${Math.min(100,(seanceDJ/objectif)*100)}%;
                    background:${seanceDJ>=objectif?'var(--fd-mint)':'var(--fd-indigo)'}">
        </div>
      </div>
    </div>

    <!-- Niveau fatigue -->
    <div class="card mb-md">
      <div class="card-label">🌡️ Niveau de fatigue</div>
      <div class="flex gap-sm mt-md">
        ${[
          { val:0, label:'Frais', color:'var(--fd-mint)'     },
          { val:1, label:'OK',    color:'var(--fd-lemon)'    },
          { val:2, label:'Modéré',color:'var(--fd-coral)'    },
          { val:3, label:'Épuisé',color:'rgba(255,141,150,.6)'}
        ].map(f => `
          <button onclick="selectionnerFatigue(${f.val})"
                  style="flex:1;padding:var(--space-sm) 4px;border-radius:var(--radius-md);
                         border:2px solid ${fatigue?.niveau === f.val ? f.color : 'var(--border-color)'};
                         background:${fatigue?.niveau === f.val ? f.color + '22' : 'var(--bg-card)'};
                         color:${fatigue?.niveau === f.val ? f.color : 'var(--text-muted)'};
                         font-size:.72rem;font-weight:600;transition:all .2s">
            ${f.label}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Warm-up suggéré -->
    <div class="card mb-md" onclick="naviguer('training')" style="cursor:pointer">
      <div class="flex justify-between items-center">
        <div>
          <div class="card-label">🌡️ Warm-up suggéré</div>
          <div style="font-size:.88rem;color:var(--text-primary);margin-top:4px">
            ${(Coach.getWarmupDuJour()?.[0]?.nom) || '5 min · Cardio léger'}
          </div>
          <div style="font-size:.72rem;color:var(--text-muted)">
            ${Coach.getWarmupDuJour()?.length || 0} exercices
          </div>
        </div>
        <span style="color:var(--fd-indigo);font-size:1.2rem">→</span>
      </div>
    </div>
  `;

  // Anneau semaine
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

function getDefiSemaine() {
  const objectif = Utils.storage.get('ft_objectif_seances_semaine', 4);
  return {
    description: `Réalise ${objectif} séances cette semaine !`,
    objectif
  };
}

// ════════════════════════════════════════════════════════════
// PAGE TRAINING
// ════════════════════════════════════════════════════════════
function renderTraining(tab = 'planning', seanceOffset = 0) {
  const container = document.getElementById('page-content');
  const tabs = ['planning','exercices','timer','phases','recup'];

  container.innerHTML = `
    <div class="tabs-container">
      ${tabs.map(t => `
        <button class="tab-btn ${tab===t?'active':''}"
                onclick="renderTraining('${t}')">
          ${{planning:'📅 Planning',exercices:'🏋️ Exercices',
             timer:'⏱️ Timer',phases:'📈 Phases',recup:'🧘 Récup'}[t]}
        </button>`).join('')}
    </div>
    <div id="training-content"></div>
  `;

  const content = document.getElementById('training-content');

  switch(tab) {
    case 'planning':   renderPlanning(content, seanceOffset);  break;
    case 'exercices':  renderListeExercices(content);          break;
    case 'timer':      renderTimerStandalone(content);         break;
    case 'phases':     renderPhases(content);                  break;
    case 'recup':      renderRecup(content);                   break;
  }
}

// ── Planning semaine ──────────────────────────────────────────
let planningOffset = 0;

function renderPlanning(el, offset = 0) {
  planningOffset = offset;
  const semaines = Programme.getSeancesSemaine(offset);
  const infos    = Programme.getInfosProgramme();
  const semNum   = infos.semaine + offset;

  el.innerHTML = `
    <!-- Navigation semaine -->
    <div class="flex items-center justify-between mb-md">
      <button class="btn-icon" onclick="renderTraining('planning', ${offset-1})">◄</button>
      <div style="text-align:center">
        <div style="font-weight:700;font-size:1rem">SEMAINE ${semNum}</div>
        <div style="font-size:.72rem;color:var(--text-muted)">${infos.phase.emoji} ${infos.phase.nom}</div>
      </div>
      <button class="btn-icon" onclick="renderTraining('planning', ${offset+1})">►</button>
    </div>

    <!-- Jours -->
    <div class="card">
      ${semaines.map(jour => `
        <div class="seance-card">
          <span class="seance-day" style="${jour.estAujourdhui?'color:var(--fd-indigo);font-weight:800':''}">${jour.label}</span>
          <div class="seance-info">
            ${jour.seance ? `
              <div class="seance-name">
                ${jour.seance.emoji} ${jour.seance.nom}
              </div>
              <div class="seance-meta">
                ${jour.seance.exercices.length} exercices · ~${jour.seance.duree_estimee}min
              </div>
            ` : `
              <div class="seance-name" style="color:var(--text-muted)">
                ✨ Récupération
              </div>
            `}
          </div>
          ${jour.seance ? `
            <button class="badge-seance"
                    onclick="ouvrirSeance('${jour.seance.id}')">
              ${jour.estPasse && !jour.estAujourdhui ? '📋' : '▶'} Séance
            </button>
          ` : `
            <span class="badge-repos">Repos</span>
          `}
        </div>
      `).join('')}
    </div>
  `;
}

// ── Liste exercices ───────────────────────────────────────────
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
        <div class="section-title">${exos[0]?.emoji || '💪'} ${muscle}</div>
        ${exos.map(ex => {
          const gifUID = `list_gif_${ex.ref}`;
          return `
            <div class="exercice-card mb-md"
                 onclick="afficherDetailExercice('${ex.ref}')">
              <div class="exercice-header">

                <!-- Mini GIF -->
                <div id="${gifUID}"
                     style="width:70px;height:70px;border-radius:var(--radius-md);
                            background:var(--fd-indigo-dim);display:flex;
                            align-items:center;justify-content:center;
                            font-size:1.8rem;flex-shrink:0;overflow:hidden">
                  ${ex.emoji}
                </div>

                <div class="exercice-details">
                  <div class="exercice-name">${ex.nom}</div>
                  <div class="exercice-muscle">${ex.muscle}</div>
                  <div class="exercice-volume">${ex.equipement}</div>
                  <div style="display:flex;gap:4px;margin-top:4px;font-size:.75rem">
                    ${'⭐'.repeat(ex.difficulte)}${'☆'.repeat(4-ex.difficulte)}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      `).join('')}
    </div>
  `;

  // ── Charger les GIFs mini en différé ──────────────────────
  // On charge seulement les GIFs visibles (Intersection Observer)
  _observerGIFs();
}

// Observer pour lazy load des GIFs
function _observerGIFs() {
  const observer = new IntersectionObserver((entries) => {
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

  // Observer tous les conteneurs GIF de la liste
  document.querySelectorAll('[id^="list_gif_"]').forEach(el => {
    const ref = el.id.replace('list_gif_', '');
    el.dataset.ref = ref;
    observer.observe(el);
  });
}

function filtrerExercices(query) {
  const q   = query.toLowerCase();
  const all = document.querySelectorAll('.exercice-card');
  all.forEach(card => {
    const txt = card.textContent.toLowerCase();
    card.style.display = txt.includes(q) ? '' : 'none';
  });
}

function afficherDetailExercice(ref) {
  const ex    = EXERCICES[ref];
  const pr    = Tracker.getPR(ref);
  if (!ex) return;

  const gifUID = `modal_gif_${ref}`;
  const modal  = document.getElementById('modal-info');
  const content = document.getElementById('modal-info-content');

  content.innerHTML = `
    <!-- GIF grand format en modal -->
    <div id="${gifUID}"
         style="width:100%;height:200px;display:flex;align-items:center;
                justify-content:center;background:var(--fd-indigo-dim);
                border-radius:var(--radius-lg);margin-bottom:var(--space-md);
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
      <div class="card-label">📍 Équipement Basic-Fit</div>
      <p style="font-size:.9rem;margin-top:var(--space-xs)">${ex.equipement}</p>
    </div>

    <div class="card mb-md">
      <div class="card-label">📖 Description</div>
      <p style="font-size:.88rem;line-height:1.6;margin-top:var(--space-xs)">
        ${ex.description}
      </p>
    </div>

    <div class="card mb-md">
      <div class="card-label">💡 Conseils technique</div>
      ${ex.conseils.map(c => `
        <div style="display:flex;gap:var(--space-sm);
                    padding:4px 0;font-size:.85rem">
          <span style="color:var(--fd-mint)">✓</span>
          <span>${c}</span>
        </div>
      `).join('')}
    </div>

    ${pr ? `
      <div class="card">
        <div class="card-label">🏆 Ton record personnel</div>
        <div class="flex justify-between mt-md">
          <div class="text-center">
            <div style="font-size:1.3rem;font-weight:800;color:var(--fd-lemon)">
              ${pr.rm1}kg
            </div>
            <div style="font-size:.7rem;color:var(--text-muted)">1RM estimé</div>
          </div>
          <div class="text-center">
            <div style="font-size:1.3rem;font-weight:800;color:var(--fd-indigo)">
              ${pr.poids}kg
            </div>
            <div style="font-size:.7rem;color:var(--text-muted)">Meilleur poids</div>
          </div>
          <div class="text-center">
            <div style="font-size:1.3rem;font-weight:800;color:var(--fd-mint)">
              ${pr.reps}
            </div>
            <div style="font-size:.7rem;color:var(--text-muted)">Meilleur reps</div>
          </div>
        </div>
      </div>
    ` : ''}
  `;

  modal.classList.remove('hidden');
  document.getElementById('modal-info-close').onclick =
    () => modal.classList.add('hidden');
  modal.querySelector('.modal-overlay').onclick =
    () => modal.classList.add('hidden');

  // ── Charger GIF async ────────────────────────────────────
  ExerciseGIF.chargerDans(ref, gifUID);
}

// ── Timer standalone ──────────────────────────────────────────
function renderTimerStandalone(el) {
  let dureeSelectionnee = 90;

  el.innerHTML = `
    <div class="timer-screen">
      <div class="timer-title">⏱️ Timer Repos</div>

      <!-- Présets -->
      <div class="timer-presets">
        ${[60,90,120,180].map(s => `
          <button class="preset-btn ${s===90?'active':''}"
                  onclick="selectionnerPreset(${s}, this)">
            ${s}s
          </button>`).join('')}
        <button class="preset-btn" onclick="demanderCustomTimer()">⚙️</button>
      </div>

      <!-- Anneau countdown -->
      <div class="countdown-ring">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle class="ring-bg" cx="100" cy="100" r="88"
                  stroke-dasharray="${2*Math.PI*88}" />
          <circle class="ring-fill" id="ring-fill" cx="100" cy="100" r="88"
                  stroke-dasharray="${2*Math.PI*88}"
                  stroke-dashoffset="0" />
        </svg>
        <div class="countdown-text">
          <div class="countdown-number" id="countdown-display">01:30</div>
          <div class="countdown-label" id="countdown-label">Prêt</div>
        </div>
      </div>

      <!-- Contrôles -->
      <div class="timer-controls mb-md">
        <button class="timer-adjust-btn" onclick="timerRepos.ajuster(-30); updateTimerUI()">-30s</button>
        <button class="btn-primary" id="btn-timer-start"
                onclick="toggleTimer()" style="flex:1;max-width:160px">
          ▶ Démarrer
        </button>
        <button class="timer-adjust-btn" onclick="timerRepos.ajuster(30); updateTimerUI()">+30s</button>
      </div>

      <!-- Son / Vibration -->
      <div class="flex gap-md justify-center">
        <label class="toggle-row" style="border:none;gap:var(--space-sm)">
          <span style="font-size:.85rem">🔔 Son</span>
          <label class="toggle">
            <input type="checkbox" id="toggle-son"
                   ${Utils.storage.get('ft_son',true)?'checked':''}
                   onchange="Utils.storage.set('ft_son', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </label>
        <label class="toggle-row" style="border:none;gap:var(--space-sm)">
          <span style="font-size:.85rem">📳 Vibration</span>
          <label class="toggle">
            <input type="checkbox" id="toggle-vib"
                   ${Utils.storage.get('ft_vibration',true)?'checked':''}
                   onchange="Utils.storage.set('ft_vibration', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </label>
      </div>
    </div>
  `;

  // Init timer display
  updateTimerUI(90);
}

let timerDureeBase = 90;

function selectionnerPreset(s, btn) {
  timerDureeBase = s;
  timerRepos.reset(s);
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  updateTimerUI(s);
  const startBtn = document.getElementById('btn-timer-start');
  if (startBtn) startBtn.textContent = '▶ Démarrer';
}

function toggleTimer() {
  const btn = document.getElementById('btn-timer-start');
  if (!timerRepos.isActif()) {
    timerRepos.demarrer(timerDureeBase,
      (restant, total) => updateTimerUI(restant, total),
      () => {
        updateTimerUI(0, timerDureeBase);
        if (btn) btn.textContent = '▶ Démarrer';
      }
    );
    if (btn) btn.textContent = '⏸ Pause';
  } else {
    timerRepos.pauseReprendre();
    if (btn) btn.textContent = timerRepos.enPause ? '▶ Reprendre' : '⏸ Pause';
  }
}

function updateTimerUI(restant = null, total = null) {
  const r = restant !== null ? restant : timerRepos.restant;
  const t = total   !== null ? total   : (timerRepos.total || timerDureeBase);
  const pct = t > 0 ? r / t : 1;

  const display = document.getElementById('countdown-display');
  const label   = document.getElementById('countdown-label');
  const ring    = document.getElementById('ring-fill');

  if (display) display.textContent = Utils.formatDureeMin(r);
  if (label)   label.textContent   = r === 0 ? '✅ C\'est parti !' : timerRepos.actif ? 'Repos...' : 'Prêt';
  if (ring) {
    const circ = 2 * Math.PI * 88;
    ring.style.strokeDashoffset = circ * (1 - pct);
    ring.style.stroke = r <= 3 ? 'var(--fd-coral)' : r <= 10 ? 'var(--fd-lemon)' : 'var(--fd-indigo)';
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
  const infos    = Programme.getInfosProgramme();
  const cycle    = infos.cycle;
  const semaine  = infos.semaineInCycle;

  const phases = [
    { num:1, nom:'Reprise',      emoji:'🌱', desc:'Technique & Adaptation',   s:'S1-S4',  intensite:'65-70%',color:'var(--fd-mint)'     },
    { num:2, nom:'Construction', emoji:'🏗️', desc:'Volume & Hypertrophie',    s:'S5-S8',  intensite:'75-80%',color:'var(--fd-indigo)'   },
    { num:3, nom:'Intensité',    emoji:'💥', desc:'Force & Records',          s:'S9-S12', intensite:'85-90%',color:'var(--fd-lavender)' },
    { num:4, nom:'Peak',         emoji:'🏆', desc:'Records & Décharge',       s:'S13-S16',intensite:'95%+',  color:'var(--fd-lemon)'    }
  ];

  const phaseActuelle = infos.phase.numero;

  el.innerHTML = `
    <div class="card mb-md" style="text-align:center">
      <div class="card-label">🔄 Cycle ${cycle} — Semaine ${semaine}/16</div>
      <div style="margin:var(--space-md) 0">
        <div class="progress-bar">
          <div class="progress-fill" style="width:${infos.progression}%"></div>
        </div>
        <div style="font-size:.72rem;color:var(--text-muted);margin-top:4px">
          ${infos.progression}% du cycle complété
        </div>
      </div>
    </div>

    ${phases.map(p => `
      <div class="card mb-md" style="${p.num===phaseActuelle
        ? `border-color:${p.color};background:${p.color}15`:''}">
        <div class="flex items-center gap-md">
          <div style="width:44px;height:44px;border-radius:50%;
                      background:${p.color}22;border:2px solid ${p.color};
                      display:flex;align-items:center;justify-content:center;
                      font-size:1.2rem;flex-shrink:0">
            ${p.num <= phaseActuelle - 1 ? '✅' : p.num===phaseActuelle ? p.emoji : '🔒'}
          </div>
          <div style="flex:1">
            <div style="font-weight:700;font-size:.95rem;color:${
              p.num===phaseActuelle?p.color:'var(--text-primary)'}">
              Phase ${p.num} — ${p.nom}
              ${p.num===phaseActuelle ? '<span style="font-size:.7rem;margin-left:4px">← Actuelle</span>' : ''}
            </div>
            <div style="font-size:.75rem;color:var(--text-muted)">${p.desc}</div>
            <div style="font-size:.72rem;margin-top:2px">
              <span class="chip chip-indigo">${p.s}</span>
              <span style="color:${p.color};font-weight:600;margin-left:var(--space-sm)">
                ${p.intensite} du max
              </span>
            </div>
          </div>
        </div>
      </div>
    `).join('')}
  `;
}

// ── Récup ─────────────────────────────────────────────────────
function renderRecup(el) {
  const seance    = Programme.getSeanceDuJour?.() || Programme.getProchaineSeance();
  const etirements = seance ? (ETIREMENTS[seance.id] || []) : [];

  el.innerHTML = `
    <!-- Étirements -->
    <div class="card mb-md">
      <div class="card-label">🧘 Étirements du jour</div>
      ${etirements.length === 0
        ? `<p style="color:var(--text-muted);padding:var(--space-md);text-align:center">
             Lance une séance pour voir les étirements adaptés.
           </p>`
        : etirements.map(e => `
          <div class="flex items-center gap-md"
               style="padding:var(--space-sm) 0;border-bottom:1px solid var(--border-color)">
            <span style="font-size:1.5rem">${e.gif}</span>
            <div style="flex:1">
              <div style="font-size:.9rem;font-weight:600">${e.nom}</div>
            </div>
            <div style="color:var(--fd-mint);font-size:.82rem;font-weight:600">
              ${e.duree}s
            </div>
          </div>
        `).join('')}
    </div>

    <!-- Conseils récup -->
    <div class="card">
      <div class="card-label">💡 Conseils récupération</div>
      ${[
        { emoji:'💧', titre:'Hydratation',  desc:'2.5 à 3L d\'eau par jour. +500ml après une séance intense.'   },
        { emoji:'😴', titre:'Sommeil',       desc:'7 à 9 heures. C\'est pendant le sommeil que les muscles grandissent.' },
        { emoji:'🍗', titre:'Protéines',     desc:'~2g par kg de poids corporel. Répartis sur tous les repas.'    },
        { emoji:'🧊', titre:'Bain froid',    desc:'2-3 min à 10-15°C après séance intense. Réduit l\'inflammation.'},
        { emoji:'📱', titre:'Repos actif',   desc:'Les jours de repos, marche légère ou vélo doux 20-30 min.'     }
      ].map(c => `
        <div style="display:flex;gap:var(--space-md);padding:var(--space-sm) 0;
                    border-bottom:1px solid var(--border-color)">
          <span style="font-size:1.3rem">${c.emoji}</span>
          <div>
            <div style="font-weight:600;font-size:.88rem">${c.titre}</div>
            <div style="font-size:.78rem;color:var(--text-muted);margin-top:2px">${c.desc}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ── Ouvrir une séance ─────────────────────────────────────────
function ouvrirSeance(seanceId) {
  const seance   = Programme.getSeanceComplete(seanceId);
  if (!seance) return;

  AppState.seanceChoisie = seance;

  // Afficher aperçu de la séance avec GIFs
  const container = document.getElementById('page-content');

  container.innerHTML = `
    <!-- Header -->
    <div class="flex items-center gap-md mb-md">
      <button class="btn-icon" onclick="renderTraining()">←</button>
      <div>
        <div style="font-weight:700;font-size:1.1rem">
          ${seance.emoji} ${seance.nom}
        </div>
        <div style="font-size:.75rem;color:var(--text-muted)">
          ${seance.exercices.length} exercices · ~${seance.duree_estimee}min
        </div>
      </div>
    </div>

    <!-- Warm-up -->
    <div class="card mb-md">
      <div class="card-label">🔥 Warm-up (${seance.warmup?.length || 0} exercices)</div>
      ${(seance.warmup || []).map(w => `
        <div style="display:flex;justify-content:space-between;
                    padding:var(--space-xs) 0;font-size:.85rem;
                    border-bottom:1px solid var(--border-color)">
          <span>${w.nom}</span>
          <span style="color:var(--fd-mint)">${Utils.formatDuree(w.duree)}</span>
        </div>
      `).join('')}
    </div>

    <!-- Liste exercices avec mini GIFs -->
    <div class="card mb-md">
      <div class="card-label">📋 Exercices</div>
      ${seance.exercicesDetails.map((item, i) => {
        const ex     = item.details;
        const pr     = Tracker.getPR(item.ref);
        const gifUID = `preview_gif_${item.ref}_${i}`;

        return `
          <div style="display:flex;gap:var(--space-md);
                      padding:var(--space-md) 0;
                      border-bottom:1px solid var(--border-color);
                      align-items:center">

            <!-- Mini GIF -->
            <div id="${gifUID}"
                 style="width:60px;height:60px;border-radius:var(--radius-md);
                        background:var(--fd-indigo-dim);display:flex;
                        align-items:center;justify-content:center;
                        font-size:1.5rem;flex-shrink:0;overflow:hidden">
              ${ex?.emoji || '💪'}
            </div>

            <div style="flex:1">
              <div style="font-weight:600;font-size:.92rem">
                ${i+1}. ${ex?.nom || item.ref}
              </div>
              <div style="font-size:.75rem;color:var(--fd-mint)">
                ${ex?.muscle || ''}
              </div>
              <div style="font-size:.75rem;color:var(--text-muted)">
                ${item.series} × ${item.reps} · Repos ${item.repos}s
              </div>
              ${pr ? `
                <div style="font-size:.7rem;color:var(--fd-lemon);margin-top:2px">
                  🏆 Record: ${pr.poids}kg × ${pr.reps}
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Bouton démarrer -->
    <button class="btn-primary" onclick="demarrerNouvelleSeance(AppState.seanceChoisie)"
            style="position:sticky;bottom:calc(var(--nav-height) + var(--space-md))">
      ⚡ Démarrer la séance
    </button>
  `;

  // ── Charger GIFs preview ──────────────────────────────────
  seance.exercicesDetails.forEach((item, i) => {
    setTimeout(() => {
      ExerciseGIF.chargerDans(item.ref, `preview_gif_${item.ref}_${i}`);
    }, i * 100); // Décalage pour ne pas tout charger en même temps
  });
}

// ════════════════════════════════════════════════════════════
// PAGE LIVE — Séance en cours
// ════════════════════════════════════════════════════════════
function renderLive() {
  const container = document.getElementById('page-content');
  const seance    = AppState.seanceEnCours;

  if (!seance && !AppState.seanceChoisie) {
    // Aucune séance sélectionnée — afficher le sélecteur
    renderSelecteurSeance(container);
    return;
  }

  if (!seance) {
    // Démarrer une nouvelle séance
    demarrerNouvelleSeance(AppState.seanceChoisie);
    return;
  }

  // Séance en cours — afficher l'exercice actuel
  renderExerciceActuel(container);
}

function renderExerciceActuel(container) {
  const seance   = AppState.seanceEnCours;
  if (!seance) return;

  const item     = seance.exercicesDetails[AppState.exerciceIndex];
  const ex       = item?.details;
  const derniere = Tracker.getDernierePerf(seance.id, item?.ref);
  const gifUID   = `live_gif_${item?.ref}`;

  container.innerHTML = `
    <!-- Header séance -->
    <div class="flex items-center justify-between mb-md">
      <button class="btn-secondary btn-sm"
              onclick="confirmerAbandon()">✕ Arrêter</button>
      <div style="text-align:center">
        <div style="font-weight:700;font-size:.9rem">
          ${AppState.exerciceIndex + 1}/${seance.exercicesDetails.length}
        </div>
        <div style="font-size:.72rem;color:var(--text-muted)" id="chrono-global">
          00:00
        </div>
      </div>
      <button class="btn-secondary btn-sm"
              onclick="afficherDetailExercice('${item?.ref}')">
        ℹ️ Info
      </button>
    </div>

    <!-- Exercice principal -->
    <div class="exercice-card mb-md">

      <!-- GIF démo grand format -->
      <div id="${gifUID}"
           style="width:100%;height:220px;display:flex;align-items:center;
                  justify-content:center;background:var(--fd-indigo-dim);
                  border-radius:var(--radius-md) var(--radius-md) 0 0;
                  font-size:4rem;overflow:hidden">
        ${ex?.emoji || '💪'}
      </div>

      <div style="padding:var(--space-md);text-align:center;
                  border-bottom:1px solid var(--border-color)">
        <div style="font-size:1.2rem;font-weight:700">${ex?.nom || item?.ref}</div>
        <div style="font-size:.8rem;color:var(--fd-mint);margin-top:4px">
          ${ex?.muscle || ''}
        </div>
        <div style="font-size:.75rem;color:var(--text-muted);margin-top:4px">
          ${item?.series} séries × ${item?.reps} reps · Repos ${item?.repos}s
        </div>
        ${derniere ? `
          <div style="font-size:.72rem;color:var(--fd-lemon);margin-top:4px">
            📊 Dernière fois : ${derniere.poids}kg × ${derniere.reps} reps
          </div>
        ` : ''}
      </div>

      <!-- Indicateurs séries -->
      <div style="padding:var(--space-sm) var(--space-md)">
        <div class="series-indicators">
          ${Array.from({length: item?.series || 4}, (_,i) => `
            <div class="serie-dot ${
              i + 1 < AppState.serieActuelle  ? 'done'    :
              i + 1 === AppState.serieActuelle ? 'current' : ''}">
              ${i + 1 < AppState.serieActuelle ? '✓' : i + 1}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Inputs -->
      <div style="padding:var(--space-md)">
        <div style="font-size:.85rem;font-weight:600;text-align:center;
                    color:var(--text-secondary);margin-bottom:var(--space-sm)">
          Série ${AppState.serieActuelle} / ${item?.series}
        </div>

        <div class="input-group mb-md">
          <div style="flex:1">
            <div class="input-label" style="text-align:center">Poids (kg)</div>
            <input class="input" id="inp-poids" type="number"
                   placeholder="${derniere?.poids || '0'}"
                   value="${derniere?.poids || ''}" step="2.5" />
          </div>
          <div style="flex:1">
            <div class="input-label" style="text-align:center">Reps</div>
            <input class="input" id="inp-reps" type="number"
                   placeholder="${derniere?.reps || '0'}"
                   value="${derniere?.reps || ''}" />
          </div>
        </div>

        <!-- RPE -->
        <div class="rpe-selector">
          <div class="rpe-label">Effort ressenti (RPE)</div>
          <div class="rpe-grid">
            ${Array.from({length:10},(_,i) => `
              <button class="rpe-btn" data-rpe="${i+1}"
                      onclick="selectionnerRPE(${i+1}, this)">
                ${i+1}
              </button>`).join('')}
          </div>
        </div>

        <button class="btn-primary mt-md" onclick="validerSerie()">
          ✅ Valider série ${AppState.serieActuelle}
        </button>
      </div>
    </div>

    <!-- Zone repos (cachée) -->
    <div id="zone-repos" class="hidden">
      <div class="card" style="text-align:center;padding:var(--space-xl)">
        <div class="timer-title">💤 Repos</div>
        <div class="countdown-ring" style="width:160px;height:160px;margin:var(--space-md) auto">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle class="ring-bg" cx="80" cy="80" r="70"
                    stroke-dasharray="${2*Math.PI*70}" />
            <circle class="ring-fill" id="live-ring" cx="80" cy="80" r="70"
                    stroke-dasharray="${2*Math.PI*70}"
                    stroke-dashoffset="0" />
          </svg>
          <div class="countdown-text">
            <div class="countdown-number" id="live-countdown" style="font-size:2.2rem">
              ${Utils.formatDureeMin(item?.repos || 90)}
            </div>
            <div class="countdown-label">secondes</div>
          </div>
        </div>
        <div class="timer-controls">
          <button class="timer-adjust-btn"
                  onclick="timerRepos.ajuster(-15);updateLiveTimer()">-15s</button>
          <button class="timer-adjust-btn"
                  onclick="passerRepos()"
                  style="color:var(--fd-mint)">⏭ Passer</button>
          <button class="timer-adjust-btn"
                  onclick="timerRepos.ajuster(15);updateLiveTimer()">+15s</button>
        </div>
      </div>
    </div>
  `;

  // ── Charger le GIF de manière asynchrone ──────────────────
  ExerciseGIF.chargerDans(item?.ref, gifUID);
}

function demarrerNouvelleSeance(seance) {
  AppState.seanceEnCours  = seance;
  AppState.exerciceIndex  = 0;
  AppState.serieActuelle  = 1;
  AppState.seanceChoisie  = null;
  AppState.seanceData     = Tracker.demarrerSeance(seance.id);
  AppState.prsSeance      = [];

  chronoSeance.demarrer((elapsed) => {
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

  container.innerHTML = `
    <!-- Header séance -->
    <div class="flex items-center justify-between mb-md">
      <button class="btn-secondary btn-sm"
              onclick="confirmerAbandon()">✕ Arrêter</button>
      <div style="text-align:center">
        <div style="font-weight:700;font-size:.9rem">
          ${AppState.exerciceIndex + 1}/${seance.exercicesDetails.length}
        </div>
        <div style="font-size:.72rem;color:var(--text-muted)" id="chrono-global">
          00:00
        </div>
      </div>
      <button class="btn-secondary btn-sm" onclick="afficherDetailExercice('${item?.ref}')">
        ℹ️ Info
      </button>
    </div>

    <!-- Exercice principal -->
    <div class="exercice-card mb-md">
      <div style="padding:var(--space-md);text-align:center;
                  border-bottom:1px solid var(--border-color)">
        <div style="font-size:4rem;margin-bottom:var(--space-sm)">${ex?.emoji || '💪'}</div>
        <div style="font-size:1.2rem;font-weight:700">${ex?.nom || item?.ref}</div>
        <div style="font-size:.8rem;color:var(--fd-mint);margin-top:4px">${ex?.muscle || ''}</div>
        <div style="font-size:.75rem;color:var(--text-muted);margin-top:4px">
          ${item?.series} séries × ${item?.reps} reps · Repos ${item?.repos}s
        </div>
        ${derniere ? `
          <div style="font-size:.72rem;color:var(--fd-lemon);margin-top:4px">
            📊 Dernière fois : ${derniere.poids}kg × ${derniere.reps} reps
          </div>
        ` : ''}
      </div>

      <!-- Indicateurs séries -->
      <div style="padding:var(--space-sm) var(--space-md)">
        <div class="series-indicators">
          ${Array.from({length: item?.series || 4}, (_,i) => `
            <div class="serie-dot ${
              i + 1 < AppState.serieActuelle ? 'done' :
              i + 1 === AppState.serieActuelle ? 'current' : ''}">
              ${i + 1 < AppState.serieActuelle ? '✓' : i + 1}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Inputs poids / reps -->
      <div style="padding:var(--space-md)">
        <div style="font-size:.85rem;font-weight:600;text-align:center;
                    color:var(--text-secondary);margin-bottom:var(--space-sm)">
          Série ${AppState.serieActuelle} / ${item?.series}
        </div>

        <div class="input-group mb-md">
          <div style="flex:1">
            <div class="input-label" style="text-align:center">Poids (kg)</div>
            <input class="input" id="inp-poids" type="number"
                   placeholder="${derniere?.poids || '0'}"
                   value="${derniere?.poids || ''}" step="2.5" />
          </div>
          <div style="flex:1">
            <div class="input-label" style="text-align:center">Reps</div>
            <input class="input" id="inp-reps" type="number"
                   placeholder="${derniere?.reps || '0'}"
                   value="${derniere?.reps || ''}" />
          </div>
        </div>

        <!-- RPE -->
        <div class="rpe-selector">
          <div class="rpe-label">Effort ressenti (RPE)</div>
          <div class="rpe-grid">
            ${Array.from({length:10},(_,i)=>`
              <button class="rpe-btn" data-rpe="${i+1}"
                      onclick="selectionnerRPE(${i+1}, this)">
                ${i+1}
              </button>`).join('')}
          </div>
        </div>

        <!-- Bouton valider -->
        <button class="btn-primary mt-md" onclick="validerSerie()">
          ✅ Valider série ${AppState.serieActuelle}
        </button>
      </div>
    </div>

    <!-- Timer repos (caché par défaut) -->
    <div id="zone-repos" class="hidden">
      <div class="card" style="text-align:center;padding:var(--space-xl)">
        <div class="timer-title">💤 Repos</div>
        <div class="countdown-ring" style="width:160px;height:160px;margin:var(--space-md) auto">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle class="ring-bg" cx="80" cy="80" r="70"
                    stroke-dasharray="${2*Math.PI*70}" />
            <circle class="ring-fill" id="live-ring" cx="80" cy="80" r="70"
                    stroke-dasharray="${2*Math.PI*70}"
                    stroke-dashoffset="0" />
          </svg>
          <div class="countdown-text">
            <div class="countdown-number" id="live-countdown" style="font-size:2.2rem">
              ${Utils.formatDureeMin(item?.repos || 90)}
            </div>
            <div class="countdown-label">secondes</div>
          </div>
        </div>
        <div class="timer-controls">
          <button class="timer-adjust-btn" onclick="timerRepos.ajuster(-15);updateLiveTimer()">-15s</button>
          <button class="timer-adjust-btn" onclick="passerRepos()" style="color:var(--fd-mint)">
            ⏭ Passer
          </button>
          <button class="timer-adjust-btn" onclick="timerRepos.ajuster(15);updateLiveTimer()">+15s</button>
        </div>
      </div>
    </div>
  `;
}

let rpeActuel = null;

function selectionnerRPE(val, btn) {
  rpeActuel = val;
  document.querySelectorAll('.rpe-btn').forEach(b => b.classList.remove('selected'));
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
    seance.id, item.ref, AppState.serieActuelle, reps, poids, rpeActuel
  );

  rpeActuel = null;
  Utils.vibrerSuccess();

  // PR ?
  if (result.isPR) {
    AppState.prsSeance.push({ ref: item.ref, poids, reps });
    timerRepos.jouerSon('pr');
    Utils.toast(`🏆 NOUVEAU PR ! ${poids}kg × ${reps}`, 'pr', 4000);
    Notifications.notifierPR(item.ref, poids, reps);
    Gamification.recompenser('PR_BATTU');
  }

  // Prochaine série ou prochain exercice
  if (AppState.serieActuelle < item.series) {
    AppState.serieActuelle++;
    lancerTimerRepos(item.repos, () => {
      renderExerciceActuel(document.getElementById('page-content'));
    });
  } else if (AppState.exerciceIndex + 1 < seance.exercicesDetails.length) {
    AppState.exerciceIndex++;
    AppState.serieActuelle = 1;
    lancerTimerRepos(item.repos, () => {
      renderExerciceActuel(document.getElementById('page-content'));
    });
  } else {
    // Séance terminée !
    terminerSeance();
  }
}

function lancerTimerRepos(secondes, callback) {
  // Afficher zone repos
  const zoneRepos = document.getElementById('zone-repos');
  if (zoneRepos) zoneRepos.classList.remove('hidden');

  // Scroll vers le timer
  zoneRepos?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  timerRepos.demarrer(secondes,
    (restant, total) => updateLiveTimerValues(restant, total),
    () => {
      if (zoneRepos) zoneRepos.classList.add('hidden');
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
    ring.style.stroke = restant <= 3 ? 'var(--fd-coral)' :
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
  if (ok) {
    timerRepos.arreter();
    chronoSeance.arreter();
    const data = Tracker.terminerSeance(AppState.seanceEnCours.id);
    AppState.seanceEnCours = null;
    AppState.prsSeance     = [];
    naviguer('home');
  }
}

function terminerSeance() {
  timerRepos.arreter();
  const duree = chronoSeance.arreter();
  const seance = AppState.seanceEnCours;
  const data   = Tracker.terminerSeance(seance.id);
  const prs    = AppState.prsSeance;

  Gamification.recompenser('SEANCE_COMPLETE');
  Notifications.verifierSemaineParf();

  // Confetti !
  Utils.confetti(4000);
  Utils.vibrerFin();

  const container = document.getElementById('page-content');
  const volume    = data?.volumeTotal || 0;
  const series    = data?.series?.length || 0;

  container.innerHTML = `
    <div class="fin-screen">
      <div class="fin-emoji">🎉</div>
      <div class="fin-title">Séance terminée !</div>
      <p style="color:var(--text-secondary);margin-bottom:var(--space-lg)">
        Bravo ${Tracker.getProfil().nom || ''} ! Incroyable effort.
      </p>

      <!-- Stats séance -->
      <div class="fin-stats-grid mb-md">
        <div class="fin-stat">
          <div class="fin-stat-value">${Utils.formatDuree(duree)}</div>
          <div class="fin-stat-label">Durée</div>
        </div>
        <div class="fin-stat">
          <div class="fin-stat-value">${Utils.formatVolume(volume)}</div>
          <div class="fin-stat-label">Volume</div>
        </div>
        <div class="fin-stat">
          <div class="fin-stat-value">${series}</div>
          <div class="fin-stat-label">Séries</div>
        </div>
      </div>

      <!-- PRs -->
      ${prs.length > 0 ? `
        <div class="pr-alert mb-md">
          <div class="pr-alert-title">🏆 ${prs.length} nouveau${prs.length>1?'x':''} record${prs.length>1?'s':''} !</div>
          ${prs.map(p => `
            <div class="pr-alert-item">
              <span>🎯</span>
              <span>${EXERCICES[p.ref]?.nom || p.ref} : ${p.poids}kg × ${p.reps}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Actions -->
      <div style="margin-top:var(--space-lg)">
        <button class="btn-primary mb-md"
                onclick="ajouterJournalPostSeance('${seance.id}')">
          📔 Ajouter une note
        </button>
        <button class="btn-secondary" onclick="finNaviguer()">
          🏠 Retour accueil
        </button>
      </div>
    </div>
  `;

  AppState.seanceEnCours = null;
  AppState.prsSeance     = [];

  // Vérifier trophées
  setTimeout(() => Gamification.verifierTrophees(), 1500);
}

function finNaviguer() {
  naviguer('home');
}

function ajouterJournalPostSeance(seanceId) {
  const modal  = document.getElementById('modal-info');
  const content = document.getElementById('modal-info-content');

  content.innerHTML = `
    <h3 style="margin-bottom:var(--space-md)">📔 Note de séance</h3>
    <textarea class="input" id="journal-texte" rows="4"
              placeholder="Comment s'est passée la séance ? Sensations, difficultés, objectifs..."
              style="resize:vertical;min-height:120px"></textarea>
    <button class="btn-primary mt-md" onclick="sauvegarderNoteJournal('${seanceId}')">
      💾 Sauvegarder
    </button>
  `;

  modal.classList.remove('hidden');
  document.getElementById('modal-info-close').onclick = () => modal.classList.add('hidden');
}

function sauvegarderNoteJournal(seanceId) {
  const texte = document.getElementById('journal-texte')?.value?.trim();
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
  const tabs = ['moi','journal','objectifs','blessure','coach','outils'];

  container.innerHTML = `
    <div class="tabs-container">
      ${tabs.map(t => `
        <button class="tab-btn ${tab===t?'active':''}"
                onclick="renderProfil('${t}')">
          ${{moi:'👤 Moi',journal:'📔 Journal',objectifs:'🎯 Objectifs',
             blessure:'🩹 Blessure',coach:'🤖 Coach',outils:'🔧 Outils'}[t]}
        </button>`).join('')}
    </div>
    <div id="profil-content"></div>
  `;

  const content = document.getElementById('profil-content');

  switch(tab) {
    case 'moi':       renderProfilMoi(content);      break;
    case 'journal':   renderJournal(content);        break;
    case 'objectifs': renderObjectifs(content);      break;
    case 'blessure':  renderBlessure(content);       break;
    case 'coach':     Coach.renderCoachTab(content); break;
    case 'outils':    renderOutils(content);         break;
  }
}

// ── Profil Moi ────────────────────────────────────────────────
function renderProfilMoi(el) {
  const profil   = Tracker.getProfil();
  const mesures  = Tracker.getDerniereMesure() || {};
  const xp       = Gamification.getXP();
  const streak   = Tracker.getStreak();

  el.innerHTML = `
    <!-- Carte profil -->
    <div class="profil-card mb-md">
      <div class="profil-avatar">${profil.avatar || '💪'}</div>
      <div class="profil-name">${profil.nom || 'Athlète'}</div>
      <div class="profil-level">${xp.niveau.emoji} Niveau ${xp.niveau.numero} — ${xp.niveau.nom}</div>
      <div style="margin-top:var(--space-md)">
        <div class="flex justify-between" style="font-size:.72rem;opacity:.8;margin-bottom:4px">
          <span>${xp.total} XP</span>
          <span>${xp.niveau.xpSuivant} XP</span>
        </div>
        <div style="height:6px;background:rgba(255,255,255,0.2);border-radius:99px;overflow:hidden">
          <div style="height:100%;width:${xp.pourcentage}%;background:white;border-radius:99px;transition:width 1s"></div>
        </div>
      </div>
    </div>

    <!-- Stats rapides profil -->
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
        <span class="stat-value">${Object.keys(Tracker.getAllPRs()).length}</span>
        <span class="stat-label">PRs</span>
      </div>
    </div>

    <!-- Mesures -->
    <div class="card mb-md">
      <div class="card-label">⚖️ Mesures corporelles</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-sm);margin-top:var(--space-md)">
        ${[
          { id:'m-poids',    label:'Poids (kg)',        val: mesures.poids    || profil.poids    || '' },
          { id:'m-taille',   label:'Taille (cm)',       val: mesures.taille   || profil.taille   || '' },
          { id:'m-bras',     label:'Tour de bras (cm)', val: mesures.bras     || ''                    },
          { id:'m-poitrine', label:'Poitrine (cm)',     val: mesures.poitrine || ''                    },
          { id:'m-taille2',  label:'Tour de taille',    val: mesures.taille2  || ''                    },
          { id:'m-hanches',  label:'Hanches (cm)',      val: mesures.hanches  || ''                    }
        ].map(m => `
          <div>
            <div class="input-label">${m.label}</div>
            <input class="input" id="${m.id}" type="number"
                   placeholder="${m.label}" value="${m.val}" />
          </div>
        `).join('')}
      </div>
      <button class="btn-primary mt-md" onclick="sauvegarderMesures()">
        💾 Sauvegarder
      </button>
    </div>

    <!-- Nom / Avatar -->
    <div class="card">
      <div class="card-label">✏️ Modifier profil</div>
      <div class="input-label mt-md">Prénom</div>
      <input class="input" id="edit-nom" value="${profil.nom || ''}" placeholder="Ton prénom" />
      <button class="btn-primary mt-md" onclick="sauvegarderProfil()">
        💾 Sauvegarder
      </button>
    </div>
  `;
}

function sauvegarderMesures() {
  const data = {
    poids:    parseFloat(document.getElementById('m-poids')?.value)    || undefined,
    taille:   parseFloat(document.getElementById('m-taille')?.value)   || undefined,
    bras:     parseFloat(document.getElementById('m-bras')?.value)     || undefined,
    poitrine: parseFloat(document.getElementById('m-poitrine')?.value) || undefined,
    taille2:  parseFloat(document.getElementById('m-taille2')?.value)  || undefined,
    hanches:  parseFloat(document.getElementById('m-hanches')?.value)  || undefined
  };
  Tracker.ajouterMesure(data);
  if (data.poids) Tracker.sauvegarderProfil({ poids: data.poids });
  if (data.taille) Tracker.sauvegarderProfil({ taille: data.taille });
  Utils.toast('Mesures sauvegardées !', 'success');
}

function sauvegarderProfil() {
  const nom = document.getElementById('edit-nom')?.value?.trim();
  if (!nom) return;
  Tracker.sauvegarderProfil({ nom });
  Utils.toast('Profil mis à jour !', 'success');
}

// ── Journal ───────────────────────────────────────────────────
function renderJournal(el) {
  const journal = Tracker.getJournal();

  el.innerHTML = `
    <button class="btn-primary mb-md" onclick="ajouterEntreeJournal()">
      + Nouvelle note
    </button>

    ${journal.length === 0
      ? `<div class="card" style="text-align:center;padding:var(--space-xl)">
           <div style="font-size:2rem;margin-bottom:var(--space-sm)">📔</div>
           <p style="color:var(--text-muted)">Ton journal est vide.<br>Commence à noter tes séances !</p>
         </div>`
      : journal.map(e => `
        <div class="journal-entry">
          <div class="journal-date">${Utils.formatDateCourt(e.date)}</div>
          ${e.seanceId ? `
            <div class="journal-seance">
              ${SEANCES_BASE[e.seanceId]?.emoji || ''} ${SEANCES_BASE[e.seanceId]?.nom || e.seanceId}
            </div>
          ` : ''}
          <div class="journal-text">${e.texte}</div>
          <button onclick="supprimerJournal('${e.id}')"
                  style="margin-top:var(--space-sm);background:none;border:none;
                         color:var(--text-muted);font-size:.75rem;cursor:pointer">
            🗑️ Supprimer
          </button>
        </div>
      `).join('')}
  `;
}

function ajouterEntreeJournal() {
  const modal   = document.getElementById('modal-info');
  const content = document.getElementById('modal-info-content');

  content.innerHTML = `
    <h3 style="margin-bottom:var(--space-md)">📔 Nouvelle note</h3>
    <textarea class="input" id="new-journal" rows="5"
              placeholder="Tes pensées, sensations, objectifs..."
              style="resize:vertical;min-height:140px"></textarea>
    <button class="btn-primary mt-md" onclick="sauvegarderJournal()">
      💾 Sauvegarder
    </button>
  `;

  modal.classList.remove('hidden');
  document.getElementById('modal-info-close').onclick = () => modal.classList.add('hidden');
}

function sauvegarderJournal() {
  const texte = document.getElementById('new-journal')?.value?.trim();
  if (!texte) return;
  Tracker.ajouterEntreeJournal(texte);
  Gamification.ajouterXP(25, 'journal');
  Utils.toast('Note ajoutée !', 'success');
  document.getElementById('modal-info')?.classList.add('hidden');
  renderProfil('journal');
}

async function supprimerJournal(id) {
  const ok = await Utils.confirmer('Supprimer cette note ?', 'Cette action est irréversible.');
  if (ok) {
    Tracker.supprimerEntreeJournal(id);
    renderProfil('journal');
  }
}

// ── Objectifs ─────────────────────────────────────────────────
function renderObjectifs(el) {
  const objectifs = Tracker.getObjectifs();

  el.innerHTML = `
    <button class="btn-primary mb-md" onclick="ajouterObjectif()">
      + Nouvel objectif
    </button>

    ${objectifs.length === 0
      ? `<div class="card" style="text-align:center;padding:var(--space-xl)">
           <div style="font-size:2rem">🎯</div>
           <p style="color:var(--text-muted);margin-top:var(--space-sm)">
             Définis tes objectifs pour rester motivé !
           </p>
         </div>`
      : objectifs.map(o => {
          const pct = Tracker.calculerProgressionObjectif(o);
          return `
            <div class="objectif-card">
              <div class="objectif-header">
                <span class="objectif-name">${o.emoji || '🎯'} ${o.nom}</span>
                <span class="objectif-pct">${pct}%</span>
              </div>
              <div class="progress-bar mb-md">
                <div class="progress-fill" style="width:${pct}%;
                  background:${pct>=100?'var(--fd-mint)':'var(--fd-indigo)'}"></div>
              </div>
              <div class="objectif-progress">
                <span>Actuel: <strong>${o.valeurActuelle || '?'} ${o.unite || ''}</strong></span>
                <span>→ ${o.valeurCible} ${o.unite || ''}</span>
                ${o.echeance ? `<span>📅 ${o.echeance}</span>` : ''}
              </div>
              <div style="margin-top:var(--space-sm);display:flex;gap:var(--space-sm)">
                <button class="btn-secondary btn-sm"
                        onclick="mettreAJourObjectif('${o.id}')">
                  ✏️ Mettre à jour
                </button>
              </div>
            </div>
          `;
        }).join('')}
  `;
}

function ajouterObjectif() {
  const modal   = document.getElementById('modal-info');
  const content = document.getElementById('modal-info-content');

  content.innerHTML = `
    <h3 style="margin-bottom:var(--space-md)">🎯 Nouvel objectif</h3>
    <div class="input-label">Objectif</div>
    <input class="input mb-md" id="obj-nom" placeholder="ex: Bench Press 100kg" />
    <div class="flex gap-sm mb-md">
      <div style="flex:1">
        <div class="input-label">Valeur actuelle</div>
        <input class="input" id="obj-actuel" type="number" placeholder="85" />
      </div>
      <div style="flex:1">
        <div class="input-label">Valeur cible</div>
        <input class="input" id="obj-cible" type="number" placeholder="100" />
      </div>
    </div>
    <div class="flex gap-sm mb-md">
      <div style="flex:1">
        <div class="input-label">Unité</div>
        <input class="input" id="obj-unite" placeholder="kg" />
      </div>
      <div style="flex:1">
        <div class="input-label">Émoji</div>
        <input class="input" id="obj-emoji" placeholder="🏋️" maxlength="2" />
      </div>
    </div>
    <div class="input-label">Échéance (optionnel)</div>
    <input class="input mb-md" id="obj-date" type="date" />
    <button class="btn-primary" onclick="sauvegarderObjectif()">
      💾 Ajouter
    </button>
  `;

  modal.classList.remove('hidden');
  document.getElementById('modal-info-close').onclick = () => modal.classList.add('hidden');
}

function sauvegarderObjectif() {
  const nom    = document.getElementById('obj-nom')?.value?.trim();
  const actuel = parseFloat(document.getElementById('obj-actuel')?.value);
  const cible  = parseFloat(document.getElementById('obj-cible')?.value);

  if (!nom || !cible) { Utils.toast('Remplis au minimum le nom et la cible !', 'error'); return; }

  Tracker.ajouterObjectif({
    nom,
    valeurActuelle: actuel || 0,
    valeurCible:    cible,
    unite:    document.getElementById('obj-unite')?.value || '',
    emoji:    document.getElementById('obj-emoji')?.value || '🎯',
    echeance: document.getElementById('obj-date')?.value || null
  });

  Utils.toast('Objectif ajouté !', 'success');
  document.getElementById('modal-info')?.classList.add('hidden');
  renderProfil('objectifs');
}

function mettreAJourObjectif(id) {
  const objectifs = Tracker.getObjectifs();
  const obj = objectifs.find(o => o.id === id);
  if (!obj) return;

  const nouvelleVal = prompt(`Valeur actuelle pour "${obj.nom}" :`, obj.valeurActuelle);
  if (!nouvelleVal) return;

  Tracker.mettreAJourObjectif(id, { valeurActuelle: parseFloat(nouvelleVal) });

  if (parseFloat(nouvelleVal) >= obj.valeurCible) {
    Tracker.mettreAJourObjectif(id, { complete: true });
    Utils.confetti(2000);
    Utils.toast('🎉 Objectif atteint !', 'success', 4000);
  }

  renderProfil('objectifs');
}

// ── Blessure ──────────────────────────────────────────────────
function renderBlessure(el) {
  const blessures = Tracker.getBlessures().filter(b => b.active);
  const zones = [
    'Épaule gauche','Épaule droite','Dos haut','Dos bas',
    'Genou gauche','Genou droit','Coude','Poignet','Cheville','Cou'
  ];

  el.innerHTML = `
    <div class="card mb-md">
      <div class="card-label">🩹 Signaler une douleur</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-sm);margin:var(--space-md) 0">
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
                placeholder="Notes (ex: douleur en extension...)" style="resize:none"></textarea>
      <button class="btn-primary" onclick="ajouterBlessure()">
        🩹 Signaler
      </button>
    </div>

    ${blessures.length > 0 ? `
      <div class="section-title">⚠️ Blessures actives</div>
      ${blessures.map(b => `
        <div class="card mb-md" style="border-color:var(--fd-coral)">
          <div class="flex justify-between items-center">
            <div>
              <div style="font-weight:600">${b.zone}</div>
              <div style="font-size:.78rem;color:var(--fd-coral)">
                ${b.severite === 'severe' ? '🔴' : b.severite === 'moderee' ? '🟠' : '🟡'}
                ${b.severite} · depuis ${Utils.formatDateCourt(b.date)}
              </div>
              ${b.notes ? `<div style="font-size:.78rem;color:var(--text-muted);margin-top:4px">${b.notes}</div>` : ''}
            </div>
            <button class="btn-secondary btn-sm" onclick="guerirBlessure('${b.id}')">
              ✅ Guéri
            </button>
          </div>
        </div>
      `).join('')}
    ` : `
      <div class="card" style="text-align:center;padding:var(--space-xl)">
        <div style="font-size:2rem">💪</div>
        <p style="color:var(--fd-mint);margin-top:var(--space-sm)">Aucune blessure active !</p>
      </div>
    `}
  `;
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

// ── Outils ────────────────────────────────────────────────────
function renderOutils(el) {
  const config = Notifications.getConfig();
  const profil = Tracker.getProfil();

  el.innerHTML = `
    <!-- Export / Import -->
 <div class="card mb-md">
  <div class="card-label">💾 Données</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;
              gap:var(--space-sm);margin-top:var(--space-md)">
    <button class="btn-secondary" onclick="Utils.exporterJSON()">📤 Export JSON</button>
    <button class="btn-secondary" onclick="Utils.exporterCSV()">📊 Export CSV</button>
    <button class="btn-secondary" onclick="importerFichier()">📥 Importer</button>
    <button class="btn-secondary" onclick="genererQRSync()">📱 QR Sync</button>
  </div>

  <!-- Stats GIFs -->
  <div style="margin-top:var(--space-md);padding:var(--space-sm);
              background:var(--bg-input);border-radius:var(--radius-sm)">
    <div style="font-size:.78rem;color:var(--text-secondary);
                display:flex;justify-content:space-between;align-items:center">
      <span>
        🎞️ GIFs en cache :
        <strong id="gif-cache-count">
          ${ExerciseGIF.statsCache().cached}/${ExerciseGIF.statsCache().total}
        </strong>
      </span>
      <button onclick="rechargerGIFs()"
              style="background:none;border:none;color:var(--fd-indigo);
                     font-size:.78rem;cursor:pointer;font-weight:600">
        🔄 Recharger
      </button>
    </div>
    <div class="progress-bar" style="margin-top:var(--space-xs)">
      <div class="progress-fill"
           style="width:${ExerciseGIF.statsCache().pct}%"></div>
    </div>
  </div>

  <div style="font-size:.72rem;color:var(--text-muted);margin-top:var(--space-sm)">
    Données app: ${Utils.storage.taille()}
  </div>
</div>

    <!-- Notifications -->
    <div class="card mb-md">
      <div class="card-label">🔔 Notifications</div>
      <div style="margin-top:var(--space-md)">
        ${[
          { id:'rappelQuotidien', label:'Rappel quotidien' },
          { id:'absence1j',       label:'Absent 1 jour'    },
          { id:'absence2j',       label:'Absent 2 jours'   },
          { id:'absence5j',       label:'Absent 5 jours+'  },
          { id:'streakDanger',    label:'Streak en danger'  },
          { id:'semaineParf',     label:'Semaine parfaite'  },
          { id:'motivationMatin', label:'Motivation matin'  }
        ].map(n => `
          <div class="toggle-row">
            <span class="toggle-label">${n.label}</span>
            <label class="toggle">
              <input type="checkbox" ${config[n.id]?'checked':''}
                     onchange="Notifications.sauvegarderConfig({'${n.id}': this.checked})">
              <span class="toggle-slider"></span>
            </label>
          </div>
        `).join('')}

        <div style="margin-top:var(--space-md)">
          <div class="input-label">Heure rappel quotidien</div>
          <input class="input" type="time" value="${config.heureRappel}"
                 onchange="Notifications.sauvegarderConfig({heureRappel: this.value})" />
        </div>

        <div style="margin-top:var(--space-md)">
          <div class="input-label">Ton des messages</div>
          <select class="input"
                  onchange="Notifications.sauvegarderConfig({ton: this.value})">
            <option value="motivant"  ${config.ton==='motivant' ?'selected':''}>💪 Motivant</option>
            <option value="doux"      ${config.ton==='doux'     ?'selected':''}>🌸 Doux</option>
            <option value="severe"    ${config.ton==='severe'   ?'selected':''}>🔥 Sévère</option>
          </select>
        </div>

        <button class="btn-secondary mt-md" onclick="Notifications.tester()">
          🔔 Tester une notification
        </button>
      </div>
    </div>

    <!-- Paramètres -->
    <div class="card mb-md">
      <div class="card-label">⚙️ Paramètres</div>
      <div class="toggle-row">
        <span class="toggle-label">Thème sombre</span>
        <label class="toggle">
          <input type="checkbox" ${AppState.thème === 'dark' ? 'checked' : ''}
                 onchange="appliquerTheme(this.checked?'dark':'light');Utils.storage.set('ft_theme',this.checked?'dark':'light')">
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div style="margin-top:var(--space-md)">
        <div class="input-label">Objectif séances/semaine</div>
        <select class="input"
                onchange="Utils.storage.set('ft_objectif_seances_semaine', parseInt(this.value))">
          ${[3,4,5].map(n => `
            <option value="${n}"
              ${Utils.storage.get('ft_objectif_seances_semaine',4)===n?'selected':''}>
              ${n} séances
            </option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Danger zone -->
    <div class="card" style="border-color:rgba(255,141,150,0.3)">
      <div class="card-label" style="color:var(--fd-coral)">⚠️ Zone danger</div>
      <button class="btn-danger mt-md w-full"
              onclick="resetDonnees()">
        🗑️ Réinitialiser toutes les données
      </button>
    </div>
  `;
}

function importerFichier() {
  document.getElementById('file-import')?.click();
}

async function handleImport(input) {
  if (!input.files[0]) return;
  await Utils.importerJSON(input.files[0]);
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
    'Es-tu absolument certain ? Sauvegarde tes données d\'abord (Export JSON).'
  );
  if (!ok2) return;

  Tracker.resetComplet();
  Utils.toast('Données réinitialisées. Rechargement...', 'info');
  setTimeout(() => window.location.reload(), 1500);
}

async function genererQRSync() {
  const data   = Utils.storage.exporter();
  const json   = JSON.stringify(data);
  const modal  = document.getElementById('modal-info');
  const content = document.getElementById('modal-info-content');

  content.innerHTML = `
    <h3 style="margin-bottom:var(--space-md);text-align:center">📱 QR Code Sync</h3>
    <p style="font-size:.82rem;color:var(--text-muted);text-align:center;margin-bottom:var(--space-md)">
      Scanne ce QR code sur ton autre appareil pour synchroniser tes données.
    </p>
    <div style="text-align:center">
      <canvas id="qr-canvas" width="200" height="200"
              style="border-radius:var(--radius-md);background:white;padding:8px"></canvas>
    </div>
    <p style="font-size:.72rem;color:var(--text-muted);text-align:center;margin-top:var(--space-md)">
      ${(json.length/1024).toFixed(1)} KB de données
    </p>
  `;

  modal.classList.remove('hidden');
  document.getElementById('modal-info-close').onclick = () => modal.classList.add('hidden');

  // Générer QR
  const canvas = document.getElementById('qr-canvas');
  await Utils.genererQR(json.substring(0, 500), canvas); // Limité à 500 chars pour QR
}
