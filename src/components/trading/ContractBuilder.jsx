function ContractBuilder() {
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
        <label>Trade Type</label>

        <select
          style={{
            width: "100%",
            marginTop: "5px",
            padding: "10px",
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
        <label>Duration</label>

        <select
          style={{
            width: "100%",
            marginTop: "5px",
            padding: "10px",
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
        </select>
      </div>

      <div>
        <label>Stake ($)</label>

        <input
          defaultValue="10"
          style={{
            width: "100%",
            marginTop: "5px",
            padding: "10px",
            background: "#0f172a",
            color: "white",
            border: "1px solid #334155",
            borderRadius: "6px",
          }}
        />
      </div>

      <button
        style={{
          padding: "12px",
          background: "#22c55e",
          border: "none",
          borderRadius: "8px",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        BUY
      </button>

      <button
        style={{
          padding: "12px",
          background: "#ef4444",
          border: "none",
          borderRadius: "8px",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        SELL
      </button>
    </div>
  );
}

export default ContractBuilder;
