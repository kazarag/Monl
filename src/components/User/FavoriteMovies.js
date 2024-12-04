import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom'; // Import Link từ react-router-dom
import { db } from '../../firebase/firebase';
import { AuthContext } from '../../contexts/AuthContext';
import { collection, getDocs } from 'firebase/firestore';
import './FavoriteMovie.css';

const FavoriteMovie = () => {
  const { user } = useContext(AuthContext);
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const favoriteMoviesRef = collection(db, 'users', user.uid, 'favorites');
        const favoriteMoviesSnapshot = await getDocs(favoriteMoviesRef);
        setFavoriteMovies(favoriteMoviesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);
  if (loading) {
    return <div className="favorite-movies2">Đang tải danh sách...</div>;
  }

  if (!favoriteMovies.length) {
    return <div className="favorite-movies2">Chưa có phim yêu thích nào.</div>;
  }
  return (
    <div className="favorite-movies">
      <h2>Danh sách phim yêu thích</h2>
      <div className="movies-grid">
        {favoriteMovies.map((movie) => (
          <Link to={`/movies/${movie.id}`} key={movie.id} className="movie-card"> {/* Link tới MovieDetail */}
            <img src={movie.poster_url} alt={movie.name} className="movie-poster" />
            <h3>{movie.name}</h3>
            <p>{movie.category.map(cat => cat.name).join(', ')}</p>
            <p>{movie.year}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FavoriteMovie;
