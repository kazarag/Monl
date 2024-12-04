import axios from 'axios';

const API_BASE_URL = 'https://phimapi.com/v1/api';

const apiService = {
  getAnimatedMovies: async (pageId = 1) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/danh-sach/hoat-hinh`, {
        params: { page: pageId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching animated movies:', error);
      throw error;
    }
  },
  getMovieDetails: (slugMovie) => {
    return axios.get(`${API_BASE_URL}/phim/${slugMovie}`);
  },
  searchMovies: (keyword, limit = 10) => {
    return axios.get(`${API_BASE_URL}/tim-kiem`, {
      params: { keyword, limit }
    });
  }
};

export default apiService;
