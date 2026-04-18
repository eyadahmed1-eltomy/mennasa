import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import PersistentLoginModal from './components/PersistentLoginModal';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Groups from './pages/Groups';
import Pages from './pages/Pages';
import Marketplace from './pages/Marketplace';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import PrivacyCenter from './pages/PrivacyCenter';
import Reels from './pages/Reels';
import Stories from './pages/Stories';
import PhotoViewer from './pages/PhotoViewer';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return (
    <>
      <PersistentLoginModal />
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="profile/:id?" element={<Profile />} />
          <Route path="messages" element={<Messages />} />
          <Route path="groups" element={<Groups />} />
          <Route path="pages" element={<Pages />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings/*" element={<Settings />} />
          <Route path="privacy" element={<PrivacyCenter />} />
          <Route path="reels" element={<Reels />} />
          <Route path="stories" element={<Stories />} />
          <Route path="photo/:id" element={<PhotoViewer />} />
        </Route>
      </Routes>
    </>
  );
}
