import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "../AuthContext";

const Home = () => {
  const { usuario, signout } = useContext(Auth);
  const navigate = useNavigate();

  const logout = () => {
    signout(() => navigate("/login"));
  };

  return (
    <>
      <header>
        <h1 className="text-center mt-4">PromNight Admin</h1>
        <button onClick={logout} className="btn btn-secondary mx-auto d-block">
          Cerrar sesión
        </button>
      </header>
      <main>
        <p>{usuario.displayName}</p>
        <p>{usuario.email}</p>
      </main>
    </>
  );
};

export { Home };
