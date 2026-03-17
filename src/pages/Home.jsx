import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const Home = () => {

  const navigate = useNavigate();

  return (

    <div className="landing">

      <header className="landing-nav">

        <div className="brand">E2EE</div>

        <div className="nav-right">

          <button onClick={()=>navigate("/auth/login")}>
            Login
          </button>

          <button
            className="nav-register"
            onClick={()=>navigate("/auth/register")}
          >
            Register
          </button>

        </div>

      </header>

      <main className="landing-center">

        <h1>
          Real-Time Encrypted Chat <br/>
          <span>Private Messaging</span>
        </h1>

        <p class="temp-text">
          Secure, fast and minimal communication. 
          Use 
          <a 
            href="https://temp-mail.org/en/" 
            target="_blank" 
            rel="noopener noreferrer"
            class="temp-badge"
          >
            Temp Mail
          </a> 
          for temporary email.
        </p>

        <div className="cta">

          <button
            className="primary"
            onClick={()=>navigate("/auth/login")}
          >
            Start Chat
          </button>

          <button
            className="ghost"
            onClick={()=>navigate("/auth/register")}
          >
            Create Account
          </button>

        </div>

      </main>

    </div>

  );
};

export default Home;