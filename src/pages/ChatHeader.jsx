import { getAvatarColor } from "../utils/avatarColor";
import "../styles/chatHeader.css";

export default function ChatHeader({ selectedUser, userProfile, setShowProfile, isTyping }) {

  function avatar() {

    if (!userProfile) return null;

    if (userProfile.profilePicture) {
      return <img src={userProfile.profilePicture} alt="" />;
    }

    const letter =
      (userProfile.username || userProfile.email)
        .charAt(0)
        .toUpperCase();

    return (
      <div
        className="chat-avatar-letter"
        style={{
          backgroundColor: getAvatarColor(userProfile.email)
        }}
      >
        {letter}
      </div>
    );

  }

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

  if (!selectedUser || !userProfile) {
    return <div className="chat-placeholder">Select a contact</div>;
  }

  return (

    <div className="chat-header-inner">

      <div
        className="chat-header-left"
        onClick={() => setShowProfile(true)}
      >

        <div className="chat-user-avatar">
          {avatar()}
        </div>

        <div className="chat-user-name">
          {userProfile.username || userProfile.email}
        </div>

      </div>

      <div className="chat-header-right">
        {isTyping ? (

          <span className="typing-status">
            Typing...
          </span>

        ) : userProfile.online ? (

          <span className="online-status">
            online
          </span>

        ) : (

          <span className="last-seen">
            last seen {formatLastSeen(userProfile.lastSeen)}
          </span>

        )}

      </div>

    </div>

  );

}