import useProposalStore from "../../store/proposalStore";

const WS_URL =
  "wss://ws.derivws.com/websockets/v3?app_id=1089";

let proposalSocket = null;

export function requestProposal({
  symbol,
  amount,
  duration,
  contractType,
})
 {
if (
  proposalSocket &&
  proposalSocket.readyState === WebSocket.OPEN
) {
  proposalSocket.close();
}

let derivContract = "CALL";

switch (contractType) {
  case "PUT":
    derivContract = "PUT";
    break;

  case "DIGITODD":
    derivContract = "DIGITODD";
    break;

  case "DIGITEVEN":
    derivContract = "DIGITEVEN";
    break;

  case "DIGITOVER":
    derivContract = "DIGITOVER";
    break;

  case "DIGITUNDER":
    derivContract = "DIGITUNDER";
    break;

  case "DIGITMATCH":
    derivContract = "DIGITMATCH";
    break;

  case "DIGITDIFF":
    derivContract = "DIGITDIFF";
    break;

  default:
    derivContract = "CALL";
}
proposalSocket = new WebSocket(WS_URL);

proposalSocket.addEventListener(
  "open",
  () => {
    proposalSocket.send(
      JSON.stringify({
        proposal: 1,

        amount: Number(amount),

        basis: "stake",

        contract_type: derivContract,

        currency: "USD",

        duration: Number(duration),

        duration_unit: "t",

        symbol,
      })
    );
  }
);
proposalSocket.onmessage = (event) => {
  const data = JSON.parse(event.data);


  console.log(data);

  if (data.proposal) {
    const { setProposal } =
      useProposalStore.getState();

    setProposal(data.proposal);
  }
};

  proposalSocket.onerror = (error) => {
    console.error(error);
  };
}
