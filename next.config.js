/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: { unoptimized: true },
  productionBrowserSourceMaps: false,
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      console.log('--- Disabling webpack disk cache for production build ---');
      // Completely disable webpack cache
      config.cache = false;
      // Ensure source maps are completely disabled
      config.devtool = false;
      
      // Optimization to reduce bundle size
      if (!isServer) {
        config.optimization.splitChunks.maxSize = 200000; // 200KB
      }
    }
    return config;
  },
};

module.exports = nextConfig;
