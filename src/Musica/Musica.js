import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { MainLayout } from "../Components/MainLayout";
import { db } from "../firebaseConfig";

const Musica = () => {
  const shouldLoad = useRef(true);

  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [musicas, setMusicas] = useState([]);

  useEffect(() => {
    if (shouldLoad.current) {
      const q = query(collection(db, "promos"), orderBy("order", "desc"));
      getDocs(q).then((data) => {
        setPromos(data.docs);
      });
    }

    return () => {
      shouldLoad.current = false;
    };
  }, []);

  const handlerChangePromo = (event) => {
    setLoading(true);
    const currentIdPromo = event.currentTarget.value;
    const q = query(
      collection(db, "promo_alumnos"),
      where("idPromo", "==", currentIdPromo)
    );
    getDocs(q)
      .then((data) => {
        setMusicas(data.docs);
      })
      .finally(finallyFn);
  };

  const finallyFn = () => {
    setLoading(false);
  };

  const imprimirMusicaPorAlumno = (musica) => {
    let itemHtml = [];

    musica.forEach((item, i) => {
      itemHtml.push(
        <span className="badge rounded-pill text-bg-dark me-2 my-1" key={i}>
          {item}
        </span>
      );
    });

    return itemHtml.map((badge) => badge);
  };

  return (
    <MainLayout>
      <h2 className="text-center mb-4">Lista de Canciones</h2>
      <div className="row mb-3 justify-content-center">
        <div className="col col-lg-3">
          <select
            className="form-select"
            disabled={!promos.length}
            onChange={handlerChangePromo}
            id="select-promos"
          >
            <option>
              {!promos.length
                ? "Cargando lista..."
                : "Seleccione una promoción"}
            </option>
            {promos.map((promo) => {
              return (
                <option value={promo.id} key={promo.id}>
                  {promo.get("nombre")}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col col-lg-10">
          <div className="list-group">
            {loading ? (
              <strong>Cargando...</strong>
            ) : (
              musicas
                .filter((musica) => {
                  const data = musica.data();
                  return data.acciones && data.acciones.musica.length;
                })
                .map((musica) => {
                  return (
                    <li className="list-group-item" key={musica.id}>
                      {imprimirMusicaPorAlumno(musica.data().acciones.musica)}
                    </li>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export { Musica };
