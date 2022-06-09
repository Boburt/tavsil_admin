import authRequired from '@services/authRequired'
import React, { useEffect, useState } from 'react'
import LoadingScreen from '@components/ui/LoadingScreen'
import MainLayout from '@components/ui/MainLayout'
import { message, Button } from 'antd'

export default function Home() {
  const user = authRequired({})
  const [show, setShow] = useState(false)

  if (!user) {
    return <LoadingScreen />
  }

  return (
    <MainLayout title="Home">
      <iframe
        src="https://kb.hq.fungeek.net/goto/2350d6eae528bbb6346387c6c0a875fb"
        height="1000"
        width="100%"
      ></iframe>
    </MainLayout>
  )
}
