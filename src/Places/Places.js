import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
} from "firebase/firestore";
import { app } from "../firebaseConfig";

import { MainLayout } from "../Components/MainLayout";
import { ModalFormPlace } from "./ModalFormPlace";

const Places = () => {
  const db = getFirestore(app);
  const shouldLoad = useRef(true);

  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoId, setPromoId] = useState(null);
  const [lugar, setLugar] = useState({});
  const [show, setShow] = useState(null);
  const [ejecutar, setEjecutar] = useState(0);

  useEffect(() => {
    if (shouldLoad.current) {
      const q = query(collection(db, "promos"), orderBy("order", "desc"));
      getDocs(q).then((data) => {
        setPromos(data.docs);
      });
    }

    return () => {
      shouldLoad.current = false;
    };
  }, []);

  const handlerChangePromo = (event) => {
    setLoading(true);
    const currentIdPromo = event.currentTarget.value;
    setPromoId(currentIdPromo);

    const docRef = doc(db, "promo_lugares", currentIdPromo);
    getDoc(docRef)
      .then((docSnap) => {
        setLugar(docSnap.data());
      })
      .finally(finallyFn);
  };

  const finallyFn = () => {
    setLoading(false);
  };

  const printPlaces = () => {
    let items = [];
    for (const item in lugar) {
      const order = parseInt(item.split("_")[1]);
      items.push({
        order,
        item: (
          <div className="accordion-item" key={order}>
            <h2 className="accordion-header" id={"heading" + order}>
              <button
                className={
                  "accordion-button " + (order === show ? "" : "collapsed")
                }
                type="button"
                aria-expanded={order === show ? "true" : "false"}
                aria-controls={"collapse" + order}
                onClick={handlerOpenData}
                data-order={order}
              >
                <strong>{item}</strong> - {lugar[item].total} mesas
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
        ),
      });
    }

    return items.sort((a, b) => a.order - b.order);
  };

  const handlerOpenData = (event) => {
    const order = parseInt(event.currentTarget.getAttribute("data-order"));
    const isCollapsed = event.currentTarget.classList.contains("collapsed");
    if (!isCollapsed) {
      setShow(null);
    } else {
      setShow(order);
    }
  };

  const modalOpen = () => {
    setEjecutar((previousData) => ++previousData);
  };

  return (
    <MainLayout>
      <h1>Listado de Lugares</h1>
      <div className="row mb-3">
        <div className="col-4 d-flex">
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
          <button
            type="button"
            className="btn btn-secondary me-3 d-none"
            onClick={modalOpen}
          >
            Nuevo
          </button>
        </div>
      </div>
      <div className="row">
        <div className="accordion">
          {printPlaces().map((item) => {
            return item.item;
          })}
        </div>
      </div>
      <ModalFormPlace ejecutar={ejecutar} />
    </MainLayout>
  );
};

export { Places };
