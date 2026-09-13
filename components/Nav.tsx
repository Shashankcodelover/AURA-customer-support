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

  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;
  const rate = tickets.length ? Math.round((resolvedCount / tickets.length) * 100) : 63;

  return (
    <header className="border-b border-white/10 sticky top-0 z-50 bg-[#060913]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand & Telemetry */}
        <div className="flex items-center gap-3">
          <Link href="/" onClick={() => playClickSound()} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-md shadow-indigo-500/15 group-hover:shadow-indigo-500/30 transition">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="text-cyan-400 group-hover:scale-110 transition" size={17} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-extrabold tracking-tight text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-cyan-200">
                  AURA
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                  v2.5 AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 tracking-wider hidden sm:block font-medium">
                AUTONOMOUS UNIFIED RESOLUTION AGENT
              </p>
            </div>
          </Link>

          {/* Engine Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-[11px] text-slate-600 dark:text-gray-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700 dark:text-gray-200">Qwen 2.5 Multi-Agent Engine</span>
            <span className="text-slate-300 dark:text-gray-600">|</span>
            <span className="text-slate-500 dark:text-gray-400">EnterPro Graph</span>
            <span className="text-slate-300 dark:text-gray-600">|</span>
            <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-cyan-700 dark:text-cyan-400">
              <Wifi size={11} /> {ping}ms
            </span>
          </div>
        </div>

        {/* Center/Right Nav Links */}
        <div className="hidden md:flex items-center gap-2">
          <nav className="flex items-center gap-1 bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-1 rounded-xl">
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
                      ? 'bg-slate-900 text-white shadow-sm dark:bg-gradient-to-r dark:from-cyan-500/20 dark:to-violet-500/20 dark:text-cyan-200 dark:border dark:border-cyan-400/40'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-cyan-400' : 'text-slate-500 dark:text-gray-500'} />
                  {l.label}
                  {l.href === '/dashboard' && capsules.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white dark:bg-amber-500/20 dark:text-amber-300 border border-amber-600 dark:border-amber-500/40 font-mono font-bold">
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:bg-slate-50 dark:hover:bg-white/[0.08] hover:border-slate-300 dark:hover:border-cyan-500/30 text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white transition text-xs shadow-2xs group"
            title="Open Omnibar Command Palette (Ctrl+K)"
          >
            <Search size={13} className="text-slate-500 dark:text-cyan-400 group-hover:scale-110 transition" />
            <span className="hidden lg:inline text-slate-700 dark:text-gray-300 font-medium">Quick Actions</span>
            <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-600 dark:text-cyan-300">
              <Command size={10} className="hidden lg:inline" /> K
            </kbd>
          </button>

          {/* Performance Pill */}
          <div className="hidden xl:flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-xs text-slate-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <Activity size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>
                Auto-Resolve: <strong className="text-emerald-700 dark:text-emerald-300">{rate}%</strong>
              </span>
            </div>
            <span className="text-slate-300 dark:text-gray-700">·</span>
            <span>
              MTTR: <strong className="text-cyan-700 dark:text-cyan-300">1.4s</strong>
            </span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={() => {
              playClickSound();
              toggleTheme();
            }}
            title={theme === 'light' ? 'Switch to Cybernetic Dark Mode' : 'Switch to Executive Light Mode'}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 transition flex items-center gap-1 text-xs shadow-2xs"
          >
            {theme === 'light' ? <Moon size={15} className="text-indigo-600" /> : <Sun size={15} className="text-amber-400" />}
          </button>

          {/* Cybernetic Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? 'Mute Cybernetic Audio' : 'Enable Cybernetic Audio'}
            className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs shadow-2xs ${
              soundOn
                ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100'
                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-500 hover:text-slate-900 dark:hover:text-white'
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
            className="p-2 rounded-xl text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition flex items-center gap-1 text-xs"
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
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-cyan-600 dark:text-cyan-400 hover:text-slate-950 dark:hover:text-white"
            title="Open Command Palette"
          >
            <Search size={16} />
          </button>

          <button
            onClick={() => {
              playClickSound();
              toggleTheme();
            }}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={16} className="text-indigo-600" /> : <Sun size={16} className="text-amber-400" />}
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white"
          >
            {soundOn ? <Volume2 size={16} className="text-cyan-600 dark:text-cyan-400" /> : <VolumeX size={16} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#060913]/95 space-y-1 shadow-lg">
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
                    ? 'bg-slate-900 text-white dark:bg-cyan-500/15 dark:text-cyan-300 dark:border dark:border-cyan-500/30'
                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-500 dark:text-gray-400'} />
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
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
