import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import { BookList } from './components/BookList';

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
      <ThemeProvider theme={theme}>
        <div className="min-h-screen bg-[#04070e]">
          <header className="py-6 px-4 bg-[#3c4464]">
            <h1 className="text-3xl font-bold text-[#aa8c65]">LitRPG Academy</h1>
          </header>
          <main>
            <BookList />
          </main>
        </div>
      </ThemeProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;
