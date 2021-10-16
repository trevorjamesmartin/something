import updateChat, {
  connectionClosed,
  connectionOpened,
  addUserNamed,
  removeUser,
  updateChatHistory,
} from "./state";

function connectWebSocket() {
  return new WebSocket(
    process.env.NODE_ENV === "development"
      ? "ws://localhost:8080/ws"
      : `${window.location.href.startsWith("https") ? "wss" : "ws"}://${
          window.location.host
        }/ws`
  );
}

const ws = connectWebSocket();

/**
 * construct object from portable JSON
 *
 * @param {URLSearchParams} portable JSON
 * @returns object
 */
export function loadPortable(usp) {
  let params = new URLSearchParams(usp);
  let keys = params.get("keys").split(",");
  const jsonObj = {};
  keys.forEach((keyName) => {
    let value = params.get(keyName);
    if (value?.startsWith(".OK.")) {
      value = value.slice(4); // remove the extra bit
    }
    let encodingType = value.slice(2, 13); // expandable
    switch (encodingType) {
      case "JSON.string":
        jsonObj[keyName] = JSON.parse(JSON.parse(value)["JSON.string"]);
        break;
      // ** future types **
      default:
        jsonObj[keyName] = value;
        break;
    }
  });
  return jsonObj;
}

// function intoStorage(jsonObj) {
//   try {
//     Object.keys(jsonObj).forEach((keyName) =>
//       localStorage.setItem(keyName, jsonObj[keyName])
//     );
//   } catch (error) {
//     console.log(error.message);
//   }
// }

// connection opened
ws.addEventListener("open", function (event) {
  // connection opened, shake hands
  const params = new URLSearchParams();
  params.set("foo", "yo");
  const oldSession = localStorage.getItem("session");
  const oldName = localStorage.getItem("name");
  params.set("session", oldSession);
  params.set("name", oldName);
  ws.send(`?${params.toString()}`);
  connectionOpened();
});

ws.addEventListener("ping", () => ws.send("pong"));

ws.addEventListener("close", () => connectionClosed);

ws.addEventListener("message", async function (event) {
  const params = new URLSearchParams(event.data);
  switch (params.get("foo")) {
    case "status":
      console.log("[status] ", params.get("name"), params.get("data"));
      break;
    case "@joins":
      addUserNamed(loadPortable(params));
      break;
    case "@leaves":
      let { id, name } = loadPortable(params.toString());
      console.log(name, "has left the chatroom");
      removeUser({ id });
      break;
    case "chat":
      await updateChat(params);
      break;
    case "yo?":
      const sent = loadPortable(event.data);
      const chatlog = typeof sent?.chatlog !== "string" ? sent.chatlog : [];
      const users = sent?.users || [];
      await updateChatHistory({ chatlog, users });
      break;
    default:
      break;
  }
});

export default ws;
