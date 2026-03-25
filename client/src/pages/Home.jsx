

import React,{useEffect, useState} from 'react'
import api from '../utils/axios.js'
import { useSelector, useDispatch } from 'react-redux'
import { getUsers } from "../feature/userSlice.js"
export default function Home() {

  const dispatch = useDispatch()
  const {users, loading, error,loggedUser} = useSelector((state) => state.users)
  
  useEffect(() => {
    console.log("ok",users, loading, loggedUser.name)
    if (users.length === 0) {
      console.log("dispatching getUsers")
      dispatch(getUsers())

    }
  }, [dispatch, users.length])

  return (
    <>
    <div>
      <h1>All Users</h1>
      {loading && <div>Loading users…</div>}
      {error && <div className='text-error'>{error}</div>}

      <div>
        {Array.isArray(users) && users.map((item, key) => (
          <div key={key}>
            <div className='text-2xl text-amber-100'>{item.name}</div>
            <div>{item.email}</div>
          </div>
        ))}
      </div>
    </div>
    </>
  )
}
