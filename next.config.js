/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: { unoptimized: true },
  productionBrowserSourceMaps: false,
  webpack: (config, { dev }) => {
    if (!dev) {
      console.log('--- Disabling webpack cache for production build ---');
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
