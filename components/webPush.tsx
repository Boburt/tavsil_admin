import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import localforage from 'localforage'

const firebaseConfig = {
  apiKey: 'AIzaSyCEPs0hwZzQxb3VrgOtmIjXR7UukVwdKyk',
  authDomain: 'tavsil.firebaseapp.com',
  projectId: 'tavsil',
  storageBucket: 'tavsil.appspot.com',
  messagingSenderId: '1024070622288',
  appId: '1:1024070622288:web:06cac0c41c948bdc3b0555',
  measurementId: 'G-DX57LSEEQJ',
}

const firebaseCloudMessaging = {
  //checking whether token is available in indexed DB
  tokenInlocalforage: async () => {
    return localforage.getItem('fcm_token')
  },
  //initializing firebase app
  init: async function () {
    if (getApps().length === 0) {
      const app = initializeApp(firebaseConfig)
      try {
        const messaging = getMessaging(app)
        const tokenInLocalForage = await this.tokenInlocalforage()
        //if FCM token is already there just return the token
        if (tokenInLocalForage !== null) {
          return tokenInLocalForage
        }
        //requesting notification permission from browser
        const status = await Notification.requestPermission()
        if (status && status === 'granted') {
          getToken(messaging, {
            vapidKey:
              'BB_Bxo8d7h-zx6TICOp4vC6rpK51uYE6GMFF-Lbtxewy-Wiyv5JYOh43kRz_JloCeH3mNh_0r918v2U2IMQdvsI',
          })
            .then((currentToken) => {
              if (currentToken) {
                // Send the token to your server and update the UI if necessary
                // ...

                localforage.setItem('fcm_token', currentToken)
                console.log('fcm token', currentToken)
              } else {
                // Show permission request UI
                console.log(
                  'No registration token available. Request permission to generate one.'
                )
                // ...
              }
            })
            .catch((err) => {
              console.log('An error occurred while retrieving token. ', err)
              // ...
            })
        }
      } catch (error) {
        console.error(error)
        return null
      }
    }
  },
}
export { firebaseCloudMessaging }
