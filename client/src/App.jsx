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
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      <Navbar />
      <ProtectedRoutes />
    </div>
  );

}

export default App;