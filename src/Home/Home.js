import React, { useContext, useEffect, useRef, useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";

import { ModalFormPromo } from "./ModalFormPromo";
import { MainLayout } from "../Components/MainLayout";
import { Context } from "../Store/promos-context";

import { TableOverlay } from "./HomeStyles";

const Home = () => {
  const shouldLoad = useRef(true);
  const { promociones, obtenerPromociones } = useContext(Context);

  // use states
  const [updateListPromos, setUpdateListPromos] = useState(0);
  const [ejecutar, setEjecutar] = useState(0);
  const [dataToUpdate, setDataToUpdate] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (updateListPromos) {
      shouldLoad.current = false;
      obtenerPromociones();
    }
  }, [updateListPromos, obtenerPromociones]);

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
    <MainLayout>
      <p>
        <button type="button" className="btn btn-primary" onClick={modalOpen}>
          Nueva Promoción
        </button>
      </p>
      <div className="row">
        <div className="col">
          <div className="table-responsive position-relative">
            <TableOverlay
              className={
                "position-absolute w-100 bg-white " + (!loading ? "d-none" : "")
              }
              style={{ "--bs-bg-opacity": 0.6 }}
            ></TableOverlay>
            <table className="table table-hover small">
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
                            ? data.fecha_inicio.toDate().toLocaleDateString()
                            : ""}
                        </td>
                        <td>
                          {data.fecha_fin
                            ? data.fecha_fin.toDate().toLocaleDateString()
                            : ""}
                        </td>
                        <td>
                          <div className="d-flex">
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
                          </div>
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
      <ModalFormPromo
        ejecutar={ejecutar}
        setUpdateListPromos={setUpdateListPromos}
        cantidadPromos={promociones.length}
        dataToUpdate={dataToUpdate}
        setDataToUpdate={setDataToUpdate}
      />
    </MainLayout>
  );
};

export { Home };
