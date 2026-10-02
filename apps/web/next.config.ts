import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Image Docker légère : serveur Node autonome (voir deploy/web/Dockerfile)
  output: 'standalone',
  // Monorepo : trace les dépendances depuis la racine du dépôt
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // Design system en React Native, rendu sur le web par react-native-web
  transpilePackages: ['@kwatro/design-system', 'react-native-web'],
  turbopack: {
    resolveAlias: { 'react-native': 'react-native-web' },
    resolveExtensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
  },
}

export default nextConfig
