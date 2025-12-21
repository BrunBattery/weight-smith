import { useState, useEffect, useDeferredValue, memo, useMemo } from 'react';
import { Scale, Minus, Plus, Settings, Info, Mail, Percent, Flame, Check } from 'lucide-react';
import { useLocalStorage, useLocalStorageNumber } from './hooks/useLocalStorage';
import { calculatePlatesForWeight, plateCountMapToArray } from './utils/plates';
import { Dropdown } from './components/Dropdown';
import type { DropdownOption } from './components/Dropdown';
import { PlateBadges } from './components/PlateBadges';
import {
  APP_VERSION,
  DEFAULT_PLATES_KG,
  ALL_PLATES_KG,
  DEFAULT_PLATES_LBS,
  ALL_PLATES_LBS,
  IWF_COLORS_KG,
  IWF_COLORS_LBS,
  PLATE_SIZES_KG,
  PLATE_SIZES_LBS,
  PLATE_WIDTHS_KG,
  PLATE_WIDTHS_LBS,
  DIFFICULTY_LEVELS,
  BARBELL_MAX_WEIGHTS_LBS,
  MACHINE_MAX_WEIGHTS_LBS,
  BARBELL_MAX_WEIGHTS_KG,
  MACHINE_MAX_WEIGHTS_KG,
  BARBELL_WEIGHT_IN_KG,
  WARMUP_DEFINITIONS,
  ROUNDING_STEP,
  WARMUP_STYLE_LABELS,
  WARMUP_STYLE_DESCRIPTIONS,
  PERCENTAGE_RPE_CHART,
} from './constants';
import type {
  WarmupStyle,
  EquipmentType,
  BarbellWeightType,
  WarmupSet,
  AppTab,
} from './constants';

// Hook to detect if screen is larger than a breakpoint
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// Design Review component - auto-resolves via Vite alias in vite.config.ts
// If DesignReview.dev.tsx exists (local), uses full version
// Otherwise falls back to DesignReview.stub.tsx (empty, ships with repo)
import DesignReview from '@/DesignReview';

// GitHub icon (Lucide deprecated brand icons)
const GitHubIcon = ({ size = 18, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

// Memoized Barbell Visualization to prevent re-renders during slider drag
const BarbellVisualization = memo(function BarbellVisualization({
  platesOneSide,
  plateColors,
  plateSizes,
  isMachine,
  scale = 1
}: {
  platesOneSide: number[];
  plateColors: Record<number, { plate: string; text: string; bg: string; border: string }>;
  plateSizes: Record<number, number>;
  isMachine: boolean;
  scale?: number;
}) {
  return (
    <div className="flex items-center justify-center mb-3 py-2">
      <div className="flex items-center">
        {[...platesOneSide].reverse().map((plate, idx) => (
          <div
            key={`left-${idx}`}
            className="rounded-sm mx-px"
            style={{
              width: 6 * scale,
              height: (plateSizes[plate] || 20) * scale,
              backgroundColor: plateColors[plate]?.plate || '#666'
            }}
          />
        ))}
      </div>
      {!isMachine ? (
        <div className="bg-[#4a4a4a]" style={{ width: 80 * scale, height: 8 * scale, borderRadius: '2px' }} />
      ) : (
        <div className="flex items-center" style={{ gap: 24 * scale }}>
          <div className="bg-[#4a4a4a]" style={{ width: 30 * scale, height: 8 * scale, borderRadius: '2px' }} />
          <div className="bg-[#665c54]" style={{ width: 1, height: 48 * scale }} />
          <div className="bg-[#4a4a4a]" style={{ width: 30 * scale, height: 8 * scale, borderRadius: '2px' }} />
        </div>
      )}
      <div className="flex items-center">
        {platesOneSide.map((plate, idx) => (
          <div
            key={`right-${idx}`}
            className="rounded-sm mx-px"
            style={{
              width: 6 * scale,
              height: (plateSizes[plate] || 20) * scale,
              backgroundColor: plateColors[plate]?.plate || '#666'
            }}
          />
        ))}
      </div>
    </div>
  );
});

// Percentages Card Component
const PercentagesCard = memo(function PercentagesCard({
  estimated1RM,
  isKg,
  barbellWeight,
  isMachine,
  availablePlates,
  plateColors,
  plateSizes
}: {
  estimated1RM: number | null;
  isKg: boolean;
  barbellWeight: number;
  isMachine: boolean;
  availablePlates: number[];
  plateColors: Record<number, { plate: string; text: string; bg: string; border: string }>;
  plateSizes: Record<number, number>;
}) {
  const [selectedPct, setSelectedPct] = useState<number | null>(100);
  const unit = isKg ? 'kgs' : 'lbs';

  const calculateWeight = (pct: number): number | null => {
    if (!estimated1RM) return null;
    const raw = estimated1RM * (pct / 100);
    return Math.round(raw / ROUNDING_STEP) * ROUNDING_STEP;
  };

  // Get selected weight and plates
  const selectedWeight = selectedPct !== null ? calculateWeight(selectedPct) : null;
  const selectedPlates = selectedWeight !== null
    ? calculatePlatesForWeight(selectedWeight, barbellWeight, isMachine, availablePlates)
    : {};

  // Build plates array for visualization
  const platesOneSide = selectedWeight !== null
    ? plateCountMapToArray(selectedPlates, availablePlates)
    : [];

  return (
    <div className="bg-[#242424] rounded-lg shadow-[0px_0px_8px_rgba(0,0,0,0.25)] p-4 min-[390px]:p-6">
      {/* Header with 1RM display */}
      <div className="text-center mb-3 min-[390px]:mb-4">
        <span className="text-xs text-[#a89984] uppercase tracking-wide">Based on Estimated 1RM</span>
        <div className="text-2xl min-[390px]:text-3xl font-bold text-[#C6A85B]">
          {estimated1RM !== null ? estimated1RM : '–'} <span className="text-base font-normal text-[#a89984]">{unit}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-1 text-center text-xs mb-1 min-[390px]:mb-2 px-1">
        <div className="text-[#665c54]">%</div>
        <div className="text-[#665c54]">Weight</div>
        <div className="text-[#665c54]">RPE</div>
      </div>

      {/* Percentage rows */}
      <div className="space-y-0.5 min-[390px]:space-y-1">
        {PERCENTAGE_RPE_CHART.map(({ pct, rpe }) => {
          const weight = calculateWeight(pct);
          const isSelected = selectedPct === pct;
          return (
            <button
              key={pct}
              onClick={() => setSelectedPct(isSelected ? null : pct)}
              className={`w-full grid grid-cols-3 gap-1 rounded py-1.5 min-[390px]:py-2 text-center transition-colors ${
                isSelected
                  ? 'bg-[#3a3a3a] ring-2 ring-[#C6A85B]'
                  : 'bg-[#2a2a2a] hover:bg-[#333]'
              }`}
            >
              <div className="text-sm font-medium text-[#C6A85B]">{pct}%</div>
              <div className="text-sm font-bold text-[#ebdbb2]">
                {weight !== null ? weight : '–'}
              </div>
              <div className="text-xs text-[#665c54]">{rpe}</div>
            </button>
          );
        })}
      </div>

      {/* Plate Visualization for Selected Percentage */}
      {selectedPct !== null && selectedWeight !== null && (
        <div className="bg-[#1e1e1e] rounded-lg p-3 min-[390px]:p-4 mt-3 min-[390px]:mt-4">
          <div className="text-center text-sm text-[#a89984] mb-1 min-[390px]:mb-2">
            {selectedPct}% = {selectedWeight}{unit}
          </div>

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
      )}
    </div>
  );
});

const WarmupCard = memo(function WarmupCard({
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

function App() {
  // Detect larger screens for scaling barbell visualization
  const isLargerScreen = useMediaQuery('(min-width: 390px)');
  const barbellScale = isLargerScreen ? 1.25 : 1;

  // Persisted state using custom localStorage hooks
  const [weight, setWeight] = useLocalStorageNumber('weight', 135);
  const [weightInput, setWeightInput] = useState<string>(weight.toString());
  const [reps, setReps] = useLocalStorage<number | null>('reps', 1);
  const [repsInput, setRepsInput] = useState<string>(reps !== null ? reps.toString() : '');
  const [equipmentType, setEquipmentType] = useLocalStorage<EquipmentType>('equipmentType', 'Barbell');
  const [isKg, setIsKg] = useLocalStorage<boolean>('isKg', false);
  const [barbellWeight, setBarbellWeight] = useLocalStorage<45 | 35 | 15>('barbellWeight', 45);
  const [maxWeightBarbellLevel, setMaxWeightBarbellLevel] = useLocalStorage<number>('maxWeightBarbellLevel', 2);
  const [maxWeightMachineLevel, setMaxWeightMachineLevel] = useLocalStorage<number>('maxWeightMachineLevel', 2);
  const [availablePlatesKg, setAvailablePlatesKg] = useLocalStorage<number[]>('availablePlatesKg', DEFAULT_PLATES_KG);
  const [availablePlatesLbs, setAvailablePlatesLbs] = useLocalStorage<number[]>('availablePlatesLbs', DEFAULT_PLATES_LBS);

  // Non-persisted UI state
  const [isDesignReviewOpen, setIsDesignReviewOpen] = useState(false);
  const [developerMode, setDeveloperMode] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('plates');
  const [settingsTab, setSettingsTab] = useState<'general' | 'plates'>('general');

  // Conversion functions
  const lbsToKg = (lbs: number): number => Math.round(lbs * 0.453592 * 2) / 2; // Round to nearest 0.5kg
  const kgToLbs = (kg: number): number => Math.round(kg * 2.20462 / 2.5) * 2.5; // Round to nearest 2.5lbs

  // Current active weight arrays based on unit (using static constants)
  const barbellMaxWeights = isKg ? BARBELL_MAX_WEIGHTS_KG : BARBELL_MAX_WEIGHTS_LBS;
  const machineMaxWeights = isKg ? MACHINE_MAX_WEIGHTS_KG : MACHINE_MAX_WEIGHTS_LBS;

  const maxWeightBarbell = barbellMaxWeights[maxWeightBarbellLevel];
  const maxWeightMachine = machineMaxWeights[maxWeightMachineLevel];

  // Keyboard listener for developer mode (Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'D') {
        setDeveloperMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isMachine = equipmentType === 'Machine';

  // Calculate 1RM using Epley formula: weight × (1 + reps/30)
  const calculate1RM = (weight: number, reps: number): number => {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30));
  };

  const estimated1RM = reps !== null && reps > 0 ? calculate1RM(weight, reps) : null;

  // Get current available plates sorted in descending order
  const availablePlates = isKg
    ? [...availablePlatesKg].sort((a, b) => b - a)
    : [...availablePlatesLbs].sort((a, b) => b - a);

  // Calculate optimal plate breakdown for each side of the bar
  // Weight increment based on unit and available plates
  // KG: if 0.5kg available → 1, if 1kg available → 2, otherwise 2.5
  // LBS: if 1.25lb available → 2.5, otherwise 5
  const weightIncrement = isKg
    ? availablePlatesKg.includes(0.5) ? 1 : availablePlatesKg.includes(1) ? 2 : 2.5
    : availablePlatesLbs.includes(1.25) ? 2.5 : 5;

  // Get minimum weight based on equipment and unit
  const getMinWeight = () => {
    if (isMachine) return 0;
    return isKg ? BARBELL_WEIGHT_IN_KG[barbellWeight] : barbellWeight;
  };

  const handleWeightChange = (delta: number) => {
    const minWeight = getMinWeight();
    const maxWeight = isMachine ? maxWeightMachine : maxWeightBarbell;
    // Don't do anything if already at min/max
    if (delta > 0 && weight >= maxWeight) return;
    if (delta < 0 && weight <= minWeight) return;
    const newWeight = Math.min(maxWeight, Math.max(minWeight, weight + delta));
    setWeight(newWeight);
    setWeightInput(newWeight.toString());
  };

  const handleInputBlur = () => {
    const val = parseFloat(weightInput);
    if (!isNaN(val)) {
      const minWeight = getMinWeight();
      const rounded = Math.round(val / ROUNDING_STEP) * ROUNDING_STEP;
      const maxWeight = isMachine ? maxWeightMachine : maxWeightBarbell;
      const clamped = Math.max(minWeight, Math.min(maxWeight, rounded));
      setWeight(clamped);
      setWeightInput(clamped.toString());
    } else {
      setWeightInput(weight.toString());
    }
  };

  const handleRepsInputBlur = () => {
    if (repsInput === '') {
      setReps(null);
      return;
    }
    const val = parseInt(repsInput);
    if (!isNaN(val)) {
      const clamped = Math.max(1, Math.min(40, val));
      setReps(clamped);
      setRepsInput(clamped.toString());
    } else {
      setRepsInput(reps !== null ? reps.toString() : '');
    }
  };

  // Handle unit toggle
  const handleUnitToggle = (toKg: boolean) => {
    if (toKg === isKg) return;

    // Convert current weight
    const newWeight = toKg ? lbsToKg(weight) : kgToLbs(weight);
    setWeight(newWeight);
    setWeightInput(newWeight.toString());
    setIsKg(toKg);
  };

  const currentBarWeight = isKg ? BARBELL_WEIGHT_IN_KG[barbellWeight] : barbellWeight;

  // Equipment type dropdown options and handler
  const equipmentTypeOptions: DropdownOption<EquipmentType>[] = [
    { value: 'Barbell', label: 'Barbell' },
    { value: 'Machine', label: 'Machine' }
  ];

  const handleEquipmentTypeChange = (type: EquipmentType) => {
    setEquipmentType(type);
    const minBarbell = isKg ? BARBELL_WEIGHT_IN_KG[barbellWeight] : barbellWeight;
    if (type === 'Barbell' && weight < minBarbell) {
      setWeight(minBarbell);
      setWeightInput(minBarbell.toString());
    } else if (type === 'Barbell' && weight > maxWeightBarbell) {
      setWeight(maxWeightBarbell);
      setWeightInput(maxWeightBarbell.toString());
    } else if (type === 'Machine' && weight > maxWeightMachine) {
      setWeight(maxWeightMachine);
      setWeightInput(maxWeightMachine.toString());
    }
  };

  // Barbell weight dropdown options and handler
  const barbellWeightOptions: DropdownOption<BarbellWeightType>[] = [
    { value: 15, label: isKg ? 'Technique - 7kgs' : 'Technique - 15lbs' },
    { value: 35, label: isKg ? 'Womens - 15kgs' : 'Womens - 35lbs' },
    { value: 45, label: isKg ? 'Olympic - 20kgs' : 'Olympic - 45lbs' }
  ];

  const handleBarbellWeightChange = (newWeight: BarbellWeightType) => {
    setBarbellWeight(newWeight);
    const minWeight = isKg ? BARBELL_WEIGHT_IN_KG[newWeight] : newWeight;
    if (equipmentType === 'Barbell' && weight < minWeight) {
      setWeight(minWeight);
      setWeightInput(minWeight.toString());
    }
  };

  // Max weight dropdown options and handlers
  const maxWeightBarbellOptions: DropdownOption<number>[] = DIFFICULTY_LEVELS.map((level, idx) => ({
    value: idx,
    label: `${level} (${barbellMaxWeights[idx]}${isKg ? 'kgs' : 'lbs'})`
  }));

  const handleMaxWeightBarbellChange = (idx: number) => {
    setMaxWeightBarbellLevel(idx);
    if (equipmentType === 'Barbell' && weight > barbellMaxWeights[idx]) {
      setWeight(barbellMaxWeights[idx]);
      setWeightInput(barbellMaxWeights[idx].toString());
    }
  };

  const maxWeightMachineOptions: DropdownOption<number>[] = DIFFICULTY_LEVELS.map((level, idx) => ({
    value: idx,
    label: `${level} (${machineMaxWeights[idx]}${isKg ? 'kgs' : 'lbs'})`
  }));

  const handleMaxWeightMachineChange = (idx: number) => {
    setMaxWeightMachineLevel(idx);
    if (equipmentType === 'Machine' && weight > machineMaxWeights[idx]) {
      setWeight(machineMaxWeights[idx]);
      setWeightInput(machineMaxWeights[idx].toString());
    }
  };

  // Use deferred value for plate calculations to keep slider smooth
  const deferredWeight = useDeferredValue(weight);
  const plates = calculatePlatesForWeight(deferredWeight, currentBarWeight, isMachine, availablePlates);

  // Use IWF color standards
  const plateColors = isKg ? IWF_COLORS_KG : IWF_COLORS_LBS;
  const plateSizes = isKg ? PLATE_SIZES_KG : PLATE_SIZES_LBS;

  // Build array of plates for one side using shared utility
  const platesOneSide = plateCountMapToArray(plates, availablePlates);

  return (
    <div className="min-h-screen bg-[#191919] p-4 pb-20 md:pb-4 font-sans flex justify-center">
      <div className="max-w-md w-full">
        {/* Header with integrated nav icons */}
        <div className="text-center mb-3">
          <div className="flex items-center justify-center gap-3">
            <h1 className="flex items-center justify-center gap-2 text-3xl text-[#ebdbb2]" style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontStyle: 'italic', letterSpacing: '0.033em' }}>
              <img
                src={`${import.meta.env.BASE_URL}favicon.svg`}
                alt="Weight Smith Logo"
                className="w-12 h-12"
                onError={(e) => {
                  console.error('Logo failed to load');
                  e.currentTarget.style.display = 'none';
                }}
              />
              WeightSmith
            </h1>
            {/* Header nav icons (Desktop only - mobile uses bottom nav) */}
            <div className="hidden md:flex items-center gap-2 ml-4">
              <button
                onClick={() => setActiveTab('plates')}
                className={`p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A85B] ${
                  activeTab === 'plates' ? 'text-[#C6A85B]' : 'text-[#666666] hover:text-[#a89984]'
                }`}
                title="Load"
              >
                <Scale size={24} />
              </button>
              <button
                onClick={() => setActiveTab('warmup')}
                className={`p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A85B] ${
                  activeTab === 'warmup' ? 'text-[#C6A85B]' : 'text-[#666666] hover:text-[#a89984]'
                }`}
                title="Warmup"
              >
                <Flame size={24} />
              </button>
              <button
                onClick={() => setActiveTab('percentages')}
                className={`p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A85B] ${
                  activeTab === 'percentages' ? 'text-[#C6A85B]' : 'text-[#666666] hover:text-[#a89984]'
                }`}
                title="Percentages"
              >
                <Percent size={24} />
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A85B] ${
                  activeTab === 'settings' ? 'text-[#C6A85B]' : 'text-[#666666] hover:text-[#a89984]'
                }`}
                title="Settings"
              >
                <Settings size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Plate Calculator Card - Single Column Layout */}
        {activeTab === 'plates' && (
          <div className="bg-[#242424] rounded-lg shadow-[0px_0px_8px_rgba(0,0,0,0.25)] min-[390px]:py-3">
            <div className="px-4 py-3">
              {/* Weight Row */}
              <div className="grid grid-cols-[1fr_90px] gap-3 mb-3 items-center">
                {/* Weight Input */}
                <div>
                  <label className="block text-xs font-medium text-[#a89984] uppercase tracking-wide mb-2">
                    Total Weight
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleWeightChange(-weightIncrement)}
                      className="bg-[#2f2f2f] hover:bg-[#313131] focus-visible:ring-2 focus-visible:ring-[#C6A85B] focus-visible:outline-none rounded-md w-10 h-10 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <Minus size={18} className="text-[#d5c4a1]" />
                    </button>
                    <div className="flex-1 flex items-center justify-center gap-1">
                      <input
                        type="number"
                        value={weightInput}
                        onChange={(e) => setWeightInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        onBlur={handleInputBlur}
                        className="w-[92px] text-3xl font-semibold text-[#C6A85B] text-center bg-transparent border-b-2 border-[#2f2f2f] focus:border-[#C6A85B] outline-none"
                      />
                      <span className="text-xs text-[#a89984]">{isKg ? 'kgs' : 'lbs'}</span>
                    </div>
                    <button
                      onClick={() => handleWeightChange(weightIncrement)}
                      className="bg-[#2f2f2f] hover:bg-[#313131] focus-visible:ring-2 focus-visible:ring-[#C6A85B] focus-visible:outline-none rounded-md w-10 h-10 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <Plus size={18} className="text-[#d5c4a1]" />
                    </button>
                  </div>
                </div>
                {/* Per Side Stats Card */}
                <div className="bg-[#2f2f2f] rounded-lg p-3 text-center h-full flex flex-col justify-center">
                  <div className="text-xs text-[#a89984] uppercase tracking-wide mb-1">Per Side</div>
                  <div className="text-xl font-bold text-[#C6A85B]">
                    {!isMachine && weight >= currentBarWeight
                      ? `${(weight - currentBarWeight) / 2}`
                      : isMachine && weight > 0
                        ? `${weight / 2}`
                        : '0'
                    }
                  </div>
                  <div className="text-xs text-[#a89984]">{isKg ? 'kgs' : 'lbs'}</div>
                </div>
              </div>

              {/* Reps Row */}
              <div className="grid grid-cols-[1fr_90px] gap-3 mb-3 items-center">
                {/* Reps Input */}
                <div>
                  <label className="block text-xs font-medium text-[#a89984] uppercase tracking-wide mb-2">
                    Total Reps
                  </label>
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        const newReps = Math.max(1, (reps || 1) - 1);
                        setReps(newReps);
                        setRepsInput(newReps.toString());
                      }}
                      className="bg-[#2f2f2f] hover:bg-[#313131] focus-visible:ring-2 focus-visible:ring-[#C6A85B] focus-visible:outline-none rounded-md w-10 h-10 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <Minus size={18} className="text-[#d5c4a1]" />
                    </button>
                    <div className="flex-1 flex items-center justify-center gap-1">
                      <input
                        type="number"
                        value={repsInput}
                        placeholder="-"
                        onChange={(e) => setRepsInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        onBlur={handleRepsInputBlur}
                        className="w-16 text-3xl font-semibold text-[#d4534f] text-center bg-transparent border-b-2 border-[#2f2f2f] focus:border-[#d4534f] outline-none placeholder:text-[#665c54]"
                      />
                      <span className="text-xs text-[#a89984]">reps</span>
                    </div>
                    <button
                      onClick={() => {
                        const newReps = Math.min(40, (reps || 0) + 1);
                        setReps(newReps);
                        setRepsInput(newReps.toString());
                      }}
                      className="bg-[#2f2f2f] hover:bg-[#313131] focus-visible:ring-2 focus-visible:ring-[#C6A85B] focus-visible:outline-none rounded-md w-10 h-10 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <Plus size={18} className="text-[#d5c4a1]" />
                    </button>
                  </div>
                </div>
                {/* 1RM Stats Card */}
                <div className="bg-[#2f2f2f] rounded-lg p-3 text-center h-full flex flex-col justify-center">
                  <div className="text-xs text-[#a89984] uppercase tracking-wide mb-1">Est. 1RM</div>
                  <div className="text-xl font-bold text-[#d4534f]">
                    {estimated1RM !== null ? estimated1RM : '-'}
                  </div>
                  <div className="text-xs text-[#a89984]">{isKg ? 'kgs' : 'lbs'}</div>
                </div>
              </div>

              {/* 1RM Warning - Blue Info Alert */}
              {reps && reps > 10 && (
                <div className="flex items-start gap-2 bg-[#24292f] border border-[#28343d] rounded-md p-3 mb-4">
                  <Info size={16} className="text-[#5a9bb8] flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-[#5a9bb8]">
                    1RM calculations inaccurate 11+ reps
                  </span>
                </div>
              )}

              {/* Equipment Type Dropdown */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-[#a89984] uppercase tracking-wide mb-1">
                  Equipment Type
                </label>
                <Dropdown
                  value={equipmentType as EquipmentType}
                  options={equipmentTypeOptions}
                  onChange={handleEquipmentTypeChange}
                />
              </div>

              {/* Visual Barbell (memoized for slider performance) */}
              <BarbellVisualization
                platesOneSide={platesOneSide}
                plateColors={plateColors}
                plateSizes={plateSizes}
                isMachine={isMachine}
                scale={barbellScale}
              />

              {/* Per Side Plate Breakdown */}
              <div className="text-center text-xs text-[#665c54] uppercase tracking-wide mb-2">
                Per Side
              </div>
              <PlateBadges
                plates={plates}
                availablePlates={availablePlates}
                plateColors={plateColors}
                isMachine={isMachine}
                className="mb-3"
              />

              {/* Slider */}
              <div>
                <input
                  type="range"
                  min={isMachine ? 0 : currentBarWeight}
                  max={isMachine ? maxWeightMachine : maxWeightBarbell}
                  step={weightIncrement}
                  value={weight}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setWeight(val);
                    setWeightInput(val.toString());
                  }}
                  className="w-full h-2 bg-[#2f2f2f] rounded-lg appearance-none cursor-pointer accent-[#C6A85B]"
                />
                <div className="flex justify-between text-xs text-[#a89984] mt-1">
                  <span>{isMachine ? 0 : currentBarWeight}</span>
                  <span>{Math.round((isMachine ? maxWeightMachine : maxWeightBarbell) / 2)}</span>
                  <span>{isMachine ? maxWeightMachine : maxWeightBarbell}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Percentages Card */}
        {activeTab === 'percentages' && (
          <PercentagesCard
            estimated1RM={estimated1RM}
            isKg={isKg}
            barbellWeight={currentBarWeight}
            isMachine={isMachine}
            availablePlates={availablePlates}
            plateColors={plateColors}
            plateSizes={plateSizes}
          />
        )}

        {/* Warmup Card */}
        {activeTab === 'warmup' && (
          <WarmupCard
            workingWeight={weight}
            barbellWeight={currentBarWeight}
            isKg={isKg}
            isMachine={isMachine}
            availablePlates={availablePlates}
            plateColors={plateColors}
            plateSizes={plateSizes}
          />
        )}

        {/* Settings Page (Card - same for mobile and desktop) */}
        {activeTab === 'settings' && (
          <div className="bg-[#242424] rounded-lg shadow-[0px_0px_8px_rgba(0,0,0,0.25)] p-6 min-[390px]:py-7">
            {/* Settings Tabs */}
            <div className="flex border-b border-[#2f2f2f] mb-6">
              {([
                { id: 'general', label: 'General' },
                { id: 'plates', label: 'Plates' },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSettingsTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A85B] focus-visible:ring-inset ${
                    settingsTab === tab.id ? 'text-[#C6A85B]' : 'text-[#a89984] hover:text-[#d5c4a1]'
                  }`}
                >
                  {tab.label}
                  {settingsTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C6A85B]" />
                  )}
                </button>
              ))}
            </div>

              {/* General Tab */}
              {settingsTab === 'general' && (
                <>
                  {/* Unit Toggle */}
                  <div className="mb-6">
                    <label className="block text-xs font-medium text-[#a89984] uppercase tracking-wide mb-2">
                      Weight Unit
                    </label>
                    <div className="flex bg-[#2f2f2f] rounded-md p-1">
                      <button
                        onClick={() => handleUnitToggle(false)}
                        className={`flex-1 px-4 py-2 rounded text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#C6A85B] focus-visible:outline-none ${
                          !isKg
                            ? 'bg-[#3a3a3a] text-[#C6A85B] border-2 border-[#C6A85B]'
                            : 'text-[#665c54] hover:text-[#a89984]'
                        }`}
                      >
                        LBs
                      </button>
                      <button
                        onClick={() => handleUnitToggle(true)}
                        className={`flex-1 px-4 py-2 rounded text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#C6A85B] focus-visible:outline-none ${
                          isKg
                            ? 'bg-[#3a3a3a] text-[#C6A85B] border-2 border-[#C6A85B]'
                            : 'text-[#665c54] hover:text-[#a89984]'
                        }`}
                      >
                        KGs
                      </button>
                    </div>
                  </div>

            {/* Barbell Weight Setting */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-[#a89984] uppercase tracking-wide mb-2">
                Barbell Weight
              </label>
              <Dropdown
                value={barbellWeight}
                options={barbellWeightOptions}
                onChange={handleBarbellWeightChange}
              />
            </div>

            {/* Max Weight - Barbell */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-[#a89984] uppercase tracking-wide mb-2">
                Total Weight Max - Barbell
              </label>
              <Dropdown
                value={maxWeightBarbellLevel}
                options={maxWeightBarbellOptions}
                onChange={handleMaxWeightBarbellChange}
              />
            </div>

            {/* Max Weight - Machine */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-[#a89984] uppercase tracking-wide mb-2">
                Total Weight Max - Machine
              </label>
              <Dropdown
                value={maxWeightMachineLevel}
                options={maxWeightMachineOptions}
                onChange={handleMaxWeightMachineChange}
                openUpward
              />
            </div>
                </>
              )}

              {/* Available Plates Tab */}
              {settingsTab === 'plates' && (
                <>
                  <label className="block text-xs font-medium text-[#a89984] uppercase tracking-wide mb-3">
                    Available Plates ({isKg ? 'KG' : 'LBS'})
                  </label>

                  {/* Visual plate stack preview */}
                  <div className="flex items-center justify-center gap-0.5 py-6 bg-[#252525] rounded-lg mb-4">
                    {(isKg ? ALL_PLATES_KG : ALL_PLATES_LBS).slice().reverse().map(plate => {
                      const isSelected = isKg
                        ? availablePlatesKg.includes(plate)
                        : availablePlatesLbs.includes(plate);
                      const colors = plateColors[plate];
                      const plateWidths = isKg ? PLATE_WIDTHS_KG : PLATE_WIDTHS_LBS;
                      const size = (plateSizes[plate] || 20) * 1.4;
                      const width = plateWidths[plate] || 8;
                      return (
                        <button
                          key={plate}
                          onClick={() => {
                            if (isKg) {
                              setAvailablePlatesKg(prev =>
                                isSelected ? prev.filter(p => p !== plate) : [...prev, plate]
                              );
                            } else {
                              setAvailablePlatesLbs(prev =>
                                isSelected ? prev.filter(p => p !== plate) : [...prev, plate]
                              );
                            }
                          }}
                          className={`rounded-sm transition-all ${
                            isSelected ? '' : 'opacity-20'
                          }`}
                          style={{
                            width: width,
                            height: size,
                            backgroundColor: colors?.plate || '#666'
                          }}
                          title={`${plate}${isKg ? 'kg' : 'lb'}`}
                        />
                      );
                    })}
                  </div>

                  {/* Plate selection grid */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {(isKg ? ALL_PLATES_KG : ALL_PLATES_LBS).map(plate => {
                      const isSelected = isKg
                        ? availablePlatesKg.includes(plate)
                        : availablePlatesLbs.includes(plate);
                      const colors = plateColors[plate];
                      return (
                        <button
                          key={plate}
                          onClick={() => {
                            if (isKg) {
                              setAvailablePlatesKg(prev =>
                                isSelected ? prev.filter(p => p !== plate) : [...prev, plate]
                              );
                            } else {
                              setAvailablePlatesLbs(prev =>
                                isSelected ? prev.filter(p => p !== plate) : [...prev, plate]
                              );
                            }
                          }}
                          className={`py-2 rounded-md text-center text-sm font-semibold transition-all ${
                            isSelected ? 'ring-2 ring-[#C6A85B]' : 'opacity-40'
                          }`}
                          style={{
                            backgroundColor: colors?.bg || '#2f2f2f',
                            color: colors?.text || '#d5c4a1'
                          }}
                        >
                          {plate}{isKg ? 'kg' : 'lb'}
                        </button>
                      );
                    })}
                  </div>

                  {/* Reset to defaults button */}
                  <button
                    onClick={() => {
                      if (isKg) {
                        setAvailablePlatesKg([...DEFAULT_PLATES_KG]);
                      } else {
                        setAvailablePlatesLbs([...DEFAULT_PLATES_LBS]);
                      }
                    }}
                    className="w-full mt-4 px-4 py-2.5 text-sm font-medium text-[#a89984] bg-transparent hover:text-[#d5c4a1] rounded-md border border-[#504945] hover:border-[#665c54] transition-colors focus-visible:ring-2 focus-visible:ring-[#C6A85B] focus-visible:outline-none"
                  >
                    Reset to defaults
                  </button>
                </>
              )}

            {/* About Section - Always visible at bottom */}
            <div className="pt-6 mt-6 border-t border-[#2f2f2f]">
              <h3 className="text-xs font-medium text-[#a89984] uppercase tracking-wide mb-3">About</h3>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-[#d5c4a1]">
                  {APP_VERSION}
                </div>
                <a
                  href="mailto:hi@weightsmith.com"
                  className="flex items-center gap-2 text-sm font-medium text-[#d5c4a1] hover:text-[#C6A85B] transition-colors"
                >
                  <Mail size={18} />
                  <span>Contact</span>
                </a>
                <a
                  href="https://github.com/BrunBattery/weight-smith"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-[#d5c4a1] hover:text-[#C6A85B] transition-colors"
                >
                  <GitHubIcon size={18} />
                  <span>GitHub</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Design Review Section - Developer Mode Only (Shift+D) */}
        {developerMode && (
          <DesignReview
            isOpen={isDesignReviewOpen}
            onToggle={() => setIsDesignReviewOpen(!isDesignReviewOpen)}
          />
        )}

      </div>

      {/* Bottom Navigation Bar (Mobile only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#242424] border-t border-[#2f2f2f] z-30 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setActiveTab('plates')}
            className={`flex items-center justify-center flex-1 h-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C6A85B] ${
              activeTab === 'plates' ? 'text-[#C6A85B]' : 'text-[#666666] hover:text-[#a89984]'
            }`}
          >
            <Scale size={24} />
          </button>
          <button
            onClick={() => setActiveTab('warmup')}
            className={`flex items-center justify-center flex-1 h-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C6A85B] ${
              activeTab === 'warmup' ? 'text-[#C6A85B]' : 'text-[#666666] hover:text-[#a89984]'
            }`}
          >
            <Flame size={24} />
          </button>
          <button
            onClick={() => setActiveTab('percentages')}
            className={`flex items-center justify-center flex-1 h-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C6A85B] ${
              activeTab === 'percentages' ? 'text-[#C6A85B]' : 'text-[#666666] hover:text-[#a89984]'
            }`}
          >
            <Percent size={24} />
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center justify-center flex-1 h-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C6A85B] ${
              activeTab === 'settings' ? 'text-[#C6A85B]' : 'text-[#666666] hover:text-[#a89984]'
            }`}
          >
            <Settings size={24} />
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
