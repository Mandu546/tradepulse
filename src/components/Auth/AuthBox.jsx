import { useState } from "react";
import useAuthStore from "../../store/authStore";
import { authorizeDeriv }
  from "../../services/deriv/authService";

function AuthBox() {
  const [inputToken, setInputToken] =
    useState("");

  const { setToken } =
    useAuthStore();

  return (
    <div
      style={{
        background: "#0f172a",
        padding: "15px",
        borderRadius: "10px",
        marginBottom: "20px",
        border: "1px solid #334155",
      }}
    >
      <h3>Deriv Login</h3>

      <input
        type="text"
        placeholder="Paste Deriv API Token"
        value={inputToken}
        onChange={(e) =>
          setInputToken(e.target.value)
        }
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

      <button
       onClick={() => {
  setToken(inputToken);

  authorizeDeriv(
    inputToken
  );
}}
        style={{
          width: "100%",
          marginTop: "10px",
          padding: "10px",
          background: "#22c55e",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Save Token
      </button>
    </div>
  );
}

export default AuthBox;
