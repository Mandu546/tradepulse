import useContractStore from "../../store/contractStore";
import useSymbolStore from "../../store/symbolStore";
import useTradeStore from "../../store/tradeStore";

function TradeSummary() {
  const { selectedContract } = useContractStore();
  const { selectedSymbol } = useSymbolStore();
   const {
  stake,
  duration,
  unit,
} = useTradeStore();
  
return (
    <div
      style={{
        background: "#0f172a",
        border: "1px solid #334155",
        padding: "15px",
        borderRadius: "10px",
        marginTop: "20px",
      }}
    >
<h3
  style={{
    color: "#22c55e",
    fontSize: "24px",
  }}
>
  Trade Summary
</h3>

      <hr
        style={{
          margin: "10px 0",
          borderColor: "#334155",
        }}
      />

      <p>
<strong style={{ color: "#94a3b8" }}>
  Market
</strong>
        <br />
        {selectedSymbol}
      </p>

      <br />

      <p>
       <strong style={{ color: "#94a3b8" }}>
Contract
</strong>
        <br />
        {selectedContract}
      </p>

      <br />

      <p>
<strong style={{ color: "#94a3b8" }}>
  Stake
</strong>         
        <br />
      ${stake}        
      </p>

      <br />

      <p>
<strong style={{ color: "#94a3b8" }}>
  Duration
</strong>        
        <br />
      {duration} {unit}
      </p>
    </div>
  );
}

export default TradeSummary;
