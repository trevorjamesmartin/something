import updateChat from "./state";
const hostname = window.location.hostname;
const secureProtocol = window.location.href.startsWith('https');
const wsURL = `${secureProtocol ? 'wss':'ws'}://${secureProtocol ? window.location.host : hostname + ':8080'}/ws`;
const ws = new WebSocket(wsURL);

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
