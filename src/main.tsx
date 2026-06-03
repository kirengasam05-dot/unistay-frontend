import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './features/auth/context/AuthContext';
import { ConfirmProvider } from './shared/components/ui/ConfirmDialog';
import { ThemeProvider } from './shared/lib/themeContext';
import { queryClient } from './shared/lib/queryClient';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ConfirmProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: { borderRadius: '14px', fontWeight: 600 },
                  success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
                  error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
                }}
              />
            </ConfirmProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>
);
