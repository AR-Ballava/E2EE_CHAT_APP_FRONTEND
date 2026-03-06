import { useState, useEffect } from "react";
import Profile from "./Profile";
import "../styles/contactPanel.css";

export default function ContactPanel({ token, selectedUser, setSelectedUser }) {

  const [contacts, setContacts] = useState([]);
  const [contactProfiles, setContactProfiles] = useState({});
  const [newContact, setNewContact] = useState("");

  const [showProfile, setShowProfile] = useState(false);
  const [profileEmail, setProfileEmail] = useState(null);

  const [myProfile, setMyProfile] = useState(null);

  // avatar background color generator
  function getAvatarColor(text) {

    const colors = [
      "#4CAF50",
      "#2196F3",
      "#FF9800",
      "#9C27B0",
      "#E91E63"
    ];

    let hash = 0;

    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;

    return colors[index];

  }

  /* LOAD MY PROFILE */

  useEffect(() => {

    fetch("https://noncommunicating-princess-sinusoidally.ngrok-free.dev/api/profile/me", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(setMyProfile);

  }, [token]);

  /* LOAD CONTACTS */

  useEffect(() => {

    fetch("https://noncommunicating-princess-sinusoidally.ngrok-free.dev/api/contacts", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => {

        const users = data.map(c => c.contactUserId);
        setContacts(users);

        loadContactProfiles(users);

      });

  }, [token]);

  /* LOAD PROFILE FOR EACH CONTACT */

  function loadContactProfiles(users) {

    users.forEach(email => {

      fetch(`https://noncommunicating-princess-sinusoidally.ngrok-free.dev/api/profile/${email}`, {
        headers: { Authorization: "Bearer " + token }
      })
        .then(res => res.json())
        .then(profile => {

          setContactProfiles(prev => ({
            ...prev,
            [email]: profile
          }));

        });

    });

  }

  async function addContact(username) {

    if (!username.trim()) return;

    const res = await fetch(
      "https://noncommunicating-princess-sinusoidally.ngrok-free.dev/api/contacts/" + username,
      {
        method: "POST",
        headers: { Authorization: "Bearer " + token }
      }
    );

    if (res.status === 200) {

      setContacts(prev => [...prev, username]);
      loadContactProfiles([username]);
      setNewContact("");

    }

  }

  /* MY PROFILE AVATAR */

  function myAvatar() {

    if (!myProfile) return null;

    if (myProfile.profilePicture) {
      return <img src={myProfile.profilePicture} alt="" />;
    }

    const letter = (myProfile.username || myProfile.email)
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

  /* CONTACT AVATAR */

  function contactAvatar(email) {

    const profile = contactProfiles[email];

    if (profile && profile.profilePicture) {
      return <img src={profile.profilePicture} alt="" />;
    }

    const letter = (profile?.username || email)
      .charAt(0)
      .toUpperCase();

    return (
      <div
        className="avatar-letter"
        style={{
          backgroundColor: getAvatarColor(email)
        }}
      >
        {letter}
      </div>
    );

  }

  return (

    <>
    
    <div className="contact-panel">

      {/* MY PROFILE HEADER */}

      <div
        className="sidebar-profile-container"
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

      <h3>Contacts</h3>

      <div className="add-contact">

        <input
          placeholder="username"
          value={newContact}
          onChange={(e) => setNewContact(e.target.value)}
        />

        <button onClick={() => addContact(newContact)}>
          Add
        </button>

      </div>

      <div className="contact-list">

        {contacts.map((c, i) => (

          <div
            key={i}
            className={`contact-item ${selectedUser === c ? "active" : ""}`}
          >

            <div
              className="contact-avatar"
              onClick={() => {
                setProfileEmail(c);
                setShowProfile(true);
              }}
            >
              {contactAvatar(c)}
            </div>

            <div
              className="contact-name"
              onClick={() => setSelectedUser(c)}
            >
              {contactProfiles[c]?.username || c}
            </div>

          </div>

        ))}

      </div>

    </div>

    {/* PROFILE MODAL */}

    {showProfile && (
      <Profile
        token={token}
        email={profileEmail}
        onClose={() => setShowProfile(false)}
      />
    )}

    </>

  );

}