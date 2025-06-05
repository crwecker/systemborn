import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BooksPage } from './pages/Books';
import { Header } from './components/Header';
import { Banner } from './components/Banner';

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
        <Header />
        <Banner />
        <main className="container mx-auto py-6">
          <BooksPage />
        </main>
      </div>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;
