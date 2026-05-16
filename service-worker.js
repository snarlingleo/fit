/* ============================================================
   FitTracker Pro — Service Worker v1.1
   Cache offline + mise à jour
   ============================================================ */

const CACHE_NAME    = 'fittracker-v1.1';
const CACHE_STATIC  = [
  './',
  './index.html',
  './style.css',
  './js/utils.js',
  './js/programme.js',
  './js/tracker.js',
  './js/timer.js',
  './js/stats.js',
  './js/gamification.js',
  './js/coach.js',
  './js/notifications.js',
  './js/charts.js',
  './js/nutrition.js', 
  './js/app.js',
  './js/exercice-videos.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// ─── INSTALL ──────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installation v1.1');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Mise en cache des fichiers statiques');
        return cache.addAll(CACHE_STATIC.map(url => {
          return new Request(url, { cache: 'reload' });
        }));
      })
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Cache partiel:', err))
  );
});

// ─── ACTIVATE ─────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activation');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Suppression ancien cache:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH ────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') return;

  // Ignorer chrome-extension et autres
  if (!request.url.startsWith('http')) return;

  // Stratégie : Cache First pour statiques, Network First pour resto
  const isStatic = CACHE_STATIC.some(url =>
    request.url.includes(url.replace('./', ''))
  );

  if (isStatic) {
    // Cache First
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => {
          // Page offline de secours
          if (request.destination === 'document') {
            return caches.match('./index.html');
          }
        });
      })
    );
  } else {
    // Network First
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
  }
});

// ─── PUSH NOTIFICATIONS ───────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch(e) {
    data = {
      title: 'FitTracker Pro',
      body:  event.data.text()
    };
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'FitTracker', {
      body:    data.body    || '',
      icon:    data.icon    || './assets/icons/icon-192.png',
      badge:   data.badge   || './assets/icons/icon-72.png',
      vibrate: data.vibrate || [200, 100, 200],
      tag:     data.tag     || 'fittracker',
      data:    data.data    || {},
      actions: data.actions || []
    })
  );
});

// ─── NOTIFICATION CLICK ───────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const action  = event.action;
  const urlBase = self.location.origin + self.location.pathname
    .replace('service-worker.js', '');

  let url = urlBase;

  if (action === 'go'      ) url = urlBase + '?page=live';
  if (action === 'express' ) url = urlBase + '?page=live&action=start-session';
  if (action === 'stats'   ) url = urlBase + '?page=stats';
  if (action === 'later'   ) return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Réutiliser onglet existant si possible
        for (const client of clientList) {
          if (client.url.includes(urlBase) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return clients.openWindow(url);
      })
  );
});

// ─── SKIP WAITING (depuis app.js) ─────────────────────────
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] FitTracker Pro Service Worker chargé ✅');
