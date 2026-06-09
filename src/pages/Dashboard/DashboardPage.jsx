import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import MarketTicker from "../../components/layout/MarketTicker";
import AccountPanel from "../../components/layout/AccountPanel";
import DashboardWorkspace from "../../components/common/DashboardWorkspace";

function DashboardPage() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
<Topbar />
<MarketTicker />

      <div
        style={{
          flex: 1,
          display: "flex",
        }}
      >
        <Sidebar />

        <div
          style={{
            flex: 1,
            padding: "20px",
          }}
        >
<DashboardWorkspace />
        </div>
<div
  style={{
    width: "300px",
    background: "#121a30",
    padding: "20px",
  }}
>
  <AccountPanel />
</div>

      </div>
    </div>
  );
}

export default DashboardPage;
