import React, { useState } from 'react'
import api from "../utils/axios.js"
import { toast } from 'react-hot-toast'
import { loginUser } from '../feature/userSlice.js'
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
    const navigate=useNavigate();
  const dispatch = useDispatch()
  // Match the slice keys: usersSlice.reducer is mounted likely as "users"
  const { loggedUser, isLoggedIn, loading: storeLoading, error: storeError } = useSelector((state) => state.users)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error("email required!")
      return
    }
    if (!password.trim()) {
      toast.error("password required!")
      return
    }

    setLoading(true)
    setError("")

    try {
      
      const user = await dispatch(loginUser({ email, password })).unwrap()

        toast.success("login successful")
        navigate('/home')
    } catch (err) {
      // Only needed if using unwrap
      toast.error(err || 'Login failed')
      setError(err || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-base-200">
        <div className="w-full mx-auto px-4 py-8">
          <div className="max-w-100 mx-auto">
            <div className="card bg-base-100">
              <div className="card-body">
                <h2 className="text-center text-2xl font-bold">Login</h2>
                <form onSubmit={handleSubmit}>
                  <div className='form-control mb-4 mt-4'>
                    <input
                      type='text'
                      placeholder='enter your email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='input input-bordered w-full rounded-2xl p-4 text-center'
                    />
                  </div>
                  <div className='form-control mb-4 mt-4'>
                    <input
                      type='password'
                      placeholder='enter your password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className='input input-bordered w-full rounded-2xl p-4 text-center'
                    />
                  </div>
                  {!!(error || storeError) && (
                    <p className="text-error text-center mt-2">
                      {error }
                    </p>
                  )}
                  <div>
                    <button
                      disabled={loading || storeLoading}
                      type='submit'
                      className='btn btn-success w-full rounded-2xl mt-4'
                    >
                      {(loading || storeLoading) ? "loading..." : "Login"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
