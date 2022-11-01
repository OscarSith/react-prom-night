import React, { useEffect, useState } from "react";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
// import Cargando from '../components/Cargando'

export const Auth = React.createContext();

export const AuthContext = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setShowChild(true);
    });
  }, []);

  const signout = (callback) => {
    signOut(auth)
      .then(() => {
        callback();
      })
      .catch((err) => console.log(err));
  };

  if (!showChild) {
    // return <Cargando/>;
    return <div>Cargando...</div>;
  } else {
    return (
      <Auth.Provider value={{ usuario, signout }}>{children}</Auth.Provider>
    );
  }
};
