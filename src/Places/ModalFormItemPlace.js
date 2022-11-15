import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";

const ModalFormItemPlace = ({
  lugar,
  removeTable,
  changeChairsNumber,
  index,
  placesLength,
}) => {
  return (
    <div className="row mb-1">
      <div className="col d-flex">
        <span className="d-inline-block me-2 w-25 pt-1">Mesa {lugar.mesa}</span>
        <input
          type="number"
          className="form-control form-control-sm w-25 me-3"
          min="1"
          data-id={lugar.mesa}
          placeholder="Sillas"
          defaultValue={lugar.total}
          onChange={changeChairsNumber}
        />
        <button
          type="button"
          onClick={removeTable}
          className={
            "btn btn-danger btn-sm " +
            (!(index > 0 && index === placesLength - 1) ? "d-none" : "")
          }
          data-id={lugar.mesa}
        >
          {<FontAwesomeIcon icon={solid("trash")} />}
        </button>
      </div>
    </div>
  );
};

export { ModalFormItemPlace };
