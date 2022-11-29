import React, { useContext, useRef, useState } from "react";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import readXlsxFile from "read-excel-file";
import { db } from "../firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { MainLayout } from "../Components/MainLayout";
import { TableOverlay } from "../Home/HomeStyles";
import { ModalUser } from "./Modal/ModalUser";
import { Context } from "../Store/promos-context";

const User = () => {
  const { promociones } = useContext(Context);
  const fileExcel = useRef(null);

  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoId, setPromoId] = useState(null);
  const [ejecutar, setEjecutar] = useState(0);
  const [alumno, setAlumno] = useState(null);

  const handlerChangePromo = (event) => {
    setLoading(true);
    const currentIdPromo = event.currentTarget.value;
    setPromoId(currentIdPromo);

    const q = query(
      collection(db, "promo_alumnos"),
      where("idPromo", "==", currentIdPromo),
      orderBy("apellidos")
    );
    getDocs(q)
      .then((data) => {
        setAlumnos(data.docs);
      })
      .finally(finallyFn);
  };

  const handlerInputfile = () => {
    if (!promoId) {
      alert("Seleccione una promoción primero");
      return;
    }

    const file = fileExcel.current.files[0];
    if (file) {
      setLoading(true);
      readXlsxFile(file)
        .then(async (rows) => {
          for (let i = 0; i < rows.length; i++) {
            if (i > 0) {
              const newDoc = {
                nombres: rows[i][1],
                apellidos: rows[i][2],
                llevaInvitado: rows[i][3],
                idPromo: promoId,
              };
              await addDoc(collection(db, "promo_alumnos"), newDoc);
            }
          }
        })
        .finally((_) => {
          fileExcel.current.value = "";
          updateListAlumnos();
        });
    } else {
      alert("Escoja un archivo excel");
    }
  };

  const handlerDelete = (event) => {
    if (window.confirm("Seguro de eliminar este alumno?")) {
      const id = event.currentTarget.getAttribute("data-id");
      setLoading(true);
      deleteDoc(doc(db, "promo_alumnos", id))
        .then((_) => {
          updateListAlumnos();
        })
        .finally(finallyFn);
    }
  };

  const handlerEdit = async (event) => {
    const currentElement = event.currentTarget;
    const id = currentElement.getAttribute("id");
    currentElement.disabled = true;
    const alumno = await getDoc(doc(db, "promo_alumnos", id));

    setAlumno(alumno);
    setEjecutar(1);
    currentElement.disabled = false;
  };

  const updateListAlumnos = () => {
    const input = document.querySelector("#select-promos");
    const ev = new Event("change", { bubbles: true });
    input.dispatchEvent(ev);
  };

  const finallyFn = () => {
    setLoading(false);
  };

  return (
    <MainLayout>
      <h2 className="text-center">Lista de alumnos</h2>
      <div className="row mb-3">
        <div className="col-12 col-lg-3 mb-3 mb-lg-0">
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
            {promociones.map((promo) => {
              return (
                <option value={promo.id} key={promo.id}>
                  {promo.get("nombre")}
                </option>
              );
            })}
          </select>
        </div>
        <div className="col-12 col-lg-5 d-flex">
          <input
            type="file"
            className="form-control me-2"
            ref={fileExcel}
            disabled={loading}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlerInputfile}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Subir"}
          </button>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="mb-3">
            <strong>Total de alumnos: {alumnos.length}</strong>
          </div>
          <div className="table-responsive position-relative">
            <TableOverlay
              className={
                "position-absolute w-100 bg-white " + (!loading ? "d-none" : "")
              }
              style={{ "--bs-bg-opacity": 0.6 }}
            ></TableOverlay>
            <table className="table table-hover">
              <thead>
                <tr className="table-dark">
                  <th>Nombre completo</th>
                  <th>Acompañante</th>
                  <th>Celular</th>
                  <th>Correo</th>
                  <th>Género</th>
                  <th>Registro</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map((alumno) => {
                  const data = alumno.data();
                  return (
                    <tr key={alumno.id}>
                      <td>
                        {data.nombres} {data.apellidos}
                      </td>
                      <td>{data.llevaInvitado}</td>
                      <td>{data.celular}</td>
                      <td>{data.correo}</td>
                      <td>{data.sexo}</td>
                      <td>
                        {data.fecha
                          ? data.fecha.toDate().toLocaleDateString()
                          : ""}
                      </td>
                      <td>
                        <div className="d-flex">
                          <button
                            type="button"
                            className="btn btn-success btn-sm me-2"
                            id={alumno.id}
                            onClick={handlerEdit}
                          >
                            <FontAwesomeIcon icon={solid("edit")} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            data-id={alumno.id}
                            onClick={handlerDelete}
                          >
                            <FontAwesomeIcon icon={solid("trash")} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {ejecutar ? (
        <ModalUser
          ejecutar={ejecutar}
          setEjecutar={setEjecutar}
          user={alumno}
          updateListAlumnos={updateListAlumnos}
        />
      ) : (
        ""
      )}
    </MainLayout>
  );
};

export { User };
