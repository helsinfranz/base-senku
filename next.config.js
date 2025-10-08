const withPWA = require('next-pwa')({
  dest: 'public',
  mode: "production",
  disable: process.env.NEXTAUTH_URL === "http://localhost:3000",
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  // next.js config
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.dcodeblock.com',
      },
    ],
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
})

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   eslint: {
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'www.dcodeblock.com',
//       },
//     ],
//   },
//   webpack: (config) => {
//     config.externals.push("pino-pretty", "lokijs", "encoding");
//     return config;
//   },
// }

// export default nextConfig

// /** @type {import('next').NextConfig} */
// import nextPWA from "next-pwa";

// const nextConfig = {
//   reactStrictMode: true,
// };

// const withPWA = nextPWA({
//   dest: "public",
//   mode: "production",
//   disable: process.env.NEXTAUTH_URL === "http://localhost:3000",
//   register: true,
//   skipWaiting: true,
//   buildExcludes: [/dynamic-css-manifest\.json$/]
// })(nextConfig);

// export default withPWA;