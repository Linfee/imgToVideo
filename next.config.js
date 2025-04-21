/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  typescript: {
    // 完全禁用TypeScript检查
    ignoreBuildErrors: true,
  },
  eslint: {
    // 完全禁用ESLint检查
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
