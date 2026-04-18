import { use, useEffect, useState } from 'react'
import api from './utils/axios.js'
import {Routes,Route, Navigate, useLocation, useNavigate} from "react-router-dom"
import Login from './pages/Login.jsx'
import History from './pages/History.jsx'
import Home from './pages/Home.jsx'
import Header from './component/Header.jsx'
import BillForm from './pages/BillForm.jsx'
import { getCurrentUser } from './feature/userSlice.js'
import { useSelector,useDispatch } from 'react-redux'

// Protected Route Component
const ProtectedRoute = ({ isLoggedIn, loading, children }) => {
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/" replace />
  }
  
  return children
}

// Public Route (Login only - redirect if already logged in)
const PublicRoute = ({ isLoggedIn, loading, children }) => {
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }
  
  if (isLoggedIn) {
    
    return <Navigate to= "/home" replace />
  }
  
  return children
}

function App() {
const dispatch=useDispatch()
const {loggedUser,isLoggedIn,loading,error}=useSelector((state)=>state.users)
const location = useLocation()
const navigate = useNavigate()

  
 useEffect(()=>{
  dispatch(getCurrentUser())
 },[dispatch])

 useEffect(() => {
  // console.log("Auth state changed:", { loggedUser: loggedUser ? loggedUser.name : null, isLoggedIn, loading, error })   
 }, [loggedUser, isLoggedIn, loading, error])

  return (
    <>
    <Header/>
    <Routes>
      <Route  path='/'  element={<PublicRoute isLoggedIn={isLoggedIn} loading={loading}><Login/></PublicRoute>} />
      <Route  path='/home'  element={<ProtectedRoute isLoggedIn={isLoggedIn} loading={loading}><Home/></ProtectedRoute>} />
      <Route  path='/history'  element={<ProtectedRoute isLoggedIn={isLoggedIn} loading={loading}><History/></ProtectedRoute>} />
      <Route  path='/billform'  element={<ProtectedRoute isLoggedIn={isLoggedIn} loading={loading}><BillForm/></ProtectedRoute>} />
    </Routes>
    

    </>
  )
}

export default App
