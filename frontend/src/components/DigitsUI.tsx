import './DigitsUI.css';

interface DigitsUIProps {
  contractType: string;
  lastDigit: number | null;
  selectedDigit: number;
  onDigitChange: (d: number) => void;
}

export default function DigitsUI({ contractType, lastDigit, selectedDigit, onDigitChange }: DigitsUIProps) {
  const needsPicker = ['DIGITMATCH','DIGITDIFF','DIGITOVER','DIGITUNDER'].includes(contractType);

  return (
    <div className="digits-ui">
      <div className="last-digit-row">
        <span className="digit-label">Last digit</span>
        <div className="last-digit-display">
          {lastDigit !== null ? lastDigit : '—'}
        </div>
        <div className="digit-track">
          {Array.from({length:10},(_,i) => (
            <div key={i} className={`digit-bar ${lastDigit===i?'active':''}`}>
              <div className="digit-bar-fill" style={{height:`${10+i*8}%`}} />
              <span className="digit-bar-label">{i}</span>
            </div>
          ))}
        </div>
      </div>

      {needsPicker && (
        <div className="digit-picker">
          <span className="digit-label">
            {contractType === 'DIGITOVER' ? 'Over' :
             contractType === 'DIGITUNDER' ? 'Under' :
             contractType === 'DIGITMATCH' ? 'Match' : 'Differs from'} digit
          </span>
          <div className="digit-grid">
            {Array.from({length:10},(_,i) => (
              <button
                key={i}
                className={`digit-btn ${selectedDigit===i?'active':''}`}
                onClick={() => onDigitChange(i)}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
