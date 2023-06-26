import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { db } from "../../firebaseConfig";

const ModalUser = ({ user, ejecutar, setEjecutar, updateListAlumnos }) => {
  const formRef = useRef(null);

  const [show, setShow] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setShow("show");

    const inputs = formRef.current.elements;
    const user_data = user.data();
    for (const key in user_data) {
      if (Object.hasOwnProperty.call(user_data, key)) {
        if (inputs[key]) inputs[key].value = user_data[key];
      }
    }
  }, [ejecutar]);

  const modalClose = () => {
    setShow("");
    setTimeout(() => {
      setEjecutar(0);
    }, 200);
  };

  const setButtonStates = () => {
    let message = loading ? "Agregando..." : "Agregar";
    if (user) {
      message = loading ? "Editando..." : "Editar";
    }
    return message;
  };

  const submitSaveUser = (event) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(formRef.current);
    let data = {};

    for (const pair of formData.entries()) {
      data[pair[0]] = pair[1];
    }

    updateDoc(doc(db, "promo_alumnos", user.id), data)
      .then((_) => {
        modalClose();
        updateListAlumnos();
      })
      .finally((_) => {
        setLoading(false);
        formRef.current.reset();
      });
  };

  return (
    <>
      <div
        className={"modal fade " + show}
        tabIndex="-1"
        aria-hidden="true"
        aria-labelledby="headerTitle"
        style={{ display: "block" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <form ref={formRef} onSubmit={submitSaveUser}>
              <div className="modal-header">
                <h5 className="modal-title" id="headerTitle">
                  Editar Usuario
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={modalClose}
                ></button>
              </div>
              <div className="modal-body">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="nombres"
                    placeholder="Nombre"
                    name="nombres"
                  />
                  <label htmlFor="nombres">Nombre</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="apellidos"
                    placeholder="Apellidos"
                    name="apellidos"
                  />
                  <label htmlFor="apellidos">Apellidos</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="correo"
                    placeholder="Correo electrónico"
                    name="correo"
                  />
                  <label htmlFor="correo">Correo electrónico</label>
                </div>
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="llevaInvitado"
                    placeholder="Nombre del invitado"
                    name="llevaInvitado"
                  />
                  <label htmlFor="llevaInvitado">Nombre del invitado</label>
                </div>
                <div className="row">
                  <div className="col col-lg-6">
                    <div className="form-floating mb-3">
                      <select className="form-select" id="genero" name="sexo">
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                      </select>
                      <label htmlFor="genero">Género</label>
                    </div>
                  </div>
                  <div className="col col-lg-6">
                    <div className="form-floating mb-3">
                      <input
                        type="tel"
                        className="form-control"
                        id="celular"
                        placeholder="Número de celular"
                        name="celular"
                      />
                      <label htmlFor="celular">Número de celular</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                  onClick={modalClose}
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {setButtonStates()}
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

export { ModalUser };
