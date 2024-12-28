/* eslint-disable no-restricted-globals */

// Cache name for our app
const CACHE_NAME = 'containders-v1';

// Assets to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache)),
      self.skipWaiting()
    ])
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames
              .filter(cacheName => cacheName !== CACHE_NAME)
              .map(cacheName => caches.delete(cacheName))
          );
        }),
      self.clients.claim()
    ])
  );
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.warn('Push event but no data');
    return;
  }

  let notification;
  try {
    notification = event.data.json();
  } catch (e) {
    notification = {
      title: 'New Notification',
      body: event.data.text()
    };
  }

  const options = {
    body: notification.body || notification.message,
    icon: notification.icon || '/logo192.png',
    badge: '/logo192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      url: notification.url || '/',
      ...notification.data
    },
    actions: notification.actions || [
      {
        action: 'view',
        title: 'View',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
    tag: notification.tag || 'default',
    renotify: true,
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(notification.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // Handle notification click
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        const matchingClient = windowClients.find(client => 
          client.url.includes(urlToOpen)
        );

        // If so, focus it
        if (matchingClient) {
          return matchingClient.focus();
        }

        // If not, open new window
        return clients.openWindow(urlToOpen);
      })
  );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response before using it
        const responseToCache = response.clone();

        // Cache the fetched response
        caches.open(CACHE_NAME)
          .then(cache => {
            if (event.request.method === 'GET') {
              cache.put(event.request, responseToCache);
            }
          });

        return response;
      })
      .catch(() => {
        // If network fails, try to return cached response
        return caches.match(event.request);
      })
  );
});
