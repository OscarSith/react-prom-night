import React, { useContext, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Auth } from "../Store/AuthContext";

const MainLayout = ({ children }) => {
  const { signout } = useContext(Auth);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const activeClassName = "active";

  const logout = () => {
    signout(() => navigate("/login"));
  };

  const fnIsActive = ({ isActive }) => {
    return "nav-link " + (isActive ? activeClassName : "");
  };

  const openNavMenu = (e) => {
    setShow((prevState) => !prevState);
  };

  return (
    <>
      <header className="mb-4">
        <nav className="navbar navbar-expand-lg bg-light">
          <div className="container">
            <Link className="navbar-brand" to="/">
              PromNight Admin
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
              onClick={openNavMenu}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div
              className={"collapse navbar-collapse " + (show ? "show" : "")}
              id="navbarNav"
            >
              <ul className="navbar-nav me-auto">
                <li className="nav-item">
                  <NavLink
                    className={fnIsActive}
                    aria-current="page"
                    to="/"
                    end
                  >
                    Inicio
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={fnIsActive} to="/alumnos">
                    Alumnos
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={fnIsActive} to="/lugares">
                    Lugares
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={fnIsActive} to="/votos">
                    Los más votados
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={fnIsActive} to="/musicas">
                    Musicas
                  </NavLink>
                </li>
              </ul>
              <hr className="d-lg-none mt-1 mb-3" />
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm mt-3 mt-lg-0"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </nav>
      </header>
      <main>
        <div className="container">{children}</div>
      </main>
    </>
  );
};

export { MainLayout };
