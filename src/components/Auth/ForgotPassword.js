import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { Link } from "react-router-dom";
import "./Login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Liên kết đặt lại mật khẩu đã được gửi đến email của bạn!");
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng kiểm tra email và thử lại.");
    }
  };

  return (
    <div className="login-container">
      <h2>Quên mật khẩu</h2>
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}
      <form onSubmit={handlePasswordReset}>
        <input
          type="email"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Gửi liên kết đặt lại mật khẩu</button>
      </form>
      <p>
        Nhớ mật khẩu? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
