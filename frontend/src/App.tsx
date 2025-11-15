import { Routes, Route } from 'react-router-dom'
import LoginView from '@/pages/LoginView'
import HomeView from '@/pages/HomeView'
import RegisterView from '@/pages/RegisterView'
import ProtectedRoute from '@/routes/ProtectedRoute'
import GuestRoute from '@/routes/GuestRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <ProtectedRoute>
          <HomeView />
        </ProtectedRoute>
      } />
      <Route path="/login" element={
        <GuestRoute>
          <LoginView />
        </GuestRoute>
      } />
      <Route path="/register" element={
        <GuestRoute>
          <RegisterView />
        </GuestRoute>
      } />
    </Routes>
  )
}

export default App
