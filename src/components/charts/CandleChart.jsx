import useCandleStore from "../../store/candleStore";
import { useEffect, useRef } from "react";

function CandleChart() {
const { candles } =
  useCandleStore();
  console.log("FIRST CANDLE", candles[0]);
  const chartRef = useRef(null);

  useEffect(() => {
    const canvas = chartRef.current;
    const ctx = canvas.getContext("2d");

    const drawChart = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = "#334155";

      for (let i = 0; i < width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }

      for (let i = 0; i < height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

if (candles.length === 0) return;

const highs = candles.map((c) => c.high);
const lows = candles.map((c) => c.low);

const highest = Math.max(...highs);
const lowest = Math.min(...lows);

const priceRange =
  highest - lowest || 1;

   const priceSteps = 6;

const candleWidth = 12;
const spacing = 18;

candles.forEach((candle, index) => {
  const x =
    50 + index * spacing;

  const openY =
    height -
    ((candle.open - lowest) /
      priceRange) *
      (height - 40);

  const closeY =
    height -
    ((candle.close - lowest) /
      priceRange) *
      (height - 40);

  const highY =
    height -
    ((candle.high - lowest) /
      priceRange) *
      (height - 40);

  const lowY =
    height -
    ((candle.low - lowest) /
      priceRange) *
      (height - 40);

  const bullish =
    candle.close >= candle.open;

  ctx.strokeStyle =
    bullish
      ? "#22c55e"
      : "#ef4444";

  ctx.fillStyle =
    bullish
      ? "#22c55e"
      : "#ef4444";

  ctx.beginPath();

  ctx.moveTo(
    x + candleWidth / 2,
    highY
  );

  ctx.lineTo(
    x + candleWidth / 2,
    lowY
  );

  ctx.stroke();

  ctx.fillRect(
    x,
    Math.min(openY, closeY),
    candleWidth,
    Math.max(
      Math.abs(closeY - openY),
      2
    )
  );
});
for (let i = 0; i <= priceSteps; i++) {
  const value =
    lowest +
    (priceRange / priceSteps) * i;

  const y =
    height -
    ((value - lowest) /
      priceRange) *
      (height - 40);

  ctx.fillStyle = "#94a3b8";

  ctx.font = "12px Arial";

  ctx.fillText(
    value.toFixed(2),
    width - 70,
    y
  );
}
        const latest =
  candles[candles.length - 1];

const latestY =
  height -
  ((latest.close - lowest) /
    priceRange) *
    (height - 40);

ctx.strokeStyle = "#22c55e";

ctx.setLineDash([6, 4]);

ctx.beginPath();

ctx.moveTo(0, latestY);

ctx.lineTo(width, latestY);

ctx.stroke();

ctx.setLineDash([]);

    };

    drawChart();
}, [candles]);

  return (
    <canvas
      ref={chartRef}
      width={1000}
      height={350}
      style={{
        width: "100%",
        background: "#0f172a",
        borderRadius: "8px",
      }}
    />
  );
}

export default CandleChart;
