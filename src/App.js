import React, { useContext } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
import { AuthContext, Auth } from "./Store/AuthContext";
import Login from "./Login/Login";
import { Home } from "./Home/Home";
import { User } from "./Users/User";
import { Places } from "./Places/Places";

import "./App.css";

function App() {
  // prom-night-admin/
  return (
    <AuthContext>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Home />} />
            <Route path="/alumnos" element={<User />} />
            <Route path="/lugares" element={<Places />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext>
  );
}

function RequireAuth() {
  let { usuario } = useContext(Auth);
  let location = useLocation();

  if (!usuario) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default App;
