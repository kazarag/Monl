import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WatchHistory from '../components/User/WatchHistory';  // Giả sử bạn có component này

const HistoryPage = () => {
  return (
    <div>
      <Header />
      <WatchHistory />
      <Footer />
    </div>
  );
};

export default HistoryPage;
