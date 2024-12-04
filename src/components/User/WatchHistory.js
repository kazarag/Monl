import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { db } from "../../firebase/firebase";
import { collection, query, where, getDocs, deleteDoc, doc ,orderBy} from "firebase/firestore";
import { Link } from "react-router-dom";
import "./WatchHistory.css"; // Tạo file CSS để tùy chỉnh giao diện

const WatchHistory = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchHistory = async () => {
      if (user) {
        const historyRef = collection(db, "watchHistory");
        const q = query(
          historyRef,
          where("userId", "==", user.uid),
          // orderBy("timestamp", "desc")
        );

        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHistory(historyData);
        setLoading(false);
      }
    };

    fetchWatchHistory();
  }, [user]);
  const handleDeleteHistory = async (id) => {
    try {
      const docRef = doc(db, "watchHistory", id);
      await deleteDoc(docRef);

      // Cập nhật lại danh sách lịch sử trong state
      setHistory((prevHistory) => prevHistory.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa lịch sử:", error);
    }
  };
  if (loading) {
    return <div className="watch-history2">Đang tải lịch sử xem...</div>;
  }

  if (!history.length) {
    return <div className="watch-history2">Chưa có lịch sử xem nào.</div>;
  }

  return (
    <div className="watch-history">
      <h1>Lịch sử xem của bạn</h1>
      <ul className="history-list">
        {history.map((item) => (
          <li key={item.id} className="history-item">
            <div className="history-content">
              <Link to={`/movies/${item.movieId}/watch`} state={{ episode: item.episode }}>
                <div className="movie-title">{item.movieTitle}</div>
                <div className="episode-name">{item.episode.name}</div>
                <div className="watch-timestamp">
                  {new Date(item.timestamp.seconds * 1000).toLocaleString()}
                </div>
              </Link>
              <button
                className="delete-button"
                onClick={() => handleDeleteHistory(item.id)}
              >
                Xóa
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WatchHistory;
