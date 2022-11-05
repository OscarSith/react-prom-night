import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "../AuthContext";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
} from "firebase/firestore";
import { app } from "../firebaseConfig";
import { ModalFormPromo } from "./ModalFormPromo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { TableOverlay } from "./HomeStyles";

const Home = () => {
  const db = getFirestore(app);
  const { signout } = useContext(Auth);
  const navigate = useNavigate();

  // use states
  const [promociones, setPromociones] = useState([]);
  const [updateListPromos, setUpdateListPromos] = useState(0);
  const [ejecutar, setEjecutar] = useState(0);
  const [dataToUpdate, setDataToUpdate] = useState(null);
  const [loading, setLoading] = useState(false);

  const logout = () => {
    signout(() => navigate("/login"));
  };

  useEffect(() => {
    if (updateListPromos > 0) {
      setLoading(true);
      const q = query(collection(db, "promos"), orderBy("order", "desc"));
      getDocs(q)
        .then((data) => {
          setPromociones(data.docs);
        })
        .finally(finallyFn);
    } else {
      setUpdateListPromos(1);
    }
  }, [updateListPromos]);

  const modalOpen = () => {
    setEjecutar((previousData) => ++previousData);
  };

  const handlerEdit = (event) => {
    const id = event.currentTarget.getAttribute("data-id");
    const promo = promociones.find((promo) => promo.get("id") === id);

    setDataToUpdate(promo);
    modalOpen();
  };

  const handlerDelete = (event) => {
    if (window.confirm("Seguro de eliminar esta promoción?")) {
      const id = event.currentTarget.getAttribute("data-id");
      setLoading(true);
      deleteDoc(doc(db, "promos", id))
        .then((_) => {
          setUpdateListPromos((prev) => ++prev);
        })
        .finally(finallyFn);
    }
  };

  const finallyFn = () => {
    setLoading(false);
  };

  return (
    <>
      <header>
        <h1 className="text-center mt-4">PromNight Admin</h1>
        <button onClick={logout} className="btn btn-secondary mx-auto d-block">
          Cerrar sesión
        </button>
      </header>
      <main>
        <div className="container">
          <p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={modalOpen}
            >
              Nueva Promoción
            </button>
          </p>
          <div className="row">
            <div className="col">
              <div className="table-responsive position-relative">
                <TableOverlay
                  className={
                    "position-absolute w-100 bg-white " +
                    (!loading ? "d-none" : "")
                  }
                  style={{ "--bs-bg-opacity": 0.6 }}
                ></TableOverlay>
                <table className="table table-hover">
                  <thead>
                    <tr className="table-dark">
                      <th>Nombre</th>
                      <th>Dia</th>
                      <th>Lugar</th>
                      <th>Fecha Inicio</th>
                      <th>Fecha Fin</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {promociones.length > 0 ? (
                      promociones.map((promo) => {
                        const data = promo.data();
                        return (
                          <tr key={promo.id}>
                            <td>{data.nombre}</td>
                            <td>{data.dia}</td>
                            <td>{data.lugar}</td>
                            <td>
                              {data.fecha_inicio
                                ? data.fecha_inicio
                                    .toDate()
                                    .toLocaleDateString()
                                : ""}
                            </td>
                            <td>
                              {data.fecha_fin
                                ? data.fecha_fin.toDate().toLocaleDateString()
                                : ""}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-success btn-sm me-2"
                                data-id={promo.id}
                                onClick={handlerEdit}
                              >
                                <FontAwesomeIcon icon={solid("edit")} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                data-id={promo.id}
                                onClick={handlerDelete}
                              >
                                <FontAwesomeIcon icon={solid("trash")} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center">
                          Cargando datos...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <ModalFormPromo
          ejecutar={ejecutar}
          setUpdateListPromos={setUpdateListPromos}
          cantidadPromos={promociones.length}
          dataToUpdate={dataToUpdate}
          setDataToUpdate={setDataToUpdate}
        />
      </main>
    </>
  );
};

export { Home };
