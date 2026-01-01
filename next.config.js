/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  // Remove deprecated option warning
  // swcMinify is no longer needed in Next 16
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://hybridtradeai.com',
  },
};

module.exports = nextConfig;
