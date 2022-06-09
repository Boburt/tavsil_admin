import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyCEPs0hwZzQxb3VrgOtmIjXR7UukVwdKyk',
  authDomain: 'tavsil.firebaseapp.com',
  projectId: 'tavsil',
  storageBucket: 'tavsil.appspot.com',
  messagingSenderId: '1024070622288',
  appId: '1:1024070622288:web:06cac0c41c948bdc3b0555',
  measurementId: 'G-DX57LSEEQJ',
}

export const app = initializeApp(firebaseConfig)

export const messaging = getMessaging()

export async function getFCMToken() {
  try {
    const messaging = getMessaging(app)
    // Don't forget to paste your VAPID key here
    // (you can find it in the Console too)
    const token = await getToken(messaging, {
      vapidKey:
        'BB_Bxo8d7h-zx6TICOp4vC6rpK51uYE6GMFF-Lbtxewy-Wiyv5JYOh43kRz_JloCeH3mNh_0r918v2U2IMQdvsI',
    })
    console.log('FCM Token:', token)
    return token
  } catch (e) {
    console.log('getFCMToken error', e)
    return undefined
  }
}

export const onMessageListener = () =>
  new Promise((resolve) => {
    messaging.onMessage((payload) => {
      resolve(payload)
      console.log('Message received. ', payload)
    })
  })
