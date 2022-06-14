import 'tailwindcss/tailwind.css'
import 'antd/dist/antd.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ManagedUIContext } from '@components/ui/context'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'

import { firebaseCloudMessaging } from '../components/webPush'
import { RecoilRoot } from 'recoil'
declare global {
  interface Window {
    firebase: any // 👈️ turn off type checking
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  async function setToken() {
    try {
      const token = await firebaseCloudMessaging.init()
      if (token) {
        getMessage()
      }
    } catch (error) {
      console.log(error)
    }
  }
  function getMessage() {
    // const messaging = window.firebase.messaging()
    // messaging.onMessage((message: any) => console.log('foreground', message))
  }
  useEffect(() => {
    setToken()
  }, [])
  return (
    <ManagedUIContext>
      <QueryClientProvider client={queryClient}>
        <RecoilRoot>
          <Component {...pageProps} />
        </RecoilRoot>
      </QueryClientProvider>
    </ManagedUIContext>
  )
}
export default MyApp
