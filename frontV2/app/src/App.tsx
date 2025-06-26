import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import CreateOrganization from './pages/CreateOrganization';
import HomeOrganization from './pages/HomeOrganization';
import CreatePrestataire from './pages/CreatePrestataire';
import HomePrestataire from './pages/HomePrestataire';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import PrestataireProjectDetail from './pages/PrestataireProjectDetail';
import './App.css';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              {user?.role === 'USER' ? (
                <Navigate to="/onboarding" replace />
              ) : user?.role === 'ORG' ? (
                <HomeOrganization />
              ) : user?.role === 'PRESTA' ? (
                <HomePrestataire />
              ) : (
                <Home />
              )}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              {user?.role === 'ORG' ? <Projects /> : <Navigate to="/" replace />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/project/:id" 
          element={
            <ProtectedRoute>
              {user?.role === 'ORG' ? <ProjectDetail /> : <Navigate to="/" replace />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/prestataire/project/:id" 
          element={
            <ProtectedRoute>
              {user?.role === 'PRESTA' ? <PrestataireProjectDetail /> : <Navigate to="/" replace />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute>
              {user?.role === 'USER' ? <Onboarding /> : <Navigate to="/" replace />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-organization" 
          element={
            <ProtectedRoute>
              {user?.role === 'USER' ? <CreateOrganization /> : <Navigate to="/" replace />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-prestataire" 
          element={
            <ProtectedRoute>
              {user?.role === 'USER' ? <CreatePrestataire /> : <Navigate to="/" replace />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={user ? <Navigate to="/" replace /> : <Register />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
