/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  server: "./server.ts",
  serverBuildTarget: "netlify",
  serverBuildPath: "netlify/functions/server.js",
  serverMainFields: ["module", "main"],
  serverModuleFormat: "cjs",
  serverPlatform: "node",
  serverMinify: false,
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
}; 