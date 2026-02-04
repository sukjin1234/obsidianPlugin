import { useState, useEffect, useCallback, useMemo } from 'react';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseChart } from './components/ExpenseChart';
import { ExpenseTable } from './components/ExpenseTable';
import { ExpenseCalendar } from './components/ExpenseCalendar';
import { DataManager } from './DataManager';
import { Transaction } from './types';

interface AppProps {
	dataManager: DataManager;
}

// 현재 월을 YYYY-MM 형식으로 반환
const getCurrentMonth = () => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function App({ dataManager }: AppProps) {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [activeTab, setActiveTab] = useState<'table' | 'chart' | 'calendar'>('table');
	const [filterMonth, setFilterMonth] = useState(getCurrentMonth());
	const [showAddModal, setShowAddModal] = useState(false);

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
		setShowAddModal(false);
	};

	const deleteTransaction = async (id: string) => {
		await dataManager.deleteTransaction(id);
	};

	const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
		await dataManager.updateTransaction(id, updates);
	};

	// 사용 가능한 월 목록 생성
	const availableMonths = useMemo(() => {
		return Array.from(
			new Set(
				transactions.map((t) => {
					const date = new Date(t.date);
					return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
				})
			)
		).sort().reverse();
	}, [transactions]);

	// 필터링된 거래 내역
	const filteredTransactions = useMemo(() => {
		if (filterMonth === 'all') return transactions;
		return transactions.filter((t) => t.date.substring(0, 7) === filterMonth);
	}, [transactions, filterMonth]);

	// 총계 계산 (필터 적용)
	const totalIncome = filteredTransactions
		.filter(t => t.type === 'income')
		.reduce((sum, t) => sum + t.amount, 0);

	const totalExpense = filteredTransactions
		.filter(t => t.type === 'expense')
		.reduce((sum, t) => sum + t.amount, 0);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('ko-KR', {
			style: 'currency',
			currency: 'KRW',
		}).format(amount);
	};

	const formatMonth = (monthStr: string) => {
		const [year, month] = monthStr.split('-');
		return `${year}년 ${parseInt(month)}월`;
	};

	return (
		<div className="expense-tracker">
			{/* 헤더 */}
			<div className="expense-header">
				<h1 className="expense-title">가계부</h1>
				<p className="expense-subtitle">당신의 재정을 한눈에 관리하세요</p>
			</div>

			{/* 월 필터 */}
			<div className="month-filter">
				<select
					value={filterMonth}
					onChange={(e) => setFilterMonth(e.target.value)}
					className="month-select"
				>
					<option value="all">전체 기간</option>
					{availableMonths.map((month) => (
						<option key={month} value={month}>
							{formatMonth(month)}
						</option>
					))}
				</select>
			</div>

			{/* 요약 카드 */}
			<div className="expense-summary">
				<div className="summary-card income">
					<div className="summary-label">
						{filterMonth === 'all' ? '총 수입' : `${formatMonth(filterMonth)} 수입`}
					</div>
					<div className="summary-value">{formatCurrency(totalIncome)}</div>
				</div>
				<div className="summary-card expense">
					<div className="summary-label">
						{filterMonth === 'all' ? '총 지출' : `${formatMonth(filterMonth)} 지출`}
					</div>
					<div className="summary-value">{formatCurrency(totalExpense)}</div>
				</div>
				<div className="summary-card balance">
					<div className="summary-label">잔액</div>
					<div className="summary-value">{formatCurrency(totalIncome - totalExpense)}</div>
				</div>
			</div>

			{/* 거래 등록 섹션 */}
			<div className="expense-section">
				<div className="section-header-row">
					<h2 className="section-title">새로운 거래 등록</h2>
					<button type="button" className="btn-add-transaction" onClick={() => setShowAddModal(true)}>
						추가하기
					</button>
				</div>
			</div>

			{/* 거래 등록 모달 */}
			{showAddModal && (
				<div className="expense-modal-overlay" onClick={() => setShowAddModal(false)}>
					<div className="expense-modal" onClick={(e) => e.stopPropagation()}>
						<div className="expense-modal-header">
							<h3 className="expense-modal-title">새로운 거래 등록</h3>
							<button type="button" className="expense-modal-close" onClick={() => setShowAddModal(false)}>
								×
							</button>
						</div>
						<div className="expense-modal-body">
							<ExpenseForm onAdd={addTransaction} />
						</div>
					</div>
				</div>
			)}

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
						filterMonth={filterMonth}
					/>
				)}
				{activeTab === 'chart' && (
					<ExpenseChart transactions={filteredTransactions} filterMonth={filterMonth} />
				)}
				{activeTab === 'calendar' && (
					<ExpenseCalendar transactions={transactions} />
				)}
			</div>
		</div>
	);
}
