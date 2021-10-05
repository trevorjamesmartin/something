import React, { useCallback, useEffect } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { socket as socketState, chat as chatState } from "../../atoms";
import ws from '../../helpers/ws'

const ChatWindow = (props) => {
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
    if (websocket) {
      console.log('ok, connected')
      return;
    }
    cbSetSocket(ws);
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
        <label>Name:</label>
        <input
          value={chat.name}
          onChange={(e) => {
            e.preventDefault();
            setChat((old) => ({ ...old, name: e.target.value }));
          }}
        />

        <textarea
          className="chat-area"
          style={{ width: "84vw", height: "42vh" }}
          value={chat.output?.join("\n")}
          readOnly
        />
        <br />
        <label>
          Chat:
          <input
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
