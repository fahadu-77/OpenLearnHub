import { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProtectedRoutes } from './components/ProtectedRoutes';

function App() {
  useEffect(() => {

    // Listen for storage changes
    const handleStorageChange = (e) => {
      // Listen for storage changes
      const handleStorageChange = (e) => {
        if (e.key === 'token') {
          // Token changed, optional: reload or handle
        }
      };
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    // Remove the loading class after a delay to show the splash effect
    const timer = setTimeout(() => {
      document.body.classList.remove('app-loading');
    }, 2000); // 2 seconds splash

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      <Navbar />
      <ProtectedRoutes />
    </div>
  );

}

export default App;