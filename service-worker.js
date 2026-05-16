// ============================================================
// FitTracker Pro — Service Worker
// Version : 1.0.0
// ============================================================

const APP_VERSION   = '1.0.0';
const CACHE_STATIC  = `fittracker-static-v${APP_VERSION}`;
const CACHE_DYNAMIC = `fittracker-dynamic-v${APP_VERSION}`;

// Fichiers à mettre en cache immédiatement
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/app.js',
  './js/programme.js',
  './js/timer.js',
  './js/tracker.js',
  './js/stats.js',
  './js/gamification.js',
  './js/coach.js',
  './js/notifications.js',
  './js/utils.js',
  './assets/sounds/beep.mp3',
  './assets/sounds/finish.mp3',
  './assets/sounds/pr.mp3',
  './assets/sounds/levelup.mp3',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

// ─── INSTALLATION ────────────────────────────────────────────
self.addEventListener('install', event => {
  console.log(`[SW] Installation v${APP_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => {
        console.log('[SW] Mise en cache des assets statiques');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Erreur cache install:', err))
  );
});

// ─── ACTIVATION ──────────────────────────────────────────────
self.addEventListener('activate', event => {
  console.log(`[SW] Activation v${APP_VERSION}`);
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_STATIC && key !== CACHE_DYNAMIC)
          .map(key => {
            console.log('[SW] Suppression ancien cache:', key);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ─── FETCH — Stratégie Cache First ───────────────────────────
self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET et externes
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Retourner depuis cache + update en background
        fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.ok) {
            caches.open(CACHE_DYNAMIC).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // Pas en cache → réseau + mise en cache dynamique
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || !networkResponse.ok) return networkResponse;

        const responseClone = networkResponse.clone();
        caches.open(CACHE_DYNAMIC).then(cache => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      }).catch(() => {
        // Offline fallback pour les pages HTML
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});

// ─── NOTIFICATIONS BACKGROUND ────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const action = event.action;
  const data   = event.notification.data || {};

  let urlToOpen = './index.html';

  if (action === 'go' || action === 'express') {
    urlToOpen = './index.html?action=start-session';
  } else if (action === 'later') {
    urlToOpen = './index.html?action=schedule';
  } else if (action === 'stats') {
    urlToOpen = './index.html?page=stats';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Si l'app est déjà ouverte, focus dessus
        for (const client of clientList) {
          if (client.url.includes('index.html') && 'focus' in client) {
            client.postMessage({ action, data });
            return client.focus();
          }
        }
        // Sinon ouvrir une nouvelle fenêtre
        if (clients.openWindow) return clients.openWindow(urlToOpen);
      })
  );
});

self.addEventListener('notificationclose', event => {
  console.log('[SW] Notification fermée:', event.notification.tag);
});

// ─── SYNC EN ARRIÈRE-PLAN ─────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'check-absence') {
    event.waitUntil(checkAbsenceAndNotify());
  }
  if (event.tag === 'daily-reminder') {
    event.waitUntil(sendDailyReminder());
  }
});

// ─── PERIODIC SYNC ───────────────────────────────────────────
self.addEventListener('periodicsync', event => {
  if (event.tag === 'daily-check') {
    event.waitUntil(checkAbsenceAndNotify());
  }
});

// ─── FONCTIONS NOTIFICATIONS ─────────────────────────────────
async function checkAbsenceAndNotify() {
  // Récupérer données depuis IndexedDB ou message client
  const allClients = await clients.matchAll();
  if (allClients.length > 0) {
    // App ouverte → pas de notif
    return;
  }

  // Lire le localStorage via un client
  // (logique gérée côté app.js via postMessage)
  self.registration.showNotification('💪 FitTracker Pro', {
    body: 'Ta séance du jour t\'attend !',
    icon: './assets/icons/icon-192.png',
    badge: './assets/icons/icon-72.png',
    tag: 'daily-reminder',
    renotify: true,
    vibrate: [200, 100, 200, 100, 200],
    actions: [
      { action: 'go',    title: '▶ J\'y vais !' },
      { action: 'later', title: '⏰ Plus tard'   }
    ]
  });
}

async function sendDailyReminder() {
  self.registration.showNotification('🌅 Bonjour !', {
    body: 'Prêt pour ta séance aujourd\'hui ?',
    icon: './assets/icons/icon-192.png',
    badge: './assets/icons/icon-72.png',
    tag: 'morning-reminder',
    vibrate: [100, 50, 100],
    actions: [
      { action: 'go',   title: '💪 On y va !'  },
      { action: 'later', title: '⏰ Ce soir'   }
    ]
  });
}

// ─── MESSAGE DEPUIS L'APP ────────────────────────────────────
self.addEventListener('message', event => {
  const { type, payload } = event.data || {};

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(payload.titre, {
      body:    payload.message,
      icon:    './assets/icons/icon-192.png',
      badge:   './assets/icons/icon-72.png',
      tag:     payload.tag || 'fittracker',
      vibrate: payload.vibrate || [200, 100, 200],
      actions: payload.actions || [],
      data:    payload.data || {}
    });
  }

  if (type === 'UPDATE_CACHE') {
    // Forcer mise à jour du cache si nouvelle version
    caches.delete(CACHE_STATIC).then(() => self.skipWaiting());
  }
});