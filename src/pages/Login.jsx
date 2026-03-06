import { useState } from "react";
import API from "../services/api";

export default function Login({ setToken }) {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  async function login(){

    const res = await API.post("/auth/login",{
      email,
      password
    });

    const token = res.data.token;

    localStorage.setItem("token",token);

    setToken(token);
  }

  return(
    <div>
      <h2>Login</h2>

      <input
        placeholder="email"
        onChange={(e)=>setEmail(e.target.value)}
      />

      <input
        placeholder="password"
        type="password"
        onChange={(e)=>setPassword(e.target.value)}
      />

      <button onClick={login}>Login</button>
    </div>
  );
}