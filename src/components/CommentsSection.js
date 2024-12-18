import React, { useState, useEffect } from "react";
import { db } from "../firebase/firebase"; // Giả sử bạn đã config Firebase
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import "../styles/CommentsSection.css";
const CommentsSection = ({ movieId, user }) => {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);
  const [visibleComments, setVisibleComments] = useState(5);
  const [hoveredCommentId, setHoveredCommentId] = useState(null);
  useEffect(() => {
    const fetchComments = async () => {
      const commentsRef = collection(db, "comments");
      const q = query(
        commentsRef,
        where("movieId", "==", movieId)
        // orderBy("timestamp", "desc")
      );

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
  }, [movieId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert("Bình luận không được để trống!");
      return;
    }

    if (!user) {
      alert("Vui lòng đăng nhập để bình luận!");
      return;
    }

    try {
      const commentsRef = collection(db, "comments");
      await addDoc(commentsRef, {
        movieId,
        userId: user.uid,
        username: user.displayName || user.email || "Anonymous",
        comment: newComment,
        reaction: "",
        timestamp: new Date(),
      });

      setNewComment("");
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const commentRef = doc(db, "comments", commentId);
      await deleteDoc(commentRef);
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
    }
  };
  const handleUpdateReaction = async (commentId, selectedReaction) => {
    if (!user) {
      alert("Vui lòng đăng nhập để thả cảm xúc!");
      return;
    }
  
    try {
      const commentRef = doc(db, "comments", commentId);
      const commentSnapshot = await getDoc(commentRef);
  
      if (!commentSnapshot.exists()) {
        console.error("Bình luận không tồn tại!");
        return;
      }
  
      const currentReactions = commentSnapshot.data().reactions || {};
  

      const updatedReactions = { ...currentReactions };
      Object.keys(updatedReactions).forEach((reaction) => {
        if (updatedReactions[reaction].includes(user.uid)) {
          updatedReactions[reaction] = updatedReactions[reaction].filter(
            (id) => id !== user.uid
          );
        }
      });
  

      if (!updatedReactions[selectedReaction]) {
        updatedReactions[selectedReaction] = [];
      }
  
      updatedReactions[selectedReaction].push(user.uid);

      await updateDoc(commentRef, { reactions: updatedReactions });
    } catch (error) {
      console.error("Lỗi khi cập nhật cảm xúc:", error);
    }
  };
  
  const handleLoadMoreComments = () => {
    setVisibleComments((prev) => prev + 5);
  };

  return (
    <div className="comments-section">
      <h3>Bình luận</h3>
      <ul className="comments-list">
        {comments.length > 0 ? (
          comments.slice(0, visibleComments).map((comment) => (
            <li
              key={comment.id}
              onMouseEnter={() => setHoveredCommentId(comment.id)}
              onMouseLeave={() => setHoveredCommentId(null)}
            >
              <div className="comment-header">
                <strong>{comment.username}</strong>
                {comment.userId === user?.uid && (
                  <button onClick={() => handleDeleteComment(comment.id)}>
                    Xóa
                  </button>
                )}
              </div>
              <p>{comment.comment}</p>
              {hoveredCommentId === comment.id &&
                comment.userId !== user?.uid && (
                  <div className="comment-actions">
                    {["❤️", "😂", "😢", "😡"].map((icon) => (
                      <button
                        key={icon}
                        className={comment.reaction === icon ? "active" : ""}
                        onClick={() => handleUpdateReaction(comment.id, icon)}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                )}
              {comment.reactions &&
              Object.keys(comment.reactions).length > 0 ? (
                <div className="reactions-summary">
                  {Object.entries(comment.reactions).map(
                    ([reaction, users]) => ( users.length !== 0 &&(
                      <span key={reaction} className="reaction-badge">
                        {reaction} {users.length}
                      </span>)
                    )
                  )}
                </div>
              ) : (
                <p></p>
              )}
            </li>
          ))
        ) : (
          <li>Chưa có bình luận nào.</li>
        )}
      </ul>

      {visibleComments < comments.length && (
        <button className="load-more-comments" onClick={handleLoadMoreComments}>
          Xem thêm bình luận
        </button>
      )}
      {user ? (
        <div className="comment-input">
          <textarea
            placeholder="Viết bình luận..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment}>Gửi bình luận</button>
        </div>
      ) : (
        <p>
          Vui lòng <a href="/login">đăng nhập</a> để bình luận.
        </p>
      )}
    </div>
  );
};

export default CommentsSection;
