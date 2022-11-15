import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

import { MainLayout } from "../Components/MainLayout";
import { ModalFormPlace } from "./ModalFormPlace";
import { AccordionPlace } from "./AccordionPlace";

const Places = () => {
  const shouldLoad = useRef(true);

  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoId, setPromoId] = useState(null);
  const [lugar, setLugar] = useState({});
  const [ejecutar, setEjecutar] = useState(0);
  const [updateListLugares, setUpdateListLugares] = useState(0);

  useEffect(() => {
    if (shouldLoad.current) {
      const q = query(collection(db, "promos"), orderBy("order", "desc"));
      getDocs(q).then((data) => {
        setPromos(data.docs);
      });
    }

    if (updateListLugares) {
      const input = document.querySelector("#select-promos");
      const ev = new Event("change", { bubbles: true });
      input.dispatchEvent(ev);
    }

    return () => {
      shouldLoad.current = false;
    };
  }, [updateListLugares]);

  const handlerChangePromo = (event) => {
    const currentIdPromo = event.currentTarget.value;
    if (currentIdPromo === "0") {
      setPromoId(null);
      setLugar({});
      return;
    }

    setLoading(true);
    setPromoId(currentIdPromo);

    // Limpio la variable de los lugares,
    // Porque estableciendolo en {} se vuelve a renderizar el componente
    // y asi el boton de editar se deshabilita por que no tiene lugares
    setLugar({});
    const docRef = doc(db, "promo_lugares", currentIdPromo);
    getDoc(docRef)
      .then((docSnap) => {
        const data = docSnap.data();
        setLugar(data === undefined ? {} : data);
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
        item: <AccordionPlace order={order} item={item} lugar={lugar} />,
      });
    }

    return items.sort((a, b) => a.order - b.order);
  };

  const modalOpen = () => {
    setEjecutar((previousData) => ++previousData);
  };

  const modalOpenEdit = () => {
    setEjecutar((previousData) => ++previousData);
  };

  return (
    <MainLayout>
      <h1>Listado de Lugares</h1>
      <div className="row mb-3">
        <div className="col-4 d-flex">
          <select
            className="form-select me-3"
            disabled={!promos.length}
            onChange={handlerChangePromo}
            id="select-promos"
          >
            <option value="0">
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
          {promoId ? (
            <button
              type="button"
              className={
                "btn btn-info " +
                (lugar.hasOwnProperty("mesa_1") ? "d-none" : "")
              }
              onClick={modalOpen}
            >
              Nuevo
            </button>
          ) : (
            ""
          )}
          <button
            type="button"
            className={
              "btn btn-success " +
              (!lugar.hasOwnProperty("mesa_1") ? "d-none" : "")
            }
            onClick={modalOpenEdit}
          >
            Editar
          </button>
        </div>
      </div>
      <div className="row">
        <div className="accordion">
          {loading ? (
            <p>Cargando...</p>
          ) : (
            printPlaces().map((item) => {
              return item.item;
            })
          )}
        </div>
      </div>
      {!ejecutar ? (
        ""
      ) : (
        <ModalFormPlace
          ejecutar={ejecutar}
          setEjecutar={setEjecutar}
          promoId={promoId}
          setUpdateListLugares={setUpdateListLugares}
          lugar={lugar}
        />
      )}
    </MainLayout>
  );
};

export { Places };
