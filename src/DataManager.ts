import { App, TFile } from 'obsidian';
import { ExpenseData, Transaction, DEFAULT_DATA } from './types';

const DATA_FILE_PATH = 'expenses.json';

export class DataManager {
	private app: App;
	private data: ExpenseData;
	private listeners: Set<() => void> = new Set();

	constructor(app: App) {
		this.app = app;
		this.data = { ...DEFAULT_DATA };
	}

	async loadData(): Promise<void> {
		try {
			const file = this.app.vault.getAbstractFileByPath(DATA_FILE_PATH);
			if (file instanceof TFile) {
				const content = await this.app.vault.read(file);
				this.data = JSON.parse(content);
			} else {
				// 파일이 없으면 기본 데이터로 생성
				await this.saveData();
			}
		} catch (error) {
			console.error('Failed to load expense data:', error);
			this.data = { ...DEFAULT_DATA };
		}
	}

	async saveData(): Promise<void> {
		try {
			const content = JSON.stringify(this.data, null, 2);
			const file = this.app.vault.getAbstractFileByPath(DATA_FILE_PATH);
			
			if (file instanceof TFile) {
				await this.app.vault.modify(file, content);
			} else {
				await this.app.vault.create(DATA_FILE_PATH, content);
			}
		} catch (error) {
			console.error('Failed to save expense data:', error);
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

	// React 상태 동기화를 위한 리스너 패턴
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
