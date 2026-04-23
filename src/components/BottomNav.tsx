import { Scale, Flame, Percent, Settings } from 'lucide-react';
import type { AppTab } from '../constants';

export function BottomNav({
  activeTab,
  onTabChange,
}: {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#242424] border-t border-[#2f2f2f] z-30 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => onTabChange('plates')}
          className={`flex items-center justify-center flex-1 h-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C6A85B] ${
            activeTab === 'plates' ? 'text-[#C6A85B]' : 'text-[#666666] hover:text-[#a89984]'
          }`}
        >
          <Scale size={24} />
        </button>
        <button
          onClick={() => onTabChange('warmup')}
          className={`flex items-center justify-center flex-1 h-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C6A85B] ${
            activeTab === 'warmup' ? 'text-[#C6A85B]' : 'text-[#666666] hover:text-[#a89984]'
          }`}
        >
          <Flame size={24} />
        </button>
        <button
          onClick={() => onTabChange('percentages')}
          className={`flex items-center justify-center flex-1 h-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C6A85B] ${
            activeTab === 'percentages' ? 'text-[#C6A85B]' : 'text-[#666666] hover:text-[#a89984]'
          }`}
        >
          <Percent size={24} />
        </button>
        <button
          onClick={() => onTabChange('settings')}
          className={`flex items-center justify-center flex-1 h-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C6A85B] ${
            activeTab === 'settings' ? 'text-[#C6A85B]' : 'text-[#666666] hover:text-[#a89984]'
          }`}
        >
          <Settings size={24} />
        </button>
      </div>
    </nav>
  );
}
