import path from 'node:path'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Image Docker légère : serveur Node autonome (voir apps/web/Dockerfile)
  output: 'standalone',
  // Monorepo : trace les dépendances depuis la racine du dépôt
  outputFileTracingRoot: path.join(__dirname, '../../'),
}

export default nextConfig
