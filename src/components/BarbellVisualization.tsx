import { memo } from 'react';

// Memoized Barbell Visualization to prevent re-renders during slider drag
export const BarbellVisualization = memo(function BarbellVisualization({
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
