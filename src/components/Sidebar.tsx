'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  Wallet,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ingresos', label: 'Ingresos', icon: TrendingUp },
  { href: '/gastos', label: 'Gastos', icon: TrendingDown },
  { href: '/presupuesto', label: 'Presupuesto', icon: CalendarDays },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass-card rounded-none border-r border-white/8 flex flex-col z-50"
      style={{ borderRadius: 0 }}>
      {/* Logo */}
      <div className="p-6 border-b border-white/8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-none">FinanzasPro</h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(232,234,246,0.4)' }}>Control Total</p>
          </div>
        </motion.div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Link href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group
                  ${isActive
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(102,126,234,0.2) 0%, rgba(118,75,162,0.2) 100%)',
                    border: '1px solid rgba(102,126,234,0.3)',
                  } : {}}>
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-indigo-400' : 'group-hover:scale-110'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400"
                    />
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/8">
        <p className="text-xs text-center" style={{ color: 'rgba(232,234,246,0.25)' }}>
          © 2025 FinanzasPro
        </p>
      </div>
    </aside>
  );
}
