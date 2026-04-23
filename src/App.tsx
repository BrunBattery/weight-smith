import { useState, useEffect, useDeferredValue } from 'react';
import { useLocalStorage, useLocalStorageNumber } from './hooks/useLocalStorage';
import { useMediaQuery } from './hooks/useMediaQuery';
import { calculatePlatesForWeight, plateCountMapToArray } from './utils/plates';
import type { DropdownOption } from './components/Dropdown';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PlateCalculatorTab } from './components/PlateCalculatorTab';
import { PercentagesCard } from './components/PercentagesCard';
import { WarmupCard } from './components/WarmupCard';
import { SettingsTab } from './components/SettingsTab';
import type { SettingsSubTab } from './components/SettingsTab';
import {
  DEFAULT_PLATES_KG,
  DEFAULT_PLATES_LBS,
  IWF_COLORS_KG,
  IWF_COLORS_LBS,
  PLATE_SIZES_KG,
  PLATE_SIZES_LBS,
  DIFFICULTY_LEVELS,
  BARBELL_MAX_WEIGHTS_LBS,
  MACHINE_MAX_WEIGHTS_LBS,
  BARBELL_MAX_WEIGHTS_KG,
  MACHINE_MAX_WEIGHTS_KG,
  BARBELL_WEIGHT_IN_KG,
  ROUNDING_STEP,
} from './constants';
import type { EquipmentType, BarbellWeightType, AppTab } from './constants';

// Auto-resolves via Vite alias: dev version locally, stub in repo
import DesignReview from '@/DesignReview';

function App() {
  const isLargerScreen = useMediaQuery('(min-width: 390px)');
  const barbellScale = isLargerScreen ? 1.25 : 1;

  // Persisted state
  const [weight, setWeight] = useLocalStorageNumber('weight', 135);
  const [weightInput, setWeightInput] = useState<string>(weight.toString());
  const [reps, setReps] = useLocalStorage<number | null>('reps', 1);
  const [repsInput, setRepsInput] = useState<string>(reps !== null ? reps.toString() : '');
  const [equipmentType, setEquipmentType] = useLocalStorage<EquipmentType>('equipmentType', 'Barbell');
  const [isKg, setIsKg] = useLocalStorage<boolean>('isKg', false);
  const [barbellWeight, setBarbellWeight] = useLocalStorage<BarbellWeightType>('barbellWeight', 45);
  const [maxWeightBarbellLevel, setMaxWeightBarbellLevel] = useLocalStorage<number>('maxWeightBarbellLevel', 2);
  const [maxWeightMachineLevel, setMaxWeightMachineLevel] = useLocalStorage<number>('maxWeightMachineLevel', 2);
  const [availablePlatesKg, setAvailablePlatesKg] = useLocalStorage<number[]>('availablePlatesKg', DEFAULT_PLATES_KG);
  const [availablePlatesLbs, setAvailablePlatesLbs] = useLocalStorage<number[]>('availablePlatesLbs', DEFAULT_PLATES_LBS);

  // UI state
  const [isDesignReviewOpen, setIsDesignReviewOpen] = useState(false);
  const [developerMode, setDeveloperMode] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('plates');
  const [settingsTab, setSettingsTab] = useState<SettingsSubTab>('general');

  // Unit conversion helpers
  const lbsToKg = (lbs: number): number => Math.round(lbs * 0.453592 * 2) / 2;
  const kgToLbs = (kg: number): number => Math.round(kg * 2.20462 / 2.5) * 2.5;

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
  const calculate1RM = (w: number, r: number): number => {
    if (r === 1) return w;
    return Math.round(w * (1 + r / 30));
  };

  const estimated1RM = reps !== null && reps > 0 ? calculate1RM(weight, reps) : null;

  const availablePlates = isKg
    ? [...availablePlatesKg].sort((a, b) => b - a)
    : [...availablePlatesLbs].sort((a, b) => b - a);

  // Weight increment based on smallest available plate
  // KG: if 0.5kg → 1, if 1kg → 2, otherwise 2.5
  // LBS: if 1.25lb → 2.5, otherwise 5
  const weightIncrement = isKg
    ? availablePlatesKg.includes(0.5) ? 1 : availablePlatesKg.includes(1) ? 2 : 2.5
    : availablePlatesLbs.includes(1.25) ? 2.5 : 5;

  const getMinWeight = () => {
    if (isMachine) return 0;
    return isKg ? BARBELL_WEIGHT_IN_KG[barbellWeight] : barbellWeight;
  };

  const handleWeightChange = (delta: number) => {
    const minWeight = getMinWeight();
    const maxWeight = isMachine ? maxWeightMachine : maxWeightBarbell;
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

  const handleUnitToggle = (toKg: boolean) => {
    if (toKg === isKg) return;
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

  const plateColors = isKg ? IWF_COLORS_KG : IWF_COLORS_LBS;
  const plateSizes = isKg ? PLATE_SIZES_KG : PLATE_SIZES_LBS;
  const platesOneSide = plateCountMapToArray(plates, availablePlates);

  return (
    <div className="min-h-screen bg-[#191919] p-4 pb-20 md:pb-4 font-sans flex justify-center">
      <div className="max-w-md w-full">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'plates' && (
          <PlateCalculatorTab
            weight={weight}
            weightInput={weightInput}
            setWeightInput={setWeightInput}
            setWeight={setWeight}
            handleWeightChange={handleWeightChange}
            handleInputBlur={handleInputBlur}
            weightIncrement={weightIncrement}
            reps={reps}
            repsInput={repsInput}
            setReps={setReps}
            setRepsInput={setRepsInput}
            handleRepsInputBlur={handleRepsInputBlur}
            isKg={isKg}
            isMachine={isMachine}
            currentBarWeight={currentBarWeight}
            estimated1RM={estimated1RM}
            equipmentType={equipmentType}
            equipmentTypeOptions={equipmentTypeOptions}
            onEquipmentTypeChange={handleEquipmentTypeChange}
            plates={plates}
            platesOneSide={platesOneSide}
            availablePlates={availablePlates}
            plateColors={plateColors}
            plateSizes={plateSizes}
            maxWeightBarbell={maxWeightBarbell}
            maxWeightMachine={maxWeightMachine}
            barbellScale={barbellScale}
          />
        )}

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

        {activeTab === 'settings' && (
          <SettingsTab
            settingsTab={settingsTab}
            onSettingsTabChange={setSettingsTab}
            isKg={isKg}
            onUnitToggle={handleUnitToggle}
            barbellWeight={barbellWeight}
            barbellWeightOptions={barbellWeightOptions}
            onBarbellWeightChange={handleBarbellWeightChange}
            maxWeightBarbellLevel={maxWeightBarbellLevel}
            maxWeightBarbellOptions={maxWeightBarbellOptions}
            onMaxWeightBarbellChange={handleMaxWeightBarbellChange}
            maxWeightMachineLevel={maxWeightMachineLevel}
            maxWeightMachineOptions={maxWeightMachineOptions}
            onMaxWeightMachineChange={handleMaxWeightMachineChange}
            availablePlatesKg={availablePlatesKg}
            setAvailablePlatesKg={setAvailablePlatesKg}
            availablePlatesLbs={availablePlatesLbs}
            setAvailablePlatesLbs={setAvailablePlatesLbs}
            plateColors={plateColors}
            plateSizes={plateSizes}
          />
        )}

        {developerMode && (
          <DesignReview
            isOpen={isDesignReviewOpen}
            onToggle={() => setIsDesignReviewOpen(!isDesignReviewOpen)}
          />
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
