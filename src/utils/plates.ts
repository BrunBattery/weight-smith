/**
 * Utility functions for plate calculations.
 */

export type PlateCountMap = Record<number, number>;

/**
 * Calculate the plate configuration needed for a target weight.
 * 
 * @param totalWeight - The total weight to achieve
 * @param barbellWeight - The weight of the barbell (ignored for machines)
 * @param isMachine - Whether this is for a machine (plates per side = total/2)
 * @param availablePlates - Array of available plate weights, sorted descending
 * @returns Record mapping plate weight to count per side
 */
export function calculatePlatesForWeight(
  totalWeight: number,
  barbellWeight: number,
  isMachine: boolean,
  availablePlates: number[]
): PlateCountMap {
  const result: PlateCountMap = {};
  
  // Calculate weight per side
  let weightPerSide = isMachine 
    ? totalWeight / 2 
    : (totalWeight - barbellWeight) / 2;
  
  // Clamp to non-negative
  if (weightPerSide < 0) {
    weightPerSide = 0;
  }

  // Greedily assign plates from largest to smallest
  for (const plate of availablePlates) {
    const count = Math.floor(weightPerSide / plate);
    if (count > 0) {
      result[plate] = count;
      weightPerSide -= count * plate;
    }
  }
  
  return result;
}

/**
 * Convert a plate count map to a flat array of plates.
 * Useful for rendering individual plates in visualizations.
 * 
 * @param plateCountMap - Record mapping plate weight to count
 * @param availablePlates - Array of available plate weights (determines order)
 * @returns Array of plate weights, one entry per plate
 */
export function plateCountMapToArray(
  plateCountMap: PlateCountMap,
  availablePlates: number[]
): number[] {
  const result: number[] = [];
  for (const plate of availablePlates) {
    const count = plateCountMap[plate] || 0;
    for (let i = 0; i < count; i++) {
      result.push(plate);
    }
  }
  return result;
}

/**
 * Check if any plates are present in the plate count map.
 * 
 * @param plateCountMap - Record mapping plate weight to count
 * @returns True if at least one plate is present
 */
export function hasPlates(plateCountMap: PlateCountMap): boolean {
  return Object.values(plateCountMap).some(count => count > 0);
}

