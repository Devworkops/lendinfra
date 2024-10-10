import axios from 'axios'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()

export default function BuildClient ({ req }: any): any {
  if (typeof window === 'undefined') {
    // We are on the server
    return axios.create({
      baseURL: `${publicRuntimeConfig.backendUrl}`,
      headers: req.headers
    })
  } else {
    // We must be on the browser
    return axios.create({
      withCredentials: true,
      baseURL: `${publicRuntimeConfig.backendUrl}`
    })
  }
}
