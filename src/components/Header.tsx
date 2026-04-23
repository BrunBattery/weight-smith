import { Scale, Flame, Percent, Settings } from 'lucide-react';
import type { AppTab } from '../constants';

export function Header({
  activeTab,
  onTabChange,
}: {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}) {
  return (
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
            onClick={() => onTabChange('plates')}
            className={`p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A85B] ${
              activeTab === 'plates' ? 'text-[#C6A85B]' : 'text-[#666666] hover:text-[#a89984]'
            }`}
            title="Load"
          >
            <Scale size={24} />
          </button>
          <button
            onClick={() => onTabChange('warmup')}
            className={`p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A85B] ${
              activeTab === 'warmup' ? 'text-[#C6A85B]' : 'text-[#666666] hover:text-[#a89984]'
            }`}
            title="Warmup"
          >
            <Flame size={24} />
          </button>
          <button
            onClick={() => onTabChange('percentages')}
            className={`p-2 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A85B] ${
              activeTab === 'percentages' ? 'text-[#C6A85B]' : 'text-[#666666] hover:text-[#a89984]'
            }`}
            title="Percentages"
          >
            <Percent size={24} />
          </button>
          <button
            onClick={() => onTabChange('settings')}
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
  );
}
