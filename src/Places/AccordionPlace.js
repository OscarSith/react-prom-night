import React, { useState } from "react";

const AccordionPlace = ({ order, item, lugar }) => {
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
    <div className="accordion-item" key={order}>
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
            {lugar[item].sillas.map((item, i) => {
              return (
                <div className="col-3" key={i}>
                  <strong>Silla {item.silla}</strong>
                  <p>{item.nombre}</p>
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
