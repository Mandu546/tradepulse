import StatCard from "../dashboard/StatCard";
import DashboardStats from "../dashboard/DashboardStats";
import Watchlist from "../trading/Watchlist";
import MarketOverview from "../dashboard/MarketOverview";
import ChartPanel from "../dashboard/ChartPanel";

function DashboardWorkspace() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
          <DashboardStats />
           <MarketOverview />
           <ChartPanel />
           <Watchlist />

      {/* Recent Activity */}
      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        }}
      >
        <h2>Recent Activity</h2>

        <br />

        <p>No trades yet</p>
      </div>
    </div>
  );
}

export default DashboardWorkspace;
