/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  ignoredRouteFiles: ["**/.*"],
  server: "./server.ts",
  serverBuildPath: "netlify/functions/server.js",
  serverMainFields: ["module", "main"],
  serverModuleFormat: "cjs",
  serverPlatform: "node",
  serverMinify: false,
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
}; 