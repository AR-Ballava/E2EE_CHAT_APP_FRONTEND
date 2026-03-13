import { useNavigate } from "react-router-dom";
import "../styles/sessionExpired.css";

export default function SessionExpired(){

  const navigate = useNavigate();

  function relogin(){
    navigate("/auth");
  }

  function goHome(){
    navigate("/");
  }

  return(

    <div className="session-expired-page">

      <div className="session-card">

        <div className="session-icon">⏳</div>

        <h2>Session Expired</h2>

        <p>Your login session has expired. Please sign in again.</p>

        <div className="session-buttons">

          <button
            className="relogin-btn"
            onClick={relogin}
          >
            Re-Login
          </button>

          <button
            className="home-btn"
            onClick={goHome}
          >
            Home
          </button>

        </div>

      </div>

    </div>

  );

}