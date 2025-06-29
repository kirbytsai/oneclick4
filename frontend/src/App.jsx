// src/App.jsx - 更新版本
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './domains/auth/contexts/AuthContext';
import { router } from './router/Router';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;