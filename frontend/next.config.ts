import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};
/** @type {import('next').NextConfig} */
const repo = "estudio-contable";
const isProd = process.env.NODE_ENV === "production";

module.exports = {
  trailingSlash: true,

  // GitHub Pages publica bajo /estudio-contable/
  basePath: isProd ? `/${repo}` : "",
  assetPrefix: isProd ? `/${repo}/` : "",

  // Pages no soporta el optimizer de next/image
  images: { unoptimized: true },
};
export default nextConfig;
