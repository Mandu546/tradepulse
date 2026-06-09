import { useEffect, useState } from "react";
import {
  connectDeriv,
  disconnectDeriv,
} from "../../services/deriv/derivWebSocket";
import useSymbolStore from "../../store/symbolStore";

function LivePrice() {
  const [price, setPrice] = useState("Loading...");
const {
  selectedSymbol,
  setSelectedSymbol,
} = useSymbolStore();

  useEffect(() => {
    connectDeriv(selectedSymbol, (quote) => {
      setPrice(quote);
    });

    return () => {
      disconnectDeriv();
    };
}, [selectedSymbol]);
  return (
    <div
      style={{
        background: "#1e293b",
        padding: "15px",
        borderRadius: "10px",
      }}
    >
           
 <select
  value={selectedSymbol}
  onChange={(e) =>
    setSelectedSymbol(e.target.value)
  } 
         style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          background: "#0f172a",
          color: "white",
          border: "1px solid #334155",
          borderRadius: "6px",
        }}
      >
        <option value="R_10">Volatility 10</option>
        <option value="R_25">Volatility 25</option>
        <option value="R_50">Volatility 50</option>
        <option value="R_75">Volatility 75</option>
        <option value="R_100">Volatility 100</option>
      </select>

      <h3>Live Price</h3>

      <h1>{price}</h1>
    </div>
  );
}

export default LivePrice;
