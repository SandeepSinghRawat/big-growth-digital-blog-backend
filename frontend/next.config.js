const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudfront.net'
      },
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com'
      }
    ]
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
  }
};

export default nextConfig;
