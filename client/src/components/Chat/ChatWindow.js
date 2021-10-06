import React, { useCallback, useEffect, useRef } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { socket as socketState, chat as chatState } from "../../atoms";
import ws from "../../helpers/ws";

const ChatWindow = () => {
  const inputText = useRef(null);
  const chat = useRecoilValue(chatState);
  const [, setChat] = useRecoilState(chatState);
  const [, setSocket] = useRecoilState(socketState);
  const websocket = useRecoilValue(socketState);

  const cbSetSocket = useCallback(
    function (value) {
      setSocket(value);
    },
    [setSocket]
  );

  useEffect(() => {
    if (inputText.current) {
      inputText.current.focus();
    }
    if (!websocket) {
      // connect to websocket
      cbSetSocket(ws);
      console.log("connected to websocket");
    }
  }, [websocket, cbSetSocket]);

  function say(e) {
    e.preventDefault();

    // prepare data to be sent
    const params = new URLSearchParams();
    params.set("foo", "chat");
    params.set("name", chat.name);
    params.set("data", chat.input);

    // clear input
    setChat((old) => ({ ...old, input: "" }));

    // send data
    websocket?.send(params);
  }

  return (
    <>
      <form onSubmit={say}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            marginLeft: "8vw",
          }}
        >
          <label>[{chat.name}]</label>
        </div>
        <br />
        <div>
        <textarea
          className="chat-area"
          style={{ width: "84vw", height: "42vh" }}
          value={chat.output?.join("\n")}
          readOnly
        />
        <textarea
          className="user-list"
          style={{ width: "12vw", height: "42vh" }}
          value={chat.users?.join('\n')}
          readOnly
        />
        </div>
        <br />
        <label>
          Chat:
          <input
            onFocus={(e) => e.currentTarget.select()}
            value={chat.input}
            style={{ width: "77vw" }}
            onChange={(e) => {
              e.preventDefault();
              setChat((old) => ({ ...old, input: e.target.value }));
            }}
          />
        </label>
        <button type="submit">enter</button>
      </form>
    </>
  );
};

export default ChatWindow;
