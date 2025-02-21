import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};


module.exports = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
    // Disable specific rules
    config: {
      rules: {
        'react/no-unescaped-entities': 'off',
        '@next/next/no-page-custom-font': 'off',
      },
    },
  },
}

export default nextConfig;
