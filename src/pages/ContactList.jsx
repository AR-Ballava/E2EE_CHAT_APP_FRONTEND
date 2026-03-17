import "../styles/contactList.css";
import { jwtDecode } from "jwt-decode";

export default function ContactList({
  contacts,
  contactProfiles,
  messagePreviews,
  setMessagePreviews,
  selectedUser,
  setSelectedUser,
  formatPreviewTime,
  getAvatarColor,
  setShowProfile,
  setProfileEmail,
  token
}) {

  let currentUser = null;

  if (token) {
    try {
      currentUser = jwtDecode(token).sub;
    } catch (e) {
      console.error("Invalid token", e);
    }
  }

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

  /* SORT CONTACTS BY LAST MESSAGE TIME */

  const sortedContacts = [...contacts].sort((a, b) => {

    const timeA = messagePreviews[a]?.sentAt
      ? new Date(messagePreviews[a].sentAt).getTime()
      : 0;

    const timeB = messagePreviews[b]?.sentAt
      ? new Date(messagePreviews[b].sentAt).getTime()
      : 0;

    return timeB - timeA;

  });

  function renderPreviewStatus(preview) {

    if (!preview) return null;

    if (preview.senderId !== currentUser) return null;

    if (preview.status === "SENT") {
      return <span className="preview-status">✓</span>;
    }

    if (preview.status === "DELIVERED") {
      return <span className="preview-status">✓✓</span>;
    }

    if (preview.status === "READ") {
      return <span className="preview-status read-status">✓✓</span>;
    }

    return null;
  }

  return (

    <div className="contact-list">

      {sortedContacts.map((c, i) => (

        <div
          key={i}
          className={`contact-item ${selectedUser === c ? "active" : ""}`}
          onClick={() => {

            setSelectedUser(c);

            const conversationId =
              currentUser < c ? currentUser + "_" + c : c + "_" + currentUser;

            // ✅ 1. Call backend to mark as read
            fetch(`http://localhost:8080/api/messages/read/conversation/${conversationId}`, {
              method: "POST",
              headers: { Authorization: "Bearer " + token }
            });

            // ✅ 2. INSTANT UI UPDATE (IMPORTANT FIX)
            setMessagePreviews(prev => ({
              ...prev,
              [c]: {
                ...(prev[c] || {} ),
                unreadCount: 0
              }
            }));

          }}
        >

          <div
            className="contact-avatar"
            onClick={(e) => {
              e.stopPropagation();
              setProfileEmail(c);
              setShowProfile(true);
            }}
          >
            {contactAvatar(c)}
          </div>

          <div className="contact-info">

            {/* ROW 1 */}
            <div className="contact-row">

              <div className="contact-name">
                {contactProfiles[c]?.username || c}
              </div>

              {messagePreviews[c] && (
                <div
                  className={`contact-time ${
                    messagePreviews[c]?.unreadCount > 0 ? "unread-time" : ""
                  }`}
                >
                  {formatPreviewTime(messagePreviews[c].sentAt)}
                </div>
              )}

            </div>

            {/* ROW 2 */}
            {messagePreviews[c] && (

              <div className="contact-row">

                <div className="contact-preview">
                  {renderPreviewStatus(messagePreviews[c])}
                  {messagePreviews[c].content}
                </div>

                {messagePreviews[c]?.unreadCount > 0 && (
                  <div className="unread-badge">
                    {messagePreviews[c].unreadCount}
                  </div>
                )}

              </div>

            )}

          </div>

        </div>

      ))}

    </div>

  );
}