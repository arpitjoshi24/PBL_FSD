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
import ProjectDetails from "./pages/ProjectDetail";
import AddProject from "./pages/AddProjects";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

/* -------------------- Protected Route -------------------- */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return null; // prevents flicker

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/* -------- Client Only Route -------- */
const ClientRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector(
    (state) => state.auth
  );

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "client") {
    return <Navigate to="/" replace />;
  }

  return children;
};

/* -------------------- Layout -------------------- */
const Layout = () => {
  const location = useLocation();

  const hideLayoutRoutes = ["/login", "/signup"];
  const hideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <>
      {!hideLayout && <Navbar />}

      <div className={`${!hideLayout ? "pt-20" : ""} min-h-screen px-4`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Client Only */}
          <Route
            path="/add-project"
            element={
              <ClientRoute>
                <AddProject />
              </ClientRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {!hideLayout && <Footer />}
    </>
  );
};

/* -------------------- Main App -------------------- */
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