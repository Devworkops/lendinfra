import { createContext, type Context, useContext } from 'react'
import getConfig from 'next/config'
import { type SignUpArgs, type UserPayload } from '../interfaces/IUser'
import { useSnackbar } from 'notistack'
import axios from 'axios'
import { type Company } from '../interfaces/ICompany'
const { publicRuntimeConfig } = getConfig()

interface AuthContext {
  auth: UserPayload | null
  company: Company | null
  signin: (email: string, password: string, _onSuccess: any) => void
  signup: (data: SignUpArgs, onSuccess: any) => void
  signout: (onSuccess: any) => void
  switchCompany: (companyId: string, _onSuccess: any) => void
  passwordReset: (email: string) => void
  changePassword: (token: string, password: string, _onSuccess: any) => void
}

// Create context with a default state.
const authContext: Context<AuthContext> = createContext<AuthContext>({
  auth: null,
  company: null,
  signin: async (_email: string, _password: string, _onSuccess: any) => { },
  signup: async (_data: SignUpArgs, _onSuccess: any) => { },
  signout: async (_onSuccess: any) => { },
  switchCompany: async (_companyId: string, _onSuccess: any) => { },
  passwordReset: async (_email: string) => { },
  changePassword: async (_token: string, _password: string, _onSuccess: any) => { }
})

const { Provider } = authContext

function useProvideAuth (auth: UserPayload, company: Company) {
  const { enqueueSnackbar } = useSnackbar()
  const client = axios.create({
    withCredentials: true,
    baseURL: `${publicRuntimeConfig.backendUrl}`
  })

  const signin = async (email: string, password: string, onSuccess: any) => {
    try {

      let response = await client.post('/api/users/signin', { email, password }, {
        withCredentials: true,
      })
      if (onSuccess) {
        onSuccess(response.data)
      }
    } catch (error: any) {

      if(error.response){
        enqueueSnackbar(error.response.data.errors[0].message, {
          variant: "error",
        });
      }
      else{
        enqueueSnackbar(error.message, {
          variant: "error",
        });
      }


    }
  }

  const signup = async (data: SignUpArgs, onSuccess: any) => {
    try {
      const response = await client.post('/api/users/signup', { ...data }, {
        withCredentials: true
      })

      if (onSuccess) {
        onSuccess(response.data)
      }
    } catch (error: any) {
      enqueueSnackbar(error.response.data.errors[0].message, {
        variant: 'error'
      })
    }
  }

  const passwordReset = async (email: string) => {
    try {
      const response = await client.get(`/api/users/resetPassword?email=${email}`, {
        withCredentials: true
      })
      enqueueSnackbar(response.data.message as string, {
        variant: 'info'
      })
    } catch (error: any) {
      enqueueSnackbar(error.response.data.errors[0].message, {
        variant: 'error'
      })
    }
  }

  const changePassword = async (token: string, password: string, onSuccess: any) => {
    try {
      const response = await client.post('/api/users/resetPassword', { password, token }, {
        withCredentials: true
      })

      if (onSuccess) {
        enqueueSnackbar(response.data.message as string, {
          variant: 'success'
        })
        onSuccess(response.data)
      }
    } catch (error: any) {
      enqueueSnackbar(error.response.data.errors[0].message, {
        variant: 'error'
      })
    }
  }

  const signout = async (onSuccess: any) => {
    try {
      const response = await client.get('/api/users/signout', {
        withCredentials: true
      })

      if (onSuccess) {
        if (response.data.errors) {
          enqueueSnackbar(response.data.errors[0].message as string, {
            variant: 'error'
          })
        } else { onSuccess(response.data) }
      }
    } catch (error: any) {
      enqueueSnackbar(error.response.data.errors[0].message, {
        variant: 'error'
      })
    }
  }
  const switchCompany = async (companyId: string, onSuccess: any) => {
    try {
      const response = await client.put('/api/users/switchCompany', { companyId }, {
        withCredentials: true
      })
      if (onSuccess) {
        onSuccess(response.data)
      }
    } catch (error: any) {
      enqueueSnackbar(error.response.data.errors[0].message, {
        variant: 'error'
      })
    }
  }

  // returns state values and callbacks for signIn and signOut.
  return {
    auth,
    company,
    signin,
    signup,
    signout,
    switchCompany,
    passwordReset,
    changePassword
  }
}

function AuthProvider (props: { auth: UserPayload, company: Company, children: any }) {
  const auth = useProvideAuth(props.auth, props.company)
  return <Provider value={auth}>{props.children}</Provider>
}
export const useAuth = () => useContext(authContext)

export default AuthProvider
