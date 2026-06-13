import { useState, useEffect } from 'react';
import './ContractSelector.css';

const CATEGORIES = [
  { id: 'callput', label: 'Up/Down', types: [
    { id: 'CALL', label: 'Rise' }, { id: 'PUT', label: 'Fall' },
    { id: 'CALLE', label: 'Rise Equal' }, { id: 'PUTE', label: 'Fall Equal' },
  ]},
  { id: 'digits', label: 'Digits', types: [
    { id: 'DIGITEVEN', label: 'Even' }, { id: 'DIGITODD', label: 'Odd' },
    { id: 'DIGITMATCH', label: 'Match' }, { id: 'DIGITDIFF', label: 'Differs' },
    { id: 'DIGITOVER', label: 'Over' }, { id: 'DIGITUNDER', label: 'Under' },
  ]},
  { id: 'touch', label: 'Touch', types: [
    { id: 'ONETOUCH', label: 'One Touch' }, { id: 'NOTOUCH', label: 'No Touch' },
  ]},
  { id: 'accumulator', label: 'Accumulators', types: [
    { id: 'ACCU', label: 'Accumulator' },
  ]},
  { id: 'multiplier', label: 'Multipliers', types: [
    { id: 'MULTUP', label: 'Multiply Up' }, { id: 'MULTDOWN', label: 'Multiply Down' },
  ]},
];

interface ContractSelectorProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export default function ContractSelector({ selectedType, onTypeChange }: ContractSelectorProps) {
  const [activeCategory, setActiveCategory] = useState('callput');

  useEffect(() => {
    const cat = CATEGORIES.find(c => c.types.some(t => t.id === selectedType));
    if (cat) setActiveCategory(cat.id);
  }, [selectedType]);

  const currentCategory = CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="contract-selector">
      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(cat.id);
              onTypeChange(cat.types[0].id);
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="type-pills">
        {currentCategory?.types.map(t => (
          <button
            key={t.id}
            className={`type-pill ${selectedType === t.id ? 'active' : ''}`}
            onClick={() => onTypeChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function isDigitsType(contractType: string): boolean {
  return contractType.startsWith('DIGIT');
}

export function needsBarrier(contractType: string): boolean {
  return ['DIGITOVER','DIGITUNDER','DIGITMATCH','DIGITDIFF'].includes(contractType);
}
