// authService.js

import { auth } from '../firebase/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
const USERS="user";
export const signup = (email, password, fullname, phone, role) => {
  auth()
    .createUserWithEmailAndPassword(email, password)
    .then(() => {
      USERS.doc(email).set({
        email,
        password,
        fullname,
        phone,
        role,
      });
    })
    .catch(e => console.log(e.message));
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in user: ', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out user: ', error);
    throw error;
  }
};
