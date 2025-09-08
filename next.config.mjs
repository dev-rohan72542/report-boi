/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable static export for Capacitor
  output: 'export',
  trailingSlash: true,
  devIndicators: {
    allowedDevOrigins: ["http://192.168.0.116:3000"],
  },
}

export default nextConfig
