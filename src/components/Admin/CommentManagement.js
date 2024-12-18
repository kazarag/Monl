import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "./CommentManagement.css";
import AdminHeader from "./AdminHeader";

const CommentManagement = () => {
  const [comments, setComments] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      const commentsRef = collection(db, "comments");
      const q = query(commentsRef, orderBy("timestamp", "desc"));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const commentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsData);
      });

      return () => unsubscribe();
    };

    fetchComments();
  }, []);

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Bạn có chắc muốn xóa bình luận này?")) {
      try {
        const commentRef = doc(db, "comments", commentId);
        await deleteDoc(commentRef);
        alert("Xóa bình luận thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa bình luận:", error);
        alert("Đã xảy ra lỗi khi xóa bình luận!");
      }
    }
  };

  const filteredComments = comments.filter((comment) =>
    comment.comment.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <AdminHeader />
      <div className="comment-management">
        <h2>Quản lý bình luận</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm bình luận..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table className="comments-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Bình luận</th>
              <th>Phim</th>
              <th>Thời gian</th>
              <th>Cảm xúc</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredComments.length > 0 ? (
              filteredComments.map((comment) => (
                <tr key={comment.id}>
                  <td>{comment.username}</td>
                  <td>{comment.comment}</td>
                  <td>{comment.movieId}</td>
                  <td>
                    {new Date(
                      comment.timestamp.seconds * 1000
                    ).toLocaleString()}
                  </td>
                  <td>
                    {comment.reactions ? (
                      <div className="reactions-list">
                        {Object.entries(comment.reactions).map(
                          ([reaction, users]) => (
                            <span key={reaction}>
                              {reaction} ({users.length})
                            </span>
                          )
                        )}
                      </div>
                    ) : (
                      "Không có cảm xúc"
                    )}
                  </td>
                  <td>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Không tìm thấy bình luận nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommentManagement;
