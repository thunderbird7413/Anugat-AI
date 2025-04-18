import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ContentManager from './pages/ContentManager';
import ChatInterface from './pages/ChatInterface';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import FolderManager from './pages/FolderManager';


function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />} />
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