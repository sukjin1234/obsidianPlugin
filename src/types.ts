export interface Transaction {
	id: string;
	date: string;
	type: 'expense' | 'income';
	category: string;
	amount: number;
	description: string;
}

export interface ExpenseData {
	transactions: Transaction[];
	settings: ExpenseSettings;
}

export interface ExpenseSettings {
	expenseCategories: string[];
	incomeCategories: string[];
}

export const DEFAULT_DATA: ExpenseData = {
	transactions: [],
	settings: {
		expenseCategories: ['식비', '교통', '쇼핑', '생활', '문화', '기타'],
		incomeCategories: ['용돈', '월급', '부수입'],
	},
};
