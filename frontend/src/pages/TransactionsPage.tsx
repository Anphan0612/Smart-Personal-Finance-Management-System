import { useState, useEffect } from 'react';
import { mockService } from '../services/mockService';
import type { Transaction } from '../services/mockData';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import CreateTransactionDialog from '../components/CreateTransactionDialog';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, PlusCircle, Download, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const data = await mockService.getTransactions();
            setTransactions(data);
        } catch (error) {
            toast.error('Failed to load transactions');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            try {
                await mockService.deleteTransaction(id);
                toast.success('Transaction deleted');
                fetchTransactions(); // Refresh
            } catch (error) {
                toast.error('Failed to delete transaction');
            }
        }
    };

    // Filter logic
    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CreateTransactionDialog
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={fetchTransactions}
            />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-brand-text">Transactions</h2>
                    <p className="text-brand-text-muted">Manage and track your financial activity.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="hidden md:flex border-brand-border text-brand-text-muted hover:text-brand-text hover:border-brand-text-muted">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button onClick={() => setIsCreateOpen(true)} className="bg-brand-primary hover:bg-brand-primary/90 text-white border-transparent shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add New
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className="w-full pl-10 pr-4 py-2 border border-brand-border rounded-lg bg-brand-surface text-brand-text focus:border-brand-primary focus:outline-none transition-colors placeholder:text-brand-text-muted"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="w-full md:w-auto border-brand-border text-brand-text-muted hover:text-brand-text hover:bg-brand-surface">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <Card className="hidden md:block shadow-sm border-brand-border bg-brand-surface">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-brand-border bg-brand-bg/50">
                                        <th className="p-4 font-display font-bold text-brand-text-muted text-xs uppercase tracking-wider w-[150px]">
                                            <button className="flex items-center gap-1 hover:text-brand-text transition-colors">
                                                Date <ArrowUpDown className="w-3 h-3" />
                                            </button>
                                        </th>
                                        <th className="p-4 font-display font-bold text-brand-text-muted text-xs uppercase tracking-wider">Description</th>
                                        <th className="p-4 font-display font-bold text-brand-text-muted text-xs uppercase tracking-wider">Category</th>
                                        <th className="p-4 font-display font-bold text-brand-text-muted text-xs uppercase tracking-wider text-right">Amount</th>
                                        <th className="p-4 font-display font-bold text-brand-text-muted text-xs uppercase tracking-wider w-[100px] text-center">Status</th>
                                        <th className="p-4 font-display font-bold text-brand-text-muted text-xs uppercase tracking-wider w-[50px]"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className="border-b border-brand-border/50 hover:bg-brand-bg/30 transition-colors group">
                                            <td className="p-4 text-sm font-medium text-brand-text-muted">
                                                {format(new Date(tx.date), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-brand-text">{tx.description}</div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="secondary" className="bg-brand-bg text-brand-text-muted border border-brand-border">
                                                    {tx.category}
                                                </Badge>
                                            </td>
                                            <td className={`p-4 text-right font-display font-bold ${tx.type === 'income' ? 'text-brand-primary' : 'text-brand-text'}`}>
                                                {tx.type === 'expense' ? '-' : '+'}
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <Badge variant="success" className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Completed</Badge>
                                            </td>
                                            <td className="p-4 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-500/10"
                                                    onClick={() => handleDelete(tx.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-brand-text-muted">
                                                No transactions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="flex items-center justify-between p-4 border-t border-brand-border">
                            <span className="text-xs text-brand-text-muted font-medium">Showing {filteredTransactions.length} results</span>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled className="border-brand-border bg-brand-bg text-brand-text-muted">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" className="border-brand-border text-brand-text-muted hover:bg-brand-bg hover:text-brand-text">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Mobile List View */}
                    <div className="md:hidden space-y-4">
                        {filteredTransactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="flex items-center justify-between p-4 bg-brand-surface border border-brand-border rounded-lg shadow-sm active:scale-[0.98] transition-transform"
                                onClick={() => {/* Open details */ }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 flex items-center justify-center font-bold text-sm bg-brand-bg border border-brand-border rounded-full text-brand-text-muted`}>
                                        {tx.category.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-brand-text truncate max-w-[150px]">
                                            {tx.description}
                                        </div>
                                        <div className="text-xs text-brand-text-muted font-medium mt-0.5">
                                            {tx.category} • {format(new Date(tx.date), 'MMM dd')}
                                        </div>
                                    </div>
                                </div>
                                <div className={`font-display font-bold text-sm ${tx.type === 'income' ? 'text-brand-primary' : 'text-brand-text'}`}>
                                    {tx.type === 'expense' ? '-' : '+'}
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumSignificantDigits: 3 }).format(tx.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
