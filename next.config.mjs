/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Proxy public funnel calls to the GMF CRM ("one brain, many funnels"):
  //   /api/gmf/public/track          → https://gmfautotransport.com/api/public/track
  //   /api/gmf/public/price-estimate → https://gmfautotransport.com/api/public/price-estimate
  //   /api/gmf/public/sms-capture    → https://gmfautotransport.com/api/public/sms-capture
  //   /api/gmf/crm/leads             → https://gmfautotransport.com/api/crm/leads
  // The browser sees same-origin requests (no CORS), the server-side rewrite forwards
  // to the canonical CRM endpoints. To swap CRM hosts later, change the destination here.
  async rewrites() {
    // www is the canonical host — bare gmfautotransport.com 307s to www, which
    // breaks browser POSTs (the redirect drops the body in many clients).
    return [
      {
        source: "/api/gmf/:path*",
        destination: "https://www.gmfautotransport.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
