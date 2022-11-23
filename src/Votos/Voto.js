import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { MainLayout } from "../Components/MainLayout";
import { db } from "../firebaseConfig";

const Voto = () => {
  const shouldLoad = useRef(true);
  const [alumnos, setAlumnos] = useState([]);
  const [promociones, setPromociones] = useState([]);

  useEffect(() => {
    if (shouldLoad.current) {
      const q = query(collection(db, "promos"), orderBy("order", "desc"));
      getDocs(q).then((data) => {
        setPromociones(data.docs);
      });
    }

    return () => {
      shouldLoad.current = false;
    };
  }, []);

  const handlerChangePromo = (event) => {
    // setLoading(true);
    const currentIdPromo = event.currentTarget.value;
    // setPromoId(currentIdPromo);
    const q = query(
      collection(db, "promo_alumnos"),
      where("idPromo", "==", currentIdPromo),
      orderBy("apellidos")
    );
    getDocs(q)
      .then((data) => {
        const lista_alumnos = data.docs
          .map((alumno) => {
            const dataAlumno = alumno.data();
            return {
              nombres_apellidos:
                dataAlumno.nombres + " " + dataAlumno.apellidos,
              votos: dataAlumno.votos ? dataAlumno.votos.length : 0,
            };
          })
          .filter((alumno) => {
            if (alumno.votos > 0) {
              return alumno;
            }
          })
          .sort((a, b) => b.votos - a.votos)
          .filter((_, i) => i < 10);
        setAlumnos(lista_alumnos);
      })
      .finally((_) => {});
  };

  return (
    <MainLayout>
      <h2 className="text-center">Los 10 mas votados</h2>
      <div className="row mb-3">
        <div className="col-3">
          <select
            className="form-select"
            disabled={!promociones.length}
            onChange={handlerChangePromo}
            id="select-promos"
          >
            <option>
              {!promociones.length
                ? "Cargando lista..."
                : "Seleccione una promoción"}
            </option>
            {promociones.map((promocion) => {
              return (
                <option value={promocion.id} key={promocion.id}>
                  {promocion.get("nombre")}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <hr />
      <div className="row mb-3 justify-content-center">
        <div className="col-6">
          <ul className="list-group">
            {alumnos.map((alumno) => {
              return (
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  {alumno.nombres_apellidos}
                  <span className="badge bg-primary rounded-pill">
                    {alumno.votos}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export { Voto };
