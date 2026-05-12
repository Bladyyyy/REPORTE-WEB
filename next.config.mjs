const isGithubPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isGithubPages ? "export" : undefined,
  basePath: isGithubPages ? "/REPORTE-WEB" : undefined,
  assetPrefix: isGithubPages ? "/REPORTE-WEB/" : undefined,
  trailingSlash: isGithubPages,
  images: {
    unoptimized: isGithubPages
  },
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
