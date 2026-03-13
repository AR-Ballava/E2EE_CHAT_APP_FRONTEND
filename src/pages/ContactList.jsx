import "../styles/contactList.css"

export default function ContactList({
  contacts,
  contactProfiles,
  messagePreviews,
  selectedUser,
  setSelectedUser,
  formatPreviewTime,
  getAvatarColor,
  setShowProfile,
  setProfileEmail
}) {

  function contactAvatar(email) {

    const profile = contactProfiles[email];

    if (profile && profile.profilePicture) {
      return <img src={profile.profilePicture} alt="" />;
    }

    const letter =
      (profile?.username || email)
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

    return timeB - timeA; // newest first

  });

  return (

    <div className="contact-list">

      {sortedContacts.map((c, i) => (

        <div
          key={i}
          className={`contact-item ${selectedUser === c ? "active" : ""}`}
          onClick={() => setSelectedUser(c)}
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

            <div className="contact-top">

              <div className="contact-name">
                {contactProfiles[c]?.username || c}
              </div>

              {messagePreviews[c] && (
                <div className="contact-time">
                  {formatPreviewTime(messagePreviews[c].sentAt)}
                </div>
              )}

            </div>

            {messagePreviews[c] && (
              <div className="contact-preview">
                {messagePreviews[c].content}
              </div>
            )}

          </div>

        </div>

      ))}

    </div>

  );
}