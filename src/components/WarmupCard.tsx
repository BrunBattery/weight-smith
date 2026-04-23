import { memo, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { calculatePlatesForWeight, plateCountMapToArray } from '../utils/plates';
import { Dropdown } from './Dropdown';
import type { DropdownOption } from './Dropdown';
import { PlateBadges } from './PlateBadges';
import { BarbellVisualization } from './BarbellVisualization';
import {
  WARMUP_DEFINITIONS,
  WARMUP_STYLE_LABELS,
  WARMUP_STYLE_DESCRIPTIONS,
} from '../constants';
import type { WarmupStyle, WarmupSet } from '../constants';

export const WarmupCard = memo(function WarmupCard({
  workingWeight,
  barbellWeight,
  isKg,
  isMachine,
  availablePlates,
  plateColors,
  plateSizes
}: {
  workingWeight: number;
  barbellWeight: number;
  isKg: boolean;
  isMachine: boolean;
  availablePlates: number[];
  plateColors: Record<number, { plate: string; text: string; bg: string; border: string }>;
  plateSizes: Record<number, number>;
}) {
  const [warmupStyle, setWarmupStyle] = useLocalStorage<WarmupStyle>('warmupStyle', 'average');
  const [selectedSetIndex, setSelectedSetIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Set<number>>(new Set());

  const unit = isKg ? 'kgs' : 'lbs';
  const minWeight = isMachine ? 0 : barbellWeight;

  // Calculate rounding step based on smallest available plate (times 2 for both sides)
  const smallestPlate = availablePlates.length > 0 ? availablePlates[availablePlates.length - 1] : 2.5;
  const roundingStep = smallestPlate * 2;

  // Round weight to nearest achievable weight
  const roundWeight = (rawWeight: number): number => {
    return Math.round(rawWeight / roundingStep) * roundingStep;
  };

  // Generate warmup sets based on style (memoized for performance)
  const warmupSets = useMemo((): WarmupSet[] => {
    if (workingWeight <= minWeight) {
      return [{ weight: minWeight, reps: 0, note: isMachine ? 'Empty' : 'Bar only' }];
    }

    const sets: WarmupSet[] = [];
    const range = workingWeight - minWeight;

    // Use data-driven warmup definition
    const warmupDef = WARMUP_DEFINITIONS[warmupStyle];
    warmupDef.forEach(({ pct, reps, noteBar, noteMachine }) => {
      const rawWeight = minWeight + range * pct;
      const weight = roundWeight(rawWeight);
      const note = isMachine ? noteMachine : noteBar;
      if (sets.length === 0 || weight > sets[sets.length - 1].weight) {
        sets.push({ weight, reps, note });
      }
    });

    return sets;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workingWeight, minWeight, isMachine, warmupStyle, roundingStep]);
  const selectedSet = warmupSets[selectedSetIndex];

  // Calculate plates for selected set using shared utility
  const selectedPlates = calculatePlatesForWeight(
    selectedSet?.weight || 0,
    barbellWeight,
    isMachine,
    availablePlates
  );

  // Build array of plates for visualization
  const platesOneSide = plateCountMapToArray(selectedPlates, availablePlates);

  const handleSetClick = (index: number) => {
    // If clicking the next uncompleted set, mark current as complete
    if (index === selectedSetIndex + 1 && !completedSets.has(selectedSetIndex)) {
      setCompletedSets(new Set([...completedSets, selectedSetIndex]));
    }
    setSelectedSetIndex(index);
  };

  // Reset completed sets when warmup style changes
  const handleStyleChange = (style: WarmupStyle) => {
    setWarmupStyle(style);
    setSelectedSetIndex(0);
    setCompletedSets(new Set());
  };

  // Build dropdown options for warmup style using imported constants
  const warmupStyleOptions: DropdownOption<WarmupStyle>[] = [
    { value: 'methodical', label: WARMUP_STYLE_LABELS.methodical, description: WARMUP_STYLE_DESCRIPTIONS.methodical },
    { value: 'average', label: WARMUP_STYLE_LABELS.average, description: WARMUP_STYLE_DESCRIPTIONS.average },
    { value: 'aggressive', label: WARMUP_STYLE_LABELS.aggressive, description: WARMUP_STYLE_DESCRIPTIONS.aggressive }
  ];

  return (
    <div className="bg-[#242424] rounded-lg shadow-[0px_0px_8px_rgba(0,0,0,0.25)] p-4 min-[390px]:p-5">
      {/* Header */}
      <div className="text-center mb-2 min-[390px]:mb-3">
        <span className="text-xs text-[#a89984] uppercase tracking-wide">Warmup for Working Weight</span>
        <div className="text-2xl min-[390px]:text-3xl font-bold text-[#C6A85B]">
          {workingWeight} <span className="text-base font-normal text-[#a89984]">{unit}</span>
        </div>
      </div>

      {/* Warmup Style Dropdown */}
      <div className="mb-2 min-[390px]:mb-3">
        <label className="block text-xs font-medium text-[#a89984] uppercase tracking-wide mb-1">
          Warmup Style
        </label>
        <Dropdown
          value={warmupStyle}
          options={warmupStyleOptions}
          onChange={handleStyleChange}
        />
      </div>

      {/* Warmup Sets List */}
      <div className="space-y-0.5 min-[390px]:space-y-1 mb-2 min-[390px]:mb-3">
        {warmupSets.map((set, index) => {
          const isSelected = index === selectedSetIndex;
          const isCompleted = completedSets.has(index);
          const isWorking = set.note === 'Working set';

          return (
            <button
              key={index}
              onClick={() => handleSetClick(index)}
              className={`w-full flex items-center gap-2 px-2 min-[390px]:px-3 py-1 min-[390px]:py-1.5 rounded transition-colors text-left ${
                isSelected
                  ? 'bg-[#C6A85B]/20 border-2 border-[#C6A85B]'
                  : isCompleted
                    ? 'bg-[#2a2a2a]/50 border border-[#3d3d3d]'
                    : 'bg-[#2a2a2a] border border-transparent hover:border-[#3d3d3d]'
              }`}
            >
              {/* Set number or check */}
              <span className={`w-5 h-5 min-[390px]:w-6 min-[390px]:h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                isCompleted
                  ? 'bg-[#4aba4a] text-[#1b1b1b]'
                  : isWorking
                    ? 'bg-[#C6A85B] text-[#1b1b1b]'
                    : 'bg-[#3a3a3a] text-[#a89984]'
              }`}>
                {isCompleted ? <Check size={10} /> : index + 1}
              </span>

              {/* Weight and info */}
              <div className={`flex-1 ${isCompleted ? 'opacity-50' : ''}`}>
                <span className={`text-sm min-[390px]:text-base font-bold ${isWorking ? 'text-[#C6A85B]' : 'text-[#ebdbb2]'}`}>
                  {set.weight} {unit}
                </span>
                <span className="text-xs text-[#665c54] ml-2">{set.note}</span>
              </div>

              {/* Reps */}
              <div className={`text-right ${isCompleted ? 'opacity-50' : ''}`}>
                {set.reps > 0 ? (
                  <span className="text-sm text-[#a89984]">×{set.reps}</span>
                ) : (
                  <span className="text-xs text-[#C6A85B] font-medium">WORK</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Plate Visualization for Selected Set */}
      <div className="bg-[#1e1e1e] rounded-lg p-3">
        {/* Barbell visualization */}
        <BarbellVisualization
          platesOneSide={platesOneSide}
          plateColors={plateColors}
          plateSizes={plateSizes}
          isMachine={isMachine}
        />

        {/* Per side label */}
        <div className="text-center text-xs text-[#665c54] uppercase tracking-wide mb-2">
          Per Side
        </div>

        {/* Plate breakdown badges */}
        <PlateBadges
          plates={selectedPlates}
          availablePlates={availablePlates}
          plateColors={plateColors}
          isMachine={isMachine}
        />
      </div>
    </div>
  );
});
