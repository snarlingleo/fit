/* ============================================================
   PowerApp — Service Worker v3.0
   Cache stratégique + Sync + Background + Notifications
   ============================================================ */

'use strict';

const CACHE_VERSION = 'powerapp-v3';
const CACHE_STATIC  = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_IMAGES  = `${CACHE_VERSION}-images`;

// ════════════════════════════════════════════════════════════
// ASSETS STATIQUES À METTRE EN CACHE
// ════════════════════════════════════════════════════════════
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './style.css',

  // JS Core
  './js/utils.js',
  './js/tracker.js',
  './js/programme.js',
  './js/gamification.js',
  './js/coach.js',
  './js/notifications.js',
  './js/defis.js',
  './js/predict.js',
  './js/share.js',
  './js/i18n.js',
  './js/stats.js',
  './js/app.js',

  // JS Nouveaux modules v3.0
  './js/superset.js',
  './js/photos.js',
  './js/history.js',
  './js/offline.js',
  './js/social.js',

  // Icons
  './assets/icons/icon-72.png',
  './assets/icons/icon-96.png',
  './assets/icons/icon-128.png',
  './assets/icons/icon-144.png',
  './assets/icons/icon-152.png',
  './assets/icons/icon-167.png',
  './assets/icons/icon-180.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',

  // Sons
  './assets/sounds/pr.mp3',
  './assets/sounds/rest.mp3',
  './assets/sounds/beep.mp3'
];

// Assets à ne JAMAIS mettre en cache
const NEVER_CACHE = [
  'firebase',
  'googleapis',
  'analytics',
  'chrome-extension',
  'hot-update'
];

// ════════════════════════════════════════════════════════════
// INSTALL — Mise en cache des assets statiques
// ════════════════════════════════════════════════════════════
self.addEventListener('install', (event) => {
  console.log('[SW] Install v3.0');

  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        console.log('[SW] Mise en cache des assets...');

        // Ajouter chaque asset individuellement
        // pour éviter qu'un échec bloque tout
        const promises = STATIC_ASSETS.map(url =>
          cache.add(url).catch(err => {
            console.warn(`[SW] Cache failed: ${url}`, err);
          })
        );

        return Promise.allSettled(promises);
      })
      .then(() => {
        console.log('[SW] Assets mis en cache ✅');
        // Activer immédiatement sans attendre
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Erreur install:', err);
      })
  );
});

// ════════════════════════════════════════════════════════════
// ACTIVATE — Nettoyage anciens caches
// ════════════════════════════════════════════════════════════
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate v3.0');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        const valides = [
          CACHE_STATIC, CACHE_DYNAMIC, CACHE_IMAGES
        ];

        return Promise.all(
          cacheNames
            .filter(name => !valides.includes(name))
            .map(name => {
              console.log('[SW] Suppression cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Caches nettoyés ✅');
        // Prendre le contrôle immédiatement
        return self.clients.claim();
      })
  );
});

// ════════════════════════════════════════════════════════════
// FETCH — Stratégies de cache
// ════════════════════════════════════════════════════════════
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ── Ignorer les requêtes non supportées ──
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.protocol === 'blob:') return;
  if (url.protocol === 'data:') return;

  // ── Jamais mettre en cache ──
  if (NEVER_CACHE.some(n => url.href.includes(n))) {
    event.respondWith(
      fetch(request).catch(() => _offlineFallback(request))
    );
    return;
  }

  // ── Images → Cache First + mise à jour en fond ──
  if (_estImage(url)) {
    event.respondWith(_strategieCacheFirst(
      request, CACHE_IMAGES
    ));
    return;
  }

  // ── Assets statiques → Cache First ──
  if (_estStatique(url)) {
    event.respondWith(_strategieCacheFirst(
      request, CACHE_STATIC
    ));
    return;
  }

  // ── Firebase / API → Network First ──
  if (_estAPI(url)) {
    event.respondWith(_strategieNetworkFirst(
      request, CACHE_DYNAMIC
    ));
    return;
  }

  // ── Autres → Stale While Revalidate ──
  event.respondWith(_strategieStaleWhileRevalidate(
    request, CACHE_DYNAMIC
  ));
});

// ════════════════════════════════════════════════════════════
// STRATÉGIES DE CACHE
// ════════════════════════════════════════════════════════════

// Cache First — Pour les assets statiques
async function _strategieCacheFirst(request, cacheName) {
  try {
    const cache  = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) return cached;

    // Pas en cache → fetch + mettre en cache
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;

  } catch(err) {
    return _offlineFallback(request);
  }
}

// Network First — Pour les APIs
async function _strategieNetworkFirst(request, cacheName) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;

  } catch(err) {
    // Réseau indisponible → cache
    const cache  = await caches.open(cacheName);
    const cached = await cache.match(request);
    return cached || _offlineFallback(request);
  }
}

// Stale While Revalidate — Pour le reste
async function _strategieStaleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Fetch en arrière-plan pour mettre à jour
  const fetchPromise = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  // Retourner le cache immédiatement si disponible
  return cached || fetchPromise;
}

// Fallback hors-ligne
async function _offlineFallback(request) {
  const url = new URL(request.url);

  // Page HTML → index.html depuis cache
  if (request.headers.get('Accept')?.includes('text/html')) {
    const cache    = await caches.open(CACHE_STATIC);
    const fallback = await cache.match('./index.html');
    return fallback || new Response(
      _offlineHTML(),
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  // Image → placeholder SVG
  if (_estImage(url)) {
    return new Response(
      _offlineSVG(),
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }

  // Autres → erreur réseau
  return new Response(
    JSON.stringify({ error: 'Hors-ligne', offline: true }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// ════════════════════════════════════════════════════════════
// HELPERS DÉTECTION
// ════════════════════════════════════════════════════════════
function _estImage(url) {
  return /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i
    .test(url.pathname);
}

function _estStatique(url) {
  return /\.(js|css|woff|woff2|ttf|eot)$/i
    .test(url.pathname)
    || url.pathname === '/'
    || url.pathname.endsWith('.html')
    || url.pathname.endsWith('.json');
}

function _estAPI(url) {
  return url.hostname.includes('firebase')
    || url.hostname.includes('googleapis')
    || url.hostname.includes('firebaseio')
    || url.hostname.includes('firebasestorage');
}

// ════════════════════════════════════════════════════════════
// MESSAGES DU CLIENT
// ════════════════════════════════════════════════════════════
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch(type) {

    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_URLS':
      // Mettre en cache des URLs spécifiques
      if (Array.isArray(payload)) {
        caches.open(CACHE_DYNAMIC).then(cache =>
          cache.addAll(payload)
        );
      }
      break;

    case 'CLEAR_CACHE':
      // Vider un cache spécifique
      const cacheName = payload || CACHE_DYNAMIC;
      caches.delete(cacheName).then(() => {
        _notifierClients({ type:'CACHE_CLEARED', cacheName });
      });
      break;

    case 'GET_CACHE_SIZE':
      // Retourner la taille du cache
      _getCacheSize().then(size => {
        event.source?.postMessage({
          type: 'CACHE_SIZE',
          size
        });
      });
      break;

    default:
      console.log('[SW] Message inconnu:', type);
  }
});

// ════════════════════════════════════════════════════════════
// BACKGROUND SYNC
// ════════════════════════════════════════════════════════════
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'powerapp-sync') {
    event.waitUntil(
      _notifierClients({ type:'SYNC_REQUESTED' })
    );
  }

  if (event.tag === 'powerapp-sync-seance') {
    event.waitUntil(
      _notifierClients({ type:'SYNC_SEANCE' })
    );
  }
});

// ════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS
// ════════════════════════════════════════════════════════════
self.addEventListener('push', (event) => {
  console.log('[SW] Push reçu');

  let data = {
    titre:   '⚡ PowerApp',
    message: 'Ta séance t\'attend !',
    icon:    './assets/icons/icon-192.png',
    badge:   './assets/icons/icon-72.png',
    tag:     'powerapp-push',
    actions: []
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = { ...data, ...payload };
    }
  } catch(e) {}

  event.waitUntil(
    self.registration.showNotification(data.titre, {
      body:    data.message,
      icon:    data.icon,
      badge:   data.badge,
      tag:     data.tag,
      vibrate: [200, 100, 200],
      renotify: true,
      actions: data.actions,
      data:    data
    })
  );
});

// ════════════════════════════════════════════════════════════
// NOTIFICATION CLICK
// ════════════════════════════════════════════════════════════
self.addEventListener('notificationclick', (event) => {
  const { action, notification } = event;
  notification.close();

  console.log('[SW] Notification click:', action);

  let url = './';

  switch(action) {
    case 'go':
    case 'live':
      url = './#live';
      break;
    case 'express':
      url = './#express';
      break;
    case 'stats':
      url = './#stats';
      break;
    case 'later':
      // Ne rien faire
      return;
    default:
      url = './';
  }

  event.waitUntil(
    self.clients.matchAll({
      type:         'window',
      includeUncontrolled: true
    }).then(clients => {
      // Fenêtre déjà ouverte → focus
      for (const client of clients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.postMessage({
            type:   'NOTIFICATION_CLICK',
            action, url
          });
          return;
        }
      }
      // Pas de fenêtre → ouvrir
      return self.clients.openWindow(url);
    })
  );
});

// ════════════════════════════════════════════════════════════
// NOTIFICATION CLOSE
// ════════════════════════════════════════════════════════════
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification fermée');
  _notifierClients({
    type: 'NOTIFICATION_CLOSED',
    tag:  event.notification.tag
  });
});

// ════════════════════════════════════════════════════════════
// PERIODIC BACKGROUND SYNC (si supporté)
// ════════════════════════════════════════════════════════════
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'powerapp-daily') {
    event.waitUntil(
      _notifierClients({ type:'DAILY_SYNC' })
    );
  }
});

// ════════════════════════════════════════════════════════════
// UTILITAIRES SW
// ════════════════════════════════════════════════════════════
async function _notifierClients(message) {
  const clients = await self.clients.matchAll({
    includeUncontrolled: true
  });
  clients.forEach(client => {
    client.postMessage(message);
  });
}

async function _getCacheSize() {
  const cacheNames = await caches.keys();
  let   total      = 0;

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys  = await cache.keys();
    total += keys.length;
  }

  return total;
}

// ════════════════════════════════════════════════════════════
// FALLBACKS HTML / SVG
// ════════════════════════════════════════════════════════════
function _offlineHTML() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport"
        content="width=device-width,initial-scale=1"/>
  <title>PowerApp — Hors-ligne</title>
  <style>
    * { margin:0;padding:0;box-sizing:border-box }
    body {
      min-height:100vh;
      background:#09092d;
      color:white;
      font-family:system-ui,sans-serif;
      display:flex;
      align-items:center;
      justify-content:center;
      text-align:center;
      padding:24px;
    }
    .container { max-width:320px }
    .emoji { font-size:4rem;margin-bottom:16px }
    h1 {
      font-size:1.4rem;font-weight:800;
      margin-bottom:8px;color:#f9ef77
    }
    p {
      font-size:.88rem;
      color:rgba(255,255,255,.6);
      line-height:1.6;margin-bottom:24px
    }
    button {
      background:#4b4bf9;color:white;
      border:none;padding:12px 28px;
      border-radius:99px;font-size:.9rem;
      font-weight:700;cursor:pointer;
      width:100%
    }
    .badge {
      display:inline-block;
      background:rgba(255,141,150,.2);
      color:#ff8d96;
      padding:4px 12px;border-radius:99px;
      font-size:.72rem;font-weight:700;
      margin-bottom:16px
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="emoji">📵</div>
    <div class="badge">Mode hors-ligne</div>
    <h1>Tu es hors-ligne</h1>
    <p>
      Vérifie ta connexion internet.<br>
      Tes données sont sauvegardées localement
      et seront synchronisées à la reconnexion.
    </p>
    <button onclick="window.location.reload()">
      🔄 Réessayer
    </button>
  </div>
</body>
</html>`;
}

function _offlineSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg"
     width="200" height="200"
     viewBox="0 0 200 200">
  <rect width="200" height="200"
        fill="#09092d" rx="16"/>
  <text x="100" y="110"
        text-anchor="middle"
        font-size="60">📵</text>
</svg>`;
}

console.log('✅ Service Worker v3.0 chargé');
