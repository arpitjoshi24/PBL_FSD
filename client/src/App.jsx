import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { loadUser } from "./features/authSlice";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Freelancers from "./pages/Freelancers";
import ProjectDetails from "./pages/ProjectDetail";
import FreelancerDetails from "./pages/FreelancerDetail";
import AddProject from "./pages/AddProjects";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Explore from "./pages/Explore";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";

// Protected Route: Requires login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Client Only Route: Requires login AND client role
const ClientRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "client") return <Navigate to="/" replace />;
  return children;
};

const Layout = () => {
  const location = useLocation();

  const hideLayoutRoutes = ["/login", "/signup"];
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Navbar />}

      <div className={`${!hideLayout ? "" : ""} min-h-screen`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/freelancers" element={<Freelancers />} />
          {/* Path updated to match Dashboard links */}
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/profile/:id" element={<FreelancerDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/explore" element={<Explore />} />

          {/* Protected Routes (Any Role) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Client Specific Routes */}
          <Route
            path="/add-project"
            element={
              <ClientRoute>
                <AddProject />
              </ClientRoute>
            }
          />

          <Route
            path="/client-dashboard"
            element={
              <ClientRoute>
                <ClientDashboard />
              </ClientRoute>
            }
          />

          <Route path="/freelancer-dashboard" element={<ProtectedRoute><FreelancerDashboard /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!hideLayout && <Footer />}
    </>
  );
};

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