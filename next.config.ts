import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Canonical-host redirect: any request arriving on the old vercel.app
  // host (or www) is 308-redirected to gptwatchcollector.com, path intact.
  // Keeps Google from indexing the same site under two hosts.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "watch-energy.vercel.app" }],
        destination: "https://gptwatchcollector.com/:path*",
        permanent: true,
      },
      // NOTE: no www→apex redirect here — the www↔apex relationship is owned
      // by the Vercel dashboard (primary-domain setting). Duplicating it in
      // code caused an infinite loop when the dashboard pointed the other way.
    ];
  },
};

export default nextConfig;
