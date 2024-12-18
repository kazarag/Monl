import React, { useState, useEffect, useContext } from "react";
import { db } from "../../firebase/firebase";
import "./AdminDashboard.css";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [totalMovies, setTotalMovies] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [movies, setMovies] = useState([]);
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    // if (!user || user.role !== 'admin') {
    //   navigate('/');
    // }

    const fetchData = async () => {
      try {
        // Fetch movies collection
        const moviesSnapshot = await getDocs(collection(db, "movies"));
        const moviesList = moviesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMovies(moviesList);
        setTotalMovies(moviesSnapshot.docs.length); // Count the total movies

        // Fetch users collection
        const usersSnapshot = await getDocs(collection(db, "user"));
        setTotalUsers(usersSnapshot.docs.length); // Count the total users
      } catch (error) {
        console.error("Lỗi khi tải danh sách:", error);
      }
    };

    fetchData();
  }, [user, loading, navigate]); // Add user, loading, and navigate as dependencies
  const handleDeleteCollection = async (collectionName) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa toàn bộ bảng ${collectionName}? Hành động này không thể hoàn tác.`
    );

    if (!confirmed) return;

    try {
      const batch = writeBatch(db); // Khởi tạo batch
      const querySnapshot = await getDocs(collection(db, collectionName));

      querySnapshot.forEach((docItem) => {
        const docRef = doc(db, collectionName, docItem.id); // Tham chiếu đến tài liệu
        batch.delete(docRef); // Thêm thao tác xóa vào batch
      });

      await batch.commit(); // Gửi batch để thực thi
      alert(`Đã xóa toàn bộ bảng ${collectionName} thành công!`);
    } catch (error) {
      console.error(`Lỗi khi xóa bảng ${collectionName}:`, error);
      alert(`Có lỗi xảy ra khi xóa bảng ${collectionName}: ${error.message}`);
    }
  };

  return (
    <div className="admin-dashboard">
      <h1>Thống kê</h1>

      {/* Stats Section */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Tổng số phim</h3>
          <p>{totalMovies}</p>
        </div>
        <div className="stat-card">
          <h3>Tổng số người dùng</h3>
          <p>{totalUsers}</p>
        </div>
      </div>
      {/* <div className="admin-tools">
        <h1>Công cụ quản trị</h1>
        <button onClick={() => handleDeleteCollection("watchHistory")}>
          Xóa toàn bộ Watch History
        </button>
        <button onClick={() => handleDeleteCollection("users")}>
          Xóa toàn bộ dữ liệu Users
        </button>
        <button onClick={() => handleDeleteCollection("ratings")}>
          Xóa toàn bộ Ratings
        </button>
        <button onClick={() => handleDeleteCollection("movies")}>
          Xóa toàn bộ Movies
        </button>
        <button onClick={() => handleDeleteCollection("comments")}>
          Xóa toàn bộ Comments
        </button>
        <button onClick={() => handleDeleteCollection("categories")}>
          Xóa toàn bộ Categories
        </button>
      </div> */}

    </div>
  );
};

export default AdminDashboard;
