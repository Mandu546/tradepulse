import { buildCandle } from "./buildCandles";
import useCandleStore from "../../store/candleStore";
import usePriceStore from "../../store/priceStore";

const WS_URL =
  "wss://ws.derivws.com/websockets/v3?app_id=1089";

let socket = null;

export function connectDeriv(symbol, onTick) {
  socket = new WebSocket(WS_URL);

socket.addEventListener("open", () => {
  console.log("Connected to Deriv");

  socket.send(
    JSON.stringify({
      ticks: symbol,
      subscribe: 1,
    })
  );
});

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.tick) {
    const price = data.tick.quote;

      usePriceStore
  .getState()
  .setCurrentPrice(price);

    onTick(price);

    const candle =
      buildCandle(price);

    const {
      candles,
      setCandles,
    } = useCandleStore.getState();

    if (candles.length === 0) {
      setCandles([candle]);
      return;
    }

    const last =
      candles[candles.length - 1];

    if (last.time === candle.time) {
      const updated = [...candles];

      updated[updated.length - 1] =
        candle;

      setCandles(updated);
    } else {
      setCandles([
        ...candles,
        candle,
      ]);
    }
  }
};
  socket.onerror = (error) => {
    console.error(error);
  };

  socket.onclose = () => {
    console.log("Connection closed");
  };
}

   export function disconnectDeriv() {
  if (
    socket &&
    socket.readyState === WebSocket.OPEN
  ) {
    socket.close();
  }
}
