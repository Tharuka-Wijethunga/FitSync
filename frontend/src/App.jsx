import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import CoachLoginPage from './pages/CoachLoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import UserDashboardPage from './pages/UserDashboardPage.jsx';
import CoachDashboardPage from './pages/CoachDashboardPage.jsx';
import ViewPlanPage from './pages/ViewPlanPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CoachProtectedRoute from './components/CoachProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

function App() {
  return (
    <Routes>
      {/* Public Routes - these do not use the main Layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/coach-login" element={<CoachLoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected User Routes - these are wrapped in the Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/plan/:planId" element={<ViewPlanPage />} />
          <Route path="/profile" element={<ProfilePage/>} />
        </Route>
      </Route>

      {/* Protected Coach Routes - also wrapped in the Layout */}
      <Route element={<CoachProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/coach-dashboard" element={<CoachDashboardPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;