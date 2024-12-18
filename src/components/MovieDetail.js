import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../firebase/firebase';
import { AuthContext } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import '../styles/MovieDetail.css';

const MovieDetail = () => {
  const { movieId } = useParams();
  const { user } = useContext(AuthContext);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieDocRef = doc(db, 'movies', movieId);
        const movieDoc = await getDoc(movieDocRef);
        if (movieDoc.exists()) {
          setMovie(movieDoc.data());
        } else {
          console.error('Phim không tồn tại.');
        }
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi tải chi tiết phim:', error);
        setLoading(false);
      }
    };


    const checkFavorite = async () => {
      if (user) {
        const favoriteDocRef = doc(db, 'users', user.uid, 'favorites', movieId);
        const favoriteDoc = await getDoc(favoriteDocRef);
        setIsFavorite(favoriteDoc.exists());
      }
    };

    const initializeData = async () => {
      await fetchMovieDetails();
      checkFavorite();
    };

    initializeData();
  }, [movieId, user, movie]);

  const handleWatchMovie = () => {
    navigate(`/movies/${movieId}/watch`, { state: { episode: movie.episodes[0] } });
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('Người dùng cần đăng nhập để thêm vào danh sách yêu thích.');
      return;
    }

    const favoriteDocRef = doc(db, 'users', user.uid, 'favorites', movieId);

    try {
      if (isFavorite) {
        await deleteDoc(favoriteDocRef);
      } else {
        await setDoc(favoriteDocRef, {
          name: movie.name,
          poster_url: movie.poster_url,
          category: movie.category,
          year: movie.year,
        });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái yêu thích:', error);
    }
  };

  if (loading) {
    return <div className="movie-detail">Đang tải...</div>;
  }

  if (!movie) {
    return <div className="movie-detail">Không tìm thấy phim</div>;
  }

  return (
    <div className="movie-detail">
      <div className="movie-header">
        <img src={movie.poster_url} alt={movie.name} className="movie-poster" />
        <div className="movie-info">
          <h1>{movie.name}</h1>
          <p>{movie.content}</p>
          <p>Thể loại: {movie.category.map(cat => cat.name).join(', ')}</p>
          <p>Quốc gia: {movie.country}</p>
          <p>Năm sản xuất: {movie.year}</p>
          <p>Thời lượng: {movie.time}</p>
          <p>Chất lượng: {movie.quality}</p>
          <p>Ngôn ngữ: {movie.lang}</p>
          {movie.rating && movie.rating>0?(
          <p>Đánh giá: {(movie.rating)}⭐ </p>):(
            <p>Đánh giá: Chưa có đánh giá</p>
          )}
          <button onClick={handleWatchMovie} className="watch-movie-button">Xem phim</button>
          <button onClick={handleFavoriteToggle} className="favorite-button">
            {isFavorite ? '❤️' : '🤍'} Yêu thích
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
