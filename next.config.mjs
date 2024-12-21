/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp3)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[path][name][ext]'
      }
    })
    return config
  }
}

export default nextConfig
// next.config.mjs

