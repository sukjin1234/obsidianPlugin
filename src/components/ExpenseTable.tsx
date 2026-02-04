import { useState } from 'react';
import { Transaction } from '../types';
import { Trash2, Pencil, Check, X } from 'lucide-react';

interface ExpenseTableProps {
	transactions: Transaction[];
	onDelete: (id: string) => void;
	onUpdate: (id: string, updates: Partial<Transaction>) => void;
	filterMonth: string;
}

export function ExpenseTable({ transactions, onDelete, onUpdate, filterMonth }: ExpenseTableProps) {
	const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
	const [filterCategory, setFilterCategory] = useState('all');
	const [searchTerm, setSearchTerm] = useState('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editForm, setEditForm] = useState<Partial<Transaction>>({});

	const expenseCategories = ['식비', '교통', '쇼핑', '생활', '문화', '기타'];
	const incomeCategories = ['용돈', '월급', '부수입'];

	// 필터링 및 날짜순 정렬
	const filteredTransactions = transactions
		.filter((transaction) => {
			const typeMatch = filterType === 'all' || transaction.type === filterType;
			const categoryMatch = filterCategory === 'all' || transaction.category === filterCategory;
			const searchMatch =
				transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
				transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
			
			let monthMatch = true;
			if (filterMonth !== 'all') {
				const transactionMonth = transaction.date.substring(0, 7);
				monthMatch = transactionMonth === filterMonth;
			}

			return typeMatch && categoryMatch && searchMatch && monthMatch;
		})
		.sort((a, b) => b.date.localeCompare(a.date)); // 최신순 정렬

	// 모든 카테고리 목록
	const allCategories = Array.from(new Set(transactions.map((t) => t.category)));

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

	const formatNumberWithComma = (value: string): string => {
		const numericValue = value.replace(/[^\d]/g, '');
		if (!numericValue) return '';
		return Number(numericValue).toLocaleString('ko-KR');
	};

	const parseNumber = (value: string): number => {
		return Number(value.replace(/[^\d]/g, '')) || 0;
	};

	const startEdit = (transaction: Transaction) => {
		setEditingId(transaction.id);
		setEditForm({
			date: transaction.date,
			type: transaction.type,
			category: transaction.category,
			amount: transaction.amount,
			description: transaction.description,
		});
	};

	const cancelEdit = () => {
		setEditingId(null);
		setEditForm({});
	};

	const saveEdit = () => {
		if (editingId && editForm.category && editForm.amount) {
			onUpdate(editingId, editForm);
			setEditingId(null);
			setEditForm({});
		}
	};

	const getCategories = (type: 'expense' | 'income') => {
		return type === 'expense' ? expenseCategories : incomeCategories;
	};

	// 카테고리별 합계 계산 (필터링된 거래 기준)
	const categoryTotals = filteredTransactions.reduce((acc, t) => {
		if (!acc[t.category]) {
			acc[t.category] = { amount: 0, type: t.type };
		}
		acc[t.category].amount += t.amount;
		return acc;
	}, {} as Record<string, { amount: number; type: 'expense' | 'income' }>);

	// 지출/수입 별로 분리
	const expenseTotals = Object.entries(categoryTotals)
		.filter(([_, data]) => data.type === 'expense')
		.sort((a, b) => b[1].amount - a[1].amount);

	const incomeTotals = Object.entries(categoryTotals)
		.filter(([_, data]) => data.type === 'income')
		.sort((a, b) => b[1].amount - a[1].amount);

	return (
		<div className="expense-table-container">
			{/* 필터 섹션 */}
			<div className="filter-section">
				<div className="filter-row">
					<span className="filter-label">필터:</span>
					<select
						value={filterType}
						onChange={(e) => setFilterType(e.target.value as 'all' | 'expense' | 'income')}
						className="filter-select"
					>
						<option value="all">전체</option>
						<option value="expense">지출</option>
						<option value="income">수입</option>
					</select>
					<select
						value={filterCategory}
						onChange={(e) => setFilterCategory(e.target.value)}
						className="filter-select"
					>
						<option value="all">모든 카테고리</option>
						{allCategories.map((category) => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>
				</div>
				<input
					type="text"
					placeholder="검색..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="search-input"
				/>
			</div>

			{/* 테이블 */}
			<div className="table-wrapper">
				<table className="expense-table">
					<thead>
						<tr>
							<th>날짜</th>
							<th>구분</th>
							<th>카테고리</th>
							<th>설명</th>
							<th className="text-right">금액</th>
							<th className="text-center">작업</th>
						</tr>
					</thead>
					<tbody>
						{filteredTransactions.length === 0 ? (
							<tr>
								<td colSpan={6} className="empty-message">
									거래 내역이 없습니다.
								</td>
							</tr>
						) : (
							filteredTransactions.map((transaction) => (
								<tr key={transaction.id}>
									{editingId === transaction.id ? (
										<>
											<td>
												<input
													type="date"
													value={editForm.date || ''}
													onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
													className="edit-input"
												/>
											</td>
											<td>
												<select
													value={editForm.type || 'expense'}
													onChange={(e) => {
														const newType = e.target.value as 'expense' | 'income';
														setEditForm({ 
															...editForm, 
															type: newType,
															category: ''
														});
													}}
													className="edit-select"
												>
													<option value="expense">지출</option>
													<option value="income">수입</option>
												</select>
											</td>
											<td>
												<select
													value={editForm.category || ''}
													onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
													className="edit-select"
												>
													<option value="">선택</option>
													{getCategories(editForm.type || 'expense').map((cat) => (
														<option key={cat} value={cat}>{cat}</option>
													))}
												</select>
											</td>
											<td>
												<input
													type="text"
													value={editForm.description || ''}
													onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
													className="edit-input"
												/>
											</td>
											<td>
												<input
													type="text"
													inputMode="numeric"
													value={formatNumberWithComma(String(editForm.amount || ''))}
													onChange={(e) => setEditForm({ ...editForm, amount: parseNumber(e.target.value) })}
													className="edit-input edit-amount"
												/>
											</td>
											<td className="action-cell">
												<button onClick={saveEdit} className="btn-save">
													<Check size={16} />
												</button>
												<button onClick={cancelEdit} className="btn-cancel">
													<X size={16} />
												</button>
											</td>
										</>
									) : (
										<>
											<td>{transaction.date}</td>
											<td>
												<span className={`badge ${transaction.type}`}>
													{transaction.type === 'expense' ? '지출' : '수입'}
												</span>
											</td>
											<td>{transaction.category}</td>
											<td className="description-cell">{transaction.description}</td>
											<td className={`amount-cell ${transaction.type}`}>
												{transaction.type === 'expense' ? '-' : '+'}
												{formatCurrency(transaction.amount)}
											</td>
											<td className="action-cell">
												<button onClick={() => startEdit(transaction)} className="btn-edit">
													<Pencil size={16} />
												</button>
												<button onClick={() => onDelete(transaction.id)} className="btn-delete">
													<Trash2 size={16} />
												</button>
											</td>
										</>
									)}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* 카테고리별 합계 */}
			{(expenseTotals.length > 0 || incomeTotals.length > 0) && (
				<div className="category-summary">
					<h3 className="category-summary-title">
						카테고리별 합계
						{filterMonth !== 'all' && <span className="filter-period">({formatMonth(filterMonth)})</span>}
					</h3>
					
					<div className="category-summary-grid">
						{/* 지출 카테고리 */}
						{expenseTotals.length > 0 && (
							<div className="category-group expense">
								<h4 className="category-group-title">지출</h4>
								<div className="category-list">
									{expenseTotals.map(([category, data]) => (
										<div key={category} className="category-item">
											<span className="category-name">{category}</span>
											<span className="category-amount expense">
												-{formatCurrency(data.amount)}
											</span>
										</div>
									))}
									<div className="category-item total">
										<span className="category-name">합계</span>
										<span className="category-amount expense">
											-{formatCurrency(expenseTotals.reduce((sum, [_, d]) => sum + d.amount, 0))}
										</span>
									</div>
								</div>
							</div>
						)}

						{/* 수입 카테고리 */}
						{incomeTotals.length > 0 && (
							<div className="category-group income">
								<h4 className="category-group-title">수입</h4>
								<div className="category-list">
									{incomeTotals.map(([category, data]) => (
										<div key={category} className="category-item">
											<span className="category-name">{category}</span>
											<span className="category-amount income">
												+{formatCurrency(data.amount)}
											</span>
										</div>
									))}
									<div className="category-item total">
										<span className="category-name">합계</span>
										<span className="category-amount income">
											+{formatCurrency(incomeTotals.reduce((sum, [_, d]) => sum + d.amount, 0))}
										</span>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
