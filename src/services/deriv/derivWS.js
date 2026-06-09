const ws = new WebSocket(
  "wss://ws.derivws.com/websockets/v3?app_id=1089"
);

export function subscribeToVol75(callback) {
  ws.onopen = () => {
    console.log("Connected to Deriv");

    ws.send(
      JSON.stringify({
        ticks: "R_75",
        subscribe: 1,
      })
    );
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.tick) {
      callback(data.tick.quote);
    }
  };

  ws.onerror = (error) => {
    console.error(error);
  };
}
