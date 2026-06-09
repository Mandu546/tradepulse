import useHistoryStore from "../../store/historyStore";

function TradeHistory() {
  const { history } = useHistoryStore();

  return (
    <div
      style={{
        background: "#0f172a",
        border: "1px solid #334155",
        borderRadius: "10px",
        padding: "15px",
        marginTop: "20px",
      }}
    >
      <h3>Trade History</h3>

      {history.length === 0 ? (
        <p style={{ marginTop: "10px" }}>
          No closed trades
        </p>
      ) : (
        history.map((trade) => (
          <div
            key={trade.id}
            style={{
              marginTop: "10px",
              padding: "10px",
              background: "#1e293b",
              borderRadius: "8px",
            }}
          >
            <strong>{trade.contract}</strong>

            <br />

            {trade.direction}

            <br />

            {trade.market}

            <br />

            ${trade.stake}
          </div>
        ))
      )}
    </div>
  );
}

export default TradeHistory;
