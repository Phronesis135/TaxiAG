'use client';

import { useEffect, useState } from 'react';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

// Visible install entry point. Android/desktop Chrome/Edge: drives the real
// install prompt. iOS Safari: shows Add-to-Home-Screen steps (no prompt API).
// Hidden entirely when already installed.
export default function InstallButton() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) return null;

  if (promptEvent) {
    return (
      <button
        className="btn btn-install"
        type="button"
        onClick={async () => {
          await promptEvent.prompt();
          const choice = await promptEvent.userChoice;
          if (choice.outcome === 'accepted') setPromptEvent(null);
        }}
      >
        ⬇ Install TaxiAG app
      </button>
    );
  }

  if (isIos()) {
    return (
      <div>
        <button className="btn btn-install" type="button" onClick={() => setShowIosHelp((v) => !v)}>
          ⬇ Install TaxiAG app
        </button>
        {showIosHelp && (
          <p className="meta" style={{ marginTop: 8 }}>
            On iPhone: tap <strong>Share</strong> in Safari, then <strong>Add to Home Screen</strong>.
          </p>
        )}
      </div>
    );
  }

  return null;
}
