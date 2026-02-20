import { useEffect, useState } from 'react'
import api from './utils/axios.js'

function App() {
  const [user,setuser]=useState([])
useEffect(()=>{
  const fectchUser=async ()=>{
    try {
      
      const res= await api.get("/getallusers")
      setuser(res.data)
      
    } catch (error) {
      
    }
  }
  fectchUser();
},[])


  return (
   <>
    
      {
        user.map((item,key)=>{
         return(
          <div key={key}>
            <div>{item.name}</div>
            <div>{item.email}</div>
          </div>
          
         )
        })
      }
    
   </>
  )
}

export default App
