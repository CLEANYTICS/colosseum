'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    Jupiter: any
  }
}

export default function JupiterWidget() {
  useEffect(() => {
    // Load the script if not already loaded
    if (!document.getElementById('jupiter-plugin-script')) {
      const script = document.createElement('script')
      script.id = 'jupiter-plugin-script'
      script.src = 'https://plugin.jup.ag/plugin-v1.js'
      script.setAttribute('data-preload', '')
      script.defer = true
      script.onload = () => initJupiter()
      document.head.appendChild(script)
    } else if (window.Jupiter) {
      initJupiter()
    }

    function initJupiter() {
      if (!window.Jupiter) return
      window.Jupiter.init({
        displayMode: 'widget',
        widgetStyle: {
          position: 'bottom-left',
          size: 'default',
        },
        branding: {
          name: 'CLEANYTICS',
        },
        formProps: {
          referralAccount: process.env.NEXT_PUBLIC_JUPITER_REFERRAL ?? undefined,
          referralFee: 50, // 0.5%
        },
      })
    }

    return () => {
      // Cleanup on unmount
      if (window.Jupiter?.close) window.Jupiter.close()
    }
  }, [])

  return null // widget renders itself via the script
}
