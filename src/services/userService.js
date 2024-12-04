// userService.js

import { db } from '../firebase';
import { collection, addDoc, getDoc, updateDoc, query, where, getDocs } from 'firebase/firestore';

const userCollection = collection(db, 'users');

export const addUser = async (user) => {
  try {
    const docRef = await addDoc(userCollection, user);
    return docRef.id;
  } catch (error) {
    console.error('Error adding user: ', error);
    throw error;
  }
};

export const updateUser = async (userId, updatedUser) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updatedUser);
  } catch (error) {
    console.error('Error updating user: ', error);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error fetching user: ', error);
    throw error;
  }
};

export const getUsers = async (criteria = {}) => {
  try {
    let q = query(userCollection);
    if (criteria.role) {
      q = query(q, where('role', '==', criteria.role));
    }
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return users;
  } catch (error) {
    console.error('Error fetching users: ', error);
    throw error;
  }
};
const watchHistoryCollection = collection(db, 'watchHistory');

export const getUserWatchHistory = async (userId) => {
    try {
        const q = query(watchHistoryCollection, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const history = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return history;
    } catch (error) {
        console.error('Error fetching watch history: ', error);
        throw error;
    }
};