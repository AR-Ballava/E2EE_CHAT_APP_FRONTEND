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

  return (

    <div className="chat-container">

      <ContactPanel
        token={token}
        contacts={contacts}
        setContacts={setContacts}
        messagePreviews={messagePreviews}
        setMessagePreviews={setMessagePreviews}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />

      <ChatWindow
        token={token}
        selectedUser={selectedUser}
        setMessagePreviews={setMessagePreviews}
        setContacts={setContacts}
      />

    </div>

  );
}