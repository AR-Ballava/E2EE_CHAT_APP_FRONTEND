import ContactPanel from "./ContactPanel";
import ChatWindow from "./ChatWindow";
import "../styles/chat.css";
import { useState } from "react";

export default function Chat({ token }) {

  const [selectedUser, setSelectedUser] = useState(null);

  /* GLOBAL CONTACT STATE */
  const [contacts, setContacts] = useState([]);

  /* GLOBAL MESSAGE PREVIEWS */
  const [messagePreviews, setMessagePreviews] = useState({});

  /* ⭐ MOBILE CHAT STATE */
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  return (

    <div className="chat-container">

      {/* CONTACT PANEL */}
      <div className={`contact-wrapper ${mobileChatOpen ? "hide-mobile" : ""}`}>

        <ContactPanel
          token={token}
          contacts={contacts}
          setContacts={setContacts}
          messagePreviews={messagePreviews}
          setMessagePreviews={setMessagePreviews}
          selectedUser={selectedUser}

          /* ⭐ open chat on mobile */
          setSelectedUser={(user)=>{
            setSelectedUser(user);
            setMobileChatOpen(true);
          }}
        />

      </div>

      {/* CHAT WINDOW */}
      <div className={`chat-wrapper ${mobileChatOpen ? "show-mobile" : ""}`}>

        <ChatWindow
          token={token}
          selectedUser={selectedUser}
          setMessagePreviews={setMessagePreviews}
          setContacts={setContacts}

          /* ⭐ back button for mobile */
          goBack={()=>setMobileChatOpen(false)}
        />

      </div>

    </div>

  );
}