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
  }
  
}

module.exports = nextConfig
