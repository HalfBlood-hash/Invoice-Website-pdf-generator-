// baseurl

import axios from "axios"

// const BaseUrl=import.meta.env.MODE==="development"?"http://localhost:8000/api":"/api"
 const api = axios.create({
    baseURL:"/api",
    withCredentials:true
    
})

// Add token to Authorization header
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api