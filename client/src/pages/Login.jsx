import React, { useState } from 'react'
import api from "../utils/axios.js"
import { toast } from 'react-hot-toast'
import { loginUser, registerUser } from '../feature/userSlice.js'
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isRegister, setIsRegister] = useState(false)
    const navigate=useNavigate();
  const dispatch = useDispatch()
  // Match the slice keys: usersSlice.reducer is mounted likely as "users"
  const { loggedUser, isLoggedIn, loading: storeLoading, error: storeError } = useSelector((state) => state.users)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // if (isRegister) {
    //   if (!name.trim()) {
    //     toast.error("Name required!")
    //     return
    //   }
    //   if (!email.trim()) {
    //     toast.error("Email required!")
    //     return
    //   }
    //   if (!password.trim()) {
    //     toast.error("Password required!")
    //     return
    //   }

    //   setLoading(true)
    //   setError("")

    //   try {
    //     await dispatch(registerUser({ name, email, password })).unwrap()
    //     toast.success("Registration successful! Please login.")
    //     setIsRegister(false)
    //     setName("")
    //     setEmail("")
    //     setPassword("")
    //   } catch (err) {
    //     toast.error(err || 'Registration failed')
    //     setError(err || 'Registration failed')
    //   } finally {
    //     setLoading(false)
    //   }
    // } else {
      if (!email.trim()) {
        toast.error("Email required!")
        return
      }
      if (!password.trim()) {
        toast.error("Password required!")
        return
      }

      setLoading(true)
      setError("")

      try {
        
        const user = await dispatch(loginUser({ email, password })).unwrap()

          toast.success("Login successful")
          navigate('/home')
      } catch (err) {
        // Only needed if using unwrap
        toast.error(err || 'Login failed')
        setError(err || 'Login failed')
      } finally {
        setLoading(false)
      }
    // }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="px-8 py-10">
            <h2 className="text-center text-3xl font-bold text-gray-800 mb-3">Login</h2>
            <p className="text-center text-gray-500 mb-8">Sign in to manage your invoices</p>
            <form onSubmit={handleSubmit}>
              {/* {isRegister && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                  />
                </div>
              )} */}
              <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition" />
                </div>
                <div className="mb-4">
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition" />
                  </div>
              {!!(error || storeError) && (
                <p className="text-red-600 text-center mb-4">{error || storeError}</p>
              )}
              <button
                disabled={loading || storeLoading}
                type="submit"
                className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-white font-semibold shadow-sm hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {(loading || storeLoading) ? "Loading..." : "Login"}
              </button>
            </form>
            {/* <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister)
                  setError("")
                  setName("")
                  setEmail("")
                  setPassword("")
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}
