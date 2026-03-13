import { useNavigate } from "react-router-dom";
import "../styles/home.css";

const Home = () => {

  const navigate = useNavigate();

  return (

    <div className="landing">

      <header className="landing-nav">

        <div className="brand">E2EE</div>

        <div className="nav-right">

          <button onClick={()=>navigate("/auth")}>Login</button>

          <button className="nav-register" onClick={()=>navigate("/auth")}>
            Register
          </button>

        </div>

      </header>


      <main className="landing-center">

        <h1>
          Private Messaging <br/>
          <span>Re-imagined</span>
        </h1>

        <p>
          Real-time encrypted chat built with modern architecture.
          Secure, fast and minimal communication.
        </p>

        <div className="cta">

          <button
            className="primary"
            onClick={()=>navigate("/auth")}
          >
            Start Chat
          </button>

          <button
            className="ghost"
            onClick={()=>navigate("/auth")}
          >
            Create Account
          </button>

        </div>

      </main>

    </div>

  );
};

export default Home;