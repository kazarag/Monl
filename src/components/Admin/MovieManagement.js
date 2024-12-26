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
import "./MovieManagement.css";
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminHeader";
const MovieManagement = () => {
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [showEpisode, setShowEpisode] = useState(false);
  const [movies, setMovies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentMovieId, setCurrentMovieId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [totalRatings, settotalRatings] = useState("");
  const [sumRatings, setsumRatings] = useState("");
  const [rating, setrating] = useState("");
  const [form, setForm] = useState({
    name: "",
    content: "",
    posterUrl: "",
    selectedCategories: [],
    time: "",
    country: "",
    year: "",
    quality: "",
    lang: "",
    episode_current: "",
    episode_total: "",
    episodes: [{ name: "", link_m3u8: "" }],
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMoviesAndCategories = async () => {
      try {
        const moviesSnapshot = await getDocs(collection(db, "movies"));
        const categoriesSnapshot = await getDocs(collection(db, "categories"));

        const moviesList = moviesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        const categoriesList = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMovies(moviesList);
        setCategories(categoriesList);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };
    fetchMoviesAndCategories();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa phim này? Hành động này không thể hoàn tác."
    );

    if (!confirmDelete) {
      return; // Người dùng chọn "Hủy"
    }
    try {
      await deleteDoc(doc(db, "movies", id));
      setMovies(movies.filter((movie) => movie.id !== id));
    } catch (error) {
      console.error("Lỗi khi xóa phim:", error);
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
  const handleEdit = (movie) => {
    setEditMode(true);
    setCurrentMovieId(movie.id);
    setForm({
      name: movie.name,
      content: movie.content,
      posterUrl: movie.poster_url,
      time: movie.time,
      country: movie.country,
      year: movie.year,
      quality: movie.quality,
      lang: movie.lang,
      episode_current: movie.episode_current,
      episode_total: movie.episode_total,
      episodes: movie.episodes,
    });
    setShowMovieForm(true);
    if (!movie.rating) {
      setrating(movie.rating);
      setsumRatings(movie.sumRatings);
      settotalRatings(movie.totalRatings);
    } else {
      setrating(0);
      setsumRatings(0);
      settotalRatings(0);
    }

    setSelectedCategories(movie.category.map((cat) => cat.slug));
  };

  const handleCategorySelect = (slug) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleAddEpisode = () => {
    setForm({
      ...form,
      episodes: [...form.episodes, { name: "", link_m3u8: "" }],
    });
  };

  const handleEpisodeChange = (index, field, value) => {
    const updatedEpisodes = form.episodes.map((episode, i) =>
      i === index ? { ...episode, [field]: value } : episode
    );
    setForm({ ...form, episodes: updatedEpisodes });
  };

  const handleFormChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const selectedCategoryObjects = selectedCategories.map((categorySlug) => {
        const category = categories.find((cat) => cat.slug === categorySlug);
        if (!category) {
          throw new Error(`Thể loại với slug "${categorySlug}" không tồn tại.`);
        }
        return { id: category.id, name: category.name, slug: category.slug };
      });
      const currentDate = new Date().toISOString(); 

      if (editMode) {
        await updateDoc(doc(db, "movies", currentMovieId), {
          name: form.name,
          content: form.content,
          poster_url: form.posterUrl,
          category: selectedCategoryObjects,
          time: form.time,
          country: form.country,
          year: form.year,
          quality: form.quality,
          lang: form.lang,
          episode_current: form.episode_current,
          episode_total: form.episode_total,
          episodes: form.episodes,
          totalRatings: totalRatings,
          sumRatings: sumRatings,
          rating: rating,
          day_modified: currentDate, // Thêm ngày chỉnh sửa
        });
        alert("Phim đã được cập nhật thành công!");
      } else {
        await addDoc(collection(db, "movies"), {
          name: form.name,
          content: form.content,
          poster_url: form.posterUrl,
          category: selectedCategoryObjects,
          time: form.time,
          country: form.country,
          year: form.year,
          quality: form.quality,
          lang: form.lang,
          episode_current: form.episode_current,
          episode_total: form.episode_total,
          episodes: form.episodes,
          totalRatings: 0,
          sumRatings: 0,
          rating: 0,
          day_added: currentDate, 
          day_modified: currentDate, 
        });
        alert("Phim mới đã được thêm thành công!");
      }

      // Reset lại form sau khi xử lý
      setForm({
        name: "",
        content: "",
        posterUrl: "",
        time: "",
        country: "",
        year: "",
        quality: "",
        lang: "",
        episode_current: "",
        episode_total: "",
        episodes: [{ name: "", link_m3u8: "" }],
      });
      setEditMode(false);
      setCurrentMovieId(null);
      setrating(null);
      setsumRatings(null);
      settotalRatings(null);
      setSelectedCategories([]);
      setShowMovieForm(false);

      // Tải lại danh sách phim
      const movieSnapshot = await getDocs(collection(db, "movies"));
      const moviesList = movieSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMovies(moviesList);
    } catch (error) {
      console.error("Lỗi khi thêm/cập nhật phim:", error);
      alert(`Có lỗi xảy ra khi thêm/cập nhật phim: ${error.message}`);
    }
  };

  const filteredMovies = movies.filter((movie) =>
    movie.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.content.toLowerCase().includes(searchQuery.toLowerCase())
  );
  

  const handleAddFromApi = async () => {
    if (!apiUrl) {
      alert("Vui lòng nhập URL của API!");
      return;
    }

    const urls = apiUrl.split(",").map((url) => url.trim());
    const existingCategorySlugs = new Set(categories.map((cat) => cat.slug));

    for (const url of urls) {
      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.movie) {
          const createdTime =
            data.movie.created?.time || new Date().toISOString(); 
          const modifiedTime = data.movie.modified?.time || createdTime; 

          const newMovie = {
            api: url,
            name: data.movie.name || "Tên phim chưa được cung cấp",
            content: data.movie.content || "",
            poster_url: data.movie.poster_url || "",
            time: data.movie.time || "",
            country: data.movie.country[0]?.name || "",
            year: data.movie.year || new Date().getFullYear(),
            quality: data.movie.quality || "",
            lang: data.movie.lang || "",
            episode_current: data.movie.episode_current || "",
            episode_total: data.movie.episode_total || "",
            episodes: (data.episodes[0]?.server_data || []).map((ep) => ({
              name: ep.name || "Tên tập chưa được cung cấp",
              link_m3u8: ep.link_embed || "",
            })),
            totalRatings: 0,
            sumRatings: 0,
            rating: 0,
            day_added: createdTime,
            day_modified: modifiedTime,
          };

          // Kiểm tra xem phim đã được thêm vào Firestore chưa
          const movieRef = collection(db, "movies");
          const q = query(movieRef, where("name", "==", newMovie.name));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            continue; // Bỏ qua nếu phim đã tồn tại
          }

          // Tiến hành thêm phim mới
          const categoryObjects = data.movie.category.map((cat) => ({
            name: cat.name,
            slug: cat.slug,
          }));

          // Thêm các thể loại mới vào Firestore nếu chưa tồn tại
          for (const cat of categoryObjects) {
            if (!existingCategorySlugs.has(cat.slug)) {
              await handleAddCategory(cat.name, cat.slug);
              existingCategorySlugs.add(cat.slug);
            }
          }

          // Thêm phim vào Firestore
          await addDoc(collection(db, "movies"), {
            ...newMovie,
            category: categoryObjects,
          });
        } else {
          alert(`Không tìm thấy dữ liệu phim trong API: ${url}`);
        }
      } catch (error) {
        console.error(`Lỗi khi thêm phim từ API ${url}:`, error);
        alert(`Có lỗi xảy ra khi thêm phim từ API ${url}: ${error.message}`);
      }
    }

    alert(`Phim đã được thêm thành công!`);

    // Cập nhật danh sách phim sau khi đã xử lý tất cả các API
    const movieSnapshot = await getDocs(collection(db, "movies"));
    const moviesList = movieSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMovies(moviesList);
  };

  const handleUpdateEpisodes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "movies"));
      const movies = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      for (const movie of movies) {
        // Kiểm tra nếu có api và số tập chưa hoàn thành
        if (movie.api && movie.episode_current < movie.episode_total)
          {
          const apiUrl = movie.api;
          const response = await fetch(apiUrl);
          const data = await response.json();
          const currentDate = new Date().toISOString();
          if (data && data.movie) {
            const updatedEpisodes = data.episodes[0].server_data.map((ep) => ({
              name: ep.name,
              link_m3u8: ep.link_embed,
            }));

            // Cập nhật thông tin mới
            await updateDoc(doc(db, "movies", movie.id), {
              episode_current: data.movie.episode_current,
              episode_total: data.movie.episode_total,
              episodes: updatedEpisodes,
              day_modified: currentDate,
            });
            console.log(
              `Đã cập nhật phim: ${movie.name}, Tập: ${data.movie.episode_current}/${data.movie.episode_total}`
            );
          }
        }
      }

      alert("Đã cập nhật tất cả tập phim chưa hoàn thành thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật tập phim:", error);
      alert(`Có lỗi xảy ra khi cập nhật tập phim: ${error.message}`);
    }
  };

  const handleDeleteEpisode = (indexToRemove) => {
    if (window.confirm("Bạn có chắc muốn xóa tập này không?")) {
      setForm((prevForm) => ({
        ...prevForm,
        episodes: prevForm.episodes.filter(
          (_, index) => index !== indexToRemove
        ),
      }));
    }
  };

  const handleRefesh = () => {
    setForm({
      name: "",
      content: "",
      posterUrl: "",
      selectedCategories: [],
      time: "",
      country: "",
      year: "",
      quality: "",
      lang: "",
      episode_current: "",
      episode_total: "",
      episodes: [{ name: "", link_m3u8: "" }],
    });
    setEditMode(false);
    setCurrentMovieId(null);
    setSelectedCategories([]);
    setrating(null);
    setsumRatings(null);
    settotalRatings(null);
    setShowMovieForm(false);
  };

  return (
    <div>
      <AdminHeader />
      <div className="movie-management">
        <h2>Quản lý Phim</h2>
        {/* Form quản lý phim */}
        <h3
          onClick={() => setShowMovieForm((prev) => !prev)}
          style={{ cursor: "pointer" }}
        >
          Thêm/ Cập nhật Phim {showMovieForm ? "▲" : "▼"}
        </h3>
        {showMovieForm && (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Tên phim"
              value={form.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              required
            />
            <textarea
              placeholder="Mô tả phim"
              value={form.content}
              onChange={(e) => handleFormChange("content", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="URL Poster"
              value={form.posterUrl}
              onChange={(e) => handleFormChange("posterUrl", e.target.value)}
              required
            />
            <h3 className="categories-title">Thể loại</h3>
            <div className="categories-list">
              {categories.map((category) => (
                <label key={category.id} className="category-item">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.slug)}
                    onChange={() => handleCategorySelect(category.slug)}
                    className="category-checkbox"
                  />
                  <span className="category-name">{category.name}</span>
                </label>
              ))}
            </div>

            <input
              type="text"
              placeholder="Thời lượng"
              value={form.time}
              onChange={(e) => handleFormChange("time", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Quốc gia"
              value={form.country}
              onChange={(e) => handleFormChange("country", e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Năm phát hành"
              value={form.year}
              onChange={(e) => handleFormChange("year", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Chất lượng"
              value={form.quality}
              onChange={(e) => handleFormChange("quality", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Ngôn ngữ"
              value={form.lang}
              onChange={(e) => handleFormChange("lang", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Số tập hiện tại"
              value={form.episode_current}
              onChange={(e) =>
                handleFormChange("episode_current", e.target.value)
              }
              required
            />
            <input
              type="text"
              placeholder="Tổng số tập"
              value={form.episode_total}
              onChange={(e) =>
                handleFormChange("episode_total", e.target.value)
              }
              required
            />
            <h3
              onClick={() => setShowEpisode((prev) => !prev)}
              style={{ cursor: "pointer" }}
            >
              Tập phim {showEpisode ? "▲" : "▼"}
            </h3>

            {showEpisode && (
              <div>
                {form.episodes.map((episode, index) => (
                  <div key={index} className="episode">
                    <input
                      type="text"
                      placeholder={`Tên tập ${index + 1}`}
                      value={episode.name}
                      onChange={(e) =>
                        handleEpisodeChange(index, "name", e.target.value)
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder={`Link tập ${index + 1}`}
                      value={episode.link_m3u8}
                      onChange={(e) =>
                        handleEpisodeChange(index, "link_m3u8", e.target.value)
                      }
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteEpisode(index)}
                      style={{
                        marginLeft: "10px",
                        backgroundColor: "#ff4d4d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button type="button" onClick={handleRefesh}>
              Làm mới
            </button>
            <button type="button" onClick={handleAddEpisode}>
              Thêm tập mới
            </button>

            <button type="submit">
              {editMode ? "Cập nhật phim" : "Thêm phim"}
            </button>
          </form>
        )}

        {/* <input
          type="text"
          placeholder="Nhập URL API"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
        /> */}
        {/* <button onClick={handleAddFromApi}>Thêm từ API</button> */}
        {/* <button onClick={handleUpdateEpisodes}>Cập nhật tất cả tập phim</button> */}
        {/* <button onClick={() => navigate("/admin")}>Trở về</button> */}

        <input
          type="text"
          placeholder="Tìm kiếm phim..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="tables-container">
          <table className="movie-table">
            <thead>
              <tr>
                <th>Tên phim</th>
                <th>Thể loại</th>
                <th>Năm</th>
                {/* <th>Ngày thêm</th> */}
                <th>Ngày chỉnh sửa</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.map((movie) => (
                <tr key={movie.id}>
                  <td>{movie.name}</td>
                  <td>{movie.category.map((cat) => cat.name).join(", ")}</td>
                  <td>{movie.year}</td>
                  {/* <td>{new Date(movie.day_added).toLocaleDateString()}</td> */}
                  <td>{new Date(movie.day_modified).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEdit(movie)}>Chỉnh sửa</button>
                    <button onClick={() => handleDelete(movie.id)}>Xóa</button>
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

export default MovieManagement;
