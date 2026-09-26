'use client';

import { useState } from 'react';
import { priceDisplayText } from '@taxiag/ui';

const API = 'http://localhost:3001';

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
      let res: Response;
      try {
        res = await fetch(`${API}/v1/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch {
        throw new Error(
          'API not reachable at localhost:3001 — start it with: npm run stack:up, then run the API (see README).',
        );
      }
      if (!res.ok) throw new Error(`Search failed (HTTP ${res.status}).`);
      setResult((await res.json()) as SearchResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed.');
    } finally {
      setLoading(false);
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
          </p>
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
    </div>
  );
}
