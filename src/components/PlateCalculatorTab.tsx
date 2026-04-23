import { Minus, Plus, Info } from 'lucide-react';
import { Dropdown } from './Dropdown';
import type { DropdownOption } from './Dropdown';
import { PlateBadges } from './PlateBadges';
import { BarbellVisualization } from './BarbellVisualization';
import type { EquipmentType } from '../constants';

export function PlateCalculatorTab({
  weight,
  weightInput,
  setWeightInput,
  setWeight,
  handleWeightChange,
  handleInputBlur,
  weightIncrement,
  reps,
  repsInput,
  setReps,
  setRepsInput,
  handleRepsInputBlur,
  isKg,
  isMachine,
  currentBarWeight,
  estimated1RM,
  equipmentType,
  equipmentTypeOptions,
  onEquipmentTypeChange,
  plates,
  platesOneSide,
  availablePlates,
  plateColors,
  plateSizes,
  maxWeightBarbell,
  maxWeightMachine,
  barbellScale,
}: {
  weight: number;
  weightInput: string;
  setWeightInput: (v: string) => void;
  setWeight: (v: number) => void;
  handleWeightChange: (delta: number) => void;
  handleInputBlur: () => void;
  weightIncrement: number;
  reps: number | null;
  repsInput: string;
  setReps: (v: number | null) => void;
  setRepsInput: (v: string) => void;
  handleRepsInputBlur: () => void;
  isKg: boolean;
  isMachine: boolean;
  currentBarWeight: number;
  estimated1RM: number | null;
  equipmentType: EquipmentType;
  equipmentTypeOptions: DropdownOption<EquipmentType>[];
  onEquipmentTypeChange: (type: EquipmentType) => void;
  plates: Record<number, number>;
  platesOneSide: number[];
  availablePlates: number[];
  plateColors: Record<number, { plate: string; text: string; bg: string; border: string }>;
  plateSizes: Record<number, number>;
  maxWeightBarbell: number;
  maxWeightMachine: number;
  barbellScale: number;
}) {
  return (
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
            value={equipmentType}
            options={equipmentTypeOptions}
            onChange={onEquipmentTypeChange}
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
  );
}
