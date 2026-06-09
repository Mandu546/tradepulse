function OrderPanel() {
  return (
    <div
      style={{
        background: "#1e293b",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      }}
    >
      <h2>Trade Entry</h2>

      <div style={{ marginTop: "20px" }}>
        <label>Stake ($)</label>

        <input
          type="number"
          defaultValue="10"
          style={{
            width: "100%",
            marginTop: "8px",
            padding: "10px",
            background: "#0f172a",
            color: "white",
            border: "1px solid #334155",
            borderRadius: "6px",
          }}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <label>Duration</label>

        <select
          style={{
            width: "100%",
            marginTop: "8px",
            padding: "10px",
            background: "#0f172a",
            color: "white",
            border: "1px solid #334155",
            borderRadius: "6px",
          }}
        >
          <option>1 Minute</option>
          <option>5 Minutes</option>
          <option>15 Minutes</option>
        </select>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "25px",
        }}
      >
        <button
          style={{
            flex: 1,
            background: "#16a34a",
            color: "white",
            border: "none",
            padding: "12px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          BUY
        </button>

        <button
          style={{
            flex: 1,
            background: "#dc2626",
            color: "white",
            border: "none",
            padding: "12px",
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

export default OrderPanel;

