import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import "./UserManagement.css";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "user"));
        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleToggleLock = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "locked" : "active";
    try {
      const userDoc = doc(db, "user", id);
      await updateDoc(userDoc, { status: newStatus });
      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error("Error toggling account status:", error);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const userDoc = doc(db, "user", id);
      await updateDoc(userDoc, { role: newRole });
      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, role: newRole } : user
        )
      );
      alert("Vai trò đã được cập nhật!");
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Có lỗi xảy ra khi cập nhật vai trò.");
    }
  };

  if (loading) {
    return (
      <div className="user-management">Đang tải danh sách người dùng...</div>
    );
  }

  return (
    <div>
      <AdminHeader />
      <div className="user-management">
        <h2>Quản lý Người dùng</h2>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Tên người dùng</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email || "Không có email"}</td>
                <td>{user.fullname || "Không có tên"}</td>
                <td>{user.phone || "Không có số điện thoại"}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                    {/* <option value="moderator">Moderator</option> */}
                  </select>
                </td>
                <td>{user.status === "active" ? "Hoạt động" : "Đã khóa"}</td>
                <td>
                  <button
                    onClick={() => handleToggleLock(user.id, user.status)}
                    style={{
                      backgroundColor:
                        user.status === "active" ? "#ff4d4f" : "#52c41a",
                    }}
                  >
                    {user.status === "active" ? "Khóa" : "Mở khóa"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => navigate("/admin")}>Trở về</button>
      </div>
    </div>
  );
};

export default UserManagement;
