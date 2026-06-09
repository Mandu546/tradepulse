import useContractStore from "../../store/contractStore";
import useContractConfigStore from "../../store/contractConfigStore";

function ContractParameters() {
  const { selectedContract } =
    useContractStore();

  const {
    barrier,
    prediction,
    setBarrier,
    setPrediction,
  } = useContractConfigStore();

  return (
    <div
      style={{
        marginTop: "20px",
      }}
    >
      {/* Higher Lower */}

      {selectedContract === "Higher / Lower" && (
        <div>
          <label>Barrier</label>

          <input
            type="number"
            value={barrier}
            onChange={(e) =>
              setBarrier(Number(e.target.value))
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
          />
        </div>
      )}

      {/* Over Under */}

      {selectedContract === "Over / Under" && (
        <div>
          <label>Prediction Digit</label>

          <input
            type="number"
            min="0"
            max="9"
            value={prediction}
            onChange={(e) =>
              setPrediction(Number(e.target.value))
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
          />
        </div>
      )}

      {/* Matches Differs */}

      {selectedContract === "Matches / Differs" && (
        <div>
          <label>Prediction Digit</label>

          <input
            type="number"
            min="0"
            max="9"
            value={prediction}
            onChange={(e) =>
              setPrediction(Number(e.target.value))
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
          />
        </div>
      )}
    </div>
  );
}

export default ContractParameters;
