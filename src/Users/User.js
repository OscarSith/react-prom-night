import React, { useEffect, useRef, useState } from "react";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import readXlsxFile from "read-excel-file";
import { app } from "../firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { MainLayout } from "../Components/MainLayout";
import { TableOverlay } from "../Home/HomeStyles";

const User = () => {
  const db = getFirestore(app);
  const fileExcel = useRef(null);

  const [alumnos, setAlumnos] = useState([]);
  const [promos, setPromos] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [promoId, setPromoId] = useState(null);

  useEffect(() => {
    if (mounted) {
      const q = query(collection(db, "promos"), orderBy("order", "desc"));
      getDocs(q).then((data) => {
        setPromos(data.docs);
      });
    } else {
      setMounted(true);
    }
  }, [mounted]);

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
    const file = fileExcel.current.files[0];
    if (file) {
      setLoading(true);
      readXlsxFile(file)
        .then(async (rows) => {
          for (let i = 0; i < rows.length; i++) {
            if (i > 0) {
              const newDoc = {
                nombres: rows[i][0],
                apellidos: rows[i][1],
                correo: rows[i][2],
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
        <div className="col-3">
          <select
            className="form-select"
            disabled={!promos.length}
            onChange={handlerChangePromo}
            id="select-promos"
          >
            <option>
              {!promos.length ? "Cargando lista..." : "Seleccione"}
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
        <div className="col-5 d-flex">
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
                  <th>Celular</th>
                  <th>Correo</th>
                  <th>Fecha Inicio</th>
                  <th>Género</th>
                  <th>Fecha</th>
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
                      <td>{data.celular}</td>
                      <td>{data.correo}</td>
                      <td>{data.sexo}</td>
                      <td>
                        {data.fecha
                          ? data.fecha.toDate().toLocaleDateString()
                          : ""}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-success btn-sm me-2 d-none"
                          data-id={alumno.id}
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export { User };
