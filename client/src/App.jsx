import { useEffect, useState } from 'react'
import api from './utils/axios.js'

function App() {
  const [users, setuser] = useState([])
  useEffect(() => {
    const fectchUser = async () => {
      try {

        const res = await api.get("/users/getallusers")

        

        console.log(res.data.payload);
        setuser(res.data.payload)

      } catch (error) {

      }
    }
    fectchUser();
  }, [])


  return (
    <>

      {
         users.map((item, key) => {
          return (
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
