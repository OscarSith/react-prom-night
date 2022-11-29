import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useContext, useState } from "react";
import { MainLayout } from "../Components/MainLayout";
import { db } from "../firebaseConfig";
import { Context } from "../Store/promos-context";

const Voto = () => {
  const [alumnos, setAlumnos] = useState([]);
  const { promociones } = useContext(Context);

  const handlerChangePromo = (event) => {
    const currentIdPromo = event.currentTarget.value;
    const q = query(
      collection(db, "promo_alumnos"),
      where("idPromo", "==", currentIdPromo),
      orderBy("apellidos")
    );
    getDocs(q).then((data) => {
      const lista_alumnos = data.docs
        .map((alumno) => {
          const dataAlumno = alumno.data();
          return {
            nombres_apellidos: dataAlumno.nombres + " " + dataAlumno.apellidos,
            votos: dataAlumno.votos ? dataAlumno.votos.length : 0,
          };
        })
        .filter((alumno) => alumno.votos > 0)
        .sort((a, b) => b.votos - a.votos)
        .filter((_, i) => i < 10);
      setAlumnos(lista_alumnos);
    });
  };

  return (
    <MainLayout>
      <h2 className="text-center">Los 10 mas votados</h2>
      <div className="row mb-3">
        <div className="col col-lg-3">
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
        <div className="col col-lg-6">
          <ul className="list-group">
            {alumnos.map((alumno, i) => {
              return (
                <li
                  className="list-group-item d-flex justify-content-between align-items-center"
                  key={i}
                >
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
