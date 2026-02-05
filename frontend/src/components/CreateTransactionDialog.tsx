import { useState } from 'react';
import { X, Loader2, Calendar as CalendarIcon, Wallet } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { mockService } from '../services/mockService';
import { toast } from 'sonner';

interface CreateTransactionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateTransactionDialog({ isOpen, onClose, onSuccess }: CreateTransactionDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: 'Food & Drink',
        type: 'expense' as 'income' | 'expense',
        date: new Date().toISOString().split('T')[0]
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || !formData.amount) {
            toast.error('Please fill in required fields');
            return;
        }

        setIsLoading(true);
        try {
            await mockService.addTransaction({
                description: formData.description,
                amount: Number(formData.amount),
                type: formData.type,
                category: formData.category,
                date: formData.date
            });
            toast.success('Transaction added successfully');
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                description: '',
                amount: '',
                category: 'Food & Drink',
                type: 'expense',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            toast.error('Failed to add transaction');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md p-4 animate-in zoom-in-95 duration-300">
                <Card className="border-2 border-brand-border shadow-2xl bg-brand-surface">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-brand-border pb-4">
                        <CardTitle className="text-xl text-brand-text">Add Transaction</CardTitle>
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-brand-bg">
                            <X className="w-4 h-4 text-brand-text-muted" />
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Type Selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                                    className={`p-3 text-sm font-bold border rounded-lg transition-all
                                        ${formData.type === 'expense'
                                            ? 'border-brand-accent bg-orange-500/10 text-brand-accent'
                                            : 'border-brand-border bg-brand-bg text-brand-text-muted hover:border-brand-text-muted'
                                        }`}
                                >
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: 'income' })}
                                    className={`p-3 text-sm font-bold border rounded-lg transition-all
                                        ${formData.type === 'income'
                                            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                            : 'border-brand-border bg-brand-bg text-brand-text-muted hover:border-brand-text-muted'
                                        }`}
                                >
                                    Income
                                </button>
                            </div>

                            {/* Amount Input */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">Amount (VND)</label>
                                <div className="relative">
                                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                                    <input
                                        type="number"
                                        className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-lg bg-brand-bg font-bold text-brand-text focus:border-brand-primary focus:outline-none transition-colors"
                                        placeholder="0"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Description Input */}
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">Description</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-brand-border rounded-lg bg-brand-bg font-medium text-brand-text focus:border-brand-primary focus:outline-none transition-colors"
                                    placeholder="What was this for?"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Category & Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">Category</label>
                                    <select
                                        className="w-full px-3 py-2 border border-brand-border rounded-lg bg-brand-bg font-medium text-brand-text focus:border-brand-primary focus:outline-none transition-colors"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Food & Drink</option>
                                        <option>Transport</option>
                                        <option>Shopping</option>
                                        <option>Entertainment</option>
                                        <option>Bills & Utilities</option>
                                        <option>Salary</option>
                                        <option>Freelance</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">Date</label>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted" />
                                        <input
                                            type="date"
                                            className="w-full pl-9 pr-2 py-2 border border-brand-border rounded-lg bg-brand-bg font-medium text-brand-text focus:border-brand-primary focus:outline-none transition-colors [color-scheme:dark]"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="ghost" className="flex-1 text-brand-text-muted hover:text-brand-text" onClick={onClose}>Cancel</Button>
                                <Button type="submit" className="flex-1" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Transaction'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
