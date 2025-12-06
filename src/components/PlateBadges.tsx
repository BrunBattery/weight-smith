import type { PlateCountMap } from '../utils/plates';
import { hasPlates } from '../utils/plates';

export interface PlateColorConfig {
  plate: string;
  text: string;
  bg: string;
  border: string;
}

export interface PlateBadgesProps {
  plates: PlateCountMap;
  availablePlates: number[];
  plateColors: Record<number, PlateColorConfig>;
  isMachine: boolean;
  /** Additional className for the container */
  className?: string;
}

/**
 * Displays colored badge pills for each plate type in the breakdown.
 * Shows "Bar only" or "No weight" when no plates are present.
 */
export function PlateBadges({
  plates,
  availablePlates,
  plateColors,
  isMachine,
  className = ''
}: PlateBadgesProps) {
  const hasAnyPlates = hasPlates(plates);

  if (!hasAnyPlates) {
    return (
      <div className={`flex flex-wrap justify-center gap-2 ${className}`}>
        <span className="text-sm text-[#665c54] italic">
          {isMachine ? 'No weight' : 'Bar only'}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap justify-center gap-2 ${className}`}>
      {availablePlates.map(plate => {
        const count = plates[plate] || 0;
        if (count === 0) return null;
        const colors = plateColors[plate];
        if (!colors) return null;
        return (
          <span
            key={plate}
            className="px-2 py-1 rounded-md text-sm font-semibold"
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`
            }}
          >
            {count}×{plate}
          </span>
        );
      })}
    </div>
  );
}

export default PlateBadges;

