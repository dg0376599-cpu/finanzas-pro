'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, TrendingDown, CalendarDays, Wallet, RefreshCw } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

const navItems = [
  { href: '/',             label: 'Dashboard',   icon: LayoutDashboard, color: '#667eea' },
  { href: '/ingresos',    label: 'Ingresos',    icon: TrendingUp,      color: '#43e97b' },
  { href: '/gastos',      label: 'Gastos',      icon: TrendingDown,    color: '#fa709a' },
  { href: '/presupuesto', label: 'Presupuesto', icon: CalendarDays,    color: '#f6d365' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { rate, loading, lastUpdated, refresh } = useCurrency();

  const updatedAgo = () => {
    if (!lastUpdated) return '';
    const diff = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 60000);
    if (diff < 1) return 'ahora mismo';
    if (diff < 60) return `hace ${diff} min`;
    return `hace ${Math.floor(diff / 60)}h`;
  };

  const sidebarStyle: React.CSSProperties = {
    background: 'rgba(7, 11, 20, 0.94)',
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
  };

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-full w-64 flex-col z-50"
        style={{ ...sidebarStyle, borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 4px 20px rgba(102,126,234,0.4)' }}>
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-none">FinanzasPro</h1>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(232,234,246,0.35)' }}>Venezuela · Control Total</p>
            </div>
          </motion.div>
        </div>

        {/* BCV Rate Widget */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mx-4 mt-4 p-3 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(246,211,101,0.08), rgba(253,160,133,0.08))', border: '1px solid rgba(246,211,101,0.2)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-xs font-semibold" style={{ color: 'rgba(246,211,101,0.9)' }}>BCV Oficial</span>
            </div>
            <button onClick={refresh} disabled={loading} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} style={{ color: 'rgba(246,211,101,0.6)' }} />
            </button>
          </div>
          {loading && !rate ? (
            <div className="h-8 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
          ) : rate ? (
            <>
              <p className="text-xl font-bold text-white">Bs. {rate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(232,234,246,0.35)' }}>por 1 USD · {updatedAgo()}</p>
            </>
          ) : (
            <p className="text-xs" style={{ color: 'rgba(250,112,154,0.7)' }}>Sin conexión</p>
          )}
        </motion.div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 mt-2">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <motion.div key={item.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07 }}>
                <Link href={item.href}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group"
                    style={isActive
                      ? { background: `linear-gradient(135deg, ${item.color}22, ${item.color}11)`, border: `1px solid ${item.color}44`, color: 'white' }
                      : { color: 'rgba(232,234,246,0.45)' }}>
                    <Icon className="w-5 h-5 transition-all duration-200 group-hover:scale-110" style={{ color: isActive ? item.color : undefined }} />
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && (
                      <motion.div layoutId="activeIndicator" className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* BCV mini rate footer */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-xs text-center" style={{ color: 'rgba(232,234,246,0.2)' }}>© 2025 FinanzasPro</p>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{ ...sidebarStyle, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Wallet className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-base">FinanzasPro</span>
        </div>

        {/* BCV rate pill */}
        {rate && (
          <button onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(246,211,101,0.12)', border: '1px solid rgba(246,211,101,0.25)', color: 'rgba(246,211,101,0.9)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
            Bs. {rate.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </button>
        )}
      </header>

      {/* ── Mobile Bottom Nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
        style={{ ...sidebarStyle, borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <div className="flex flex-col items-center gap-1 py-2 rounded-xl transition-all"
                style={isActive ? { background: `${item.color}18` } : {}}>
                <Icon className="w-5 h-5 transition-all" style={{ color: isActive ? item.color : 'rgba(232,234,246,0.38)' }} />
                <span className="text-xs font-medium" style={{ color: isActive ? item.color : 'rgba(232,234,246,0.38)', fontSize: '10px' }}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
