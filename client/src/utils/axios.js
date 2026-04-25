// baseurl

import axios from "axios"

// const BaseUrl=import.meta.env.MODE==="development"?"http://localhost:8000/api":"/api"
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
})

const shouldSkipRefresh = (requestUrl = "") => {
  return (
    requestUrl.includes("/users/login") ||
    requestUrl.includes("/users/register") ||
    requestUrl.includes("/users/refresh-token")
  )
}

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const requestUrl = originalRequest.url || "";

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry &&
      !shouldSkipRefresh(requestUrl)
    ) {
      originalRequest._retry = true

      try {
        await api.post('/users/refresh-token')
        return api(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        window.location.replace('/')
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
