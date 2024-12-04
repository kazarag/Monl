import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserProfile from '../components/User/UserProfile';  // Giả sử bạn có component này

const ProfilePage = () => {
  return (
    <div>
      <Header />
      <UserProfile />
      <Footer />
    </div>
  );
};

export default ProfilePage;
