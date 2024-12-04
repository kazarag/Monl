// movieService.js

import { db, storage } from '../firebase';
import { 
    collection, 
    addDoc, 
    doc, 
    getDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    getDocs 
} from 'firebase/firestore';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'firebase/storage';

const movieCollection = collection(db, 'movies');

export const addMovie = async (movie) => {
    try {
        const docRef = await addDoc(movieCollection, movie);
        return docRef.id;
    } catch (error) {
        console.error('Error adding movie: ', error);
        throw error;
    }
};

export const updateMovie = async (movieId, updatedMovie) => {
    try {
        const movieRef = doc(db, 'movies', movieId);
        await updateDoc(movieRef, updatedMovie);
    } catch (error) {
        console.error('Error updating movie: ', error);
        throw error;
    }
};

export const deleteMovie = async (movieId) => {
    try {
        const movieRef = doc(db, 'movies', movieId);
        await deleteDoc(movieRef);
    } catch (error) {
        console.error('Error deleting movie: ', error);
        throw error;
    }
};

export const uploadMovieFile = async (file, filePath) => {
    try {
        const fileRef = ref(storage, filePath);
        await uploadBytes(fileRef, file);
        const fileUrl = await getDownloadURL(fileRef);
        return fileUrl;
    } catch (error) {
        console.error('Error uploading movie file: ', error);
        throw error;
    }
};


export const getMovie = async (movieId) => {
    try {
        const movieRef = doc(firestore, 'movies', movieId);
        const movieSnap = await getDoc(movieRef);
        if (movieSnap.exists()) {
            return { id: movieSnap.id, ...movieSnap.data() };
        } else {
            throw new Error('Movie not found');
        }
    } catch (error) {
        console.error('Error fetching movie: ', error);
        throw error;
    }
};

export const getMovies = async (criteria = {}) => {
    try {
        let q = query(movieCollection);
        
        if (criteria.genre) {
            q = query(q, where('genre', '==', criteria.genre));
        }
        if (criteria.title) {
            q = query(q, where('title', '==', criteria.title));
        }
        // Add more criteria as needed
        
        const querySnapshot = await getDocs(q);
        const movies = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return movies;
    } catch (error) {
        console.error('Error fetching movies: ', error);
        throw error;
    }
};
export const getMovieEpisodeUrl = async (slug, episodeNumber) => {
    try {
        // Tạo query để tìm tập phim theo slug và số tập
        const q = query(
            collection(firestore, 'episodes'),
            where('slug', '==', slug),
            where('episodeNumber', '==', episodeNumber)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const episodeDoc = querySnapshot.docs[0];
            const episodeData = episodeDoc.data();
            const fileRef = ref(storage, episodeData.filePath);
            const fileUrl = await getDownloadURL(fileRef);
            return fileUrl;
        } else {
            throw new Error('Episode not found');
        }
    } catch (error) {
        console.error('Error fetching episode URL: ', error);
        throw error;
    }
};