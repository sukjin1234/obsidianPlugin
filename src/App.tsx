import { useState, useEffect, useCallback } from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseChart } from './components/ExpenseChart';
import { ExpenseTable } from './components/ExpenseTable';
import { ExpenseCalendar } from './components/ExpenseCalendar';
import { DataManager } from './DataManager';
import { Transaction } from './types';

interface AppProps {
	dataManager: DataManager;
}

export default function App({ dataManager }: AppProps) {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [activeTab, setActiveTab] = useState<'table' | 'chart' | 'calendar'>('table');

	// DataManager에서 데이터 로드 및 동기화
	const refreshData = useCallback(() => {
		setTransactions(dataManager.getTransactions());
	}, [dataManager]);

	useEffect(() => {
		refreshData();
		const unsubscribe = dataManager.subscribe(refreshData);
		return unsubscribe;
	}, [dataManager, refreshData]);

	const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
		await dataManager.addTransaction(transaction);
	};

	const deleteTransaction = async (id: string) => {
		await dataManager.deleteTransaction(id);
	};

	const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
		await dataManager.updateTransaction(id, updates);
	};

	// 총계 계산
	const totalIncome = transactions
		.filter(t => t.type === 'income')
		.reduce((sum, t) => sum + t.amount, 0);

	const totalExpense = transactions
		.filter(t => t.type === 'expense')
		.reduce((sum, t) => sum + t.amount, 0);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('ko-KR', {
			style: 'currency',
			currency: 'KRW',
		}).format(amount);
	};

	return (
		<div className="expense-tracker">
			{/* 헤더 */}
			<div className="expense-header">
				<h1 className="expense-title">가계부</h1>
				<p className="expense-subtitle">당신의 재정을 한눈에 관리하세요</p>
			</div>

			{/* 요약 카드 */}
			<div className="expense-summary">
				<div className="summary-card income">
					<div className="summary-label">총 수입</div>
					<div className="summary-value">{formatCurrency(totalIncome)}</div>
				</div>
				<div className="summary-card expense">
					<div className="summary-label">총 지출</div>
					<div className="summary-value">{formatCurrency(totalExpense)}</div>
				</div>
				<div className="summary-card balance">
					<div className="summary-label">잔액</div>
					<div className="summary-value">{formatCurrency(totalIncome - totalExpense)}</div>
				</div>
			</div>

			{/* 지출/수입 등록 폼 */}
			<div className="expense-section">
				<h2 className="section-title">새로운 거래 등록</h2>
				<ExpenseForm onAdd={addTransaction} />
			</div>

			{/* 탭 네비게이션 */}
			<div className="expense-tabs">
				<button
					className={`tab-button ${activeTab === 'table' ? 'active' : ''}`}
					onClick={() => setActiveTab('table')}
				>
					거래 내역
				</button>
				<button
					className={`tab-button ${activeTab === 'chart' ? 'active' : ''}`}
					onClick={() => setActiveTab('chart')}
				>
					차트
				</button>
				<button
					className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
					onClick={() => setActiveTab('calendar')}
				>
					캘린더
				</button>
			</div>

			{/* 탭 컨텐츠 */}
			<div className="expense-section">
				{activeTab === 'table' && (
					<ExpenseTable
						transactions={transactions}
						onDelete={deleteTransaction}
						onUpdate={updateTransaction}
					/>
				)}
				{activeTab === 'chart' && (
					<ExpenseChart transactions={transactions} />
				)}
				{activeTab === 'calendar' && (
					<ExpenseCalendar transactions={transactions} />
				)}
			</div>
		</div>
	);
}
