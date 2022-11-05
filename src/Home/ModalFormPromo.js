import React, { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { app } from "../firebaseConfig";

const DOC_NAME = "promos";

const ModalFormPromo = ({
  ejecutar,
  setUpdateListPromos,
  cantidadPromos,
  dataToUpdate,
  setDataToUpdate,
}) => {
  const formModal = useRef(null);
  const db = getFirestore(app);

  // useStates
  const [musica, setMusica] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState("");
  const [toggle, setToogle] = useState("none");
  // Constantes
  const TIME_MODAL_TOGGLE = 100;

  useEffect(() => {
    // Para que no se ejecuta al inicio y
    // abra el modal sin presionar el boton de abrir modal
    if (ejecutar) {
      setToogle("block");
      setTimeout(() => setShow("show"), TIME_MODAL_TOGGLE);

      printValues();
    }
  }, [ejecutar]);

  const printValues = () => {
    if (dataToUpdate) {
      for (const element of formModal.current.elements) {
        if (element.type !== "button" && element.type !== "submit") {
          if (dataToUpdate.get(element.name)) {
            let value = dataToUpdate.get(element.name);
            if (
              element.name === "fecha_inicio" ||
              element.name === "fecha_fin"
            ) {
              value = value
                .toDate()
                .toJSON()
                .substr(0, 16);
            } else if (element.name.indexOf("permisos") > -1) {
              element.checked = value;
              if (element.name.indexOf("music") > -1 && value) {
                setMusica(true);
              }
              continue;
            } else if (element.name === "imagenFondo") {
              if (element.value === value) {
                element.checked = true;
              }
              continue;
            }
            element.value = value;
          }
        }
      }
    }
  };

  const handlerSubmitPromo = (event) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(formModal.current);
    let data = {};
    let permisos = {};

    for (const pair of formData.entries()) {
      if (pair[0].indexOf("permisos") > -1) {
        const key = pair[0].split(".")[1];
        permisos[key] = pair[1];
      } else if (pair[0] === "fecha_inicio" || pair[0] === "fecha_fin") {
        data[pair[0]] = Timestamp.fromDate(new Date(pair[1]));
      } else if (
        pair[0] !== "musica_descripcion" ||
        pair[0] !== "imagenFondo"
      ) {
        data[pair[0]] = pair[1];
      }
    }

    data["permisos"] = permisos;
    data["musica"] = {
      auspiciador1: null,
      auspiciador2: null,
      descripcion: formData.get("musica_descripcion"),
      imagenFondo: formData.get("imagenFondo"),
    };

    if (dataToUpdate) {
      const docRef = doc(db, DOC_NAME, dataToUpdate.id);
      updateDoc(docRef, data)
        .then((_) => {
          success();
        })
        .finally(finallyFn);
    } else {
      data["order"] = ++cantidadPromos;
      console.log(cantidadPromos);

      addDoc(collection(db, DOC_NAME), data)
        .then(async (promoRef) => {
          await updateDoc(promoRef, { id: promoRef.id });
          success();
        })
        .finally(finallyFn);
    }
  };

  const success = () => {
    modalClose();
    setUpdateListPromos((prevState) => ++prevState);
  };
  const finallyFn = (_) => {
    setLoading(false);
    formModal.current.reset();
  };

  const modalClose = () => {
    setToogle("none");
    setTimeout(() => setShow(""), TIME_MODAL_TOGGLE);
    formModal.current.reset();
    setDataToUpdate(null);
    setMusica(false);
  };

  const onChangeMusicaSeccion = (event) => {
    setMusica(event.currentTarget.checked);
  };

  const printBotonSubmit = () => {
    if (dataToUpdate) {
      return !loading ? "Actualizar" : "Actualizando...";
    } else {
      return !loading ? "Agregar" : "Agregando...";
    }
  };

  return (
    <>
      <div
        className={"modal fade " + show}
        id="exampleModal"
        tabIndex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
        style={{ display: toggle }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <form ref={formModal} onSubmit={handlerSubmitPromo}>
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="exampleModalLabel">
                  Nueva promoción
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={modalClose}
                ></button>
              </div>
              <div className="modal-body">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="nombre"
                    placeholder="Nombre"
                    name="nombre"
                  />
                  <label htmlFor="nombre">Nombre</label>
                </div>
                <div className="row">
                  <div className="col">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="dia"
                        placeholder="Dia"
                        name="dia"
                      />
                      <label htmlFor="dia">Día</label>
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-floating mb-3">
                      <input
                        type="text"
                        className="form-control"
                        id="lugar"
                        placeholder="Lugar"
                        name="lugar"
                      />
                      <label htmlFor="lugar">Lugar</label>
                    </div>
                  </div>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="punto_entuentro"
                    placeholder="Punto de encuentro"
                    name="punto_encuentro"
                  />
                  <label htmlFor="punto_entuentro">Punto de encuentro</label>
                </div>
                <div className="row">
                  <div className="col">
                    <div className="form-floating mb-3">
                      <input
                        type={"datetime-local"}
                        className="form-control"
                        id="fecha_inicio"
                        placeholder="Fecha de inicio"
                        name="fecha_inicio"
                      />
                      <label htmlFor="fecha_inicio">Fecha de inicio</label>
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-floating mb-3">
                      <input
                        type={"datetime-local"}
                        className="form-control"
                        id="fecha_fin"
                        placeholder="Fecha de fin"
                        name="fecha_fin"
                      />
                      <label htmlFor="fecha_fin">Fecha de fin</label>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-7">
                    <div className="form-floating mb-3">
                      <textarea
                        className="form-control"
                        id="descripcion"
                        placeholder="Descripción"
                        rows={5}
                        name="descripcion"
                        style={{ height: "120px" }}
                      />
                      <label htmlFor="descripcion">Descripción</label>
                    </div>
                  </div>
                  <div className="col-auto">
                    <h4>Secciones</h4>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="true"
                        id="mejor_amigo"
                        name="permisos.bestFriend"
                      />
                      <label className="form-check-label" htmlFor="mejor_amigo">
                        Mejor amigo
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="true"
                        id="musica"
                        name="permisos.music"
                        onChange={onChangeMusicaSeccion}
                      />
                      <label className="form-check-label" htmlFor="musica">
                        Música
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        value="true"
                        id="reserva_lugar"
                        name="permisos.place"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="reserva_lugar"
                      >
                        Reserva lugar
                      </label>
                    </div>
                  </div>
                </div>
                <div className={"row " + (!musica ? "d-none" : "")}>
                  <div className="col-12">
                    <hr />
                    <h4 className="text-center">Configuración de música</h4>
                  </div>
                  <div className="col-7">
                    <div className="form-floating">
                      <textarea
                        className="form-control"
                        id="musica_descripcion"
                        placeholder="Descripción de la página de musica"
                        rows={5}
                        name="musica_descripcion"
                        style={{ height: "60px" }}
                      />
                      <label htmlFor="musica_descripcion">
                        Descripción de la página de musica
                      </label>
                    </div>
                  </div>
                  <div className="col-auto align-self-center">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="imagenFondo"
                        id="imagen1"
                        value="FONDO-music.png"
                      />
                      <label className="form-check-label" htmlFor="imagen1">
                        Fondo 1
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="imagenFondo"
                        id="imagen2"
                        value="FONDO-music2.png"
                      />
                      <label className="form-check-label" htmlFor="imagen2">
                        Fondo 2
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={modalClose}
                  disabled={!!loading}
                >
                  Cerrar
                </button>
                <button className="btn btn-primary" disabled={!!loading}>
                  {printBotonSubmit()}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {show === "show" ? <div className="modal-backdrop fade show"></div> : ""}
    </>
  );
};

export { ModalFormPromo };
