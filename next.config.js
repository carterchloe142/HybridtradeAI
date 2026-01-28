/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: { unoptimized: true },
  productionBrowserSourceMaps: false,
  webpack: (config, { dev }) => {
    if (!dev) {
      console.log('--- Disabling webpack disk cache for production build ---');
      // Use memory cache to avoid writing large .pack files to disk
      config.cache = { type: 'memory' };
      // Ensure source maps are completely disabled
      config.devtool = false;
    }
    return config;
  },
};

module.exports = nextConfig;
