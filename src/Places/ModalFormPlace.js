import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { ModalFormItemPlace } from "./ModalFormItemPlace";

const ModalFormPlace = ({
  ejecutar,
  promoId,
  setUpdateListLugares,
  lugar,
  setEjecutar,
}) => {
  const TIME_MODAL_TOGGLE = 100;

  const [show, setShow] = useState(false);
  const [toggle, setToogle] = useState("none");
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit()) {
      let editLugar = [];
      for (const key in lugar) {
        editLugar.push({
          mesa: parseInt(key.substring(5)),
          total: lugar[key].total,
        });
      }
      editLugar.sort((a, b) => a.mesa - b.mesa);
      setLugares(editLugar);
    }

    setToogle("block");
    setTimeout(() => {
      setShow("show");
    }, TIME_MODAL_TOGGLE);
  }, [ejecutar]);

  const modalClose = () => {
    setToogle("none");
    setTimeout(() => {
      setShow("");
      setEjecutar(0);
    }, TIME_MODAL_TOGGLE);
  };

  const addTable = () => {
    const newLugar = { mesa: lugares.length + 1, total: 0, sillas: [] };
    setLugares((prevState) => [...prevState, newLugar]);
  };

  const removeTable = (event) => {
    const idMesa = parseInt(event.currentTarget.getAttribute("data-id"));
    lugares.splice(idMesa - 1, 1);
    setLugares([...lugares]);
  };

  const changeChairsNumber = (event) => {
    const id = parseInt(event.currentTarget.getAttribute("data-id"));
    lugares.forEach((lugar, i) => {
      if (lugar.mesa === id) {
        lugares[i].total = event.currentTarget.value;
      }
    });

    setLugares(lugares);
  };

  const handlerSaveChairs = async (event) => {
    setLoading(true);
    let mapLugares = {};
    lugares.forEach((lugar) => {
      mapLugares["mesa_" + lugar.mesa] = {
        sillas: [],
        total: lugar.total,
      };
    });

    const refDoc = doc(db, "promo_lugares", promoId);
    if (isEdit()) {
      await updateDoc(refDoc, mapLugares);
    } else {
      await setDoc(refDoc, mapLugares);
    }

    setLoading(false);
    modalClose();
    setLugares([{ mesa: 1, sillas: [], total: 0 }]);
    setUpdateListLugares((prevState) => ++prevState);
  };

  const setButtonStates = () => {
    let message = loading ? "Agregando..." : "Agregar";
    if (isEdit()) {
      message = loading ? "Editando..." : "Editar";
    }
    return message;
  };

  const isEdit = () => {
    return lugar.hasOwnProperty("mesa_1");
  };

  return (
    <>
      <div
        className={"modal fade " + show}
        tabIndex="-1"
        aria-hidden="true"
        aria-labelledby="headerTitle"
        style={{ display: toggle }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <form>
              <div className="modal-header">
                <h5 className="modal-title" id="headerTitle">
                  Agregar mesas y sillas
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
                {lugares.map((lugar, i) => {
                  return (
                    <ModalFormItemPlace
                      key={i}
                      lugar={lugar}
                      removeTable={removeTable}
                      changeChairsNumber={changeChairsNumber}
                      index={i}
                      placesLength={lugares.length}
                    />
                  );
                })}
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={addTable}
                >
                  {<FontAwesomeIcon icon={solid("plus")} />}
                </button>
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
                  type="button"
                  className="btn btn-primary"
                  onClick={handlerSaveChairs}
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

export { ModalFormPlace };
