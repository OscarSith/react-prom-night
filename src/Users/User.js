import React, { useContext, useRef, useState } from "react";
import { Context } from "../Store/promos-context";
import readXlsxFile from "read-excel-file";
import { db } from "../firebaseConfig";
import {
  addDoc,
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { MainLayout } from "../Components/MainLayout";
import { TableOverlay } from "../Home/HomeStyles";
import { ModalUser } from "./Modal/ModalUser";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";

import { StikyPanel } from "./UserStyles";

const User = () => {
  const { promociones } = useContext(Context);
  const fileExcel = useRef(null);

  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoId, setPromoId] = useState(null);
  const [ejecutar, setEjecutar] = useState(0);
  const [alumno, setAlumno] = useState(null);
  const [votoLoading, setVotoLoading] = useState(false);

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
    setAlumno(alumnos.find((alumno) => alumno.id === id));
    setEjecutar(1);
    currentElement.disabled = false;
  };

  const updateListAlumnos = () => {
    const input = document.querySelector("#select-promos");
    const ev = new Event("change", { bubbles: true });
    input.dispatchEvent(ev);
  };

  const handlerRemoveVote = async (event) => {
    if (window.confirm("Seguro(a) de eliminar el VOTO de este alumno?")) {
      // setVotoLoading(true);
      const id = event.currentTarget.getAttribute("id");
      const alumnoEncontrado = alumnos.find((alumno) => alumno.id === id);
      const nombresCompletos = getFullName(alumnoEncontrado.data());
      let listaAlumnosVotados = [];

      for (let i = 0; i < alumnos.length; i++) {
        const alumno = alumnos[i].data();
        if (alumno.votos) {
          for (let j = 0; j < alumno.votos.length; j++) {
            if (alumno.votos[j] === nombresCompletos) {
              listaAlumnosVotados.push(alumno);
              break;
            }
          }

          if (listaAlumnosVotados.length === 2) break;
        }
      }

      // return;
      try {
        const batch = writeBatch(db);

        const docRef = doc(db, "promo_alumnos", id);
        batch.update(docRef, {
          "acciones.mejor_amigo_elegido": false,
          mejorAmigo: [],
        });

        batch.update(doc(db, "promo_alumnos", listaAlumnosVotados[0].id), {
          votos: arrayRemove(nombresCompletos),
        });

        if (listaAlumnosVotados[1]) {
          batch.update(doc(db, "promo_alumnos", listaAlumnosVotados[1].id), {
            votos: arrayRemove(nombresCompletos),
          });
        }

        await batch.commit();
        setVotoLoading(false);
        updateListAlumnos();
        window.alert("VOTO eliminado con exito");
      } catch (e) {
        setVotoLoading(false);
        window.alert("Hubo un error al eliminar el voto, intentelo de nuevo");
        console.log("La transacción falló: ", e);
      }
    }
  };

  const getFullName = (alumno) => {
    return `${alumno.nombres} ${alumno.apellidos}`;
  };

  const finallyFn = () => {
    setLoading(false);
  };

  return (
    <MainLayout>
      <StikyPanel className="sticky-top">
        <h2 className="text-center">Lista de alumnos</h2>
        <div className="row mb-3">
          <div className="col-12 col-lg-4 mb-3 mb-lg-0 d-flex">
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
            <button
              type="button"
              className="btn btn-secondary btn-sm float-start ms-3"
              title="Actualizar"
              onClick={updateListAlumnos}
              style={{ padding: "0 14px" }}
            >
              <FontAwesomeIcon icon={solid("arrow-rotate-right")} />
            </button>
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
          <div className="col text-end align-self-center">
            <strong>Total de alumnos: </strong>
            <span className="badge bg-dark rounded-pill">{alumnos.length}</span>
          </div>
        </div>
      </StikyPanel>
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
                            className="btn btn-success btn-sm"
                            id={alumno.id}
                            onClick={handlerEdit}
                          >
                            <FontAwesomeIcon icon={solid("edit")} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm mx-2"
                            data-id={alumno.id}
                            onClick={handlerDelete}
                          >
                            <FontAwesomeIcon icon={solid("trash")} />
                          </button>
                          {data.acciones &&
                          data.acciones.mejor_amigo_elegido ? (
                            <button
                              title="Remover VOTO"
                              type="button"
                              className="btn btn-dark btn-sm"
                              id={alumno.id}
                              disabled={votoLoading}
                              onClick={handlerRemoveVote}
                            >
                              <FontAwesomeIcon
                                icon={solid("circle-exclamation")}
                              />
                            </button>
                          ) : (
                            ""
                          )}
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
