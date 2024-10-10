// check if you are on the client (browser) or server
const isBrowser = () => typeof window !== 'undefined'

const ProtectedRoute = ({ router, auth, children }: any) => {
  const unprotectedRoutes = [
    '/sign-in',
    '/sign-up',
    '/reset-password',
    '/forgot-password',
    '/'
  ]

  /**
     * @var pathIsProtected Checks if path exists in the unprotectedRoutes routes array
     */
  const pathIsProtected = !unprotectedRoutes.includes(router.pathname)

  if (isBrowser() && !auth && pathIsProtected) {
    router.push('/sign-in')
  }

  return children
}

export default ProtectedRoute
