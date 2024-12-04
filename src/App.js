import React,{ useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";  
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import WatchPage from "./pages/WatchPage";
import ProfilePage from "./pages/ProfilePage";
import HistoryPage from "./pages/HistoryPage";
import FavoritesPage from "./pages/FavoritesPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFoundPage from "./pages/NotFoundPage";
import "./App.css";
import MovieManagement from "./components/Admin/MovieManagement";
import UserManagement from "./components/Admin/UserManagement";
import CategoryManagement from "./components/Admin/CategoryManagement";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

function App() {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return <div>Đang tải...</div>; 
  }
  return (

      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} /> 
          <Route path="/history" element={user ? <HistoryPage /> : <Navigate to="/login" />} />
          <Route path="/favorites" element={user ? <FavoritesPage /> : <Navigate to="/login" />} />
          <Route path="/movies/:movieId" element={<MovieDetailPage />} />
          <Route path="/movies/:movieId/watch" element={<WatchPage />} />
          <Route path="/admin" element={user ? <AdminPage /> : <Navigate to="/login" />} />
          <Route path="/admin/movies" element={<MovieManagement />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/category" element={<CategoryManagement/>}/>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>

  );
}

export default App;
