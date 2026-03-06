import ContactPanel from "./ContactPanel";
import ChatWindow from "./ChatWindow";
import "../styles/chat.css";
import { useState } from "react";

export default function Chat({ token }) {

  const [selectedUser, setSelectedUser] = useState(null);

  return (

    <div className="chat-container">

      <ContactPanel
        token={token}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
      />

      <ChatWindow
        token={token}
        selectedUser={selectedUser}
      />

    </div>

  );

}