import Head from 'next/head'
import Image from 'next/image'
import { useMemo, useRef, useState } from 'react'
import { LockClosedIcon } from '@heroicons/react/solid'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/router'
import { Input, Form } from 'antd'
import axios from 'axios'
import Cookies from 'js-cookie'
import getConfig from 'next/config'
import localforage from 'localforage'
import { useUI } from '@components/ui/context'

axios.defaults.withCredentials = true
const { publicRuntimeConfig } = getConfig()
let webAddress = publicRuntimeConfig.apiUrl

interface Errors {
  [key: string]: string
}

interface AnyObject {
  [key: string]: any
}

const errors: Errors = {
  name_field_is_required:
    'Мы Вас не нашли в нашей системе. Просьба указать своё имя.',
  opt_code_is_incorrect: 'Введённый код неверный или срок кода истёк',
}

let otpTimerRef: NodeJS.Timeout

export default function Login() {
  const router = useRouter()
  const { handleSubmit, control, watch } = useForm()
  const [isCodeSent, setCodeSent] = useState(false)
  const [isLoadingOtpSend, setIsLoadingOtpSend] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [otpShowCode, setOtpShowCode] = useState(0)

  const { user, setUserData } = useUI()

  const otpTime = useRef(0)

  const phoneValue = watch('phone')
  const passwordValue = watch('password')

  const startTimeout = () => {
    otpTimerRef = setInterval(() => {
      if (otpTime.current > 0) {
        otpTime.current = otpTime.current - 1
        setOtpShowCode(otpTime.current)
      } else {
        clearInterval(otpTimerRef)
      }
    }, 1000)
  }

  const otpTimerText = useMemo(() => {
    let text = 'Получить новый код через '
    const minutes: number = parseInt((otpShowCode / 60).toString(), 0)
    const seconds: number = otpShowCode % 60
    if (minutes > 0) {
      text += minutes + ' мин. '
    }

    if (seconds > 0) {
      text += seconds + ' сек.'
    }
    return text
  }, [otpShowCode])

  const sendOtpCode = async () => {
    setIsLoadingOtpSend(true)
    setSubmitError('')
    const csrfReq = await axios(`${webAddress}/api/keldi`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        crossDomain: true,
      },
      withCredentials: true,
    })
    let { data: res } = csrfReq
    const csrf = Buffer.from(res.result, 'base64').toString('ascii')

    Cookies.set('X-XSRF-TOKEN', csrf)
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrf
    axios.defaults.headers.common['XCSRF-TOKEN'] = csrf
    let ress = await axios.post(
      `${webAddress}/api/send_otp`,
      {
        phone: '+998' + phoneValue,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }
    )

    let {
      data: { error: otpError, data: result, success },
    }: {
      data: {
        error: string
        data: AnyObject
        success: any
      }
    } = ress

    if (otpError) {
      setSubmitError(errors[otpError])
      setIsLoadingOtpSend(false)
    } else if (success) {
      success = Buffer.from(success, 'base64')
      success = success.toString('ascii')
      success = JSON.parse(success)
      Cookies.set('opt_token', success.user_token)
      otpTime.current = result?.time_to_answer
      setOtpShowCode(otpTime.current)
      setIsLoadingOtpSend(false)
      startTimeout()
      setCodeSent(true)
    }
  }

  const getNewCode = (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault()
    sendOtpCode()
  }

  const signIn = async (e: React.SyntheticEvent<EventTarget>) => {
    e.preventDefault()

    const fcmToken = await localforage.getItem('fcm_token')
    setSubmitError('')
    const otpToken = Cookies.get('opt_token')
    let ress = await axios.post(
      `${webAddress}/api/auth_otp`,
      {
        phone: '+998' + phoneValue,
        code: passwordValue,
        token: fcmToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${otpToken}`,
        },
        withCredentials: true,
      }
    )

    let {
      data: { result },
    }: { data: { result: any } } = ress
    result = Buffer.from(result, 'base64')
    result = result.toString('ascii')
    result = JSON.parse(result)

    if (result === false) {
      setSubmitError(errors.opt_code_is_incorrect)
    } else {
      clearInterval(otpTimerRef)
      if (result?.user?.roles?.length == 0) {
        router.push('/permission_denied')
      } else {
        const userRoles = result.user.roles.map((role: any) => role.name)
        if (!userRoles.includes('admin')) {
          return router.push('/permission_denied')
        }
        setUserData(result)
        router.push('/')
      }
    }
  }

  const onSubmit = async ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => {
    // try {
    //   const loginAttempt = await login(email, password)
    //   if (loginAttempt.status === 204) {
    //     router.push('/')
    //   } else {
    //     alert('Login failed')
    //   }
    // } catch (error) {
    //   console.error(error)
    // }
  }
  return (
    <>
      <Head>
        <title>HQ Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center m-auto w-auto">
              <Image src="/login_logo.svg" width={40} height={40} />
            </div>

            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Авторизация
            </h2>
          </div>
          {submitError && (
            <div className="bg-red-200 p-5 font-bold text-red-600 my-6">
              {submitError}
            </div>
          )}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="-space-y-px">
              <div>
                <Form.Item label="Телефон" labelCol={{ span: 5 }}>
                  <Controller
                    name="phone"
                    defaultValue=""
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Input
                        onChange={onChange}
                        value={value}
                        addonBefore="+998"
                        allowClear
                      />
                    )}
                  />
                </Form.Item>
              </div>
              {isCodeSent && (
                <div>
                  <Form.Item label="Код из смс" labelCol={{ span: 5 }}>
                    <Controller
                      name="password"
                      defaultValue=""
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Input.Password
                          onChange={onChange}
                          value={value}
                          allowClear
                        />
                      )}
                    />
                  </Form.Item>
                  <div className="flex w-full justify-center">
                    {otpShowCode > 0 ? (
                      <div className="text-xs text-indigo-600 font-bold mt-3">
                        {otpTimerText}
                      </div>
                    ) : (
                      <button
                        className="text-xs text-indigo-600 mt-3 font-bold outline-none focus:outline-none border-b border-indigo-600 pb-0.5"
                        onClick={(e) => getNewCode(e)}
                      >
                        Получить код заново
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            {!isCodeSent && (
              <div>
                <button
                  type="submit"
                  className={`${
                    !phoneValue ? 'opacity-40 cursor-not-allowed' : ''
                  } group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  disabled={!phoneValue}
                  onClick={sendOtpCode}
                >
                  {isLoadingOtpSend ? (
                    <svg
                      className="animate-spin h-5 mx-auto text-center text-white w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    'Получить код'
                  )}
                </button>
              </div>
            )}
            {isCodeSent && (
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={signIn}
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LockClosedIcon
                      className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400"
                      aria-hidden="true"
                    />
                  </span>
                  Войти
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  )
}

// export async function getServerSideProps({ res, req }) {
//   // Is there a better way to know the user is already logged in?
//   console.log(process.env.API_URL)
//   try {
//     const isAuthed = await fetch(`${process.env.API_URL}/api/user`, {
//       credentials: 'include',
//       headers: {
//         accept: 'application/json',
//         referer: 'http://localhost:3000/',
//         cookie: req.headers.cookie,
//       },
//     })
//     const data = await isAuthed.text()
//     console.log(data)
//     if (isAuthed.status === 200) {
//       res.setHeader('Location', '/')
//       res.statusCode = 302

//       return { props: {} }
//     }
//   } catch (error) {
//     console.error(error)
//   }

//   const csrf = await fetch(`${process.env.API_URL}/sanctum/csrf-cookie`)
//   res.setHeader('set-cookie', csrf.headers.raw()['set-cookie'])

//   return { props: {} }
// }
