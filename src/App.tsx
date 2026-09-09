import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './app/providers';
import { AppRouter } from './app/router';
import { ErrorBoundary } from './components/common/error-boundary';

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProviders>
          <AppRouter />
        </AppProviders>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
