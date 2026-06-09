function Topbar() {
  return (
    <div
      style={{
        height: "65px",
        background: "#0f172a",
        borderBottom: "1px solid #1e293b",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 25px",
      }}
    >
      <h3>TradePulse Dashboard</h3>

      <div>
        <span>Guest Account</span>
      </div>
    </div>
  );
}

export default Topbar;
