import type { Config, Context } from "@netlify/functions";

export default async (request: Request, context: Context) => {
  try {
    // Dynamic import of React Router build and handler
    const { createRequestHandler } = await import("react-router");
    const build = await import("../../build/server/index.js");
    
    const requestHandler = createRequestHandler(build, process.env.NODE_ENV);
    
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