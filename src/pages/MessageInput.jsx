import "../styles/messageInput.css";
export default function MessageInput({ text, setText, send, sendTyping }) {

  return (

    <div className="input-area">

      <input
        value={text}
        placeholder="Type message..."
        onChange={(e)=>{

          setText(e.target.value);
          sendTyping(true);

        }}
        onBlur={()=>sendTyping(false)}
        onKeyDown={(e)=>{
          if(e.key==="Enter") send();
        }}
      />

      <button
        onClick={send}
        disabled={!text.trim()}
      >
        Send
      </button>

    </div>

  );

}