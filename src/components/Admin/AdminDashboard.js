import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../firebase/firebase';
import './AdminDashboard.css';
import { collection, getDocs } from 'firebase/firestore';
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from 'react-router-dom'; 

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
        const moviesSnapshot = await getDocs(collection(db, 'movies'));
        const moviesList = moviesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMovies(moviesList);
        setTotalMovies(moviesSnapshot.docs.length); // Count the total movies

        // Fetch users collection
        const usersSnapshot = await getDocs(collection(db, 'user'));
        setTotalUsers(usersSnapshot.docs.length); // Count the total users
      } catch (error) {
        console.error('Lỗi khi tải danh sách:', error);
      }
    };

    fetchData();
  }, [user, loading, navigate]); // Add user, loading, and navigate as dependencies

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

      {/* Actions Section */}
      {/* <div className="dashboard-actions">
        <h2>Quản lý</h2>
        <ul className="admin-links">
          <li><a href="/admin/movies">Quản lý Phim</a></li>
          <li><a href="/admin/users">Quản lý Người dùng</a></li>
        </ul>
      </div> */}

      {/* Movies Table
      <div className="movies-table">
        <h2>Danh sách phim</h2>
        <table>
          <thead>
            <tr>
              <th>Tên phim</th>
              <th>Thể loại</th>
              <th>Năm sản xuất</th>
            </tr>
          </thead>
          <tbody>
            {movies.map(movie => (
              <tr key={movie.id}>
                <td>{movie.name}</td>
                <td>{movie.category ? movie.category.map(cat => cat.name).join(', ') : 'N/A'}</td>
                <td>{movie.year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
    </div>
  );
};

export default AdminDashboard;
