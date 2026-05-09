import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
// ADD LOGOUT TO THE IMPORT
import { loadUser, logout } from "./features/authSlice"; 

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LogoutButton from "./components/LogoutButton"; 

import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Freelancers from "./pages/Freelancers";
import ProjectDetails from "./pages/ProjectDetail";
import AddProject from "./pages/AddProjects";
import Profile from "./pages/Profile"; 
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Explore from "./pages/Explore";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";

/* -------------------- Route Protectors -------------------- */

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  if (loading) return null; 
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  return children;
};

const ClientRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  if (loading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role !== "client") return <Navigate to="/" replace />;
  return children;
};

// Smart Dashboard Router: Checks role and serves the correct dashboard
const DashboardRouter = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  // Wait for the authSlice to finish fetching the user
  if (loading) return null;

  // Make it case-insensitive to prevent strict-match crashes
  const userRole = user?.role?.toLowerCase();

  if (userRole === "client") return <ClientDashboard />;
  if (userRole === "freelancer") return <FreelancerDashboard />;

  // 🛡️ THE LOOP BREAKER: Do NOT redirect to "/" here. 
  // If we don't know their role, send them to Profile to fix it.
  if (user && !userRole) {
    return <Navigate to="/profile" replace />;
  }

  // If no user object exists but they are authenticated, token is dead.
  if (!user && isAuthenticated) return <Navigate to="/login" replace />;
  
  return <Navigate to="/login" replace />;
};

/* -------------------- Main Layout -------------------- */

const Layout = () => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const hideLayoutRoutes = ["/login", "/signup"];
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Navbar />}

      <div className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/freelancers" element={<Freelancers />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          
          <Route path="/profile/:id" element={<Profile />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />

          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
          
          {/* Client Specific Routes */}
          <Route path="/add-project" element={<ClientRoute><AddProject /></ClientRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {isAuthenticated && !hideLayout && <LogoutButton />}
      {!hideLayout && <Footer />}
    </>
  );
};

/* -------------------- App Initialization -------------------- */

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;