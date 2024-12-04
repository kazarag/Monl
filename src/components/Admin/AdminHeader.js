import React,{useContext} from "react";
import "./AdminHeader.css"; 
import avatar from "../../assets/admin_logo.png";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/authService";
import { AuthContext } from "../../contexts/AuthContext";

const AdminHeader = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext); // Assuming role is now in user object
  
  const handleLogout = async () => {
    try {
      logout(); 
      alert("Đã đăng xuất thành công!");
      navigate("/login"); 
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      alert("Đăng xuất thất bại. Vui lòng thử lại!");
    }
  };
  return (
    <div className="admin-header">
      <div className="admin-logo">
        <h1>Monl Admin</h1>
      </div>
      <div className="admin-nav">
        <ul>
          <li>
            <a href="/admin">Trang chủ</a>
          </li>
          <li>
            <a href="/admin/category">Quản lý thể loại</a>
          </li>
          <li>
            <a href="/admin/movies">Quản lý Phim</a>
          </li>
          <li>
            <a href="/admin/users">Quản lý Người dùng</a>
          </li>
          {/* <li>
            <a href="/admin/stats">Thống kê</a>
          </li> */}
        </ul>
      </div>
      <div className="admin-actions">
        <div className="admin-profile">
          <img src={avatar} alt="Admin Avatar" className="admin-avatar" />
          <span>Admin</span>
        </div>
        <button className="logout-button" onClick={handleLogout}>Đăng xuất</button>
      </div>
    </div>
  );
};

export default AdminHeader;
