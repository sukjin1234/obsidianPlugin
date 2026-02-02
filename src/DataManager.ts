import { App } from 'obsidian';
import { ExpenseData, Transaction, DEFAULT_DATA } from './types';

const DATA_FILE_PATH = 'expenses.json';

export class DataManager {
	private app: App;
	private data: ExpenseData;
	private listeners: Set<() => void> = new Set();

	constructor(app: App) {
		this.app = app;
		this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
	}

	async loadData(): Promise<void> {
		try {
			const adapter = this.app.vault.adapter;
			const exists = await adapter.exists(DATA_FILE_PATH);
			
			if (exists) {
				const content = await adapter.read(DATA_FILE_PATH);
				const loadedData = JSON.parse(content);
				
				// 기존 데이터와 병합
				this.data = {
					transactions: loadedData.transactions || [],
					settings: {
						...DEFAULT_DATA.settings,
						...loadedData.settings,
					},
				};
				console.log('가계부 데이터 로드 완료:', this.data.transactions.length, '건');
			} else {
				console.log('가계부 데이터 파일 없음, 새로 생성');
				await this.saveData();
			}
		} catch (error) {
			console.error('가계부 데이터 로드 실패:', error);
			this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
		}
	}

	async saveData(): Promise<void> {
		try {
			const adapter = this.app.vault.adapter;
			const content = JSON.stringify(this.data, null, 2);
			
			await adapter.write(DATA_FILE_PATH, content);
			console.log('가계부 데이터 저장 완료');
		} catch (error) {
			console.error('가계부 데이터 저장 실패:', error);
		}
	}

	getTransactions(): Transaction[] {
		return [...this.data.transactions];
	}

	getSettings() {
		return { ...this.data.settings };
	}

	async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<void> {
		const newTransaction: Transaction = {
			...transaction,
			id: Date.now().toString(),
		};
		this.data.transactions = [newTransaction, ...this.data.transactions];
		await this.saveData();
		this.notifyListeners();
	}

	async deleteTransaction(id: string): Promise<void> {
		this.data.transactions = this.data.transactions.filter(t => t.id !== id);
		await this.saveData();
		this.notifyListeners();
	}

	async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
		this.data.transactions = this.data.transactions.map(t =>
			t.id === id ? { ...t, ...updates } : t
		);
		await this.saveData();
		this.notifyListeners();
	}

	subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private notifyListeners(): void {
		this.listeners.forEach(listener => listener());
	}
}
