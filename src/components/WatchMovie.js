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
  const [user, setUser] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewContent, setReviewContent] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false); // Quản lý hiện/ẩn form đánh giá
  const [reviews, setReviews] = useState([]); // Danh sách đánh giá

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
  useEffect(() => {
    if (movie && !currentEpisode && movie.episodes.length > 0) {
      setCurrentEpisode(movie.episodes[0]);
    }
  }, [movie, currentEpisode]);
  useEffect(() => {
    const fetchUserRating = async () => {
      if (user) {
        const ratingsRef = collection(db, "ratings");
        const usersRef = collection(db, "user"); 
        let q = query(
          ratingsRef,
          where("userId", "==", user.uid),
          where("movieId", "==", movieId)
        );
        let querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userRating = querySnapshot.docs[0].data().rating;
          const userReview = querySnapshot.docs[0].data().reviewContent;
          setSelectedRating(userRating);
          setReviewContent(userReview);
        }
  
        q = query(ratingsRef, where("movieId", "==", movieId));
        querySnapshot = await getDocs(q);
  
        const reviewsData = await Promise.all(
          querySnapshot.docs.map(async (reviewDoc) => {
            const review = reviewDoc.data();
            try {
              const userDocRef = doc(usersRef, review.userId);
              const userDoc = await getDoc(userDocRef);
              const userName = userDoc.exists()
                ? userDoc.data().fullname
                : "Người dùng ẩn danh";
  
              return {
                id: reviewDoc.id,
                ...review,
                userName,
              };
            } catch (error) {
              console.error(`Lỗi khi lấy tên người dùng: ${error.message}`);
              return {
                id: reviewDoc.id,
                ...review,
                userName: "Người dùng ẩn danh",
              };
            }
          })
        );
        setReviews(reviewsData);
      }
    };
    fetchUserRating();
  }, [user, movieId]);
  
  useEffect(() => {
    const saveHistory = async () => {
      if (!user || !currentEpisode || !movie) return; // Kiểm tra điều kiện để lưu lịch sử
      try {
        const watchHistoryRef = collection(db, "watchHistory");
        const q = query(
          watchHistoryRef,
          where("userId", "==", user.uid),
          where("movieId", "==", movieId)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docId = querySnapshot.docs[0].id;
          const docRef = doc(db, "watchHistory", docId);
          await updateDoc(docRef, {
            episode: {
              name: currentEpisode.name,
              link_m3u8: currentEpisode.link_m3u8,
            },
            timestamp: new Date(), // Cập nhật lại thời gian
          });
        } else {
          // Nếu chưa có lịch sử, tạo mới
          await addDoc(watchHistoryRef, {
            userId: user.uid,
            movieId,
            movieTitle: movie.name || "Unknown",
            episode: {
              name: currentEpisode.name,
              link_m3u8: currentEpisode.link_m3u8,
            },
            timestamp: new Date(),
          });
        }
        // alert("Lịch sử đã được lưu!");
      } catch (error) {
        console.error("Error saving watch history:", error);
      }
    };

    if (user) {
      saveHistory();
    }
  }, [currentEpisode, user, movie, movieId]);
  const handleSelectEpisode = (episode, movieId, user) => {
    setCurrentEpisode(episode);
    if (user) {
      saveWatchHistory(episode, movieId, user);
    }
  };

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

  const handleRating = async (selectedRating, reviewContent) => {
    if (!user) {
      alert("Vui lòng đăng nhập để chấm điểm!");
      return;
    }

    if (!reviewContent.trim() || selectedRating === 0) {
      alert("Vui lòng nhập nội dung đánh giá và chọn điểm!");
      return;
    }

    try {
      const ratingsRef = collection(db, "ratings");
      const movieDocRef = doc(db, "movies", movieId);

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
        const ratingDocRef = querySnapshot.docs[0].ref;
        const oldRating = querySnapshot.docs[0].data().rating;

        const updatedSumRatings = sumRatings - oldRating + selectedRating;
        const updatedRating = updatedSumRatings / totalRatings;

        await updateDoc(movieDocRef, {
          sumRatings: updatedSumRatings,
          rating: updatedRating,
        });

        await updateDoc(ratingDocRef, {
          rating: selectedRating,
          reviewContent,
          timestamp: new Date(),
        });

        alert(`Bạn đã cập nhật đánh giá thành công!`);
      } else {
        const updatedTotalRatings = totalRatings + 1;
        const updatedSumRatings = sumRatings + selectedRating;
        const updatedRating = parseFloat(
          updatedSumRatings / updatedTotalRatings
        ).toFixed(2);

        await updateDoc(movieDocRef, {
          totalRatings: updatedTotalRatings,
          sumRatings: updatedSumRatings,
          rating: updatedRating,
        });

        await addDoc(ratingsRef, {
          userId: user.uid,
          movieId,
          rating: selectedRating,
          reviewContent,
          timestamp: new Date(),
        });

        alert(`Đánh giá của bạn đã được ghi nhận!`);
        setShowReviewForm(false);
      }

      const updatedMovieDoc = await getDoc(movieDocRef);
      if (updatedMovieDoc.exists) {
        setMovie(updatedMovieDoc.data());
      }

      setReviewContent("");
      setSelectedRating(0);
    } catch (error) {
      console.error("Lỗi khi xử lý đánh giá:", error);
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
          movieTitle: movie.name || "Unknown",
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
              className={episode.name === currentEpisode.name ? "active" : ""}
              onClick={() => handleSelectEpisode(episode, movieId, user)}
            >
              {episode.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="movie-actions">
        {/* Hiển thị điểm đánh giá */}
        <div className="movie-rating">
          <h3>
            Đánh giá trung bình:{" "}
            {movie.rating ? parseFloat(movie.rating).toFixed(2) : "Chưa có"}
          </h3>
          <p>({movie.totalRatings || 0} lượt đánh giá)</p>
          <button
            className="write-review-button"
            onClick={() => setShowReviewForm(!showReviewForm)}
          >
            {showReviewForm ? "Đóng" : "Viết đánh giá"}
          </button>
        </div>

        {showReviewForm && (
          <div className="review-section">
            {/* Form đánh giá */}
            <div className="review-form">
              <h3>Viết đánh giá của bạn</h3>
              <div className="review-input">
                <textarea
                  placeholder="Nhập nội dung đánh giá của bạn..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                ></textarea>
              </div>
              <div className="rating-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`rating-button ${
                      selectedRating >= star ? "active" : ""
                    }`}
                    onClick={() => setSelectedRating(star)}
                  >
                    {star} ⭐
                  </button>
                ))}
              </div>
              <button
                className="submit-review-button"
                onClick={() => handleRating(selectedRating, reviewContent)}
              >
                Đăng bài đánh giá
              </button>
            </div>

            {/* Danh sách đánh giá */}
            <div className="reviews-list">
              <h3>Đánh giá của người xem</h3>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <strong>{review.userName}</strong>
                      <span className="rating">{review.rating} ⭐</span>
                    </div>
                    <p className="review-content">{review.reviewContent}</p>
                  </div>
                ))
              ) : (
                <p>Chưa có đánh giá nào.</p>
              )}
            </div>
          </div>
        )}

        <CommentsSection movieId={movieId} user={user} />
      </div>
    </div>
  );
};

export default WatchMovie;
