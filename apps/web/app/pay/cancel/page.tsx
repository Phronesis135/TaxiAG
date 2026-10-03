export default function PayCancel() {
  return (
    <div className="page">
      <h1>TaxiAG</h1>
      <p className="tagline">PayPal sandbox return</p>
      <div className="card">
        <h2>Payment cancelled</h2>
        <p className="meta">
          You cancelled on PayPal — nothing was charged. Your booking is still
          held; you can pay later from the booking panel.
        </p>
        <p className="meta" style={{ marginTop: 16 }}>
          <a href="/" style={{ color: 'inherit' }}>Back to search</a>
        </p>
      </div>
    </div>
  );
}
