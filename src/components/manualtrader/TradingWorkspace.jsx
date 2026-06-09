import CandleChart from "../charts/CandleChart";
import ContractTypes from "./ContractTypes";

function TradingWorkspace() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 350px",
        gap: "20px",
      }}
    >
      <div
        style={{
          background: "#1e293b",
          borderRadius: "10px",
          padding: "20px",
          minHeight: "700px",
        }}
      >
         <CandleChart />
        </div>


     <div
  style={{
    background: "#1e293b",
    borderRadius: "10px",
    padding: "20px",

    maxHeight: "80vh",
    overflowY: "auto",
  }}
>
  <ContractTypes />
</div> 
    </div>
  );
}

export default TradingWorkspace;
