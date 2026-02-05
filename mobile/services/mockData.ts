export interface Transaction {
    id: string;
    amount: number;
    category: string;
    date: string; // ISO date string
    note: string;
    type: 'income' | 'expense';
    logo?: string; // URL or local asset ref (mocked as string)
}

export interface Budget {
    category: string;
    limit: number;
    spent: number;
}

export interface Contact {
    id: string;
    name: string;
    avatar: string;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
    { id: '1', amount: 50.0, category: 'Food', date: '2023-10-26T12:00:00Z', note: 'Lunch', type: 'expense', logo: 'https://cdn-icons-png.flaticon.com/512/732/732200.png' }, // Example food icon
    { id: '2', amount: 2500.0, category: 'Salary', date: '2023-10-25T09:00:00Z', note: 'October Salary', type: 'income', logo: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' },
    { id: '3', amount: 15.0, category: 'Transport', date: '2023-10-24T18:30:00Z', note: 'Uber', type: 'expense', logo: 'https://cdn-icons-png.flaticon.com/512/5969/5969323.png' }, // Uber-like
    { id: '4', amount: 80.0, category: 'Utilities', date: '2023-10-23T10:00:00Z', note: 'Internet Bill', type: 'expense', logo: 'https://cdn-icons-png.flaticon.com/512/3022/3022243.png' },
    { id: '5', amount: 200.0, category: 'Shopping', date: '2023-10-22T14:00:00Z', note: 'Nike Sneakers', type: 'expense', logo: 'https://cdn-icons-png.flaticon.com/512/732/732084.png' },
    { id: '6', amount: 120.0, category: 'Freelance', date: '2023-10-20T15:00:00Z', note: 'Upwork Project', type: 'income', logo: 'https://cdn-icons-png.flaticon.com/512/3800/3800024.png' }, // Upwork-like
];

export const MOCK_BUDGETS: Budget[] = [
    { category: 'Food', limit: 500, spent: 350 },
    { category: 'Transport', limit: 200, spent: 120 },
    { category: 'Utilities', limit: 300, spent: 280 }, // Near limit
    { category: 'Shopping', limit: 400, spent: 450 }, // Over limit
];

export const MOCK_CONTACTS: Contact[] = [
    { id: '1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
    { id: '2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { id: '3', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
    { id: '4', name: 'David', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { id: '5', name: 'Eve', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
];

export const MOCK_SUMMARY = {
    totalBalance: 25480.00, // Matching the big numbers in the design
    monthlyIncome: 4500.00,
    monthlyExpense: 1250.00,
};
