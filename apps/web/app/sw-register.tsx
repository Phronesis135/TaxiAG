'use client';

import { useEffect } from ';

// Registers the service worker once (safe if unsupported).
export default function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* offline support unavailable — app still works online */
      });
    }
  }, []);
  return null;
}
