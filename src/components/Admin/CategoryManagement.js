import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
  query,
} from "firebase/firestore"; // Modular Firestore imports
import "./CategoryManagement.css";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
const CategoryManagement = () => {
  const [showCategoryForm, setShowCategoryForm] = useState(true);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editmode, seteditmode] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchMoviesAndCategories = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoriesList = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesList);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };
    fetchMoviesAndCategories();
  }, []);
  const handleCategorySelect = (slug) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };
  const handleDeleteCategory = async (categoryId) => {
    try {
      
      await deleteDoc(doc(db, "categories", categoryId));

      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== categoryId)
      );

      
      const movieSnapshot = await getDocs(collection(db, "movies"));
      const updateMoviesPromises = movieSnapshot.docs.map(async (movieDoc) => {
        const movieData = movieDoc.data();
        const updatedCategories = movieData.category.filter(
          (cat) => cat.id !== categoryId
        );

        // Update the movie document if the category list has changed
        if (updatedCategories.length !== movieData.category.length) {
          await updateDoc(doc(db, "movies", movieDoc.id), {
            category: updatedCategories,
          });
        }
      });

      // Wait for all updates to complete
      await Promise.all(updateMoviesPromises);

      alert("Thể loại đã được xóa thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa thể loại:", error);
      alert("Có lỗi xảy ra khi xóa thể loại.");
    }
  };

  const handleAddCategory = async (name, slug) => {
    try {
      const newCategory = await addDoc(collection(db, "categories"), {
        name,
        slug,
      });

      // Update the local state with the new category
      setCategories((prevCategories) => [
        ...prevCategories,
        { id: newCategory.id, name, slug },
      ]);
    } catch (error) {
      console.error("Lỗi khi thêm thể loại:", error);
      alert("Có lỗi xảy ra khi thêm thể loại.");
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();

    try {
      if (currentCategoryId) {
        // Edit category
        await updateDoc(doc(db, "categories", currentCategoryId), {
          name: categoryForm.name,
          slug: categoryForm.slug,
        });
      } else {
        // Add new category
        await addDoc(collection(db, "categories"), categoryForm);
      
      }

      // Reset form
      setCategoryForm({ name: "", slug: "" });
      setCurrentCategoryId(null);

      // Refresh categories
      const categoriesSnapshot = await getDocs(collection(db, "categories"));
      setCategories(
        categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
      alert("Thể loại đã được thêm thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm/cập nhật thể loại:", error);
      alert("Có lỗi xảy ra khi thêm/cập nhật thể loại.");
    }
  };
  const handleCategoryChange = (field, value) => {
    setCategoryForm({ ...categoryForm, [field]: value });
    seteditmode(true);
  };
  const handleRefeshcate = () => {
    setCategoryForm({
      name: "",
      slug: "",
    });
    setCurrentCategoryId(null);
  };
  return (
    <div>
      <AdminHeader />
      <div className="container">
        {/* Form quản lý thể loại */}
        <h3
          onClick={() => setShowCategoryForm((prev) => !prev)}
          style={{ cursor: "pointer" }}
        >
          Quản lý Thể loại {showCategoryForm ? "▲" : "▼"}
        </h3>
        {showCategoryForm && (
          <form onSubmit={handleCategorySubmit}>
            <input
              type="text"
              placeholder="Tên thể loại"
              value={categoryForm.name}
              onChange={(e) => handleCategoryChange("name", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Slug"
              value={categoryForm.slug}
              onChange={(e) => handleCategoryChange("slug", e.target.value)}
              required
            />
            <button type="submit">
              {currentCategoryId ? "Cập nhật thể loại" : "Thêm thể loại"}
            </button>
            <button type="button" onClick={handleRefeshcate}>
              Làm mới
            </button>
          </form>
        )}
        <div className="tables-container">
          <table className="category-table">
            <thead>
              <tr>
              <th>ID</th>
                <th>Tên</th>
                <th>Slug</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>
                    <button onClick={() => setCategoryForm(category) && setCurrentCategoryId(category.id)}>
                      Sửa
                    </button>
                    <button onClick={() => handleDeleteCategory(category.id)}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default CategoryManagement;
