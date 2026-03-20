'use client'
import { useEffect } from 'react'

export function AdScript() {
  useEffect(() => {
    // Wait for the SDK to load, then initialize
    const init = () => {
      if (typeof (window as any).show_10753145 === 'function') {
        (window as any).show_10753145({
          type: 'inApp',
          inAppSettings: {
            frequency: 2,
            capping: 0.1,
            interval: 30,
            timeout: 5,
            everyPage: false
          }
        })
      }
    }

    // Small delay to ensure SDK script has executed
    const timer = setTimeout(init, 500)
    return () => clearTimeout(timer)
  }, [])

  return null
}
