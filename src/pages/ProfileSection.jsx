import { useState } from "react";
import "../styles/profileSection.css";

export default function ProfileSection({
  myProfile,
  getAvatarColor,
  setShowProfile,
  setProfileEmail
}) {

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function myAvatar() {

    if (!myProfile) return null;

    if (myProfile.profilePicture) {
      return <img src={myProfile.profilePicture} alt="" />;
    }

    const letter =
      (myProfile.username || myProfile.email)
        .charAt(0)
        .toUpperCase();

    return (
      <div
        className="avatar-letter"
        style={{
          backgroundColor: getAvatarColor(myProfile.email)
        }}
      >
        {letter}
      </div>
    );
  }

  function logout(){

    localStorage.removeItem("token");

    window.location.href = "/";

  }

  return (

    <>

      <div className="sidebar-profile-container">

        {/* LEFT SIDE (PROFILE CLICK AREA) */}

        <div
          className="sidebar-profile-left"
          onClick={() => {
            setProfileEmail(null);
            setShowProfile(true);
          }}
        >

          <div className="sidebar-profile">
            {myAvatar()}
          </div>

          {myProfile && (
            <div className="sidebar-name">
              {myProfile.username || myProfile.email}
            </div>
          )}

        </div>

        {/* RIGHT SIDE (LOGOUT BUTTON) */}

        <button
          className="logout-btn"
          onClick={() => setShowLogoutConfirm(true)}
        >
          Logout
        </button>

      </div>

      {/* CONFIRMATION MODAL */}

      {showLogoutConfirm && (

        <div className="logout-overlay">

          <div className="logout-modal">

            <h3>Are you sure you want to logout?</h3>

            <div className="logout-actions">

              <button
                className="logout-yes"
                onClick={logout}
              >
                Yes
              </button>

              <button
                className="logout-no"
                onClick={() => setShowLogoutConfirm(false)}
              >
                No
              </button>

            </div>

          </div>

        </div>

      )}

    </>

  );
}