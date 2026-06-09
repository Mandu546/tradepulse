function ContractPanel() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      <h2>Trade Setup</h2>

      <div>
        <label>Market</label>

        <select
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            background: "#0f172a",
            color: "white",
            border: "1px solid #334155",
            borderRadius: "6px",
          }}
        >
          <option>Volatility 10</option>
          <option>Volatility 25</option>
          <option>Volatility 50</option>
          <option>Volatility 75</option>
          <option>Volatility 100</option>
        </select>
      </div>

      <div>
        <label>Trade Type</label>

        <select
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            background: "#0f172a",
            color: "white",
            border: "1px solid #334155",
            borderRadius: "6px",
          }}
        >
          <option>Rise/Fall</option>
          <option>Higher/Lower</option>
          <option>Odd/Even</option>
          <option>Over/Under</option>
        </select>
      </div>

      <div>
        <label>Stake ($)</label>

        <input
          type="number"
          defaultValue="10"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            background: "#0f172a",
            color: "white",
            border: "1px solid #334155",
            borderRadius: "6px",
          }}
        />
      </div>

      <div>
        <label>Duration</label>

        <select
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            background: "#0f172a",
            color: "white",
            border: "1px solid #334155",
            borderRadius: "6px",
          }}
        >
          <option>1 Tick</option>
          <option>5 Ticks</option>
          <option>10 Ticks</option>
          <option>1 Minute</option>
          <option>5 Minutes</option>
        </select>
      </div>

      <button
        style={{
          background: "#22c55e",
          color: "white",
          border: "none",
          padding: "12px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        BUY
      </button>

      <button
        style={{
          background: "#ef4444",
          color: "white",
          border: "none",
          padding: "12px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        SELL
      </button>
    </div>
  );
}

export default ContractPanel;

