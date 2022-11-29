import React, { useState } from "react";

const AccordionPlace = ({ order, item, lugar, deleteChair, loadingChair }) => {
  const [show, setShow] = useState(null);

  const handlerOpenData = (event) => {
    const order = parseInt(event.currentTarget.getAttribute("data-order"));
    const isCollapsed = event.currentTarget.classList.contains("collapsed");
    if (!isCollapsed) {
      setShow(null);
    } else {
      setShow(order);
    }
  };

  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id={"heading" + order}>
        <button
          className={"accordion-button " + (order === show ? "" : "collapsed")}
          type="button"
          aria-expanded={order === show ? "true" : "false"}
          aria-controls={"collapse" + order}
          onClick={handlerOpenData}
          data-order={order}
        >
          <strong>{item}</strong> - {lugar[item].total} sillas
        </button>
      </h2>
      <div
        id={"collapse" + order}
        className={
          "accordion-collapse collapse " + (order === show ? "show" : "")
        }
        aria-labelledby={"heading" + order}
      >
        <div className="accordion-body">
          <div className="row">
            {lugar[item].sillas.map((subItem, i) => {
              return (
                <div className="col-6 col-lg-3" key={i}>
                  <strong>Silla {subItem.silla}</strong>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-danger pt-0"
                    onClick={deleteChair}
                    silla={i}
                    mesa={item}
                    disabled={loadingChair}
                  >
                    Eliminar
                  </button>
                  <p className="small">{subItem.nombre}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export { AccordionPlace };
