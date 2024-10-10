import Dashboard from '../../components/dashboard'
import { useAuth } from '../../hooks/useAuth'
import SignIn from '../../components/auth/SignIn'

export default function Home () {
  const { auth } = useAuth()

  return (auth != null) ? <Dashboard></Dashboard> : <SignIn></SignIn>
}
