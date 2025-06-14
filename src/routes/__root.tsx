import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Header } from '../components/Header'
import { AuthProvider } from '../contexts/AuthContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
})

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className='min-h-screen bg-dark-blue'>
          <Header />
          <Outlet />
        </div>
      </AuthProvider>
      {import.meta.env.DEV && (
        <>
          <ReactQueryDevtools />
          <TanStackRouterDevtools />
        </>
      )}
    </QueryClientProvider>
  ),
})
