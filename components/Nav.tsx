'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  RotateCcw,
  Menu,
  X,
  Activity,
  MessageSquare,
  LayoutDashboard,
  LineChart,
  GitGraph,
  Volume2,
  VolumeX,
  Wifi,
  Search,
  Command,
  Sun,
  Moon,
} from 'lucide-react';
import { useAppState } from '@/lib/context/AppStateContext';
import { isSoundEnabled, setSoundEnabled, playClickSound } from '@/lib/audio/soundEffects';
import CommandPalette from './CommandPalette';

const links = [
  { href: '/', label: 'Customer Chat', icon: MessageSquare },
  { href: '/dashboard', label: 'Agent Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Churn Radar', icon: LineChart },
  { href: '/workflow', label: 'Workflow DAG', icon: GitGraph },
];

export default function Nav() {
  const pathname = usePathname();
  const { resetDemo, tickets, capsules, theme, toggleTheme } = useAppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [ping, setPing] = useState(24);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
    const interval = setInterval(() => {
      setPing(Math.floor(18 + Math.random() * 12));
    }, 4000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleSound = () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    setSoundEnabled(nextState);
    if (nextState) playClickSound();
  };

  return (
    <header className="border-b border-white/90 dark:border-white/8 sticky top-0 z-50 bg-[rgba(255,255,255,0.68)] dark:bg-[rgba(15,20,35,0.85)] backdrop-blur-[22px] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Telemetry */}
        <div className="flex items-center gap-3">
          <Link href="/" onClick={() => playClickSound()} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-[9px] bg-[linear-gradient(135deg,#6EE7C8,#B69CFF_55%,#FFAFD1)] shadow-md shadow-[#6D4AEB]/15 group-hover:shadow-[#6D4AEB]/30 transition flex items-center justify-center">
              <Sparkles className="text-white group-hover:scale-110 transition" size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-extrabold tracking-tight text-[#1B1D2A] dark:text-white">
                  AURA
                </span>
              </div>
              <p className="text-[10px] text-[#6B6E85] dark:text-[#8B8FA3] tracking-wider hidden sm:block font-medium">
                Autonomous Support Intelligence
              </p>
            </div>
          </Link>

          {/* Engine Status Pill */}
          <div className="hidden lg:flex items-center">
            <span className="live-pill flex items-center gap-1.5 text-xs text-[#6B6E85] dark:text-[#8B8FA3] px-3 py-1 bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(15,20,35,0.72)] rounded-full border border-white/90 dark:border-white/8">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-[#0E9C74]" /> Live system
            </span>
          </div>
        </div>

        {/* Center/Right Nav Links */}
        <div className="hidden md:flex items-center gap-2">
          <nav className="flex items-center gap-1 bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(15,20,35,0.5)] border border-white/90 dark:border-white/8 p-1 rounded-xl">
            {links.map((l) => {
              const Icon = l.icon;
              const isActive = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => playClickSound()}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(255,255,255,0.1)] text-[#1B1D2A] dark:text-[#E8EAF0] shadow-[0_2px_10px_rgba(109,74,235,0.08)] dark:shadow-none'
                      : 'text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#1B1D2A] dark:hover:text-[#E8EAF0] hover:bg-[rgba(255,255,255,0.4)] dark:hover:bg-[rgba(255,255,255,0.05)]'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-[#6D4AEB]' : 'text-[#6B6E85] dark:text-[#8B8FA3]'} />
                  {l.label}
                  {l.href === '/dashboard' && capsules.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#C97A00] text-white border border-[#C97A00] font-mono font-bold">
                      {capsules.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick Action Omnibar Trigger */}
          <button
            onClick={() => {
              playClickSound();
              setPaletteOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/90 dark:border-white/8 bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(15,20,35,0.72)] hover:border-[rgba(109,74,235,0.3)] dark:hover:border-[#6D4AEB]/50 text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#1B1D2A] dark:hover:text-[#E8EAF0] transition text-xs shadow-[0_8px_30px_rgba(109,74,235,0.07)] dark:shadow-none group"
            title="Open Omnibar Command Palette (Ctrl+K)"
          >
            <Search size={13} className="text-[#6B6E85] dark:text-[#8B8FA3] group-hover:text-[#6D4AEB] transition" />
            <span className="hidden lg:inline text-[#1B1D2A] dark:text-[#E8EAF0] font-medium">Quick Actions</span>
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.5)] dark:bg-white/5 border border-white/90 dark:border-white/8 text-[10px] font-mono text-[#6B6E85] dark:text-[#8B8FA3]">
              <Command size={10} className="hidden lg:inline" /> K
            </kbd>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => {
              playClickSound();
              toggleTheme();
            }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className="p-2 rounded-xl border border-white/90 dark:border-white/8 bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(15,20,35,0.72)] hover:bg-[rgba(255,255,255,0.9)] dark:hover:bg-[rgba(255,255,255,0.1)] text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#1B1D2A] dark:hover:text-[#E8EAF0] transition flex items-center gap-1 text-xs shadow-[0_8px_30px_rgba(109,74,235,0.07)] dark:shadow-none"
          >
            {theme === 'light' ? <Moon size={15} className="text-[#6D4AEB]" /> : <Sun size={15} className="text-[#C97A00]" />}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? 'Mute Audio' : 'Enable Audio'}
            className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs shadow-[0_8px_30px_rgba(109,74,235,0.07)] dark:shadow-none ${
              soundOn
                ? 'bg-[#0E9C74]/10 border-[#0E9C74]/30 text-[#0E9C74]'
                : 'bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(15,20,35,0.72)] border-white/90 dark:border-white/8 text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#1B1D2A] dark:hover:text-[#E8EAF0]'
            }`}
          >
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={() => {
              playClickSound();
              if (window.confirm('Reset AURA demo state? Clears active session tickets and knowledge base.')) {
                resetDemo();
              }
            }}
            title="Reset demo state"
            className="p-2 rounded-xl text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#1B1D2A] dark:hover:text-[#E8EAF0] bg-[rgba(255,255,255,0.5)] dark:bg-[rgba(15,20,35,0.5)] hover:bg-[rgba(255,255,255,0.8)] dark:hover:bg-[rgba(255,255,255,0.1)] border border-transparent hover:border-white/90 dark:hover:border-white/8 transition flex items-center gap-1 text-xs"
          >
            <RotateCcw size={15} />
            <span className="hidden xl:inline text-[11px] font-medium">Reset</span>
          </button>
        </div>

        {/* Mobile Hamburger & Actions */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => {
              playClickSound();
              setPaletteOpen(true);
            }}
            className="p-2 rounded-lg bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(15,20,35,0.72)] border border-white/90 dark:border-white/8 text-[#6D4AEB] hover:text-[#1B1D2A] dark:hover:text-[#E8EAF0]"
            title="Open Command Palette"
          >
            <Search size={16} />
          </button>

          <button
            onClick={() => {
              playClickSound();
              toggleTheme();
            }}
            className="p-2 rounded-lg bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(15,20,35,0.72)] border border-white/90 dark:border-white/8 text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#1B1D2A] dark:hover:text-[#E8EAF0]"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={16} className="text-[#6D4AEB]" /> : <Sun size={16} className="text-[#C97A00]" />}
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(15,20,35,0.72)] border border-white/90 dark:border-white/8 text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#1B1D2A] dark:hover:text-[#E8EAF0]"
          >
            {soundOn ? <Volume2 size={16} className="text-[#0E9C74]" /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(15,20,35,0.72)] border border-white/90 dark:border-white/8 text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#1B1D2A] dark:hover:text-[#E8EAF0]"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-white/90 dark:border-white/8 bg-[rgba(255,255,255,0.95)] dark:bg-[rgba(15,20,35,0.95)] backdrop-blur-[22px] space-y-1 shadow-lg">
          {links.map((l) => {
            const Icon = l.icon;
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => {
                  playClickSound();
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[rgba(255,255,255,0.85)] dark:bg-[rgba(255,255,255,0.1)] text-[#1B1D2A] dark:text-[#E8EAF0] border border-white/90 dark:border-white/8'
                    : 'text-[#6B6E85] dark:text-[#8B8FA3] hover:text-[#1B1D2A] dark:hover:text-[#E8EAF0] hover:bg-[rgba(255,255,255,0.5)] dark:hover:bg-white/5'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-[#6D4AEB]' : 'text-[#6B6E85] dark:text-[#8B8FA3]'} />
                {l.label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              playClickSound();
              resetDemo();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#E11D48] dark:text-[#E11D48] hover:bg-[#E11D48]/10"
          >
            <RotateCcw size={16} /> Reset Demo State
          </button>
        </div>
      )}

      {/* Omnibar Command Palette Modal */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </header>
  );
}
