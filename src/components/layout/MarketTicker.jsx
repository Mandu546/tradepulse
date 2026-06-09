function MarketTicker() {
  const markets = [
    "Volatility 10 +0.45%",
    "Volatility 25 +1.20%",
    "Volatility 50 -0.30%",
    "Volatility 75 +0.82%",
    "Volatility 100 +0.55%",
  ];

  return (
    <div
      style={{
        height: "35px",
        background: "#0d1528",
        display: "flex",
        alignItems: "center",
        gap: "25px",
        padding: "0 20px",
        fontSize: "12px",
        borderBottom: "1px solid #1f2937",
      }}
    >
      {markets.map((item, index) => (
        <span key={index}>{item}</span>
      ))}
    </div>
  );
}

export default MarketTicker;
