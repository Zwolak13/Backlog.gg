import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tse1.mm.bing.net",
      },
      {
        protocol: "https",
        hostname: "tse2.mm.bing.net",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "konsolowe.info",
      },
      {
        protocol: "https",
        hostname: "image.api.playstation.com",
      },
      {
        protocol: "https",
        hostname: "media.rawg.io",
      },
      {
        protocol: "https",
        hostname: "cdn.cloudflare.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "cdn.akamai.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "shared.akamai.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "*.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "images.igdb.com",
      },
      {
        protocol: "https",
        hostname: "store-images.s-microsoft.com",
      },
    ],
  },
};

export default nextConfig;
