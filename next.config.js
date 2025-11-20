/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  reactStrictMode: true,
  // Remove deprecated option warning
  // swcMinify is no longer needed in Next 16
  images: {
    unoptimized: true,
  },
  turbopack: {
    // Pin the dev root to this project to avoid workspace misdetection
    root: path.resolve(__dirname),
  },
};

module.exports = nextConfig;
