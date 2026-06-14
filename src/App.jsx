import { RouterProvider } from 'react-router-dom'
import { useEffect } from 'react'
import router from './router'
import './App.css'
import usePreferencesStore from './store/preferencesStore'
import { getSettings } from './api/products'

function App() {
  const language = usePreferencesStore((state) => state.language)
  const setUsdToLbpRate = usePreferencesStore((state) => state.setUsdToLbpRate)

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await getSettings()
        const rate = Number(data?.usdToLbpRate)

        if (Number.isFinite(rate) && rate > 0) {
          setUsdToLbpRate(rate)
        }
      } catch {
        setUsdToLbpRate(89500)
      }
    }

    fetchSettings()
  }, [setUsdToLbpRate])

  return <RouterProvider router={router} />
}

export default App
