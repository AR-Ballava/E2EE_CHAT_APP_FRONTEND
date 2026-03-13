import { useState, useEffect, useRef } from "react";
import { connectSocket } from "../services/socket";
import { jwtDecode } from "jwt-decode";
import "../styles/chatWindow.css";
import ChatHeader from "./ChatHeader";
import MessageArea from "./MessageArea";
import MessageInput from "./MessageInput";
import Profile from "./Profile";

export default function ChatWindow({ token, selectedUser, setMessagePreviews, setContacts}) {

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

  const [isTyping,setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  function generateConversationId(a,b){
    return a<b ? `${a}_${b}` : `${b}_${a}`;
  }

  useEffect(()=>{
    selectedUserRef.current = selectedUser;
  },[selectedUser]);

  /* SOCKET CONNECTION */

  useEffect(()=>{

    function startSocket(authToken){

      const socketClient = connectSocket(

        authToken,

        /* MESSAGE RECEIVED */

        (msg)=>{

          const activeUser = selectedUserRef.current;

          const isCurrentChat =
            (msg.senderId===currentUser && msg.receiverId===activeUser) ||
            (msg.senderId===activeUser && msg.receiverId===currentUser);

          /* MARK DELIVERED */

          if(msg.receiverId === currentUser && msg.id){

            fetch(`https://e2ee-chat.duckdns.org/api/messages/delivered/${msg.id}`,{
              method:"POST",
              headers:{Authorization:"Bearer "+authToken}
            });

          }

          if(isCurrentChat){

            setMessages(prev=>{

              const index = prev.findIndex(m => m.id === msg.id);

              if(index !== -1){

                const updated = [...prev];
                updated[index] = { ...updated[index], ...msg };
                return updated;

              }

              return [...prev,msg];

            });

          }

            /* UPDATE CONTACT PREVIEW */

            const otherUser =
              msg.senderId === currentUser ? msg.receiverId : msg.senderId;

            /* UPDATE PREVIEW */

            setMessagePreviews(prev => ({
              ...prev,
              [otherUser]: {
                content: msg.content,
                sentAt: msg.sentAt
              }
            }));

            /* MOVE CONTACT TO TOP */

            setContacts(prev => {

              const filtered = prev.filter(c => c !== otherUser);
              return [otherUser, ...filtered];

            });

        },

        /* SOCKET CONNECTED */

        (connectedClient)=>{

          setClient(connectedClient);
          socketRef.current = connectedClient;

          /* STATUS UPDATES */

          connectedClient.subscribe("/user/queue/status",(payload)=>{

            const statusMsg = JSON.parse(payload.body);

            setMessages(prev => {

              let changed = false;

              const updated = prev.map(m => {

                if(m.id === statusMsg.id && m.status !== statusMsg.status){
                  changed = true;
                  return { ...m, status: statusMsg.status };
                }

                return m;

              });

              return changed ? updated : prev;

            });

          });

          connectedClient.subscribe("/user/queue/typing",(payload)=>{

            const typingMsg = JSON.parse(payload.body);

            if(typingMsg.senderId === selectedUserRef.current){

              setIsTyping(typingMsg.typing);

            }

          });

        }

      );

      socketRef.current = socketClient;

    }

    startSocket(token);

    /* RECONNECT SOCKET WHEN TOKEN REFRESHES */

    function reconnectSocket(){

      const newToken = localStorage.getItem("token");

      if(socketRef.current){
        socketRef.current.deactivate();
      }

      startSocket(newToken);

    }

    window.addEventListener("tokenRefreshed", reconnectSocket);

    return ()=>{
      if(socketRef.current) socketRef.current.deactivate();
      window.removeEventListener("tokenRefreshed", reconnectSocket);
    };

  },[token]);



  /* LOAD MESSAGE HISTORY */

  useEffect(()=>{

    if(!selectedUser){
      setMessages([]);
      return;
    }

    const conversationId =
      generateConversationId(currentUser,selectedUser);

    fetch(`https://e2ee-chat.duckdns.org/api/messages/${conversationId}`,{
      headers:{Authorization:"Bearer "+token}
    })
    .then(res=>res.json())
    .then(setMessages);

  },[selectedUser,token]);



  /* MARK READ */

  useEffect(()=>{

    messages
      .filter(m=>m.receiverId===currentUser && m.status!=="READ")
      .forEach(m=>{

        if(!m.id) return;

        fetch(`https://e2ee-chat.duckdns.org/api/messages/read/${m.id}`,{
          method:"POST",
          headers:{Authorization:"Bearer "+token}
        });

      });

  },[messages]);



  /* AUTO SCROLL */

  const firstLoadRef = useRef(true);

  useEffect(() => {

    if (!bottomRef.current) return;

    if (firstLoadRef.current) {

      /* INSTANT SCROLL ON CHAT OPEN */
      bottomRef.current.scrollIntoView({ behavior: "auto" });
      firstLoadRef.current = false;

    } else {

      /* SMOOTH SCROLL ONLY FOR NEW MESSAGES */
      bottomRef.current.scrollIntoView({ behavior: "smooth" });

    }

  }, [messages]);



  useEffect(() => {
    firstLoadRef.current = true;
  }, [selectedUser]);

  /* LOAD PROFILE */

  useEffect(()=>{

    if(!selectedUser){
      setUserProfile(null);
      return;
    }

    fetch(`https://e2ee-chat.duckdns.org/api/profile/${selectedUser}`,{
      headers:{Authorization:"Bearer "+token}
    })
    .then(res=>res.json())
    .then(setUserProfile);

  },[selectedUser,token]);



  /* SEND MESSAGE */

  function send(){

    if(!client || !client.connected) return;
    if(!text.trim()) return;

    const msg = {
      senderId: currentUser,
      receiverId: selectedUser,
      content: text,
      sentAt: new Date().toISOString(),
      status:"SENT"
    };

    client.publish({
      destination:"/app/chat.send",
      body:JSON.stringify(msg)
    });

    /* UPDATE PREVIEW IMMEDIATELY */

    setMessagePreviews(prev => ({
      ...prev,
      [selectedUser]: {
        content: text,
        sentAt: msg.sentAt
      }
    }));

    /* MOVE CONTACT TO TOP */

    setContacts(prev => {

      const filtered = prev.filter(c => c !== selectedUser);
      return [selectedUser, ...filtered];

    });

    /* UPDATE PREVIEW IMMEDIATELY */



    setText("");

  }


  // Typing Indicator

  function sendTyping(status){

    if(!client || !client.connected) return;
    if(!selectedUser) return;

    const typingMsg = {
      senderId: currentUser,
      receiverId: selectedUser,
      typing: status
    };

    client.publish({
      destination:"/app/chat.typing",
      body:JSON.stringify(typingMsg)
    });

    /* AUTO STOP TYPING AFTER 1.5s */

    if(status){

      clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(()=>{

        client.publish({
          destination:"/app/chat.typing",
          body:JSON.stringify({
            senderId: currentUser,
            receiverId: selectedUser,
            typing:false
          })
        });

      },1000);

    }

  }


  return(

    <>

      <div className="chat-panel">

        <div className="chat-header">

          <ChatHeader
            selectedUser={selectedUser}
            userProfile={userProfile}
            setShowProfile={setShowProfile}
            isTyping={isTyping}
          />

        </div>

        <MessageArea
          messages={messages}
          currentUser={currentUser}
          bottomRef={bottomRef}
          selectedUser={selectedUser}
        />

        {selectedUser && (

          <MessageInput
            text={text}
            setText={setText}
            send={send}
            sendTyping={sendTyping}
          />

        )}

      </div>

      {showProfile && (
        <Profile
          token={token}
          email={selectedUser}
          onClose={()=>setShowProfile(false)}
        />
      )}

    </>

  );

}