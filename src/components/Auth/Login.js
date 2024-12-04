import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { AuthContext } from "../../contexts/AuthContext";
import { auth, db } from "../../firebase/firebase"; // Ensure you have configured Firebase properly
import { signInWithEmailAndPassword } from "firebase/auth"; // Import the function correctly
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import "./Login.css"; // Add a custom CSS file for styling
import { logout } from "../../services/authService";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); 
  const [error, setError] = useState(null);
  // const { user, loading } = useContext(AuthContext);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Reset error state
    try {
      // Đăng nhập người dùng bằng Firebase Auth (v9)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Fetch user role and status from Firestore
      const userDoc = await getDoc(doc(db, "user", user.uid));
      const { role, status } = userDoc.data();

      // Kiểm tra trạng thái tài khoản
      if (status === "locked") {
        alert("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.");
        logout();
        return;
      }

      // Update user context
      setUser({
        uid: user.uid,
        email: user.email,
        role,
        status,
      });


      const from = location.state?.from?.pathname;
      // alert(from);
      if (role == "admin" && from == null) {
        navigate("/admin");
      } else {
        if (from == null) {
          navigate("/");
        } else {
          navigate(from);
        }
        
        
      }
      window.location.reload();
    } catch (error) {
      setError("Sai email hoặc mật khẩu. Vui lòng thử lại. " + error.message);
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="login-container">
      <h2>Đăng nhập</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field"
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-field"
        />
        <button type="submit" className="login-button">
          Đăng nhập
        </button>
      </form>
      <div className="login-links">
        <Link to="/forgot-password" className="forgot-password">
          Quên mật khẩu?
        </Link>
        <span>Chưa có tài khoản?</span>
        <Link to="/signup" className="signup-link">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
};

export default Login;
