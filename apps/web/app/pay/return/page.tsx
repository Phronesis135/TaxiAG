'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API = 'http://localhost:3001';

function ReturnInner() {
  const params = useSearchParams();
  const [state, setState] = useState<'working' | 'paid' | 'failed'>('working');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setState('failed');
      setDetail('No PayPal order token in the return URL.');
      return;
    }
    (async () => {
      try {
        const res = await fetch(`${API}/v1/payments/capture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: token }),
        });
        const data = (await res.json()) as {
          payment?: { amountGbp: number; captureId: string };
          receiptSent?: boolean;
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? `Capture failed (HTTP ${res.status}).`);
        setState('paid');
        setDetail(
          `£${(data.payment?.amountGbp ?? 0).toFixed(2)} captured (PayPal ${data.payment?.captureId ?? ''}).` +
            (data.receiptSent
              ? ' Receipt emailed to the passenger.'
              : ' No receipt email — add a passenger email at booking time (and set RESEND keys in .env).'),
        );
      } catch (err) {
        setState('failed');
        setDetail(err instanceof Error ? err.message : 'Capture failed.');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <h1>TaxiAG</h1>
      <p className="tagline">PayPal sandbox return</p>
      <div className="card">
        {state === 'working' && <p>Confirming your payment…</p>}
        {state === 'paid' && (
          <div>
            <h2>Paid ✓</h2>
            <p>{detail}</p>
          </div>
        )}
        {state === 'failed' && (
          <div>
            <h2>Payment not completed</h2>
            <p className="meta">{detail}</p>
          </div>
        )}
        <p className="meta" style={{ marginTop: 16 }}>
          <a href="/" style={{ color: 'inherit' }}>Back to search</a>
        </p>
      </div>
    </div>
  );
}

export default function PayReturn() {
  return (
    <Suspense>
      <ReturnInner />
    </Suspense>
  );
}
