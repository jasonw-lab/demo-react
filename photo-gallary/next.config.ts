import type { NextConfig } from "next";

const MINIO_PORT = process.env.MINIO_PORT || '9000';

const nextConfig: NextConfig = {
  /* config options here */
  basePath: '/photo-gallary',
  output: 'standalone',
  images: {
    remotePatterns: [
      // ローカル開発用
      {
        protocol: 'http',
        hostname: 'localhost',
        port: MINIO_PORT,
        pathname: '/photos/**',
      },
      // Docker環境用
      {
        protocol: 'http',
        hostname: 'host.docker.internal',
        port: MINIO_PORT,
        pathname: '/photos/**',
      },
      // Docker Compose環境用
      {
        protocol: 'http',
        hostname: 'minio',
        port: MINIO_PORT,
        pathname: '/photos/**',
      },
    ],
    // Set to false to enable Next.js image optimization
    unoptimized: false,
  },
};

export default nextConfig;
