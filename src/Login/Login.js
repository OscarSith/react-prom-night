import React, { useContext, useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Auth } from "../AuthContext";

const Login = () => {
  const { usuario } = useContext(Auth);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) {
      navigate("/", { replace: true });
    }
  }, []);

  const handlerLogin = async (e) => {
    e.preventDefault();
    const { usuario, clave } = e.target.elements;

    setLoading(true);
    signInWithEmailAndPassword(auth, usuario.value, clave.value)
      .then(() => {
        navigate("/", { replace: true });
      })
      .catch((e) => {
        alert(e.message);
        setLoading(false);
      });
  };

  return (
    <>
      <header>
        <h1 className="text-center mt-4">PromNight Admin</h1>
      </header>
      <main>
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-4">
              <div className="card">
                <div className="card-body">
                  <form onSubmit={handlerLogin}>
                    <div className="mb-3">
                      <label htmlFor="correo" className="form-label">
                        Usuario
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        name="usuario"
                        id="correo"
                        placeholder="name@example.com"
                        autoComplete="off"
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        name="clave"
                        className="form-control"
                        id="password"
                      />
                    </div>
                    <button
                      className="btn btn-primary mx-auto d-block px-4"
                      disabled={!!loading}
                    >
                      {loading ? "Autenticando..." : "Autenticar"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Login;
