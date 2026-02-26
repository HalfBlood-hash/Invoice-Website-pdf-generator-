// baseurl

import axios from "axios"

// const BaseUrl=import.meta.env.MODE==="development"?"http://localhost:8000/api":"/api"
 const api = axios.create({
    baseURL:"/api",
    withCredentials:true
    
})

export default api