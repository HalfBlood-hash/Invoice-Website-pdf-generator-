import React, { useEffect } from 'react'
import { getUsers } from "../feature/userSlice.js"
import { useSelector, useDispatch } from 'react-redux'

export default function History() {
  const dispatch = useDispatch()
  const { users, loading, error,loggedUser  } = useSelector((state) => state.users)
  console.log(users, loading, error,loggedUser)
  useEffect(() => {
    if (users.length === 0) {
      dispatch(getUsers())
    }
  }, [dispatch, users.length])

  return (
    <div>
      <div>
        {loggedUser ? (loggedUser.name || JSON.stringify(loggedUser)) : 'Not logged in'}
      </div>

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
  )
}
