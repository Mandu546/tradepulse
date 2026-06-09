import useSymbolStore from "../../store/symbolStore";

function Watchlist() {
const { setSelectedSymbol } = useSymbolStore();
const symbols = [
  { name: "Volatility 10", code: "R_10" },
  { name: "Volatility 25", code: "R_25" },
  { name: "Volatility 50", code: "R_50" },
  { name: "Volatility 75", code: "R_75" },
  { name: "Volatility 100", code: "R_100" },
];

  return (
    <div
      style={{
        background: "#1e293b",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      }}
    >
      <h2>Watchlist</h2>

      <div
        style={{
          marginTop: "15px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
          {symbols.map((symbol) => (
          <div
            key={symbol.code} 
             onClick={() => setSelectedSymbol(symbol.code)}          
            style={{
              background: "#0f172a",
              padding: "12px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
              <span>{symbol.name}</span>
            <span>--</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Watchlist;
