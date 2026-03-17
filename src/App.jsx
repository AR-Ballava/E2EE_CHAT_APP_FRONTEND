import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { isTokenExpired } from "./utils/tokenUtils";

import Chat from "./pages/Chat";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import SessionExpired from "./pages/SessionExpired";

function App(){

  const [token,setToken] = useState(localStorage.getItem("token"));
  const [sessionExpired,setSessionExpired] = useState(false);

  useEffect(()=>{

    if(!token) return;

    /* IF ALREADY EXPIRED */

    if(isTokenExpired(token)){
      localStorage.removeItem("token");
      setToken(null);
      setSessionExpired(true);
      return;
    }

    /* CALCULATE TIME UNTIL EXPIRY */

    const decoded = jwtDecode(token);
    const expiryTime = decoded.exp * 1000;
    const now = Date.now();

    const timeLeft = expiryTime - now;

    /* AUTO LOGOUT WHEN TOKEN EXPIRES */

    const timer = setTimeout(()=>{

      localStorage.removeItem("token");
      setToken(null);
      setSessionExpired(true);

    }, timeLeft);

    return () => clearTimeout(timer);

  },[token]);

  return(

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home/>} />

        {/* SESSION EXPIRED */}
        <Route 
          path="/session-expired" 
          element={<SessionExpired/>}
        />

        {/* AUTH PAGE  */}
        <Route 
          path="/auth/:type" 
          element={token ? <Navigate to="/chat"/> : <AuthPage setToken={setToken}/>} 
        />

        {/* CHAT PAGE */}
        <Route 
          path="/chat" 
          element={
            sessionExpired
              ? <Navigate to="/session-expired"/>
              : token
              ? <Chat token={token} setToken={setToken}/>
              : <Navigate to="/"/>
          }
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;