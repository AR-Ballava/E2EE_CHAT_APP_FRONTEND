import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Chat from "./pages/Chat";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import ChatWindow from "./pages/ChatWindow";
import ContactPanel from "./pages/ContactPanel";

function App(){

  const [token,setToken] = useState(localStorage.getItem("token"));

  return(

    <BrowserRouter>
      
      <Routes>

        <Route path="/" element={<Home/>} />

        {/* AUTH PAGE */}
        <Route 
          path="/auth" 
          element={token ? <Navigate to="/chat"/> : <AuthPage setToken={setToken}/>} 
        />

        {/* CHAT PAGE */}
        <Route 
          path="/chat" 
          element={token ? <Chat token={token} setToken={setToken}/> : <Navigate to="/"/>}
        />

      </Routes>
    </BrowserRouter>

  );

}

export default App;