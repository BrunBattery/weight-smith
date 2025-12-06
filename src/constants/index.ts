// WeightSmith Constants
// Centralized configuration for colors, sizes, and defaults

// App version
export const APP_VERSION = 'v1.1.1';

// Default available plates for each unit system
export const DEFAULT_PLATES_KG = [1.25, 2.5, 5, 10, 15, 20, 25];
export const ALL_PLATES_KG = [0.5, 1, 1.25, 2.5, 5, 10, 15, 20, 25, 45];

export const DEFAULT_PLATES_LBS = [2.5, 5, 10, 25, 35, 45];
export const ALL_PLATES_LBS = [1.25, 2.5, 5, 10, 25, 35, 45, 55, 100];

// Plate color configuration type
export interface PlateColorConfig {
  plate: string;
  text: string;
  bg: string;
  border: string;
}

// IWF Color Standards (adapted to WeightSmith design system)
// Big plates (5kg+): IWF standard colors
// Small plates (2.5kg and below): Unique colors, consistent between KG and LB
export const IWF_COLORS_KG: Record<number, PlateColorConfig> = {
  45:   { plate: '#a89984', text: '#a89984', bg: '#2a2a2a', border: '#3d3d3d' },   // Silver/Chrome
  25:   { plate: '#d4534f', text: '#d4534f', bg: '#2f2424', border: '#3d2a2a' },   // Red
  20:   { plate: '#5a9bb8', text: '#5a9bb8', bg: '#24292f', border: '#28343d' },   // Blue
  15:   { plate: '#d4a83d', text: '#d4a83d', bg: '#2f2a24', border: '#3d3128' },   // Yellow
  10:   { plate: '#4aba4a', text: '#4aba4a', bg: '#243024', border: '#2e3d2e' },   // Green (vibrant)
  5:    { plate: '#d5c4a1', text: '#d5c4a1', bg: '#2a2a2a', border: '#3d3d3d' },   // White
  2.5:  { plate: '#c27be7', text: '#c27be7', bg: '#2f2430', border: '#3d2e47' },   // Purple
  1.25: { plate: '#e88a4c', text: '#e88a4c', bg: '#2f2824', border: '#3d3028' },   // Orange
  1:    { plate: '#4cc9e8', text: '#4cc9e8', bg: '#242c2f', border: '#28383d' },   // Cyan
  0.5:  { plate: '#e84c8a', text: '#e84c8a', bg: '#2f2428', border: '#3d2830' },   // Pink
};

// LBS equivalents following similar pattern
export const IWF_COLORS_LBS: Record<number, PlateColorConfig> = {
  100:  { plate: '#a89984', text: '#a89984', bg: '#2a2a2a', border: '#3d3d3d' },   // Silver/Chrome
  55:   { plate: '#d4534f', text: '#d4534f', bg: '#2f2424', border: '#3d2a2a' },   // Red
  45:   { plate: '#5a9bb8', text: '#5a9bb8', bg: '#24292f', border: '#28343d' },   // Blue
  35:   { plate: '#d4a83d', text: '#d4a83d', bg: '#2f2a24', border: '#3d3128' },   // Yellow
  25:   { plate: '#4aba4a', text: '#4aba4a', bg: '#243024', border: '#2e3d2e' },   // Green (vibrant)
  10:   { plate: '#d5c4a1', text: '#d5c4a1', bg: '#2a2a2a', border: '#3d3d3d' },   // White
  5:    { plate: '#c27be7', text: '#c27be7', bg: '#2f2430', border: '#3d2e47' },   // Purple (matches 2.5kg)
  2.5:  { plate: '#e88a4c', text: '#e88a4c', bg: '#2f2824', border: '#3d3028' },   // Orange (matches 1.25kg)
  1.25: { plate: '#e84c8a', text: '#e84c8a', bg: '#2f2428', border: '#3d2830' },   // Pink (matches 0.5kg)
};

// Plate sizes (visual height) for barbell display - more distinct at smaller sizes
export const PLATE_SIZES_KG: Record<number, number> = {
  45: 48, 25: 44, 20: 40, 15: 36, 10: 32, 5: 26, 2.5: 22, 1.25: 18, 1: 14, 0.5: 10
};
export const PLATE_SIZES_LBS: Record<number, number> = {
  100: 48, 55: 44, 45: 40, 35: 36, 25: 32, 10: 26, 5: 22, 2.5: 18, 1.25: 14
};

// Plate widths for settings visualization (thinner for small plates)
export const PLATE_WIDTHS_KG: Record<number, number> = {
  45: 14, 25: 10, 20: 10, 15: 10, 10: 10, 5: 8, 2.5: 7, 1.25: 6, 1: 5, 0.5: 4
};
export const PLATE_WIDTHS_LBS: Record<number, number> = {
  100: 14, 55: 10, 45: 10, 35: 10, 25: 10, 10: 8, 5: 7, 2.5: 6, 1.25: 5
};

// Doom-themed difficulty levels for max weight settings
export const DIFFICULTY_LEVELS = [
  "I'm too young to die",
  "Hey, not too rough",
  "Hurt me plenty",
  "Ultra-Violence",
  "Nightmare!"
] as const;

// Max weight presets by difficulty level
export const BARBELL_MAX_WEIGHTS_LBS = [400, 500, 600, 800, 1200] as const;
export const MACHINE_MAX_WEIGHTS_LBS = [400, 600, 800, 1000, 1500] as const;
export const BARBELL_MAX_WEIGHTS_KG = [180, 225, 270, 360, 545] as const;
export const MACHINE_MAX_WEIGHTS_KG = [180, 270, 360, 450, 680] as const;

// Barbell weights mapping (lbs key to kg value)
export const BARBELL_WEIGHT_IN_KG: Record<number, number> = { 45: 20, 35: 15, 15: 7 };

// Shared type definitions
export type WarmupStyle = 'methodical' | 'average' | 'aggressive';
export type EquipmentType = 'Barbell' | 'Machine';
export type BarbellWeightType = 45 | 35 | 15;

export interface WarmupSet {
  weight: number;
  reps: number;
  note: string;
}

// Data-driven warmup definitions
interface WarmupStepDef {
  pct: number;
  reps: number;
  noteBar: string;
  noteMachine: string;
}

export const WARMUP_DEFINITIONS: Record<WarmupStyle, WarmupStepDef[]> = {
  methodical: [
    { pct: 0, reps: 5, noteBar: 'Bar', noteMachine: 'Light' },
    { pct: 0.40, reps: 5, noteBar: '40%', noteMachine: '40%' },
    { pct: 0.55, reps: 3, noteBar: '55%', noteMachine: '55%' },
    { pct: 0.70, reps: 3, noteBar: '70%', noteMachine: '70%' },
    { pct: 0.80, reps: 1, noteBar: '80%', noteMachine: '80%' },
    { pct: 0.90, reps: 1, noteBar: '90%', noteMachine: '90%' },
    { pct: 1.0, reps: 0, noteBar: 'Working set(s)', noteMachine: 'Working set(s)' },
  ],
  average: [
    { pct: 0, reps: 10, noteBar: 'Bar', noteMachine: 'Light' },
    { pct: 0.40, reps: 5, noteBar: '40%', noteMachine: '40%' },
    { pct: 0.60, reps: 3, noteBar: '60%', noteMachine: '60%' },
    { pct: 0.80, reps: 2, noteBar: '80%', noteMachine: '80%' },
    { pct: 1.0, reps: 0, noteBar: 'Working set(s)', noteMachine: 'Working set(s)' },
  ],
  aggressive: [
    { pct: 0.60, reps: 3, noteBar: '60%', noteMachine: '60%' },
    { pct: 0.75, reps: 2, noteBar: '75%', noteMachine: '75%' },
    { pct: 0.85, reps: 1, noteBar: '85%', noteMachine: '85%' },
    { pct: 1.0, reps: 0, noteBar: 'Working set(s)', noteMachine: 'Working set(s)' },
  ]
};

// Default rounding step for weight calculations
export const ROUNDING_STEP = 2.5;

// App navigation tabs
export type AppTab = 'plates' | 'percentages' | 'warmup' | 'settings';

// Warmup style display configuration
export const WARMUP_STYLE_LABELS: Record<WarmupStyle, string> = {
  methodical: 'Methodical',
  average: 'Standard',
  aggressive: 'Aggressive'
};

export const WARMUP_STYLE_DESCRIPTIONS: Record<WarmupStyle, string> = {
  methodical: 'Many warmup sets - good for singles',
  average: 'Typical warmup - moderate jumps',
  aggressive: 'Quickly get to work sets - good for rep work'
};

// Standard percentage/RPE chart for 1RM calculations
export const PERCENTAGE_RPE_CHART = [
  { pct: 100, rpe: '~10' },
  { pct: 95, rpe: '~9.5' },
  { pct: 90, rpe: '~9' },
  { pct: 85, rpe: '~8' },
  { pct: 80, rpe: '~7-8' },
  { pct: 75, rpe: '~6-7' },
  { pct: 70, rpe: '~5-6' },
  { pct: 65, rpe: '~4-5' },
] as const;

