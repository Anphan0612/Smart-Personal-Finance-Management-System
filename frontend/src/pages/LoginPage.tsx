import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Coins, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim()) {
            toast.error('Please enter a username');
            return;
        }

        setIsLoading(true);
        try {
            await login(username);
            toast.success(`Welcome back, ${username}!`);
            navigate('/');
        } catch (error) {
            toast.error('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <Card className="border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                    <CardHeader className="text-center space-y-4 pt-10">
                        <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                            <Coins className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-display font-bold text-slate-900">SmartMoney</CardTitle>
                            <p className="text-slate-500 mt-2 font-medium">Manage your wealth with style.</p>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-10 px-8">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="username" className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="Enter any username (e.g. admin)"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 font-bold border-2 border-slate-200 rounded-sm focus:border-brand-primary focus:outline-none focus:shadow-[4px_4px_0px_0px_#22c55e] transition-all"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="text-xs text-slate-400 font-medium text-center">
                                Tip: This is a prototype. No password required.
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg group bg-slate-900 hover:bg-slate-800 text-white border-2 border-transparent hover:border-slate-900"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Get Started
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="mt-8 text-center text-slate-400 text-sm font-medium">
                    © 2026 Smart Money Inc. Built with Antigravity.
                </div>
            </div>
        </div>
    );
}
