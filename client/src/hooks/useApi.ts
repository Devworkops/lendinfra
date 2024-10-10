import axios, { type AxiosResponse } from 'axios'
import getConfig from 'next/config'
import { useSpinner } from './useSpinner'
const { publicRuntimeConfig } = getConfig()

export default <T>(): [(url: string) => Promise<AxiosResponse<any, any>>,
  (url: string, data: T) => Promise<AxiosResponse<any, any>>,
  (url: string, data: T) => Promise<AxiosResponse<any, any>>,
  (url: string, id: string) => Promise<AxiosResponse<any, any>>
] => {
  const client = axios.create({
    withCredentials: true,
    baseURL: `${publicRuntimeConfig.backendUrl}`
  })

  const { enableSpinner, disableSpinner } = useSpinner()
  const getData = async (url: string) => {
    if(url.includes('notification')){}
    else enableSpinner()
    let response
    try {
      response = await client.get(`${publicRuntimeConfig.backendUrl}/${url}`)
    } catch (error: any) {
      console.log("error--------------------",error)
      if (error?.response?.data == undefined) {
        error.response.data = { errors: [{ message: 'Something Wrong happened' }] }
      }
      response = error.response
    }
    disableSpinner()
    return response
  }

  const saveData = async (url: string, data: T) => {
    enableSpinner()
    let response
    try {
      response = await client.post(`${publicRuntimeConfig.backendUrl}/${url}`, data)
    } catch (error: any) {
      response = error.response
    }
    disableSpinner()
    return response
  }

  const updateData = async (url: string, data: T) => {
    enableSpinner()
    let response
    try {
      response = await client.put(`${publicRuntimeConfig.backendUrl}/${url}`, data)
      
    } catch (error: any) {
      if (error?.response?.data == undefined) {
        error.response.data.errors.push({ message: 'Something Wrong happened' })
      }
      response = error.response
    }
    disableSpinner()
    return response
  }

  const deleteData = async (url: string, id: string) => {
    enableSpinner()
    let response
    try {
      response = await client.delete(`${publicRuntimeConfig.backendUrl}/${url}/${id}`)
    } catch (error: any) {
      response = error.response
    }
    disableSpinner()
    return response
  }

  return [
    getData,
    saveData,
    updateData,
    deleteData
  ]
}
