import { Routes, Route } from 'react-router-dom'
import LoginView from '@/pages/LoginView'
import HomeView from '@/pages/HomeView'
import RegisterView from '@/pages/RegisterView'
import MovieDetail from './pages/MovieDetail'
import ProtectedRoute from '@/routes/ProtectedRoute'
import GuestRoute from '@/routes/GuestRoute'
import AppSync from './utils/AppSync'

function App() {
  return (
    <>
      <AppSync />

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
        <Route path='/movie/:id' element={
          <ProtectedRoute>
            <MovieDetail />
          </ProtectedRoute>
        }
        />
      </Routes>
    </>
  )
}

export default App
