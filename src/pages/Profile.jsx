import { useState, useEffect } from "react";
import "../styles/profile.css";
import { getAvatarColor } from "../utils/avatarColor";

export default function Profile({ token, email, onClose }) {

  const [profile,setProfile] = useState(null);
  const [success,setSuccess] = useState("");
  const [showAvatar,setShowAvatar] = useState(false);
  

  const isMe = !email;

  useEffect(()=>{

    const url = isMe
      ? "http://3.111.198.202/api/profile/me"
      : `http://3.111.198.202/api/profile/${email}`;

    fetch(url,{
      headers:{Authorization:"Bearer "+token}
    })
    .then(res=>res.json())
    .then(setProfile);

  },[email]);

  function updateProfile(){

    fetch("http://3.111.198.202/api/profile/update",{
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
                onClick={()=>setShowAvatar(true)}
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

  if(!profile){
    return (
      <div className="profile-overlay">
        <div className="profile-card">
          Loading profile...
        </div>
      </div>
    );
  }

  //FORMAT LAST SEEN

  function formatLastSeen(timestamp){
    if(!timestamp) return "";

    const now = new Date();
    const last = new Date(timestamp);

    const diff = now - last;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    const time = last.toLocaleTimeString([],{
      hour:"2-digit",
      minute:"2-digit"
    });

    const monthDay = last.toLocaleDateString([],{
      month:"long",
      day:"numeric"
    });

    const monthDayYear = last.toLocaleDateString([],{
      month:"long",
      day:"numeric",
      year:"numeric"
    });

    if(minutes < 60) return `${minutes} min ago`;
    if(hours < 24) return `today ${time}`;
    if(now.getFullYear() === last.getFullYear()) return `${monthDay}, ${time}`;
    return `${monthDayYear}, ${time}`;

  }


  return(

    <div className="profile-overlay">

      {showAvatar && profile.profilePicture && (

        <div
          className="avatar-viewer"
          onClick={()=>setShowAvatar(false)}
        >

          <img
            src={profile.profilePicture}
            className="avatar-large"
            onClick={(e)=>e.stopPropagation()}
          />

        </div>

      )}

      <div className="profile-card">

        <button
          className="close-btn"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="profile-header">

          {avatar()}

        <div className="profile-status">

          {profile.online ? (
            <span className="online-status">
              online
            </span>
          ) : (
            <span className="last-seen">
              last seen {formatLastSeen(profile.lastSeen)}
            </span>
          )}

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