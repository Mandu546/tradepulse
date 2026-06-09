const WS_URL =
  "wss://ws.derivws.com/websockets/v3?app_id=1089";

export function authorizeDeriv(
  token
) {
  const socket =
    new WebSocket(WS_URL);

  socket.onopen = () => {
    socket.send(
      JSON.stringify({
        authorize: token,
      })
    );
  };

  socket.onmessage = (event) => {
    const data =
      JSON.parse(event.data);

    console.log(
      "AUTHORIZED:",
      data
    );
  };

  socket.onerror = (error) => {
    console.error(error);
  };
}
