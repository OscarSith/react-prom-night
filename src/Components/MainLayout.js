import React, { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Auth } from "../Store/AuthContext";

const MainLayout = ({ children }) => {
  const { signout } = useContext(Auth);
  const navigate = useNavigate();
  const activeClassName = "active";

  const logout = () => {
    signout(() => navigate("/login"));
  };

  const fnIsActive = ({ isActive }) => {
    return "nav-link " + (isActive ? activeClassName : "");
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
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
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
              </ul>
              <button onClick={logout} className="btn btn-secondary btn-sm">
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
