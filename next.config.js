/** @type {import('next').NextConfig} */
const nextConfig = {
  exportPathMap: function () {
    return {
      '/': { page: '/index.html' }, 
    };
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      }
    ]
  },
  turbopack: {
    root: __dirname,
  }
}

module.exports = nextConfig