import usePositionsStore from "../../store/positionsStore";
import useHistoryStore from "../../store/historyStore";

function OpenPositions() {
const {
  positions,
  removePosition,
} = usePositionsStore();
const { addHistory } = useHistoryStore();

const closePosition = (position) => {
  addHistory(position);
  removePosition(position.id);
};

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
      <h3>Open Positions</h3>

      {positions.length === 0 ? (
        <p style={{ marginTop: "10px" }}>
          No open positions
 
       </p>
      ) : (
        positions.map((position) => (
          <div
            key={position.id}
            style={{
              marginTop: "10px",
              padding: "10px",
              background: "#1e293b",
              borderRadius: "8px",
            }}
          >
           
   
<strong>
  {position.contract}
</strong>

<br />

Direction:
{position.direction}

<br />

Market:
{position.market}

<br />

Stake:
${position.stake}

<br />

Ask Price:
${position.askPrice}

<br />

Proposal ID:
{position.proposalId}

<button
  onClick={() =>
    closePosition(position)
  }
  style={{
    width: "100%",
    marginTop: "10px",
    padding: "8px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  }}
>
  Close Position
</button>
          </div>
        ))
      )}
    </div>
  );
}

export default OpenPositions;

