/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ['@taxiag/ui'],
  // Fully static: all data fetching happens in the browser (Nominatim + API).
  // No server functions -> nothing to crash, cheapest Netlify hosting.
  output: 'export',
  trailingSlash: true,
  // Low-memory build machine (4GB): single compile worker.
  experimental: { cpus: 1 },
};
