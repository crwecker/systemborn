import type { Config } from "@react-router/dev/config";

export default {
  // App directory (like Remix)
  appDirectory: "app",
  
  // Server build configuration
  serverBuildFile: "index.js",
  
  // Ignore patterns for route files
  ignoredRouteFiles: ["**/.*"],
  
  // Routes configuration
  routes: "app/routes.ts",
  
  // Future flags for compatibility
  future: {
    // Enable any future flags here as needed
  }
} satisfies Config; 