
// Événement d'installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation');
  self.skipWaiting();
});

// Événement d'activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation');
  event.waitUntil(clients.claim());

  // Tentative de souscription aux notifications push dès que le SW est actif
  // Cela peut être utile si la permission a déjà été accordée
  event.waitUntil(
    self.registration.pushManager.getSubscription().then(subscription => {
      if (!subscription) {
        // L'utilisateur n'est pas encore abonné, l'abonnement se fera via l'UI
        console.log('Service Worker: Pas d\'abonnement push existant.');
      } else {
        console.log('Service Worker: Abonnement push existant trouvé.');
      }
    })
  );
});

// Gestionnaire d'événements 'push' pour les notifications entrantes
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notification push reçue');

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'Nouvelle notification',
      body: event.data.text(),
      icon: '/favicon.ico',
      data: { url: '/' }
    };
  }

  const title = data.title || 'OnBuch';
  const options = {
    body: data.body || 'Vous avez un nouveau message.',
    icon: data.icon || '/favicon.ico',
    badge: '/badge.png',
    data: {
      url: data.url || '/', // URL par défaut si non fournie
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Gestionnaire d'événements 'notificationclick' pour gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Clic sur la notification');

  const notification = event.notification;
  const urlToOpen = notification.data.url || '/';
  notification.close(); // Ferme la notification

  // Ouvre la fenêtre/onglet de l'application correspondant à l'URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      let clientIsFocused = false;

      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          client.focus();
          clientIsFocused = true;
          break;
        }
      }

      if (!clientIsFocused && clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
