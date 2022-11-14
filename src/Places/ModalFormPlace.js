import React, { useEffect, useRef, useState } from "react";

const ModalFormPlace = ({ ejecutar }) => {
  const formModal = useRef(null);

  const [show, setShow] = useState(false);
  const [toggle, setToogle] = useState("none");
  // const [mesas, setMesas] = useState(1);
  const TIME_MODAL_TOGGLE = 100;

  useEffect(() => {
    if (ejecutar) {
      setToogle("block");
      setTimeout(() => setShow("show"), TIME_MODAL_TOGGLE);
    }
  }, [ejecutar]);

  const modalClose = () => {
    setToogle("none");
    setTimeout(() => setShow(""), TIME_MODAL_TOGGLE);
    formModal.current.reset();
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
            <form ref={formModal}>
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
              <div className="modal-body"></div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                  onClick={modalClose}
                >
                  Close
                </button>
                <button type="button" className="btn btn-primary">
                  Save changes
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
