function TradingToolbar() {
  return (
    <div
      style={{
        background: "#0f172a",
        padding: "15px",
        borderRadius: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "15px",
        }}
      >
        <select
          style={{
            background: "#1e293b",
            color: "white",
            border: "none",
            padding: "10px",
            borderRadius: "6px",
          }}
        >
          <option>Volatility 10</option>
          <option>Volatility 25</option>
          <option>Volatility 50</option>
          <option>Volatility 75</option>
          <option>Volatility 100</option>
        </select>

        <select
          style={{
            background: "#1e293b",
            color: "white",
            border: "none",
            padding: "10px",
            borderRadius: "6px",
          }}
        >
          <option>1m</option>
          <option>5m</option>
          <option>15m</option>
          <option>1H</option>
        </select>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          style={{
            background: "#16a34a",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          BUY
        </button>

        <button
          style={{
            background: "#dc2626",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          SELL
        </button>
      </div>
    </div>
  );
}

export default TradingToolbar;
