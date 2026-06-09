import useTradeStore from "../../store/tradeStore";
import usePositionsStore from "../../store/positionsStore";
import useContractStore from "../../store/contractStore";
import useTradeDirectionStore from "../../store/tradeDirectionStore";
import useSymbolStore from "../../store/symbolStore";
import { useEffect } from "react";
import { requestProposal } from "../../services/deriv/proposalService";
import useProposalStore from "../../store/proposalStore";
import useContractConfigStore from "../../store/contractConfigStore";
import ContractParameters from "./ContractParameters";
import { buyContract }
  from "../../services/deriv/buyContract";
import usePriceStore from "../../store/priceStore";

  function TradeControls() {
const {
  stake,
  setStake,
} = useTradeStore();

const { addPosition } = usePositionsStore();

const { selectedContract } = useContractStore();
const buttonLabels = {
  "Rise / Fall": {
    buy: "BUY UP",
    sell: "BUY DOWN",
  },

  "Higher / Lower": {
    buy: "HIGHER",
    sell: "LOWER",
  },

  "Odd / Even": {
    buy: "ODD",
    sell: "EVEN",
  },

  "Over / Under": {
    buy: "OVER",
    sell: "UNDER",
  },

  "Matches / Differs": {
    buy: "MATCHES",
    sell: "DIFFERS",
  },

  Accumulators: {
    buy: "START",
    sell: "STOP",
  },

  Multipliers: {
    buy: "BUY",
    sell: "SELL",
  },
};

const { selectedSymbol } = useSymbolStore();

   const {
  duration,
  durationUnit,
  contractType,
  setDuration,
  setDurationUnit,
} = useContractConfigStore();


const {
  payout,
  askPrice,
  proposalId,
} = useProposalStore();

const { currentPrice } =
  usePriceStore();
const {
  direction,
  setDirection,
} = useTradeDirectionStore();
useEffect(() => {
  requestProposal({
    symbol: selectedSymbol,
    amount: stake,
    duration,
    contractType: direction,
  });
}, [
  selectedSymbol,
  stake,
  duration,
  direction,
]);
 
const handleBuyUp = () => {
  setDirection(contractType);
buyContract(proposalId);

addPosition({
  id: Date.now(),
    
   proposalId,
     askPrice,

  market: selectedSymbol,

  contract: selectedContract,

  direction: contractType,

  stake,

  duration,

  unit: durationUnit,

  entryPrice: currentPrice,

  entryTime: Date.now(),

  status: "OPEN",

  pnl: 0,
});
};
const handleBuyDown = () => {
  let opposite = "PUT";

  if (contractType === "DIGITOVER")
    opposite = "DIGITUNDER";

  if (contractType === "DIGITUNDER")
    opposite = "DIGITOVER";

  if (contractType === "DIGITODD")
    opposite = "DIGITEVEN";

  if (contractType === "DIGITEVEN")
    opposite = "DIGITODD";

  if (contractType === "DIGITMATCH")
    opposite = "DIGITDIFF";

  if (contractType === "DIGITDIFF")
    opposite = "DIGITMATCH";

  setDirection(opposite);
    buyContract(proposalId);

addPosition({
  id: Date.now(),

   proposalId,
   askPrice,  

   market: selectedSymbol,

  contract: selectedContract,

  direction: opposite,

  stake,

  duration,

  unit: durationUnit,

  entryPrice: currentPrice,

  entryTime: Date.now(),

  status: "OPEN",

  pnl: 0,
});
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
      <h3>Trade Controls</h3>

      {/* Stake */}
      <div style={{ marginTop: "15px" }}>
        <label>Stake ($)</label>

         <input
  type="number"
  value={stake}
  onChange={(e) => setStake(Number(e.target.value))}  
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            background: "#1e293b",
            color: "white",
            border: "1px solid #334155",
            borderRadius: "6px",
          }}
        />
      </div>

      {/* Duration */}
      <div style={{ marginTop: "15px" }}>
        <label>Duration</label>
       
        <input
  type="number"
  value={duration}
  onChange={(e) => setDuration(Number(e.target.value))}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            background: "#1e293b",
            color: "white",
            border: "1px solid #334155",
            borderRadius: "6px",
          }}
        />
      </div>

      {/* Duration Unit */}
      <div style={{ marginTop: "15px" }}>
        <label>Unit</label>

<select
  value={durationUnit}
  onChange={(e) =>
    setDurationUnit(e.target.value)
  }
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            background: "#1e293b",
            color: "white",
            border: "1px solid #334155",
            borderRadius: "6px",
          }}
        >
          <option>Ticks</option>
          <option>Minutes</option>
          <option>Hours</option>
        </select>
      </div>
          <ContractParameters />
      {/* Payout */}

<div
  style={{
    marginTop: "20px",
    padding: "12px",
    background: "#1e293b",
    borderRadius: "8px",
  }}
>
  <strong>Potential Payout</strong>

  <h2 style={{ marginTop: "10px" }}>
    ${Number(payout || 0).toFixed(2)}
  </h2>

  <div
    style={{
      marginTop: "15px",
      borderTop: "1px solid #334155",
      paddingTop: "10px",
    }}
  >
    <strong>Ask Price</strong>

    <h3 style={{ marginTop: "8px" }}>
      ${Number(askPrice || 0).toFixed(2)}
    </h3>
  </div>
</div>

      {/* Buy Buttons */}
<button
  onClick={handleBuyUp}
  style={{
          width: "100%",
          marginTop: "20px",
          padding: "12px",
          background: "#22c55e",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
       {
  buttonLabels[selectedContract]?.buy
}
      </button>

<button
  onClick={handleBuyDown}
  style={{
          width: "100%",
          marginTop: "10px",
          padding: "12px",
          background: "#ef4444",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
       {
  buttonLabels[selectedContract]?.sell
}
      </button>
    </div>
  );
}

export default TradeControls;
