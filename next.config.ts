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
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.gptwatchcollector.com" }],
        destination: "https://gptwatchcollector.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
