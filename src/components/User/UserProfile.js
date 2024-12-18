import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase/firebase"; // Import firebase auth và firestore
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import "./UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null); // Thông tin người dùng
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;

      if (currentUser) {
        setUser(currentUser); // Lưu thông tin người dùng từ Firebase Auth
        setEmail(currentUser.email);

        // Fetch dữ liệu từ Firestore
        const userDocRef = doc(db, "user", currentUser.uid); // Tìm kiếm document theo UID
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFullname(userData.fullname);
          setPhone(userData.phone);
        }
      }
    };
    fetchUserData();
  }, []);


  const handleUpdateProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Không tìm thấy người dùng.");

      // Cập nhật email
      if (email !== currentUser.email) {
        await updateEmail(currentUser, email);
      }

      // Cập nhật profile trong Auth
      await updateProfile(currentUser, {
        displayName: fullname,
      });

      // Cập nhật thông tin vào Firestore
      const userDocRef = doc(db, "user", currentUser.uid);
      await updateDoc(userDocRef, {
        fullname,
        phone,
      });

      setSuccessMessage("Thông tin cá nhân đã được cập nhật thành công!");
    } catch (error) {
      setError(`Có lỗi xảy ra: ${error.message}`);
    }
  };

  // Đổi mật khẩu
  const handleChangePassword = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("Không tìm thấy người dùng.");
      if(newPassword===confirmPassword){
        await updatePassword(currentUser, newPassword);
      setSuccessMessage("Mật khẩu đã được cập nhật thành công!");
      }
      else setSuccessMessage("Mật khẩu mới không trùng khớp với xác nhận mật khẩu mới.!");
    } catch (error) {
      setError(`Có lỗi xảy ra: ${error.message}`);
    }
  };

  return (
    <div className="container">
      <div className="user-profile">
        <h2>Thông tin người dùng</h2>

        {error && <p className="error">{error}</p>}
        {successMessage && <p className="success">{successMessage}</p>}

        {user ? (
          <div className="profile-form">
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Họ và tên:</label>
              <input
                type="text"
                placeholder="Họ và tên"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại:</label>
              <input
                type="text"
                placeholder="Số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button onClick={handleUpdateProfile}>Cập nhật thông tin</button>

            <div className="password-section">
              <h3>Đổi mật khẩu</h3>
              <div className="form-group">
                <label>Mật khẩu mới:</label>
                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <label>Xác nhận mật khẩu mới:</label>
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button onClick={handleChangePassword}>Cập nhật mật khẩu</button>
            </div>
          </div>
        ) : (
          <p>Đang tải thông tin...</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
