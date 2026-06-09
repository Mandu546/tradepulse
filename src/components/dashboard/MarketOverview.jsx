function MarketOverview() {
  const markets = [
    { name: "Volatility 10", price: "1,245.32", change: "+0.42%" },
    { name: "Volatility 25", price: "2,118.75", change: "-0.18%" },
    { name: "Volatility 50", price: "4,567.20", change: "+1.12%" },
    { name: "Volatility 75", price: "7,891.44", change: "+0.67%" },
    { name: "Volatility 100", price: "12,450.88", change: "-0.35%" },
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
      <h2>Market Overview</h2>

      <br />

      {markets.map((market) => (
        <div
          key={market.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 0",
            borderBottom: "1px solid #334155",
          }}
        >
          <span>{market.name}</span>
          <span>{market.price}</span>
          <span>{market.change}</span>
        </div>
      ))}
    </div>
  );
}

export default MarketOverview;
