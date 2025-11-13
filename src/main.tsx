import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { AlertProvider } from './contexts/AlertContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layout Logic
import { AutoLayout } from './components/AutoLayout/AutoLayout';

// Routes
import { AppRoutes } from './routes';

// Components
import { AlertContainer } from './components/ui/alert/AlertContainer';

// CSS
import './styles/globals.css';
import './styles/animations.css';
import './styles/satoshi.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}

// Apply macOS Liquid Glass interface classes
document.body.classList.add('macos-liquid-glass');
document.documentElement.classList.add('macos-system');

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <div className="app-container macos-liquid-glass">
          <AuthProvider>
            <SidebarProvider>
              <AlertProvider>
                <NotificationProvider>
                  <AutoLayout>
                    <AppRoutes />
                  </AutoLayout>
                  <AlertContainer />
                </NotificationProvider>
              </AlertProvider>
            </SidebarProvider>
          </AuthProvider>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
