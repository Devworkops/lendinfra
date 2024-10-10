import Router from 'next/router'
import { useEffect } from 'react'
import SignIn from '../components/auth/SignIn'
import { useAuth } from '../hooks/useAuth'

export default function SignInPage () {
  const { auth } = useAuth()
  useEffect(() => {
    if (auth != null) { Router.replace('/dashboard') }
  }, [])

  return (auth == null) ? <SignIn /> : <></>
}

