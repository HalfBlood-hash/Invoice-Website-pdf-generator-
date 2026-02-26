import { useEffect, useState } from 'react'
import api from './utils/axios.js'
import {Routes,Route} from "react-router-dom"
import Login from './pages/Login.jsx'
import History from './pages/History.jsx'
import Home from './pages/Home.jsx'
import Header from './component/Header.jsx'
import { getCurrentUser } from './feature/userSlice.js'
import { useSelector,useDispatch } from 'react-redux'
function App() {
const dispatch=useDispatch()
const {loggedUser,isLoggedIn,loading,error}=useSelector((state)=>state.users)

  
 useEffect(()=>{
  dispatch(getCurrentUser())
 },[dispatch])

  return (
    <>
    <Header/>
    <Routes>
      <Route  path='/'  element={<Login/>} />
      <Route  path='/home'  element={<Home/>} />
      <Route  path='/history'  element={<History/>} />
    </Routes>
    

    </>
  )
}

export default App
