
import { useState } from 'react';
import { X, Send, Sparkles, Bot } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

export default function AIFinancialAdvisor() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
        { role: 'ai', content: 'Hello! I am your AI Financial Advisor. Ask me anything about your spending.' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');

        // Simulate AI response
        setTimeout(() => {
            let aiResponse = "I'm analyzing your data...";
            if (userMsg.toLowerCase().includes('coffee')) {
                aiResponse = "You've spent 250k VND on coffee this week. Cutting back could save you 1M VND/month!";
            } else if (userMsg.toLowerCase().includes('save')) {
                aiResponse = "Based on your income, I recommend setting aside 20% (6M VND) for savings.";
            } else {
                aiResponse = "That's interesting! I'm still learning your spending habits. Try asking about 'coffee' or 'savings'.";
            }

            setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50">
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-transform hover:scale-105"
                >
                    <Sparkles className="w-6 h-6" />
                </Button>
            )}

            {isOpen && (
                <Card className="w-[350px] h-[500px] flex flex-col shadow-2xl border-indigo-200 animate-in fade-in slide-in-from-bottom-10 duration-300">
                    <CardHeader className="bg-indigo-600 text-white rounded-t-lg flex flex-row items-center justify-between py-3 px-4">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5" />
                            <CardTitle className="text-sm font-bold text-white">AI Advisor</CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/20"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-white dark:bg-slate-950">
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-2">
                            <input
                                type="text"
                                className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md px-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-slate-100"
                                placeholder="Ask AI..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <Button size="icon" className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 text-white shrink-0" onClick={handleSend}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
