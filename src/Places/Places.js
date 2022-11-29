import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

import { MainLayout } from "../Components/MainLayout";
import { ModalFormPlace } from "./ModalFormPlace";
import { AccordionPlace } from "./AccordionPlace";

const Places = () => {
  const shouldLoad = useRef(true);
  const formAddChair = useRef(null);

  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChair, setLoadingChair] = useState(false);
  const [loadingAddChair, setLoadingAddChair] = useState(false);
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
        item: (
          <AccordionPlace
            order={order}
            item={item}
            lugar={lugar}
            deleteChair={handlerDeleteChair}
            loadingChair={loadingChair}
            key={order}
          />
        ),
      });
    }

    return sortByOrder(items);
  };

  const sortByOrder = (items) => items.sort((a, b) => a.order - b.order);

  const modalOpen = () => {
    setEjecutar((previousData) => ++previousData);
  };

  const modalOpenEdit = () => {
    setEjecutar((previousData) => ++previousData);
  };

  const handlerDeleteChair = async (event) => {
    if (window.confirm("Seguro de eliminar esta silla?")) {
      setLoadingChair(true);
      const element = event.currentTarget;
      const mesa = element.getAttribute("mesa");
      const indiceSilla = element.getAttribute("silla");

      lugar[mesa].sillas.splice(indiceSilla, 1);
      lugar[mesa].sillas = lugar[mesa].sillas.map((silla, i) => ({
        silla: i + 1,
        nombre: silla.nombre,
      }));
      await updateDoc(doc(db, "promo_lugares", promoId), lugar);
      setLugar((prevState) => ({
        ...prevState,
        [mesa]: {
          ...prevState[mesa],
          sillas: lugar[mesa].sillas,
        },
      }));
      setLoadingChair(false);
    }
  };

  const printDropdownTables = () => {
    let mesas = [];
    for (const table in lugar) {
      const order = parseInt(table.split("_")[1]);
      mesas.push({
        order,
        table,
      });
    }

    return sortByOrder(mesas);
  };

  const submitAddTable = async (event) => {
    event.preventDefault();
    const form = new FormData(formAddChair.current);
    const mesa = form.get("mesa");
    const nombre = form.get("nombre");

    if (mesa.length === 0 || nombre.trim().length === 0) {
      alert("Tiene que llenar todos los datos");
      return;
    }

    const total = lugar[mesa].sillas.length;

    if (total < lugar[mesa].total) {
      setLoadingAddChair(true);
      const silla = {
        nombre,
        silla: total + 1,
      };
      lugar[mesa].sillas.push(silla);

      await updateDoc(doc(db, "promo_lugares", promoId), lugar);
      setLugar((prevState) => ({
        ...prevState,
        [mesa]: {
          ...prevState[mesa],
          sillas: lugar[mesa].sillas,
        },
      }));
      formAddChair.current.reset();
      setLoadingAddChair(false);
    } else {
      alert("Ya no hay espacio en esta mesa");
    }
  };

  return (
    <MainLayout>
      <h1>Listado de Lugares</h1>
      <div className="row">
        <div className="col col-lg-4 d-flex">
          <select
            className="form-select me-3"
            disabled={!promos.length}
            onChange={handlerChangePromo}
            id="select-promos"
          >
            <option value="0">
              {!promos.length
                ? "Cargando lista..."
                : "Seleccione una promoción"}
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
      <div
        className={"row " + (!lugar.hasOwnProperty("mesa_1") ? "d-none" : "")}
      >
        <div className="col">
          <hr />
          <h4>Agregar una reserva</h4>
          <form className="row" ref={formAddChair} onSubmit={submitAddTable}>
            <div className="col-12 col-lg-2 mb-2 mb-lg-0">
              <select
                className="form-select form-select-sm"
                name="mesa"
                disabled={loadingAddChair}
              >
                <option value="">Seleccione</option>
                {printDropdownTables().map((mesa) => (
                  <option value={mesa.table} key={mesa.order}>
                    {mesa.table}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-8 col-lg-4">
              <input
                type="text"
                className="form-control form-control-sm"
                name="nombre"
                placeholder="Nombre del alumno"
                disabled={loadingAddChair}
              />
            </div>
            <div className="col-4 col-lg-2">
              <button
                type="submit"
                className="btn btn-sm btn-info"
                disabled={loadingAddChair}
              >
                Reservar silla
              </button>
            </div>
          </form>
        </div>
      </div>
      <hr />
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
