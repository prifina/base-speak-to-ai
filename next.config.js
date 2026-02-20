const withPlugins = require("next-compose-plugins");
const { withPlausibleProxy } = require("next-plausible");
const withBundleAnalyzer = require("@next/bundle-analyzer");

const plausiblePlugin = withPlausibleProxy;
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  productionBrowserSourceMaps: true,
  transpilePackages: ["@prifina-dev/auth-components"],
  webpack: (config, { isServer, dev }) => {
    if (dev) {
      config.cache = {
        type: "filesystem",
        compression: "gzip",
        maxAge: 1000 * 60 * 60 * 24 * 7,
      };
    }
    config.infrastructureLogging = {
      level: "error",
    };
    config.resolve.symlinks = false;
    config.module.rules.push({
      test: /\.svg$/,
      type: "asset/resource",
    });
    return config;
  },

  // async redirects() {
  //   return [
  //     {
  //       source: "/:slug",
  //       destination: "/:slug/home",
  //       permanent: true,
  //     },
  //     {
  //       source: "/account",
  //       destination: "/account/billing",
  //       permanent: true,
  //     },
  //     // {
  //     //   source: "/signup",
  //     //   destination: "/signup",
  //     //   permanent: true,
  //     // },
  //     // {
  //     //   source: "/:slug((?!signin|signup|home$)[^/]+)", // Match any single-segment path except /signin, /signup, or paths already ending with /home
  //     //   destination: "/:slug/home", // Redirect to /slug/home
  //     //   permanent: true, // Set to true if it's a permanent redirect (308 status code)
  //     // },
  //     // {
  //     //   source: "/preview/:slug((?!signin|signup|home$)[^/]+)", // Match any single-segment path except /signin, /signup, or paths already ending with /home
  //     //   destination: "/:slug/home", // Redirect to /slug/home
  //     //   permanent: true, // Set to true if it's a permanent redirect (308 status code)
  //     // },
  //   ];
  // },
  // async redirects() {
  //   return [
  //     {
  //       source: "/:site/home", // Match the route /[site]/home
  //       destination: "/main/:site/home", // Redirect to /main/[site]/home
  //       permanent: true, // Set to true for a permanent redirect (HTTP 301)
  //     },
  //     {
  //       source: "/:site/insights", // Match the route /[site]/home
  //       destination: "/main/:site/insights", // Redirect to /main/[site]/home
  //       permanent: true, // Set to true for a permanent redirect (HTTP 301)
  //     },
  //     {
  //       source: "/:site/knowledge", // Match the route /[site]/home
  //       destination: "/main/:site/knowledge", // Redirect to /main/[site]/home
  //       permanent: true, // Set to true for a permanent redirect (HTTP 301)
  //     },
  //     {
  //       source: "/:site/login", // Match the route /[site]/home
  //       destination: "/main/:site/login", // Redirect to /main/[site]/home
  //       permanent: true, // Set to true for a permanent redirect (HTTP 301)
  //     },
  //     {
  //       source: "/:site/personalize", // Match the route /[site]/home
  //       destination: "/main/:site/personalize", // Redirect to /main/[site]/home
  //       permanent: true, // Set to true for a permanent redirect (HTTP 301)
  //     },
  //     {
  //       source: "/:site/signup", // Match the route /[site]/home
  //       destination: "/main/:site/signup", // Redirect to /main/[site]/home
  //       permanent: true, // Set to true for a permanent redirect (HTTP 301)
  //     },
  //     // {
  //     //   source: "/signup",
  //     //   destination: "/signup",
  //     //   permanent: true,
  //     // },
  //     // {
  //     //   source: "/:slug((?!signin|signup|home$)[^/]+)", // Match any single-segment path except /signin, /signup, or paths already ending with /home
  //     //   destination: "/:slug/home", // Redirect to /slug/home
  //     //   permanent: true, // Set to true if it's a permanent redirect (308 status code)
  //     // },
  //     // {
  //     //   source: "/preview/:slug((?!signin|signup|home$)[^/]+)", // Match any single-segment path except /signin, /signup, or paths already ending with /home
  //     //   destination: "/:slug/home", // Redirect to /slug/home
  //     //   permanent: true, // Set to true if it's a permanent redirect (308 status code)
  //     // },
  //   ];
  // },
  reactStrictMode: false,
  // experimental: {
  //   appDir: true,
  // },
  images: {
    unoptimized: true,
  },
  env: {
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
    COGNITO_IDENTITY_POOL_ID: process.env.COGNITO_IDENTITY_POOL_ID,
    GRAPHQL_API: process.env.GRAPHQL_API,
    MY_REGION: process.env.MY_REGION,
    SPEAK_TO_CDN: process.env.SPEAK_TO_CDN,
  },

  // async headers() {
  //   //value: process.env.NODE_ENV === 'development' ?
  //   //default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' wss://pfq5y76gf8.execute-api.us-east-1.amazonaws.com/Prod https://prifina-ai-source-docs.s3.us-east-1.amazonaws.com http://localhost:3330/api/v1/;
  //   //default-src 'self'; script-src 'self' 'unsafe-inline';               img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' wss://pfq5y76gf8.execute-api.us-east-1.amazonaws.com/Prod https://prifina-ai-source-docs.s3.us-east-1.amazonaws.com http://localhost:3330/api/v1/; report-uri http://localhost:3000/report-violation;
  //   //`default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' ${process.env.WEB_SOCKET_URL} https://${process.env.AI_BUCKET}.s3.${process.env.MY_REGION}.amazonaws.com ${process.env.MIDDLEWARE_API_URL}; report-uri http://localhost:3000/report-violation;`;

  //   const csp =
  //     process.env.SET_CORS === "dev"
  //       ? // For development, include 'unsafe-eval', WebSocket server URL, and the S3 domain
  //         `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' ${process.env.WEB_SOCKET_URL} https://${process.env.AI_BUCKET}.s3.${process.env.MY_REGION}.amazonaws.com ${process.env.MIDDLEWARE_API_URL};`
  //       : // For production, include WebSocket server URL and the S3 domain without 'unsafe-eval'
  //         //`default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' ${process.env.WEB_SOCKET_URL} https://${process.env.AI_BUCKET}.s3.${process.env.MY_REGION}.amazonaws.com ${process.env.MIDDLEWARE_API_URL};`,
  //         `default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' ${process.env.WEB_SOCKET_URL} https://${process.env.AI_BUCKET}.s3.${process.env.MY_REGION}.amazonaws.com ${process.env.MIDDLEWARE_API_URL};`;

  //   console.log("CSP", csp);
  //   return [
  //     {
  //       source: "/:path*",
  //       headers: [
  //         {
  //           key: "Content-Security-Policy",
  //           value: csp,
  //         },
  //       ],
  //     },
  //   ];
  // },
  // experimental: {
  //   serverComponentsExternalPackages: ["pdf2json"],
  // },
};
module.exports = withPlugins([plausiblePlugin, bundleAnalyzer], nextConfig);
