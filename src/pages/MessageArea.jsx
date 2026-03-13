import "../styles/messageArea.css";

export default function MessageArea({ messages, currentUser, bottomRef, selectedUser }) {

  function formatTime(timestamp) {

    if (!timestamp) return "";

    const d = new Date(timestamp);

    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

  }

  function renderStatus(message) {

    if (message.senderId !== currentUser) return null;

    if (message.status === "SENT") {
      return <span className="msg-status">✓</span>;
    }

    if (message.status === "DELIVERED") {
      return <span className="msg-status">✓✓</span>;
    }

    if (message.status === "READ") {
      return <span className="msg-status read">✓✓</span>;
    }

    return null;
  }

  return (

    <div className="message-area">

      {/* NO CONTACT SELECTED */}

      <div className="chat-guide">

        {!selectedUser ? (

          <div className="chat-onboarding">

            <div className="chat-onboarding-icon">
              💬
            </div>

            <h1 className="chat-onboarding-title">
              Start your first conversation
            </h1>

            <p className="chat-onboarding-sub">
              Connect with people and start chatting instantly.
            </p>

            <div className="chat-onboarding-features">

              <div className="feature">
                <div className="feature-icon">➕</div>
                <h3>Add Contacts</h3>
                <p>Add people using the username field on the left panel.</p>
              </div>

              <div className="feature">
                <div className="feature-icon">👆</div>
                <h3>Select a Contact</h3>
                <p>Click a contact to open your conversation.</p>
              </div>

              <div className="feature">
                <div className="feature-icon">✉️</div>
                <h3>Send Messages</h3>
                <p>Type a message and press Enter to start chatting.</p>
              </div>

            </div>

          </div>

        ) : (

          <div className="chat-empty">

            <div className="chat-empty-icon">📨</div>

            <h2>No messages yet</h2>

            <p>
              Send the first message to begin your conversation.
            </p>

          </div>

        )}

      </div>

      {/* NORMAL CHAT */}

        {selectedUser && messages.length > 0 && (

        messages.map((m) => (

            <div
            key={m.id}
            className={
                m.senderId === currentUser
                ? "message sent"
                : "message received"
            }
            >

            <div className="text">
                {m.content}
            </div>

            <div className="message-meta">

                <span className="time">
                {formatTime(m.sentAt)}
                </span>

                {renderStatus(m)}

            </div>

            </div>

        ))

        )}

      <div ref={bottomRef}></div>

    </div>

  );

}