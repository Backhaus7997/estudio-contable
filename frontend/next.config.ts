import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};
/** @type {import('next').NextConfig} */
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  output: 'export',
  trailingSlash: true,
  basePath: isProd ? `/${repo}` : '',
  assetPrefix: isProd ? `/${repo}/` : '',
  images: { unoptimized: true },
};
export default nextConfig;
