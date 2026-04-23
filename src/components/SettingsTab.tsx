import type { Dispatch, SetStateAction } from 'react';
import { Mail } from 'lucide-react';
import { Dropdown } from './Dropdown';
import type { DropdownOption } from './Dropdown';
import { GitHubIcon } from './GitHubIcon';
import {
  APP_VERSION,
  ALL_PLATES_KG,
  ALL_PLATES_LBS,
  DEFAULT_PLATES_KG,
  DEFAULT_PLATES_LBS,
  PLATE_WIDTHS_KG,
  PLATE_WIDTHS_LBS,
} from '../constants';
import type { BarbellWeightType } from '../constants';

export type SettingsSubTab = 'general' | 'plates';

export function SettingsTab({
  settingsTab,
  onSettingsTabChange,
  isKg,
  onUnitToggle,
  barbellWeight,
  barbellWeightOptions,
  onBarbellWeightChange,
  maxWeightBarbellLevel,
  maxWeightBarbellOptions,
  onMaxWeightBarbellChange,
  maxWeightMachineLevel,
  maxWeightMachineOptions,
  onMaxWeightMachineChange,
  availablePlatesKg,
  setAvailablePlatesKg,
  availablePlatesLbs,
  setAvailablePlatesLbs,
  plateColors,
  plateSizes,
}: {
  settingsTab: SettingsSubTab;
  onSettingsTabChange: (tab: SettingsSubTab) => void;
  isKg: boolean;
  onUnitToggle: (toKg: boolean) => void;
  barbellWeight: BarbellWeightType;
  barbellWeightOptions: DropdownOption<BarbellWeightType>[];
  onBarbellWeightChange: (w: BarbellWeightType) => void;
  maxWeightBarbellLevel: number;
  maxWeightBarbellOptions: DropdownOption<number>[];
  onMaxWeightBarbellChange: (idx: number) => void;
  maxWeightMachineLevel: number;
  maxWeightMachineOptions: DropdownOption<number>[];
  onMaxWeightMachineChange: (idx: number) => void;
  availablePlatesKg: number[];
  setAvailablePlatesKg: Dispatch<SetStateAction<number[]>>;
  availablePlatesLbs: number[];
  setAvailablePlatesLbs: Dispatch<SetStateAction<number[]>>;
  plateColors: Record<number, { plate: string; text: string; bg: string; border: string }>;
  plateSizes: Record<number, number>;
}) {
  return (
    <div className="bg-[#242424] rounded-lg shadow-[0px_0px_8px_rgba(0,0,0,0.25)] p-6 min-[390px]:py-7">
      {/* Settings Tabs */}
      <div className="flex border-b border-[#2f2f2f] mb-6">
        {([
          { id: 'general', label: 'General' },
          { id: 'plates', label: 'Plates' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSettingsTabChange(tab.id)}
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
                onClick={() => onUnitToggle(false)}
                className={`flex-1 px-4 py-2 rounded text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#C6A85B] focus-visible:outline-none ${
                  !isKg
                    ? 'bg-[#3a3a3a] text-[#C6A85B] border-2 border-[#C6A85B]'
                    : 'text-[#665c54] hover:text-[#a89984]'
                }`}
              >
                LBs
              </button>
              <button
                onClick={() => onUnitToggle(true)}
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
              onChange={onBarbellWeightChange}
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
              onChange={onMaxWeightBarbellChange}
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
              onChange={onMaxWeightMachineChange}
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
  );
}
