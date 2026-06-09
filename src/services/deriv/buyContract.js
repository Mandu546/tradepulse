import useAuthStore from "../../store/authStore";

const WS_URL =
  "wss://ws.derivws.com/websockets/v3?app_id=1089";

export function buyContract(
  proposalId
) {
  const {
    token,
  } = useAuthStore.getState();

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

     if (data.msg_type === "authorize") {
  console.log(
    "AUTHORIZED:",
    data
  );

  socket.send(
    JSON.stringify({
      buy: proposalId,

      price: 1000,
    })
  );

  return;
}

    console.log(
      "BUY RESPONSE:",
      data
    );
  };

  socket.onerror = (error) => {
    console.error(error);
  };
}

