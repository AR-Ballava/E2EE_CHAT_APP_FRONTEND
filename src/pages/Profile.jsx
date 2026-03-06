import { useState, useEffect } from "react";
import "../styles/profile.css";
import { getAvatarColor } from "../utils/avatarColor";

export default function Profile({ token, email, onClose }) {

  const [profile,setProfile] = useState(null);
  const [success,setSuccess] = useState("");

  const isMe = !email;

  useEffect(()=>{

    const url = isMe
      ? "http://localhost:8080/api/profile/me"
      : `http://localhost:8080/api/profile/${email}`;

    fetch(url,{
      headers:{Authorization:"Bearer "+token}
    })
    .then(res=>res.json())
    .then(setProfile);

  },[email]);

  function updateProfile(){

    fetch("http://localhost:8080/api/profile/update",{
      method:"PUT",
      headers:{
        "Content-Type":"application/json",
        Authorization:"Bearer "+token
      },
      body:JSON.stringify(profile)
    })
    .then(()=>setSuccess("Profile updated successfully"));

  }

    function avatar(){

        if(profile.profilePicture){
            return (
            <img
                src={profile.profilePicture}
                className="profile-avatar"
            />
            );
        }

        const letter = (profile.username || profile.email)
            .charAt(0)
            .toUpperCase();

        return (
            <div
            className="profile-letter"
            style={{
                backgroundColor: getAvatarColor(profile.email)
            }}
            >
            {letter}
            </div>
        );

    }

  if(!profile) return null;

  return(

    <div className="profile-overlay">

      <div className="profile-card">

        <button
          className="close-btn"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="profile-header">

          {avatar()}

          <div className="profile-name">
            {profile.username || profile.email}
          </div>

        </div>

        <div className="profile-field">
          <label>Email</label>
          <input
            value={profile.email}
            readOnly
            className="readonly"
          />
        </div>

        <div className="profile-field">
          <label>Username</label>
          <input
            value={profile.username || ""}
            readOnly={!isMe}
            onChange={e =>
              setProfile({
                ...profile,
                username:e.target.value
              })
            }
          />
        </div>

        <div className="profile-field">
          <label>Bio</label>
          <textarea
            value={profile.bio || ""}
            readOnly={!isMe}
            onChange={e =>
              setProfile({
                ...profile,
                bio:e.target.value
              })
            }
          />
        </div>

        <div className="profile-field">
          <label>Profile Picture URL</label>
          <input
            value={profile.profilePicture || ""}
            readOnly={!isMe}
            onChange={e =>
              setProfile({
                ...profile,
                profilePicture:e.target.value
              })
            }
          />
        </div>

        {isMe && (

          <button
            className="update-btn"
            onClick={updateProfile}
          >
            Update Profile
          </button>

        )}

        {success && (
          <div className="profile-success">
            {success}
          </div>
        )}

      </div>

    </div>

  );

}