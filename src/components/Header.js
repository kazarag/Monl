import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import avatar from "../assets/user_logo.png"; // Placeholder avatar
import "../styles/Header.css";
import { logout } from "../services/authService";

const Header = () => {
  const { user, setUser } = useContext(AuthContext); // Assuming role is now in user object
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "enabled") {
      setDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.body.classList.toggle("dark-mode", newMode);
    localStorage.setItem("darkMode", newMode ? "enabled" : "disabled");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-container">
          <h1 className="logo">Monl</h1>
        </div>

        <nav className="header-nav">
          <Link to="/">Trang chủ</Link>

          {/* <Link to="/movies?type=full">Phim lẻ</Link>
          <Link to="/movies?type=series">Phim bộ</Link> */}

          {user ? (
            <div className="profile-container">
              <img className="profile-avatar" src={avatar} alt="User Avatar" />
              <span className="profile-username">
                {user.displayName || user.fullname || "User"}
              </span>
              <div className="profile-dropdown">
                <Link to="/profile">Hồ sơ</Link>
                <Link to="/favorites">Yêu thích</Link>
                <Link to="/history">Lịch sử</Link>
                <a onClick={handleLogout} className="logout-btn">
                  Đăng xuất
                </a>
              </div>
            </div>
          ) : (
            <Link to="/login" state={{ from: location }}>
              Đăng nhập
            </Link>
          )}

          {/* Toggle Button for Light/Dark Mode */}
          <div className="toggle" onClick={toggleDarkMode}>
            <i
              className={`fas ${darkMode ? "fa-sun" : "fa-moon"} toggle-icon`}
            ></i>
            <div className={`toggle-ball ${darkMode ? "dark" : ""}`}></div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
