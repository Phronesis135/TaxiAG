'use client';

import { useState } from 'react';
import { mockBook, mockSearch, type MockQuote, priceDisplayText } from '@taxiag/ui';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Quote {
  id: string;
  providerId: string;
  providerName: string;
  vehicleClass: string;
  priceType: 'fixed' | 'estimated' | 'metered';
  amount?: number;
  range?: { min: number; max: number };
  pickupEtaMin: number;
  cancellationSummary: string;
}

interface SearchResult {
  quotes: Quote[];
  count: number;
  generatedAt: string;
}

function defaultWhen(): string {
  const d = new Date(Date.now() + 3600_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Real geocoding via OpenStreetMap Nominatim (free, no key). UK only. */
async function geocode(
  label: string,
): Promise<{ lat: number; lng: number; label: string } | null> {
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1` +
    `&countrycodes=gb&q=${encodeURIComponent(label)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return null;
  const [first] = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;
  if (!first) return null;
  return { lat: Number(first.lat), lng: Number(first.lon), label: first.display_name };
}

export default function Home() {
  const [from, setFrom] = useState('Cambridge Station');
  const [to, setTo] = useState('London Heathrow Terminal 5');
  const [when, setWhen] = useState(defaultWhen);
  const [passengers, setPassengers] = useState('2');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [bookingFor, setBookingFor] = useState<Quote | null>(null);
  const [paxName, setPaxName] = useState('');
  const [paxPhone, setPaxPhone] = useState('');
  const [paxEmail, setPaxEmail] = useState('');
  const [forOther, setForOther] = useState(false);
  const [booking, setBooking] = useState<null | {
    ref: string;
    route: string;
    responsibility: Record<string, string>;
  }>(null);
  const [reval, setReval] = useState<Quote | null>(null);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [demo, setDemo] = useState(false);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const [pickup, dropoff] = await Promise.all([geocode(from), geocode(to)]);
      if (!pickup) throw new Error(`Could not find “${from}” — try a more specific UK address.`);
      if (!dropoff) throw new Error(`Could not find “${to}” — try a more specific UK address.`);
      const pax = parseInt(passengers, 10);
      const body: Record<string, unknown> = {
        pickup: { lat: pickup.lat, lng: pickup.lng },
        dropoff: { lat: dropoff.lat, lng: dropoff.lng },
        when: new Date(when).toISOString(),
        passengers: Number.isInteger(pax) && pax > 0 ? pax : 1,
      };
      const max = parseFloat(maxPrice);
      if (!Number.isNaN(max) && max > 0) body.maxPrice = max;
      const iso = body.when as string;
      let res: Response;
      try {
        res = await fetch(`${API}/v1/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch {
        // API unreachable (e.g. static hosting with no backend yet):
        // fall back to the in-browser demo provider. Real flow resumes
        // automatically whenever the API is reachable.
        const m = mockSearch({
          pickup: body.pickup as { lat: number; lng: number },
          dropoff: body.dropoff as { lat: number; lng: number },
          when: iso,
          passengers: body.passengers as number,
          ...(typeof body.maxPrice === 'number' ? { maxPrice: body.maxPrice } : {}),
        });
        setResult({ quotes: m.quotes, count: m.count, generatedAt: m.generatedAt });
        setDemo(true);
        setLoading(false);
        return;
      }
      setDemo(false);
      if (!res.ok) throw new Error(`Search failed (HTTP ${res.status}).`);
      setResult((await res.json()) as SearchResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed.');
    } finally {
      setLoading(false);
    }
  }

  async function createBooking(quoteId: string) {
    setBookingBusy(true);
    setError(null);
    setBooking(null);
    setReval(null);
    if (demo) {
      // No backend: complete the loop locally as an explicit demo booking.
      const q = result?.quotes.find((x) => x.id === quoteId);
      if (!q) {
        setError('Quote no longer available — please search again.');
        setBookingBusy(false);
        return;
      }
      const d = mockBook(
        {
          ...q,
          currency: 'GBP' as const,
          fees: [] as Array<{ label: string; amount: number }>,
          vehicleClass: q.vehicleClass as MockQuote['vehicleClass'],
          validUntil: new Date(Date.now() + 5 * 60_000).toISOString(),
        },
        paxName.trim() || 'Demo Rider',
      );
      setBooking({
        ref: d.ref,
        route: 'demo',
        responsibility: {
          booking: `${d.providerName} — DEMO, no real booking was made`,
          payment: 'DEMO — no payment taken. Run the API + PayPal sandbox for real payments.',
          cancellation: q.cancellationSummary,
          refund: 'DEMO — nothing to refund.',
          support: 'Run the API locally for the full experience (see README).',
        },
      });
      setBookingFor(null);
      setBookingBusy(false);
      return;
    }
    try {
      const res = await fetch(`${API}/v1/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId,
          passenger: {
            name: paxName,
            phone: paxPhone,
            ...(paxEmail.trim() ? { email: paxEmail.trim() } : {}),
          },
          bookForOther: forOther,
        }),
      });
      const data = (await res.json()) as
        | { record: { bookingId: string; route: string; responsibility: Record<string, string> } }
        | { revalidation: Quote }
        | { message?: string };
      if (!res.ok) {
        const msg =
          'message' in data && typeof data.message === 'string' && data.message
            ? data.message
            : null;
        throw new Error(msg ?? `Booking failed (HTTP ${res.status}).`);
      }
      if ('revalidation' in data) {
        // Price changed while booking — customer must confirm the new price.
        setReval(data.revalidation);
        return;
      }
      if (!('record' in data)) throw new Error('Unexpected booking response.');
      setBooking({
        ref: data.record.bookingId,
        route: data.record.route,
        responsibility: data.record.responsibility,
      });
      setBookingFor(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed.');
    } finally {
      setBookingBusy(false);
    }
  }

  return (
    <div className="page">
      <h1>TaxiAG</h1>
      <p className="tagline">Compare. Choose. Book. — local MVP wired to the live API</p>

      <form className="card" onSubmit={onSearch}>
        <div className="field">
          <label htmlFor="from">From</label>
          <input id="from" value={from} onChange={(e) => setFrom(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="to">To</label>
          <input id="to" value={to} onChange={(e) => setTo(e.target.value)} required />
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="when">When?</label>
            <input id="when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="pax">Passengers</label>
            <input id="pax" type="number" min={1} value={passengers} onChange={(e) => setPassengers(e.target.value)} required />
          </div>
        </div>
        <div className="field">
          <label htmlFor="max">Maximum price £ (optional)</label>
          <input id="max" type="number" min={0} step="0.01" placeholder="e.g. 25" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          <p className="hint">Addresses are geocoded live via OpenStreetMap; quotes come from the TaxiAG API.</p>
        </div>
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Compare taxis'}
        </button>
      </form>

      {error && <div className="error" role="alert">{error}</div>}

      {result && (
        <div>
          <p className="meta">
            {result.count} option{result.count === 1 ? '' : 's'} · cheapest first · {new Date(result.generatedAt).toLocaleTimeString('en-GB')}
            {demo ? ' · demo sample' : ''}
          </p>
          {demo && (
            <div className="demobanner" role="status">
              Demo mode — the API isn’t reachable, so these are sample quotes computed in your browser.
              Run the API locally for live bookings and PayPal sandbox payments.
            </div>
          )}
          {result.count === 0 ? (
            <div className="empty">
              No suitable vehicles found{maxPrice ? ` under £${maxPrice}` : ''}. Try a higher budget or different route.
            </div>
          ) : (
            result.quotes.map((q) => (
              <div className="result" key={q.id}>
                <div className="main">
                  <div className="provider">{q.providerName}</div>
                  <div className="detail">
                    Pickup: {q.pickupEtaMin} min · {q.vehicleClass} · {q.cancellationSummary}
                  </div>
                  <button
                    className="btn btn-inline"
                    type="button"
                    onClick={() => {
                      setBookingFor(q);
                      setBooking(null);
                      setReval(null);
                      setError(null);
                    }}
                  >
                    Book this taxi
                  </button>
                </div>
                <div className="price">
                  <div className="amount">
                    {q.priceType === 'estimated' && q.range
                      ? `£${q.range.min.toFixed(2)}–£${q.range.max.toFixed(2)}`
                      : `£${(q.amount ?? 0).toFixed(2)}`}
                  </div>
                  <span className={`badge badge-${q.priceType}`}>
                    {priceDisplayText({ priceType: q.priceType, amount: q.amount, range: q.range })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {bookingFor && !booking && (
        <div className="card">
          <h2>Confirm booking</h2>
          <p className="meta">
            {bookingFor.providerName} ·{' '}
            {priceDisplayText({ priceType: bookingFor.priceType, amount: bookingFor.amount, range: bookingFor.range })}{' '}
            · {bookingFor.vehicleClass}
          </p>
          {reval ? (
            <div>
              <div className="error" role="alert">
                The price changed before booking. New price:{' '}
                {priceDisplayText({ priceType: reval.priceType, amount: reval.amount, range: reval.range })}.
                Nothing is booked until you confirm.
              </div>
              <button className="btn" type="button" disabled={bookingBusy} onClick={() => createBooking(reval.id)}>
                {bookingBusy ? 'Booking…' : 'Confirm new price & book'}
              </button>
            </div>
          ) : (
            <div>
              <div className="field">
                <label htmlFor="pname">Passenger name</label>
                <input id="pname" value={paxName} onChange={(e) => setPaxName(e.target.value)} placeholder="e.g. Jane Doe" />
              </div>
              <div className="field">
                <label htmlFor="pphone">Passenger phone</label>
                <input id="pphone" type="tel" value={paxPhone} onChange={(e) => setPaxPhone(e.target.value)} placeholder="e.g. +447000000000" />
              </div>
              <div className="field">
                <label htmlFor="pemail">Email for payment receipt (optional)</label>
                <input id="pemail" type="email" value={paxEmail} onChange={(e) => setPaxEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div className="checkrow">
                <input id="other" type="checkbox" checked={forOther} onChange={(e) => setForOther(e.target.checked)} />
                <label htmlFor="other">Booking for someone else</label>
              </div>
              <button
                className="btn"
                type="button"
                disabled={bookingBusy || !paxName.trim() || !paxPhone.trim()}
                onClick={() => createBooking(bookingFor.id)}
              >
                {bookingBusy ? 'Booking…' : 'Confirm & book'}
              </button>
            </div>
          )}
        </div>
      )}

      {booking && (
        <div className="card refbox">
          <h2>Booked ✓</h2>
          <p className="meta">Reference</p>
          <p className="ref">{booking.ref}</p>
          <p className="meta">Route: {booking.route} booking</p>
          {booking.route === 'demo' ? (
            <p className="meta">Demo booking — no payment step. Connect the API for PayPal sandbox checkout.</p>
          ) : (
          <button
            className="btn"
            type="button"
            disabled={bookingBusy}
            onClick={async () => {
              setBookingBusy(true);
              setError(null);
              try {
                const res = await fetch(`${API}/v1/payments/order`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ bookingId: booking.ref }),
                });
                const data = (await res.json()) as { approveUrl?: string; message?: string };
                if (!res.ok || !data.approveUrl) {
                  throw new Error(
                    (typeof data.message === 'string' && data.message) ||
                      'PayPal sandbox not configured — add keys to .env and restart the API.',
                  );
                }
                window.location.href = data.approveUrl;
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Payment failed.');
                setBookingBusy(false);
              }
            }}
          >
            {bookingBusy ? 'Contacting PayPal…' : 'Pay with PayPal (sandbox)'}
          </button>
          )}
          <ul>
            {Object.entries(booking.responsibility).map(([k, v]) => (
              <li key={k}>
                <strong>{k}:</strong> {v}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
