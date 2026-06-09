
import OrderPanel from "../trading/OrderPanel";
import LivePrice from "../trading/LivePrice";


function AccountPanel() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          padding: "15px",
          borderRadius: "10px",
        }}
      >
        <h3>Balance</h3>
        <h1>$10,000</h1>
      </div>

      <div
        style={{
          background: "#1e293b",
          padding: "15px",
          borderRadius: "10px",
        }}
      >
        <h3>Open Positions</h3>
        <h1>0</h1>
      </div>

      <div
        style={{
          background: "#1e293b",
          padding: "15px",
          borderRadius: "10px",
        }}
      >
        <h3>Status</h3>
        <p>Disconnected</p>
      </div>
<LivePrice />
<OrderPanel />
    </div>
  );
}

export default AccountPanel;
