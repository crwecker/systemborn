import type { Config, Context } from "@netlify/functions";

export const handler = async (request: Request, context: Context) => {
  try {
    // Dynamic import of React Router build and handler
    const { createRequestHandler } = await import("react-router");
    const buildModule = await import("../../build/server/index.js");
    
    // Use the module as the build, which should contain all the necessary exports
    const requestHandler = createRequestHandler(buildModule as any, process.env.NODE_ENV);
    
    return await requestHandler(request, {
      netlify: context,
    });
  } catch (error) {
    console.error("Netlify function error:", error);
    return new Response("Internal Server Error", {
      status: 500,
    });
  }
};

export const config: Config = {
  path: "/*",
  preferStatic: true,
}; 