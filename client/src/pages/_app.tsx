import * as React from 'react'
import Head from 'next/head'
import { type AppContext, type AppProps } from 'next/app'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CacheProvider, type EmotionCache } from '@emotion/react'
import { Helmet, HelmetProvider } from 'react-helmet-async'

import theme from '../config/theme/theme'
import createEmotionCache from '../utils/createEmotionCache'

import 'reactflow/dist/style.css'
import '../config/overview.css'
import SpinnerProvider from '../hooks/useSpinner'
import { SnackbarProvider } from 'notistack'
import { Box, styled } from '@mui/material'
import Header from '../components/common/Header'
import Layout from '../components/common/Layout'
import AuthProvider from '../hooks/useAuth'
import { type UserPayload } from '../interfaces/IUser'
import buildClient from '../utils/build-client'
import ProtectedRoute from '../hooks/useProtectedRoutes'
import { type Company } from '../interfaces/ICompany'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
  auth: UserPayload
  company: Company
}

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar
}))

const AppComponent = (props: MyAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps, auth, router, company } = props
  return (
    <HelmetProvider>
      <CacheProvider value={emotionCache}>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <link rel="icon" href="/favicon.ico" />
          <title>Decision Loop</title>
        </Head>
        <ThemeProvider theme={theme}>
          <SpinnerProvider>
            <SnackbarProvider>
              <AuthProvider auth={auth} company={company}>
                <Helmet
                  htmlAttributes={{ lang: 'en' }}
                  meta={[
                    {
                      name: 'viewport',
                      content: 'width=device-width, initial-scale=1'
                    },
                    { property: 'og:title', content: 'Decision Loop' }
                  ]}
                />
                <Box sx={{ display: 'flex', flexGrow: 1, height: 'inherit' }}>
                  {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                  <CssBaseline />
                  <Header></Header>
                  <Box
                    component="main" sx={{ flexGrow: 1, p: 3 }}
                  >
                    <DrawerHeader />
                    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                    <CssBaseline />
                    <ProtectedRoute router={router} auth={auth}>
                      <Layout>
                        <Component {...pageProps} />
                      </Layout>
                    </ProtectedRoute>
                  </Box>
                </Box>
              </AuthProvider>
            </SnackbarProvider>
          </SpinnerProvider>
        </ThemeProvider>
      </CacheProvider>
    </HelmetProvider>
  )
}

AppComponent.getInitialProps = async (appContext: AppContext) => {
  try {
    const client = buildClient(appContext.ctx)
    const { data } = await client.get('/api/users/currentuser')
    let company = null
    if (data.currentUser && data.currentUser.companyId) {
      const companyInfo = await client.get(`/api/company/${data.currentUser.companyId}`)
      company = companyInfo.data
    }
    // To invoke the getInitialProps of component
    let pageProps = {}
    if (appContext.Component.getInitialProps != null) {
      pageProps = await appContext.Component.getInitialProps(
        appContext.ctx
      )
    }
    return {
      pageProps,
      auth: data.currentUser,
      company
    }
  } catch (error) {
    console.log(error)
  }
}

export default AppComponent
