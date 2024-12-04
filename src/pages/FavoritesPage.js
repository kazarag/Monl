import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FavoriteMovies from '../components/User/FavoriteMovies';  // Giả sử bạn có component này

const FavoritesPage = () => {
  return (
    <div>
      <Header />
      <FavoriteMovies />
      <Footer />
    </div>
  );
};

export default FavoritesPage;
