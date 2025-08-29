import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Layout from "../layouts/Layout";
import ScrollToTop from "../components/ScrollToTop";
import { useAuth } from "../utils/idb";
import { useEffect } from "react";
import Dashboard from "../pages/dashboard/Dashboard";
import Login from "../pages/Login";
import { SelectedUserProvider } from "../utils/SelectedUserContext";



export default function AppRouter() {
  return (
    <Router>
      <ScrollToTop />
       <SelectedUserProvider>
      <Routes>
        {/* Public Restaurant Routes (NO layout) */}
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Route>
        
      </Routes>
      </SelectedUserProvider>
    </Router>
  );
}
