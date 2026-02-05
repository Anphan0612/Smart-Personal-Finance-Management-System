import { Outlet, Link, useLocation } from 'react-router-dom';

import { Wallet, Command, LayoutGrid, List, PieChart, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { Toaster, toast } from 'sonner';
import AIFinancialAdvisor from '../components/AIFinancialAdvisor';

export default function RootLayout() {
    const [query, setQuery] = useState('');
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully");
    };

    const navItems = [
        { path: '/', icon: LayoutGrid, label: 'Dashboard' },
        { path: '/transactions', icon: List, label: 'Transactions' },
        { path: '/reports', icon: PieChart, label: 'Reports' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <div className="h-screen w-full bg-brand-bg text-slate-50 font-sans flex overflow-hidden">

            {/* [DESKTOP] Sidebar Navigation */}
            <aside className="hidden md:flex flex-col w-64 bg-brand-surface border-r border-brand-border">
                <div className="p-6 border-b border-brand-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-display font-bold text-xl tracking-tight text-brand-text">
                            SMART<span className="text-brand-primary">MONEY</span>
                        </span>
                    </div>
                </div>

                <div className="flex-1 py-6 px-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 font-medium text-sm transition-all duration-200 rounded-lg
                                ${isActive
                                        ? 'bg-brand-primary/10 text-brand-primary'
                                        : 'text-brand-text-muted hover:text-brand-text hover:bg-brand-bg'
                                    }
                            `}
                            >
                                <item.icon className={`w-4 h-4 ${isActive ? 'text-brand-primary' : ''}`} />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>

                <div className="p-4 border-t border-brand-border">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-brand-bg flex items-center justify-center font-bold text-xs uppercase text-brand-text-muted border border-brand-border">
                            {user?.username?.charAt(0) || 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold truncate text-brand-text">{user?.name || 'User'}</p>
                            <p className="text-xs text-brand-text-muted truncate">Free Plan</p>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full justify-start text-xs h-9 border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-brand-bg hover:border-brand-text-muted" onClick={handleLogout}>
                        <LogOut className="w-3 h-3 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-brand-bg transition-colors duration-300">

                {/* [MOBILE] Header */}
                <header className="md:hidden flex items-center justify-between p-4 bg-brand-surface border-b border-brand-border z-20 transition-colors duration-300">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-brand-primary flex items-center justify-center rounded-md">
                            <Wallet className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-display font-bold text-lg text-brand-text">SMARTMONEY</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Button size="icon" variant="ghost" className="text-brand-text-muted">
                            <List className="w-5 h-5" />
                        </Button>
                    </div>
                </header>

                {/* Top Bar (Desktop) */}
                <header className="hidden md:flex items-center justify-between px-8 py-5 border-b border-brand-border bg-brand-bg/80 backdrop-blur-md z-10 transition-colors duration-300">
                    <h1 className="text-xl font-display font-bold text-brand-text capitalize">
                        {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1)}
                    </h1>

                    <div className="flex items-center gap-4">
                        {/* Command Bar */}
                        <div className="flex items-center gap-2 bg-brand-surface border border-brand-border px-3 py-1.5 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary transition-all rounded-md w-64 lg:w-96">
                            <Command className="w-3.5 h-3.5 text-brand-text-muted" />
                            <input
                                type="text"
                                placeholder="Type 'Spent 50k on coffee'..."
                                className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-brand-text-muted/70 text-brand-text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-brand-border bg-brand-bg px-1.5 font-mono text-[10px] font-medium text-brand-text-muted">
                                <span className="text-xs">⌘</span>K
                            </kbd>
                        </div>
                        <ThemeToggle />
                    </div>
                </header>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
                    <div className="max-w-7xl mx-auto pb-20 md:pb-0">
                        <Outlet />
                    </div>
                </main>

                {/* [MOBILE] Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-surface border-t border-brand-border pb-safe z-50 transition-colors duration-300">
                    <div className="flex justify-around p-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-colors
                                        ${isActive ? 'text-brand-primary' : 'text-brand-text-muted'}
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                </nav>

            </div>
            <Toaster position="top-center" richColors />
            <AIFinancialAdvisor />
        </div>
    );
}
