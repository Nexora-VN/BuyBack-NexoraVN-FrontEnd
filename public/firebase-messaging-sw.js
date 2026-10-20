importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDGGXUL2Q18vUxvOgyE5X77BVORVgmnCiM",
  authDomain: "piggyback-7b0d9.firebaseapp.com",
  projectId: "piggyback-7b0d9",
  storageBucket: "piggyback-7b0d9.firebasestorage.app",
  messagingSenderId: "861787610046",
  appId: "1:861787610046:web:8f3ce7a1780a1031f6f7ef",
  measurementId: "G-6TK4YH8WQ4"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle =
    payload.notification?.title || payload.data?.title || 'Piggy Back';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: '/icon.png',
    badge: '/favicon.png',
    data: {
      href: payload.data?.href || payload.fcmOptions?.link || '/app/notifications',
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.href || '/app/notifications';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
