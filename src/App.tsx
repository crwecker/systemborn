import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BooksPage } from './pages/Books';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-dark-blue">
        <header className="py-6 px-4 bg-slate">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold text-copper">LitRPG Academy</h1>
          </div>
        </header>
        <main className="container mx-auto py-6">
          <BooksPage />
        </main>
      </div>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;
