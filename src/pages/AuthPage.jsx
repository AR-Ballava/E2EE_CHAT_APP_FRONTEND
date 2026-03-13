import { useState } from "react";
import API from "../services/api";
import "../styles/auth.css";

export default function AuthPage({ setToken }) {

  const [isLogin, setIsLogin] = useState(true);

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [username,setUsername] = useState("");

  async function login(){

    try{

      const res = await API.post("/auth/login",{
        email,
        password
      });

      const accessToken = res.data.accessToken;
      const refreshToken = res.data.refreshToken;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      setToken(accessToken);

    }catch(err){
      alert("Invalid email or password");
    }

  }

  async function register(){

    try{

      await API.post("/auth/register",{
        email,
        password,
        username
      });

      alert("Registration successful. Please login.");

      setIsLogin(true);

      setEmail("");
      setPassword("");
      setUsername("");

    }catch(err){

      alert("Registration failed");

    }

  }

  return (

    <div className="auth-container">

      <div className="auth-card">

        {/* LEFT SIDE FORM */}

        <div className="auth-form">

          <h2>{isLogin ? "Login" : "Register"}</h2>

          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          {isLogin ? (
            <button onClick={login}>
              Login
            </button>
          ) : (
            <button onClick={register}>
              Register
            </button>
          )}

        </div>


        {/* RIGHT SIDE PANEL */}

        <div className="auth-welcome">

          {isLogin ? (

            <>
              <h2>Welcome Back!</h2>
              <p>Don't have an account?</p>

              <button
                className="switch-btn"
                onClick={()=>setIsLogin(false)}
              >
                Register
              </button>
            </>

          ) : (

            <>
              <h2>Create Account</h2>
              <p>Already have an account?</p>

              <button
                className="switch-btn"
                onClick={()=>setIsLogin(true)}
              >
                Login
              </button>
            </>

          )}

        </div>

      </div>

    </div>

  );
}