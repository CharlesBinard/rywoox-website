import { RouterProvider } from '@tanstack/react-router';
import { Header } from '@/components/Header';
import { router } from '@/router';

function App() {
  return (
    <div className="min-h-screen bg-dark-bg text-white">
      <Header />
      <RouterProvider router={router} />
      <footer className="py-8 text-center text-gray-600 text-sm font-mono">
        <p>6 mini jeux · React + Canvas · Rywoox</p>
      </footer>
    </div>
  );
}

export default App;
