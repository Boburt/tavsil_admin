// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing the generated config
var firebaseConfig = {
  apiKey: 'AIzaSyCEPs0hwZzQxb3VrgOtmIjXR7UukVwdKyk',
  authDomain: 'tavsil.firebaseapp.com',
  projectId: 'tavsil',
  storageBucket: 'tavsil.appspot.com',
  messagingSenderId: '1024070622288',
  appId: '1:1024070622288:web:06cac0c41c948bdc3b0555',
  measurementId: 'G-DX57LSEEQJ',
};

firebase.initializeApp(firebaseConfig);

// Retrieve firebase messaging
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});



self.addEventListener('notificationclick', (event) => {
  console.log(event);
    event.notification.close()

    const pathname = event.notification?.data?.FCM_MSG?.notification?.data?.link
    if (!pathname) return
    const url = new URL(pathname, self.location.origin).href

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientsArr) => {
                const hadWindowToFocus = clientsArr.some((windowClient) =>
                    windowClient.url === url ? (windowClient.focus(), true) : false
                )

                if (!hadWindowToFocus)
                    self.clients
                        .openWindow(url)
                        .then((windowClient) =>
                            windowClient ? windowClient.focus() : null
                        )
            })
    )
})
