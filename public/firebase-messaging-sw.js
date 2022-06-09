import { getMessaging, onMessage } from "firebase/messaging";
import { onBackgroundMessage } from "firebase/messaging/sw";

firebase.initializeApp({

  apiKey: 'AIzaSyCEPs0hwZzQxb3VrgOtmIjXR7UukVwdKyk',
  authDomain: 'tavsil.firebaseapp.com',
  projectId: 'tavsil',
  storageBucket: 'tavsil.appspot.com',
  messagingSenderId: '1024070622288',
  appId: '1:1024070622288:web:06cac0c41c948bdc3b0555',
  measurementId: 'G-DX57LSEEQJ',
});


const messaging = getMessaging(firebase);

onMessage((payload) => {
  console.log('Message received. ', payload);
});

onBackgroundMessage(messaging, (payload) => {
        console.log('[firebase-messaging-sw.js] Received background message ', payload);
        // Customize notification here
        const notificationTitle = 'Background Message Title';
        const notificationOptions = {
          body: 'Background Message body.',
          icon: '/firebase-logo.png'
        };

        self.registration.showNotification(notificationTitle,
          notificationOptions);
      });


