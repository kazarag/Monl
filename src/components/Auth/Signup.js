import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth"; // Import hàm kiểm tra email
import "./Signup.css"; // Add CSS for better styling

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.match(/.+@.+/)) {
      setError("Email không đúng định dạng!");
      
    } else if (fullname === "") alert("Full Name không được bỏ trống!");
    else if (password.length < 6) {
      setError("Password không được ít hơn 6 ký tự!");
      
    } else if (password !== confirmPassword) {
      setError("Mật khẩu không khớp!");
      return;
    }

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        setError("Email đã được sử dụng! Vui lòng sử dụng email khác.");
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Thêm thông tin người dùng vào Firestore
      await setDoc(doc(db, "user", user.uid), {
        email,
        fullname,
        phone,
        role: "user",
      });

      navigate("/");
    } catch (error) {
      console.error("Lỗi đăng ký người dùng:", error);
      setError("Đã có lỗi xảy ra khi đăng ký!");
    }
  };

  return (
    <div className="signup-container">
      <h2>Đăng ký tài khoản</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Họ tên"
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <button type="submit">Đăng ký</button>
      </form>
      <p>
        Đã có tài khoản? <a href="/login">Đăng nhập</a>
      </p>
    </div>
  );
};

export default Signup;
