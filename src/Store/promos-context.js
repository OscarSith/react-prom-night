import { collection, getDocs, orderBy, query } from "firebase/firestore";
import React, { createContext, useEffect, useRef, useState } from "react";
import { db } from "../firebaseConfig";

export const Context = createContext();

const ProviderPromociones = ({ children }) => {
  const shouldLoad = useRef(true);
  const [promociones, setPromociones] = useState([]);

  useEffect(() => {
    if (shouldLoad.current) {
      shouldLoad.current = false;
      obtenerPromociones();
    }
  }, []);

  const obtenerPromociones = () => {
    const q = query(collection(db, "promos"), orderBy("order", "desc"));
    getDocs(q).then((data) => {
      setPromociones(data.docs);
    });
  };

  const value = {
    promociones,
    obtenerPromociones,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export { ProviderPromociones };
