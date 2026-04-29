import { RouterProvider } from 'react-router-dom'
import { useEffect } from 'react'
import router from './router'
import './App.css'
import usePreferencesStore from './store/preferencesStore'

function App() {
  const language = usePreferencesStore((state) => state.language)

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  return <RouterProvider router={router} />
}

export default App
