import useAuthStore from "../store/authStore";

function AuthPanel() {
  const {
    token,
    setToken,
  } = useAuthStore();

  return (
    <div
      style={{
        background: "#0f172a",
        border: "1px solid #334155",
        borderRadius: "10px",
        padding: "15px",
        marginBottom: "20px",
      }}
    >
      <h3>Deriv API Token</h3>

      <input
        type="text"
        value={token}
        onChange={(e) =>
          setToken(e.target.value)
        }
        placeholder="Paste Deriv API Token"
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          background: "#1e293b",
          color: "white",
          border: "1px solid #334155",
          borderRadius: "6px",
        }}
      />
    </div>
  );
}

export default AuthPanel;
