import React from 'react';
import AdminHeader from '../components/Admin/AdminHeader';
import Footer from '../components/Footer';
import AdminDashboard from '../components/Admin/AdminDashboard';


const AdminPage = () => {
  return (
    <div>
      <AdminHeader />
      <AdminDashboard />
      <Footer />
    </div>
  );
};

export default AdminPage;
