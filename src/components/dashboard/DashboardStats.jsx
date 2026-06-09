import usePositionsStore from "../../store/positionsStore";
import useHistoryStore from "../../store/historyStore";

function DashboardStats() {
  const { positions } = usePositionsStore();
  const { history } = useHistoryStore();

  const totalTrades =
    positions.length + history.length;

  const openTrades =
    positions.length;

  const closedTrades =
    history.length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: "20px",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h3>Total Trades</h3>
        <h1>{totalTrades}</h1>
      </div>

      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h3>Open Trades</h3>
        <h1>{openTrades}</h1>
      </div>

      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <h3>Closed Trades</h3>
        <h1>{closedTrades}</h1>
      </div>
    </div>
  );
}

export default DashboardStats;

