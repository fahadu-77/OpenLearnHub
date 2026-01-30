import { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProtectedRoutes } from './components/ProtectedRoutes';

function App() {
 useEffect(() => {
    console.log('🏁 APP MOUNTED - Token:', localStorage.getItem('token'));
    
    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        console.log('⚠️ TOKEN CHANGED:', {
          oldValue: e.oldValue,
          newValue: e.newValue,
          url: window.location.href
        });
      }
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