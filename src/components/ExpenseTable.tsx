import { useState } from 'react';
import { Transaction } from '../types';
import { Trash2 } from 'lucide-react';

interface ExpenseTableProps {
	transactions: Transaction[];
	onDelete: (id: string) => void;
}

export function ExpenseTable({ transactions, onDelete }: ExpenseTableProps) {
	const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
	const [filterCategory, setFilterCategory] = useState('all');
	const [filterMonth, setFilterMonth] = useState('all');
	const [searchTerm, setSearchTerm] = useState('');

	// 사용 가능한 월 목록 생성
	const availableMonths = Array.from(
		new Set(
			transactions.map((t) => {
				const date = new Date(t.date);
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
			})
		)
	).sort().reverse();

	// 필터링된 거래 내역
	const filteredTransactions = transactions.filter((transaction) => {
		const typeMatch = filterType === 'all' || transaction.type === filterType;
		const categoryMatch = filterCategory === 'all' || transaction.category === filterCategory;
		const searchMatch =
			transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
		
		// 월 필터
		let monthMatch = true;
		if (filterMonth !== 'all') {
			const transactionMonth = transaction.date.substring(0, 7); // YYYY-MM
			monthMatch = transactionMonth === filterMonth;
		}

		return typeMatch && categoryMatch && searchMatch && monthMatch;
	});

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

	return (
		<div className="expense-table-container">
			{/* 필터 섹션 */}
			<div className="filter-section">
				<div className="filter-row">
					<span className="filter-label">필터:</span>
					<select
						value={filterMonth}
						onChange={(e) => setFilterMonth(e.target.value)}
						className="filter-select"
					>
						<option value="all">전체 기간</option>
						{availableMonths.map((month) => (
							<option key={month} value={month}>
								{formatMonth(month)}
							</option>
						))}
					</select>
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
							<th className="text-center">삭제</th>
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
										<button
											onClick={() => onDelete(transaction.id)}
											className="btn-delete"
										>
											<Trash2 size={16} />
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
