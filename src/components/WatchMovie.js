import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { db, auth } from "../firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/WatchMovie.css";
import CommentsSection from "./CommentsSection";
const WatchMovie = () => {
  const { movieId } = useParams();
  const location = useLocation();
  const [currentEpisode, setCurrentEpisode] = useState(
    location.state?.episode || {}
  );
  const [movie, setMovie] = useState(null);
  // const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  // const [visibleComments, setVisibleComments] = useState(10);
  const [selectedRating, setSelectedRating] = useState(0);
  // Fetch thông tin phim
  useEffect(() => {
    const fetchMovie = async () => {
      const movieDocRef = doc(db, "movies", movieId);
      const movieDoc = await getDoc(movieDocRef);
      if (movieDoc.exists) {
        setMovie(movieDoc.data());
        // alert("Movie fetched ", movieDoc.data().id);
      }
    };
    fetchMovie();
  }, [movieId]);
  // useEffect(() => {
  //   alert("movieId from URL:", movieId);
  // }, [movieId]);
  useEffect(() => {
    const fetchUserRating = async () => {
      if (user) {
        const ratingsRef = collection(db, "ratings");
        const q = query(
          ratingsRef,
          where("userId", "==", user.uid),
          where("movieId", "==", movieId)
        );
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const userRating = querySnapshot.docs[0].data().rating;
          setSelectedRating(userRating); // Gán điểm người dùng đã chấm
        }
      }
    };
    fetchUserRating();
  }, [user, movieId]);
    // // Fetch bình luận
    // useEffect(() => {
    //   const commentsRef = collection(db, "comments");
    //   const q = query(
    //     commentsRef,
    //     where("movieId", "==", movieId),
    //     orderBy("timestamp", "desc")
    //   );

    //   const unsubscribe = onSnapshot(q, (snapshot) => {
    //     if (snapshot.empty) {
    //       alert("No matching documents.");
    //     } else {
    //       const commentsData = snapshot.docs.map((doc) => ({
    //         id: doc.id,
    //         ...doc.data(),
    //       }));
    //       alert("Comments fetched: ", commentsData);
    //       setComments(commentsData);
    //     }
    //   });

    //   return () => unsubscribe();
    // }, [movieId]);

  useEffect(() => {
    const fetchWatchHistory = async (userId) => {
      const historyRef = collection(db, "watchHistory");
      const q = query(
        historyRef,
        where("userId", "==", userId),
        where("movieId", "==", movieId)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const historyData = querySnapshot.docs[0].data();
        setCurrentEpisode(historyData.episode);
        // alert(historyData.episode.name);
      }
    };
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchWatchHistory(currentUser.uid);
        saveWatchHistory(currentEpisode);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, [movieId]);

  // const handleAddComment = async () => {
  //   if (!newComment.trim()) {
  //     alert("Bình luận không được để trống!");
  //     return;
  //   }

  //   if (!user) {
  //     alert("Vui lòng đăng nhập để bình luận!");
  //     return;
  //   }

  //   try {
  //     const commentsRef = collection(db, "comments");
  //     await addDoc(commentsRef, {
  //       movieId,
  //       userId: user?.uid,
  //       username: user?.displayName || user?.email || "Anonymous",
  //       comment: newComment,
  //       reaction: "", // Mặc định không có cảm xúc
  //       timestamp: new Date(),
  //     });

  //     setNewComment("");
  //     alert("Bình luận đã được thêm!");
  //   } catch (error) {
  //     console.error("Lỗi khi thêm bình luận:", error);
  //   }
  // };
  // const handleDeleteComment = async (commentId) => {
  //   try {
  //     const commentRef = doc(db, "comments", commentId);
  //     await deleteDoc(commentRef);
  //   } catch (error) {
  //     console.error("Error deleting comment:", error);
  //   }
  // };
  // const handleUpdateReaction = async (commentId, newReaction) => {
  //   try {
  //     const commentRef = doc(db, "comments", commentId);
  //     await updateDoc(commentRef, {
  //       reaction: newReaction,
  //     });
  //   } catch (error) {
  //     console.error("Error updating reaction:", error);
  //   }
  // };

  const handleRating = async (selectedRating) => {
    if (!user) {
      alert("Vui lòng đăng nhập để chấm điểm!");
      return;
    }

    try {
      setSelectedRating(selectedRating);
      const ratingsRef = collection(db, "ratings");
      const movieDocRef = doc(db, "movies", movieId);

      // Kiểm tra xem người dùng đã chấm điểm chưa
      const q = query(
        ratingsRef,
        where("userId", "==", user.uid),
        where("movieId", "==", movieId)
      );
      const querySnapshot = await getDocs(q);

      const movieDoc = await getDoc(movieDocRef);
      if (!movieDoc.exists()) {
        console.error("Movie không tồn tại.");
        return;
      }

      const movieData = movieDoc.data();
      const totalRatings = movieData.totalRatings || 0;
      const sumRatings = movieData.sumRatings || 0;

      if (!querySnapshot.empty) {
        // Người dùng đã chấm điểm -> Cập nhật điểm
        const ratingDocRef = querySnapshot.docs[0].ref;
        const oldRating = querySnapshot.docs[0].data().rating;

        const updatedSumRatings = sumRatings - oldRating + selectedRating; // Loại bỏ điểm cũ, thêm điểm mới
        const updatedRating = updatedSumRatings / totalRatings;

        await updateDoc(movieDocRef, {
          sumRatings: updatedSumRatings,
          rating: updatedRating, // Tính lại điểm trung bình
        });

        await updateDoc(ratingDocRef, {
          rating: selectedRating,
          timestamp: new Date(),
        });

        alert(`Bạn đã cập nhật điểm thành ${selectedRating} sao!`);
      } else {
        const updatedTotalRatings = totalRatings + 1;
        const updatedSumRatings = sumRatings + selectedRating;
        const updatedRating = parseFloat(updatedSumRatings / updatedTotalRatings).toFixed(2);

        await updateDoc(movieDocRef, {
          totalRatings: updatedTotalRatings,
          sumRatings: updatedSumRatings,
          rating: updatedRating, 
        });

        await addDoc(ratingsRef, {
          userId: user.uid,
          movieId,
          rating: selectedRating,
          timestamp: new Date(),
        });

        alert(`Bạn đã chấm ${selectedRating} sao!`);
      }
      const movieDocupload = await getDoc(movieDocRef);
      if (movieDocupload.exists) {
        setMovie(movieDocupload.data());
        // alert("Movie fetched ", movieDoc.data().id);
      }
    } catch (error) {
      console.error("Lỗi khi chấm điểm:", error);
    }
  };

  const handleSelectEpisode = (episode, movieId, user) => {
    setCurrentEpisode(episode);
    if (user) {
      saveWatchHistory(episode, movieId, user);
    }
  };

  const saveWatchHistory = async (episode, movieId, user) => {
    if (!user) return; 
    const watchHistoryRef = collection(db, "watchHistory");
    const q = query(
      watchHistoryRef,
      where("userId", "==", user.uid),
      where("movieId", "==", movieId)
    );
    try {
      const querySnapshot = await getDocs(q); 
      if (!querySnapshot.empty) {
        // If a record exists, update it
        const docId = querySnapshot.docs[0].id;
        const docRef = doc(db, "watchHistory", docId);
        await updateDoc(docRef, {
          movieTitle: episode.movieTitle || "Unknown",
          episode: {
            name: episode.name,
            link_m3u8: episode.link_m3u8, 
          },
          timestamp: new Date(), 
        });
      } else {
        await addDoc(watchHistoryRef, {
          userId: user.uid,
          movieId,
          movieTitle: movie.name || "Unknown", 
          episode: {
            name: episode.name,
            link_m3u8: episode.link_m3u8,
          },
          timestamp: new Date(), 
        });
      }
      // alert("Save history success!");
    } catch (error) {
      console.error("Error saving watch history:", error);
    }
  };

  // const handleLoadMoreComments = () => {
  //   setVisibleComments((prevVisibleComments) => prevVisibleComments + 5); // Tăng số lượng bình luận hiển thị
  // };

  if (!movie) {
    return <div className="watch-movie2">Đang tải...</div>;
  }

  return (
    <div className="watch-movie">
      <h1>{movie.name}</h1>

      <div className="video-player">
        <iframe
          src={currentEpisode.link_m3u8}
          title={currentEpisode.name}
          width="100%"
          height="480px"
          allowFullScreen 
          onClick={() => saveWatchHistory(currentEpisode, movieId, user)}
        ></iframe>
      </div>

      <div className="episode-list">
        <h3>Danh sách tập</h3>
        <ul>
          {movie.episodes.map((episode, index) => (
            <li
              key={index}
              className={episode === currentEpisode ? "active" : ""}
              onClick={() => handleSelectEpisode(episode, movieId, user)}
            >
              {episode.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="movie-actions">
        {/* Chấm điểm */}
        <div className="movie-rating">
          <h3>
            Đánh giá trung bình:{" "}
            {movie.rating ? parseFloat((movie.rating).toFixed(2)) : "Chưa có"}
          </h3>
          <p>({movie.totalRatings || 0} lượt đánh giá)</p>
        </div>
        <div className="rating-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={selectedRating === star ? "active" : ""}
              onClick={() => handleRating(star)}
            >
              {star} ⭐
            </button>
          ))}
        </div>

        {/* <div className="comments-section">
          <h3>Bình luận</h3>
          <ul className="comments-list">
            {comments.length > 0 ? (
              comments.slice(0, visibleComments).map((comment) => (
                <li key={comment.id}>
                  <div className="comment-header">
                    <strong>{comment.username}</strong>
                    {comment.userId === user?.uid && (
                      <button onClick={() => handleDeleteComment(comment.id)}>
                        Xóa
                      </button>
                    )}
                  </div>
                  <p>{comment.comment}</p>
                  <div className="comment-actions">
                    <span>Chọn cảm xúc:</span>
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
                  {comment.reaction && <p>{comment.reaction}</p>}
                </li>
              ))
            ) : (
              <li>Chưa có bình luận nào.</li>
            )}
          </ul>
          {visibleComments < comments.length && ( // Chỉ hiển thị nút "Xem thêm" nếu còn bình luận chưa hiển thị
            <button
              className="load-more-comments"
              onClick={handleLoadMoreComments}
            >
              Xem thêm bình luận
            </button>
          )}
          {user ? (
            <div className="comment-input">
              <textarea
                placeholder="Viết bình luận..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <button onClick={handleAddComment}>Gửi bình luận</button>
            </div>
          ) : (
            <p>
              Vui lòng{" "}
              <Link to="/login" state={{ from: location }}>
                đăng nhập
              </Link>{" "}
              để bình luận.
            </p>
          )}
        </div> */}
        <CommentsSection movieId={movieId} user={user}/>
      </div>
    </div>
  );
};

export default WatchMovie;
