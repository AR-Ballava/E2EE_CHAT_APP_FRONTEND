import { useState, useEffect } from "react";
import ProfileSection from "./ProfileSection";
import ContactList from "./ContactList";
import Profile from "./Profile";
import "../styles/contactPanel.css";

export default function ContactPanel({
  token,
  contacts,
  setContacts,
  messagePreviews,
  setMessagePreviews,
  selectedUser,
  setSelectedUser
}) {

  const [contactProfiles, setContactProfiles] = useState({});
  const [newContact, setNewContact] = useState("");

  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [showProfile, setShowProfile] = useState(false);
  const [profileEmail, setProfileEmail] = useState(null);

  const [myProfile, setMyProfile] = useState(null);

  function getAvatarColor(text) {
    const colors = ["#4CAF50", "#2196F3", "#FF9800", "#9C27B0", "#E91E63"];
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  function formatPreviewTime(timestamp) {
    if (!timestamp) return "";

    const now = new Date();
    const msgDate = new Date(timestamp);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const msgDay = new Date(msgDate);
    msgDay.setHours(0, 0, 0, 0);

    if (msgDay.getTime() === today.getTime()) {
      return msgDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    if (msgDay.getTime() === yesterday.getTime()) {
      return "Yesterday";
    }

    return msgDate.toLocaleDateString([], {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit"
    });
  }

  /* ================= SEARCH USERS ================= */

  async function searchUsers(keyword) {

    if (!keyword.trim()) {
      setSearchResults([]);
      return;
    }

    const res = await fetch(
      `http://localhost:8080/api/contacts/search?keyword=${keyword}`,
      {
        headers: { Authorization: "Bearer " + token }
      }
    );

    const data = await res.json();
    setSearchResults(data);
    setShowSuggestions(true);
  }

  /* ================= LOAD MY PROFILE ================= */

  useEffect(() => {
    fetch("http://localhost:8080/api/profile/me", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(setMyProfile);
  }, [token]);

  /* ================= LOAD CONTACTS ================= */

  useEffect(() => {
    fetch("http://localhost:8080/api/contacts", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(data => {
        const users = data.map(c => c.contactUserId);
        setContacts(users);
        loadContactProfiles(users);
      });
  }, [token]);

  /* ================= LOAD MESSAGE PREVIEWS ================= */

  useEffect(() => {
    fetch("http://localhost:8080/api/messages/preview", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => res.json())
      .then(setMessagePreviews);
  }, [token]);

  function loadContactProfiles(users) {
    users.forEach(email => {
      fetch(`http://localhost:8080/api/profile/${email}`, {
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
      "http://localhost:8080/api/contacts/" + username,
      {
        method: "POST",
        headers: { Authorization: "Bearer " + token }
      }
    );

    if (res.status === 200) {

      setContacts(prev => [...prev, username]);
      loadContactProfiles([username]);

      setNewContact("");
      setSearchResults([]);
      setShowSuggestions(false);
    }
  }

  return (
    <>
      <div className="contact-panel">

        <ProfileSection
          token={token}
          myProfile={myProfile}
          getAvatarColor={getAvatarColor}
          setShowProfile={setShowProfile}
          setProfileEmail={setProfileEmail}
        />

        <h3>Add To Chat List</h3> 

        <div className="add-contact">

          {/* INPUT ROW */}
          <div className="add-contact-row">
            <input
              placeholder="search email or username"
              value={newContact}
              onChange={(e) => {
                const value = e.target.value;
                setNewContact(value);
                searchUsers(value);
              }}
              onFocus={() => setShowSuggestions(true)}
            />

            <button onClick={() => addContact(newContact)}>Add</button>
          </div>

          {/* 🔥 SUGGESTIONS BELOW INPUT */}
          {showSuggestions && searchResults.length > 0 && (
            <div className="search-suggestions">

              {searchResults.map((user, i) => (

                <div
                  key={i}
                  className="suggestion-item"
                  onClick={() => addContact(user.email)}
                >

                  <div
                    className="suggestion-avatar"
                    style={{ backgroundColor: getAvatarColor(user.email) }}
                  >
                    {(user.username || user.email).charAt(0).toUpperCase()}
                  </div>

                  <div className="suggestion-info">
                    <div className="suggestion-name">
                      {user.username || "No name"}
                    </div>
                    <div className="suggestion-email">
                      {user.email}
                    </div>
                  </div>

                </div>

              ))}

            </div>
          )}

        </div>

        <ContactList
          contacts={contacts}
          setContacts={setContacts}
          contactProfiles={contactProfiles}
          messagePreviews={messagePreviews}
          setMessagePreviews={setMessagePreviews}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          formatPreviewTime={formatPreviewTime}
          getAvatarColor={getAvatarColor}
          setShowProfile={setShowProfile}
          setProfileEmail={setProfileEmail}
          token={token}
        />

      </div>

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