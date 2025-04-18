import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChatInterface from './pages/ChatInterface';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import FolderManager from './pages/FolderManager';
import HomePage from './pages/HomePage';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/repository" element={<FolderManager />} />

            {/* Dynamic folder view */}
            <Route path="/repository/folder/:folderId" element={<FolderManager />} />
            <Route path="/chat" element={<ChatInterface />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;