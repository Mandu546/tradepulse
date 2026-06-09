import useContractStore from "../../store/contractStore";
import TradeSummary from "./TradeSummary";
import TradeControls from "./TradeControls";
import useContractConfigStore from "../../store/contractConfigStore";
import OpenPositions from "./OpenPositions";
import TradeHistory from "./TradeHistory";

function ContractTypes() {
const {
  selectedContract,
  setSelectedContract,
} = useContractStore();

const {
  setContractType,
  setTradeDirection,
} = useContractConfigStore();


  const contracts = [
    "Higher / Lower",
    "Rise / Fall",
    "Odd / Even",
    "Over / Under",
    "Matches / Differs",
    "Accumulators",
    "Multipliers",
  ];

  return (
    <div>
      <h2>Trade Types</h2>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {contracts.map((item) => (
<div
  key={item}
onClick={() => {
  setSelectedContract(item);

  if (item === "Rise / Fall") {
    setContractType("CALL");
    setTradeDirection("CALL");
  }

  if (item === "Higher / Lower") {
    setContractType("CALL");
    setTradeDirection("CALL");
  }

  if (item === "Over / Under") {
    setContractType("OVER");
    setTradeDirection("OVER");
  }

  if (item === "Matches / Differs") {
    setContractType("MATCH");
    setTradeDirection("MATCH");
  }

  if (item === "Odd / Even") {
    setContractType("ODD");
    setTradeDirection("ODD");
  }
}}
  style={{
    background:
      selectedContract === item
        ? "#22c55e"
        : "#0f172a",

    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",

    transition: "0.2s",
  }}
>
  {item}
</div>
        ))}
      </div>
      <TradeSummary />
<TradeControls />
<OpenPositions />
<TradeHistory />

    </div>
  );
}

export default ContractTypes;
