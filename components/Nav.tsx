'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, RotateCcw } from 'lucide-react';
import { useAppState } from '@/lib/context/AppStateContext';

const links = [
  { href: '/', label: 'Customer Chat' },
  { href: '/dashboard', label: 'Agent Dashboard' },
  { href: '/analytics', label: 'Churn Radar' },
  { href: '/workflow', label: 'Workflow' },
];

export default function Nav() {
  const pathname = usePathname();
  const { resetDemo } = useAppState();

  return (
    <header className="border-b border-white/10 sticky top-0 z-50 bg-navy-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Sparkles className="text-cyan-400" size={22} />
          <span className="font-display text-xl font-bold tracking-tight">AURA</span>
          <span className="hidden sm:inline text-[11px] px-2 py-1 rounded-full border border-white/10 text-gray-400 ml-2">
            Qwen + EnterPro Orchestration
          </span>
        </div>
        <div className="flex items-center gap-2">
          <nav className="flex gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${
                  pathname === l.href ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={() => {
              if (window.confirm('Reset the demo? This clears escalated cases and the session knowledge base.')) {
                resetDemo();
              }
            }}
            title="Reset demo state"
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
