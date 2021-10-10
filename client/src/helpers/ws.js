import updateChat, {
  updateChatNames,
  connectionClosed,
  connectionOpened,
} from "./state";

function connectWebSocket() {
  return new WebSocket(`${window.location.href.startsWith("https") ? "wss" : "ws"}://${window.location.host}/ws`);
}

const ws = connectWebSocket();

/**
 *
 * @param {URLSearchParams} params
 * @returns {Object} jsonObj
 */
function unLoadSearchParams(params) {
  const keys = params.get("keys").split(",");
  const jsonObj = {};
  keys.forEach((keyName) => (jsonObj[keyName] = params.get(keyName)));
  return jsonObj;
}

function intoStorage(jsonObj) {
  try {
    Object.keys(jsonObj).forEach((keyName) =>
      localStorage.setItem(keyName, jsonObj[keyName])
    );
  } catch (error) {
    console.log(error.message);
  }
}

// connection opened
ws.addEventListener("open", function (event) {
  // connection opened, shake hands
  const params = new URLSearchParams();
  params.set("foo", "yo");
  // if an old session exists, send it
  const oldSession = localStorage.getItem("session");
  const oldName = localStorage.getItem("name");
  params.set("session", oldSession);
  params.set("name", oldName);
  console.log("reply, ", params.toString());
  ws.send(`?${params.toString()}`);
  connectionOpened();
});

// PING
ws.addEventListener("ping", () => ws.send("pong"));

// CLOSE
ws.addEventListener("close", () => connectionClosed);

// listen for messages
ws.addEventListener("message", async function (event) {
  const params = new URLSearchParams(event.data);
  switch (params.get("foo")) {
    case "chat":
      await updateChat(params);
      break;
    case "userlist":
      console.log("received a list of nicknames");
      updateChatNames(params);
      break;
    case "yo":
      const ok = unLoadSearchParams(params);
      delete ok["foo"];
      intoStorage(ok); // save for next session
      break;
    default:
      break;
  }
});

export default ws;
