import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { AuthContext } from "../contexts/AuthContext";
import "../styles/MovieList.css";

const MovieList = () => {
  const { user } = useContext(AuthContext);
  const [movies, setMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 20;
  const sliderRef = useRef(null);
  const handleScroll = (direction) => {
    const slider = sliderRef.current;
    const scrollAmount = slider.offsetWidth / 2;
  
    if (direction === "prev") {
      if (slider.scrollLeft <= 0) {

        // slider.scrollLeft = slider.scrollWidth;
      } else {
        slider.scrollLeft -= scrollAmount;
      }
    } else if (direction === "next") {
      if (slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth) {
        slider.scrollLeft = 0;
      } else {
        slider.scrollLeft += scrollAmount;
      }
    }
  };
  
  const getRandomMovies = (movies, count) => {
    if (!Array.isArray(movies) || movies.length === 0) {
      console.error("Movies array is invalid or empty.");
      return [];
    }
  
    // Nếu số lượng phim yêu cầu lớn hơn số lượng phim trong mảng, lấy tất cả
    count = Math.min(count, movies.length);
  
    const randomMovies = [];
    const movieIndexes = new Set(); // Để tránh chọn trùng
  
    while (randomMovies.length < count) {
      const randomIndex = Math.floor(Math.random() * movies.length);
      if (!movieIndexes.has(randomIndex)) {
        randomMovies.push(movies[randomIndex]);
        movieIndexes.add(randomIndex);
      }
    }
  
    return randomMovies;
  };
  
  useEffect(() => {
    if (movies.length === 0 &&searchTerm.trim() === "") {
      const fetchMovies = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "movies"));
          const moviesList = querySnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .sort((a, b) => {
              const dateA = new Date(a.day_modified || a.day_added).getTime();
              const dateB = new Date(b.day_modified || b.day_added).getTime();
              return dateB - dateA;
            });
      
          setMovies(moviesList);
        } catch (error) {
          console.error("Lỗi khi tải danh sách phim:", error);
        }
      };
      
  
      const fetchCategories = async () => {
        try {
          const categorySnapshot = await getDocs(collection(db, "categories"));
          const categoriesList = categorySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setCategories(categoriesList);
        } catch (error) {
          console.error("Lỗi khi tải danh sách thể loại:", error);
        }
      };
  
      const initializeData = async () => {
        await Promise.all([fetchMovies(), fetchCategories()]);
        setLoading(false);
      };
  
      initializeData();
    }
  
  }, [movies]); 
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        if (user) {
          const favoritesRef = collection(db, "users", user.uid, "favorites");
          const watchHistoryRef = collection(db, "watchHistory", user.uid, "movies");
  
          const [favoritesSnapshot, watchHistorySnapshot] = await Promise.all([
            getDocs(favoritesRef),
            getDocs(watchHistoryRef),
          ]);
  
          const favoriteMovies = favoritesSnapshot.docs.map((doc) => doc.data());
          const watchedMovies = watchHistorySnapshot.docs.map((doc) => doc.data());
  
          const relevantCategories = new Set([
            ...favoriteMovies.flatMap((movie) =>
              movie.category.map((cat) => cat.slug)
            ),
            ...watchedMovies.flatMap((movie) =>
              movie.category.map((cat) => cat.slug)
            ),
          ]);
  
          const recommended = movies.filter((movie) =>
            movie.category.some((cat) => relevantCategories.has(cat.slug))
          );
          setRecommendedMovies(getRandomMovies(recommended, 15)); // Set ngẫu nhiên các bộ phim
        } else {
          const RecomMovies = getRandomMovies(movies, 15);
          setRecommendedMovies(RecomMovies);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách gợi ý:", error);
      }
    };
  
    fetchRecommendations();
  }, [user, movies]); 
  
  

  const filteredMovies = movies.filter(
    (movie) =>
      movie.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (category === "All" ||
        (movie.category && movie.category.some((cat) => cat.slug === category)))
  );

  const indexOfLastMovie = currentPage * moviesPerPage;
  const indexOfFirstMovie = indexOfLastMovie - moviesPerPage;
  const currentMovies = filteredMovies.slice(
    indexOfFirstMovie,
    indexOfLastMovie
  );

  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);

  if (loading) {
    return <div className="movie-list2">Đang tải danh sách phim...</div>;
  }

  return (
    <div className="movie-list">
      {/* Recommended Movies */}
      {recommendedMovies && recommendedMovies.length > 0 ? (
        <div className="recommended-movies">
          <h3>Gợi ý cho bạn</h3>
          <div className="slider-container">
            <button
              className="slider-button prev"
              onClick={() => handleScroll("prev")}
            >
              {"<"}
            </button>
            <div className="slider-wrapper">
              <div className="slider" ref={sliderRef}>
                {recommendedMovies.map((movie) => (
                  <div key={movie.id} className="movie-item">
                    <Link to={`/movies/${movie.id}`}>
                      <div className="movie-image-container">
                        <img
                          src={movie.poster_url}
                          alt={movie.name}
                          className="movie-poster"
                        />
                        <div className="movie-episode-info">
                          {movie.episode_current === "Full" ? (
                            <span className="status">Hoàn Tất</span>
                          ) : (
                            <span className="episode-number">
                              {movie.episode_current}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="movie-info">
                        <h3>{movie.name}</h3>
                        <p>{movie.year}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="slider-button next"
              onClick={() => handleScroll("next")}
            >
              {">"}
            </button>
          </div>
        </div>
      ) : (
        <h3 />
      )}
      <p> </p>
      {/* Search and Filter */}
      <div className="search-filter">
        <input
          type="text"
          placeholder="Tìm kiếm phim..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="filter-genre"
        >
          <option value="All">Tất cả thể loại</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      {/* Movie Grid */}
      {currentMovies && currentMovies.length > 0 ? (
        <div className="movies-container">
          {currentMovies.map((movie) => (
            <div key={movie.id} className="movie-item">
              <Link to={`/movies/${movie.id}`}>
                <div className="movie-image-container">
                  <img
                    src={movie.poster_url}
                    alt={movie.name}
                    className="movie-poster"
                  />
                  <div className="movie-episode-info">
                    {movie.episode_current === "Full" ? (
                      <span className="status">Hoàn Tất</span>
                    ) : (
                      <span className="episode-number">
                        {movie.episode_current}
                      </span>
                    )}
                  </div>
                </div>
                <div className="movie-info">
                  <h3>{movie.name}</h3>
                  <p>{movie.year}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="movies-container">
          <h3>Không tìm thấy phim</h3>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="pagination">
        {currentPage && currentPage > 1 ? (
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Trước đó
          </button>
        ) : (
          <h3 />
        )}
        <span>
          Trang
          <input
            type="number"
            min="1"
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value >= 1 && value <= totalPages) {
                setCurrentPage(value);
              }
            }}
            // onKeyDown={(e) => {
            //   if (e.key === "Enter") {
            //     const value = parseInt(e.target.value, 10);
            //     if (!isNaN(value) && value >= 1 && value <= totalPages) {
            //       setCurrentPage(value);
            //     }
            //   }
            // }}
            className="page-input"
          />
          / {totalPages}
        </span>
        {currentPage && currentPage < totalPages ? (
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Tiếp theo
          </button>
        ) : (
          <h3 />
        )}
      </div>
    </div>
  );
};

export default MovieList;
