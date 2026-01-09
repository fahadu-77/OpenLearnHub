import { Navbar } from './components/Navbar';
import { ProtectedRoutes } from './components/ProtectedRoutes';

function App() {

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      <Navbar />
      <ProtectedRoutes />
    </div>
  );
  
}

export default App;