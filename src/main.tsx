import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './styles/index.css';

// Import route components
import { Route as rootRoute } from './routes/__root'
import { Route as indexRoute } from './routes/index'
import { Route as genreFamiliarityRoute } from './routes/genre-familiarity'
import { Route as signinRoute } from './routes/signin'
import { Route as signupRoute } from './routes/signup'
import { Route as verifyRoute } from './routes/verify'

// Create the route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  genreFamiliarityRoute,
  signinRoute,
  signupRoute,
  verifyRoute,
])

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
