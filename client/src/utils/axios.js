// baseurl

import axios from "axios"

const BaseUrl=import.meta.env.MODE==="development"?"http://localhost:5000/api/users":"/api"
 const api = axios.create({
    baseURL:BaseUrl
})

export default api