import CandleChart from "../charts/CandleChart";
import TradingToolbar from "./TradingToolbar";

function ChartPanel() {
  return (
    <div
      style={{
        background: "#1e293b",
        borderRadius: "10px",
        padding: "20px",
        minHeight: "400px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      }}
    >
      <h2>Trading Chart</h2>
           <TradingToolbar />

<div
  style={{
    marginTop: "20px",
  }}
>
  <CandleChart />
</div>

    </div>
  );
}

export default ChartPanel;
