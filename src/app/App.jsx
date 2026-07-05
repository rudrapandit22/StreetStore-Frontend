import './App.css'
import { RouterProvider } from 'react-router'
import { routes } from './app.routes.jsx'
import { useEffect } from 'react'
import { useauth } from '../features/auth/hook/useAuth.js'

function App() {
  const { handlegetme } = useauth()

  useEffect(() => {
    handlegetme()
  }, [])

  return <RouterProvider router={routes} />
}

export default App
