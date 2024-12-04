import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WatchMovie from '../components/WatchMovie';  

const WatchPage = () => {
  return (
    <div>
      <Header />
      <WatchMovie/>
      <Footer />
    </div>
  );
};

export default WatchPage;
