import updateChat from "./state";
const ws = new WebSocket("ws://0.0.0.0:8080/ws");

// connection opened
ws.addEventListener("open", function (event) {
  ws.send("Hello");
});

// listen for messages
ws.addEventListener("message", async function (event) {
  const params = new URLSearchParams(event.data);
  switch (params.get('foo')) {
    case 'chat':
      await updateChat(`[${params.get('name')}] ${params.get('data')}`);
      break;
 
    default:
      break;
  }
});

export default ws;
