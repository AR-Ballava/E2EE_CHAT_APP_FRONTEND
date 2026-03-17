import { useState,useEffect } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";
import "../styles/auth.css";

export default function AuthPage({ setToken }) {

  const { type } = useParams();
  const [isLogin,setIsLogin] = useState(type !== "register");

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [username,setUsername] = useState("");

  const [otp,setOtp] = useState(new Array(6).fill(""));
  const [step,setStep] = useState("form");

  const [loading,setLoading] = useState(false);
  const [forgotMode,setForgotMode] = useState(false);

  const [timer,setTimer] = useState(0);

  const [resending,setResending] = useState(false);


  /* ========================= */
  /* OTP TIMER */
  /* ========================= */

  useEffect(()=>{

    if(timer <= 0) return;

    const interval = setInterval(()=>{
      setTimer(prev=>prev-1);
    },1000);

    return ()=>clearInterval(interval);

  },[timer]);


  /* ========================= */
  /* VALIDATIONS */
  /* ========================= */

  const isValidEmail=(email)=>{
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPassword=(password)=>{
    return password.length >= 6;
  };


  /* ========================= */
  /* UNIVERSAL API CALL */
  /* ========================= */

  const apiCall = async (url,data,successMsg,errorMsg,onSuccess)=>{

    try{

      setLoading(true);

      const res = await API.post(url,data);

      if(successMsg) alert(successMsg);

      if(onSuccess) onSuccess(res);

    }catch(err){

      alert(err?.response?.data || errorMsg);

    }finally{

      setLoading(false);

    }

  };


  /* ========================= */
  /* LOGIN */
  /* ========================= */

  async function login(){

    if(!email || !password){
      alert("Please enter email and password");
      return;
    }

    if(!isValidEmail(email)){
      alert("Enter valid email");
      return;
    }

    if(!isValidPassword(password)){
      alert("Password must be at least 6 characters");
      return;
    }

    apiCall(
      "/auth/login",
      { email,password },
      null,
      "Invalid email or password",
      (res)=>{

        const accessToken = res.data.accessToken;
        const refreshToken = res.data.refreshToken;

        localStorage.setItem("token",accessToken);
        localStorage.setItem("refreshToken",refreshToken);

        setToken(accessToken);

      }
    );

  }


  /* ========================= */
  /* REGISTER */
  /* ========================= */

  async function register(){

    if(!email || !username || !password){
      alert("Please fill all fields");
      return;
    }

    if(!isValidEmail(email)){
      alert("Enter valid email");
      return;
    }

    if(!isValidPassword(password)){
      alert("Password must be at least 6 characters");
      return;
    }

    apiCall(
      "/auth/send-otp",
      { email,username,password },
      "OTP sent to your email",
      "Failed to send OTP",
      ()=>{
        setStep("otp");
        setTimer(300);
      }
    );

  }


  /* ========================= */
  /* VERIFY OTP */
  /* ========================= */

  async function verifyOtp(){

    const otpValue = otp.join("");

    if(otpValue.length !== 6){
      alert("OTP must be 6 digits");
      return;
    }

    apiCall(
      "/auth/verify-otp",
      { email,username,password,otp:otpValue },
      "Registration successful. Please login.",
      "Invalid OTP",
      ()=>{

        setIsLogin(true);
        setStep("form");

        setEmail("");
        setPassword("");
        setUsername("");
        setOtp(new Array(6).fill(""));

      }
    );

  }


  /* ========================= */
  /* RESEND OTP */
  /* ========================= */

  async function resendOtp(){

    try{

      setResending(true);

      const res = await API.post("/auth/resend-otp",{ email });

      alert("OTP resent");

      setOtp(new Array(6).fill(""));
      setTimer(300);

    }catch(err){

      alert(err?.response?.data || "Failed to resend OTP");

    }finally{

      setResending(false);

    }

  }


  /* ========================= */
  /* FORGOT PASSWORD */
  /* ========================= */

  async function forgotPassword(){

    if(!email){
      alert("Enter email");
      return;
    }

    if(!isValidEmail(email)){
      alert("Enter valid email");
      return;
    }

    apiCall(
      "/auth/forgot-password",
      { email },
      "OTP sent to your email",
      "Failed to send OTP",
      ()=>{
        setStep("forgotOtp");
        setOtp(new Array(6).fill(""));
        setTimer(300);
      }
    );

  }


  /* ========================= */
  /* RESET PASSWORD */
  /* ========================= */

  async function resetPassword(){

    const otpValue = otp.join("");

    if(otpValue.length !== 6){
      alert("OTP must be 6 digits");
      return;
    }

    if(!isValidPassword(password)){
      alert("Password must be at least 6 characters");
      return;
    }

    apiCall(
      "/auth/reset-password",
      { email,otp:otpValue,newPassword:password },
      "Password reset successful",
      "Reset failed",
      ()=>{

        setForgotMode(false);
        setStep("form");

        setOtp(new Array(6).fill(""));
        setPassword("");

      }
    );

  }


  /* ========================= */
  /* OTP INPUT HANDLER */
  /* ========================= */

  const handleOtpChange=(value,index)=>{

    if(!/^[0-9]?$/.test(value)) return;

    const newOtp=[...otp];
    newOtp[index]=value;

    setOtp(newOtp);

    if(value && index<5){
      document.getElementById(`otp-${index+1}`).focus();
    }

  };


  const handleKeyDown=(e,index)=>{

    if(e.key==="Backspace" && !otp[index] && index>0){
      document.getElementById(`otp-${index-1}`).focus();
    }

  };


  return(

    <div className="auth-container">

      <div className="auth-card">

        {/* LEFT SIDE FORM */}

        <div className="auth-form">

          <h2>
            {forgotMode
              ? step==="forgotOtp"
                ? "Reset Password"
                : "Forgot Password"
              : isLogin
              ? "Login"
              : step==="form"
              ? "Register"
              : "Verify OTP"}
          </h2>


          {/* USERNAME */}

          {!isLogin && !forgotMode && step==="form" && (

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
            />

          )}


          {/* OTP INPUT */}

          {(step==="otp" || step==="forgotOtp") && (

            <div className="otp-container">

              {otp.map((digit,i)=>(

                <input
                  key={i}
                  id={`otp-${i}`}
                  className="otp-box"
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e)=>handleOtpChange(e.target.value,i)}
                  onKeyDown={(e)=>handleKeyDown(e,i)}
                />

              ))}

            </div>

          )}


          {timer>0 && (

            <p className="otp-timer">
              OTP expires in {Math.floor(timer/60)}:
              {(timer%60).toString().padStart(2,"0")}
            </p>

          )}


          {/* EMAIL */}

          {step!=="otp" && (

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />

          )}


          {/* PASSWORD */}

          {(step==="form" || step==="forgotOtp") && (

            <input
              type="password"
              placeholder={forgotMode ? "New Password" : "Password"}
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />

          )}


          {/* BUTTONS */}

          {forgotMode ? (

            step==="forgotOtp" ? (

              <button onClick={resetPassword} disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </button>

            ):(

              <button onClick={forgotPassword} disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>

            )

          ) : isLogin ? (

            <>

              <button onClick={login} disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="forgot-link">
                <span onClick={()=>setForgotMode(true)}>
                  Forgot Password?
                </span>
              </p>

            </>

          ) : step==="form" ? (

            <button onClick={register} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>

          ) : (

            <>

              <button onClick={verifyOtp} disabled={loading}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                className="resend-btn"
                onClick={resendOtp}
                disabled={timer > 240 || resending}
              >
                {resending
                  ? "Resending..."
                  : timer > 240
                  ? `Resend in ${timer - 240}s`
                  : "Resend OTP"}
              </button>

              <p style={{fontSize: "14px"}}>
                Pleas wait 60 sec before hiting resend button 
              </p>
            </>

          )}

        </div>


        {/* RIGHT SIDE PANEL */}

        <div className="auth-welcome">

          {isLogin ? (

            <>
              <h2>Hello, Friend!</h2>

              <p>
                Don't have an account? Register now and start chatting securely.
              </p>

              <button
                className="switch-btn"
                onClick={()=>{

                  setIsLogin(false);
                  setForgotMode(false);
                  setStep("form");

                }}
              >
                Register
              </button>
            </>

          ):(

            <>
              <h2>Welcome Back!</h2>

              <p>
                Already have an account? Login to continue.
              </p>

              <button
                className="switch-btn"
                onClick={()=>{

                  setIsLogin(true);
                  setForgotMode(false);
                  setStep("form");

                }}
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