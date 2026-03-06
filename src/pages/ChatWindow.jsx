import { useState, useEffect, useRef } from "react";
import { connectSocket } from "../services/socket";
import { jwtDecode } from "jwt-decode";
import { getAvatarColor } from "../utils/avatarColor";
import Profile from "./Profile";
import "../styles/chatWindow.css";

export default function ChatWindow({ token, selectedUser }) {

  const decoded = jwtDecode(token);
  const currentUser = decoded.sub;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [client, setClient] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const selectedUserRef = useRef(null);

  function generateConversationId(a,b){
    return a<b ? `${a}_${b}` : `${b}_${a}`;
  }

  /* keep selected user reference */

  useEffect(()=>{
    selectedUserRef.current = selectedUser;
  },[selectedUser]);

  /* SOCKET CONNECTION (connect once) */

  useEffect(()=>{

    const socketClient = connectSocket(

      token,

      (msg)=>{

        const activeUser = selectedUserRef.current;

        const isCurrentChat =
          (msg.senderId===currentUser && msg.receiverId===activeUser) ||
          (msg.senderId===activeUser && msg.receiverId===currentUser);

        if(isCurrentChat){

          setMessages(prev=>{

            /* prevent duplicates */

            const exists = prev.some(m =>
              m.senderId === msg.senderId &&
              m.receiverId === msg.receiverId &&
              m.content === msg.content &&
              m.sentAt === msg.sentAt
            );

            if(exists) return prev;

            return [...prev,msg];

          });

        }

      },

      (connectedClient)=>{
        setClient(connectedClient);
        socketRef.current = connectedClient;
      }

    );

    return ()=>{
      if(socketRef.current) socketRef.current.deactivate();
    };

  },[token]);

  /* LOAD MESSAGE HISTORY */

  useEffect(()=>{

    if(!selectedUser) return;

    const conversationId =
      generateConversationId(currentUser,selectedUser);

    fetch(`  https://noncommunicating-princess-sinusoidally.ngrok-free.dev/api/messages/${conversationId}`,{
      headers:{Authorization:"Bearer "+token}
    })
    .then(res=>res.json())
    .then(data=>setMessages(data));

  },[selectedUser]);

  /* SCROLL TO BOTTOM */

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages]);

  /* LOAD USER PROFILE */

  useEffect(()=>{

    if(!selectedUser) return;

    fetch(`  https://noncommunicating-princess-sinusoidally.ngrok-free.dev/api/profile/${selectedUser}`,{
      headers:{Authorization:"Bearer "+token}
    })
    .then(res=>res.json())
    .then(setUserProfile);

  },[selectedUser]);

  /* SEND MESSAGE */

  function send(){

    if(!client || !client.connected) return;
    if(!text.trim()) return;

    const msg = {
      senderId: currentUser,
      receiverId: selectedUser,
      content: text,
      sentAt: new Date().toISOString()
    };

    client.publish({
      destination:"/app/chat.send",
      body:JSON.stringify(msg)
    });

    /* optimistic UI */

    setMessages(prev=>[...prev,msg]);

    setText("");

  }

  /* TIME FORMAT */

  function formatTime(timestamp){

    if(!timestamp) return "";

    const d = new Date(timestamp);

    return d.toLocaleTimeString([],{
      hour:"2-digit",
      minute:"2-digit"
    });

  }

  /* AVATAR */

  function avatar(){

    if(!userProfile) return null;

    if(userProfile.profilePicture){
      return <img src={userProfile.profilePicture} alt=""/>;
    }

    const letter =
      (userProfile.username || userProfile.email)
      .charAt(0)
      .toUpperCase();

    return (
      <div
        className="chat-avatar-letter"
        style={{
          backgroundColor:getAvatarColor(userProfile.email)
        }}
      >
        {letter}
      </div>
    );

  }

  /* LAST SEEN FORMAT */

  function formatLastSeen(timestamp){

    if(!timestamp) return "";

    const now = new Date();
    const last = new Date(timestamp);

    const diff = now-last;

    const seconds = Math.floor(diff/1000);
    const minutes = Math.floor(diff/(1000*60));
    const hours = Math.floor(diff/(1000*60*60));
    const days = Math.floor(diff/(1000*60*60*24));

    if(seconds<15) return "just now";
    if(minutes<60) return `${minutes} min ago`;
    if(hours<24) return `${hours} hour${hours>1?"s":""} ago`;
    if(days===1) return "yesterday";
    if(days<7) return `${days} days ago`;

    if(days<365){
      return last.toLocaleDateString([],{
        month:"short",
        day:"numeric"
      });
    }

    return last.toLocaleDateString([],{
      year:"numeric",
      month:"short",
      day:"numeric"
    });

  }

  return(

    <>

    <div className="chat-panel">

      <div className="chat-header">

        {selectedUser && userProfile ?(

          <div className="chat-header-inner">

            <div
              className="chat-user"
              onClick={()=>setShowProfile(true)}
            >

              <div className="chat-user-avatar">
                {avatar()}
              </div>

              <div className="chat-user-name">
                {userProfile.username || userProfile.email}
              </div>

            </div>

            <div className="chat-user-status">

              {userProfile.online ?(
                <span className="online-status">
                  online
                </span>
              ):(
                <span className="last-seen">
                  last seen {formatLastSeen(userProfile.lastSeen)}
                </span>
              )}

            </div>

          </div>

        ):(
          <div>Select a contact</div>
        )}

      </div>

      <div className="message-area">

        {messages.map((m)=>(
          <div
            key={(m.sentAt || "") + m.senderId + m.content}
            className={
              m.senderId===currentUser
              ?"message sent"
              :"message received"
            }
          >

            <div className="text">
              {m.content}
            </div>

            <div className="time">
              {formatTime(m.sentAt)}
            </div>

          </div>
        ))}

        <div ref={bottomRef}></div>

      </div>

      {selectedUser &&(

        <div className="input-area">

          <input
            value={text}
            placeholder="Type message..."
            onChange={(e)=>setText(e.target.value)}
            onKeyDown={(e)=>{
              if(e.key==="Enter") send();
            }}
          />

          <button onClick={send}>
            Send
          </button>

        </div>

      )}

    </div>

    {showProfile &&(
      <Profile
        token={token}
        email={selectedUser}
        onClose={()=>setShowProfile(false)}
      />
    )}

    </>

  );

}