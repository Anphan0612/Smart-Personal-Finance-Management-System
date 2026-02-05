
import { ArrowUpRight, ArrowDownLeft, TrendingUp, CreditCard, Activity, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useState, useEffect } from 'react';
import { mockService } from '../services/mockService';
import type { DashboardData } from '../services/mockData';
import { toast } from 'sonner';

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const dashboardData = await mockService.getDashboardData();
                setData(dashboardData);
            } catch (error) {
                toast.error('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (isLoading || !data) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="relative overflow-hidden group border-brand-primary/20 bg-brand-primary/5 hover:border-brand-primary/50 transition-colors">
                    {/* Background Pattern */}
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <WalletIcon className="w-24 h-24 text-brand-primary" />
                    </div>
                    <CardHeader>
                        <CardTitle className="text-brand-text-muted text-sm uppercase tracking-wider font-medium">Total Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl lg:text-5xl font-display font-bold mb-2 break-all text-brand-text">
                            {new Intl.NumberFormat('vi-VN', { maximumSignificantDigits: 3, notation: "compact", compactDisplay: "short" }).format(data.totalBalance)} <span className="text-xl text-brand-text-muted">VND</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                            <TrendingUp className="w-4 h-4" />
                            +12.5% from last month
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:border-brand-primary transition-colors cursor-pointer group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-brand-text-muted text-sm uppercase tracking-wider font-medium">Income</CardTitle>
                        <ArrowDownLeft className="w-4 h-4 text-brand-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-display font-bold text-brand-text">
                            {new Intl.NumberFormat('vi-VN', { maximumSignificantDigits: 3, notation: "compact" }).format(data.totalIncome)}
                        </div>
                        <div className="h-1.5 w-full bg-brand-border mt-4 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-primary w-[75%]"></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:border-brand-accent transition-colors cursor-pointer group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-brand-text-muted text-sm uppercase tracking-wider font-medium">Spending</CardTitle>
                        <ArrowUpRight className="w-4 h-4 text-brand-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-display font-bold text-brand-text">
                            {new Intl.NumberFormat('vi-VN', { maximumSignificantDigits: 3, notation: "compact" }).format(data.totalExpense)}
                        </div>
                        <div className="h-1.5 w-full bg-brand-border mt-4 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-accent w-[25%]"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Smart Insights (AI Feature) */}
            <div className="grid grid-cols-1 gap-4">
                {data.insights.map((insight, index) => (
                    <div key={index} className="flex items-center p-4 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-lg">
                        <Sparkles className="w-5 h-5 text-violet-500 mr-3 shrink-0" />
                        <span className="text-sm font-medium text-brand-text">{insight}</span>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Charts (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Spending Trend</CardTitle>
                                <p className="text-sm text-brand-text-muted">Monthly spending overview.</p>
                            </div>
                            <Badge variant="outline" className="text-brand-text-muted border-brand-border">Monthly</Badge>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.monthlyStats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-brand-border)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--color-brand-text-muted)', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'var(--color-brand-text-muted)', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--color-brand-surface)', border: '1px solid var(--color-brand-border)', borderRadius: '8px', color: 'var(--color-brand-text)' }}
                                        itemStyle={{ color: 'var(--color-brand-text)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="expense"
                                        stroke="var(--color-brand-accent)"
                                        strokeWidth={3}
                                        dot={{ fill: 'var(--color-brand-accent)', strokeWidth: 2, r: 4, stroke: 'var(--color-brand-surface)' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        name="Expense"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="income"
                                        stroke="var(--color-brand-primary)"
                                        strokeWidth={3}
                                        dot={{ fill: 'var(--color-brand-primary)', strokeWidth: 2, r: 4, stroke: 'var(--color-brand-surface)' }}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        name="Income"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-brand-primary text-white border-transparent shadow-lg shadow-brand-primary/20">
                            <CardHeader>
                                <CardTitle className="text-white opacity-90">Quick Action</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Button className="w-full justify-start bg-white/10 text-white hover:bg-white/20 border-none">
                                    <Activity className="w-4 h-4 mr-2" />
                                    Add New Expense
                                </Button>
                                <Button className="w-full justify-start bg-white text-brand-primary hover:bg-zinc-100 border-none shadow-sm">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Transfer Money
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Budget Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold text-brand-text-muted">
                                            <span>Shopping</span>
                                            <span className="text-brand-accent">85%</span>
                                        </div>
                                        <div className="h-2 w-full bg-brand-border rounded-full overflow-hidden">
                                            <div className="h-full bg-brand-accent w-[85%]"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold text-brand-text-muted">
                                            <span>Food & Dining</span>
                                            <span className="text-brand-primary">42%</span>
                                        </div>
                                        <div className="h-2 w-full bg-brand-border rounded-full overflow-hidden">
                                            <div className="h-full bg-brand-primary w-[42%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Recent Transactions (1/3 width) */}
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between shrink-0">
                        <CardTitle>Recent Activity</CardTitle>
                        <Link to="/transactions" className="text-xs font-bold text-brand-primary hover:underline">View All</Link>
                    </CardHeader>
                    <CardContent className="px-0 flex-1 overflow-auto">
                        <div className="divide-y divide-brand-border">
                            {data.recentTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-brand-bg/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${tx.type === 'expense' ? 'bg-orange-500/10 text-brand-accent' : 'bg-brand-primary/10 text-brand-primary'}`}>
                                            {tx.category.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-brand-text truncate w-[100px]">{tx.description}</p>
                                            <p className="text-xs text-brand-text-muted">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-bold font-display shrink-0 ${tx.type === 'expense' ? 'text-brand-text' : 'text-brand-primary'}`}>
                                        {tx.type === 'expense' ? '-' : '+'}
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumSignificantDigits: 3 }).format(tx.amount)}
                                    </div>
                                </div>
                            ))}
                            {data.recentTransactions.length === 0 && (
                                <div className="p-8 text-center text-brand-text-muted text-sm">No activity yet.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

function WalletIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
    )
}
