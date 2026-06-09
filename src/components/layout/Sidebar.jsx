function Sidebar() {
return (
  <div
    style={{
      width: "240px",
      background: "#0f172a",
      padding: "25px",
      borderRight: "1px solid #1e293b",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    }}
  >
    <h2
      style={{
        color: "#22c55e",
        marginBottom: "25px",
      }}
    >
      TradePulse
    </h2>

    <div style={{ padding: "12px", cursor: "pointer" }}>
      🏠 Dashboard
    </div>

    <div style={{ padding: "12px", cursor: "pointer" }}>
      📈 Manual Trader
    </div>

    <div style={{ padding: "12px", cursor: "pointer" }}>
      🤖 Bot Builder
    </div>

    <div style={{ padding: "12px", cursor: "pointer" }}>
      👥 Copy Trading
    </div>

    <div style={{ padding: "12px", cursor: "pointer" }}>
      📊 Analytics
    </div>

    <div style={{ padding: "12px", cursor: "pointer" }}>
      ⚙️ Settings
    </div>
  </div>
);
}
export default Sidebar;
