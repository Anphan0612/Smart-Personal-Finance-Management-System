import { motion, type Variants } from 'framer-motion';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

const CHART_DATA = [
    { label: 'Food', value: 35, color: 'bg-orange-500' },
    { label: 'Transport', value: 15, color: 'bg-slate-800' },
    { label: 'Shopping', value: 25, color: 'bg-emerald-600' },
    { label: 'Bills', value: 20, color: 'bg-slate-400' },
    { label: 'Others', value: 5, color: 'bg-slate-200' },
];

export default function ReportsPage() {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
        >
            <div>
                <h1 className="font-display font-bold text-4xl text-slate-900 tracking-tight">Financial Reports</h1>
                <p className="text-slate-500 mt-1">Spending analysis for January 2026.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Spending Structure (CSS Bar Chart) */}
                <motion.div variants={itemVariants} className="bg-white border-2 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                    <h3 className="font-display font-bold text-xl mb-8">Spending Structure</h3>

                    <div className="space-y-6">
                        {CHART_DATA.map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-slate-900">{item.label}</span>
                                    <span>{item.value}%</span>
                                </div>
                                <div className="w-full h-4 bg-slate-100 relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.value}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className={`h-full ${item.color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Monthly Trend (Simple Visual) */}
                <motion.div variants={itemVariants} className="bg-slate-900 text-white p-8 shadow-[8px_8px_0px_0px_rgba(203,213,225,1)]">
                    <h3 className="font-display font-bold text-xl mb-2 text-white">Monthly Insight</h3>
                    <div className="text-5xl font-display font-bold text-brand-primary mb-6">
                        -12%
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                        Good job! Your spending is <span className="text-white font-bold">12% lower</span> than last month.
                        You saved <span className="text-white font-bold">1.2M VND</span> on 'Food & Drink'.
                    </p>

                    <div className="mt-12 h-32 flex items-end gap-2">
                        {[40, 60, 45, 80, 55, 70, 45].map((h, i) => (
                            <div key={i} className="flex-1 bg-slate-800 hover:bg-brand-primary transition-colors cursor-pointer relative group">
                                <div style={{ height: `${h}%` }} className="w-full bg-current absolute bottom-0"></div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
