import { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase/firebase';  

export const AuthContext = createContext();  

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
    {!loading && children}
  </AuthContext.Provider>
  );
};

export default AuthProvider;
