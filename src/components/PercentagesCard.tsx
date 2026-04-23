import { memo, useState } from 'react';
import { calculatePlatesForWeight, plateCountMapToArray } from '../utils/plates';
import { ROUNDING_STEP, PERCENTAGE_RPE_CHART } from '../constants';
import { BarbellVisualization } from './BarbellVisualization';
import { PlateBadges } from './PlateBadges';

// Percentages Card Component
export const PercentagesCard = memo(function PercentagesCard({
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
