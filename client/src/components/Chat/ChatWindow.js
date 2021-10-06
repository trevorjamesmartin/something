import React, { useCallback, useEffect, useRef } from "react";

import QRCode from "react-qr-code";

import { useRecoilValue, useRecoilState } from "recoil";
import { socket as socketState, chat as chatState } from "../../atoms";
import ws from "../../helpers/ws";

// style
import { TextField, TextareaAutosize, Button, Divider } from "@mui/material";

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
      <Divider variant="middle" sx={{ margin: "1rem" }} />
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
          <TextareaAutosize
            className="chat-area"
            value={chat.output?.join("\n")}
            style={{ width: "84vw", height: "42vh" }}
            readOnly
          />
          <TextareaAutosize
            className="user-list"
            style={{ width: "12vw", height: "42vh" }}
            value={chat.users?.join("\n")}
            readOnly
          />
          <Divider variant="middle" sx={{ margin: "1rem" }} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <TextField
              onFocus={(e) => e.currentTarget.select()}
              value={chat.input}
              style={{ width: "77vw" }}
              placeholder="type something & press enter to send"
              onChange={(e) => {
                e.preventDefault();
                setChat((old) => ({ ...old, input: e.target.value }));
              }}
            />
            <Button type="submit">enter</Button>
          </div>
        </div>
      </form>
      <br />
      <div style={{ padding: "1rem" }}>
        {window.location.href.startsWith("https") ? (
          <QRCode value={window.location.href} />
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default ChatWindow;
