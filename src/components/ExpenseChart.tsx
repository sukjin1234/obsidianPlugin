import { useState } from 'react';
import { Transaction } from '../types';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from 'recharts';

interface ExpenseChartProps {
	transactions: Transaction[];
}

export function ExpenseChart({ transactions }: ExpenseChartProps) {
	const [filterMonth, setFilterMonth] = useState('all');

	// 사용 가능한 월 목록 생성
	const availableMonths = Array.from(
		new Set(
			transactions.map((t) => {
				const date = new Date(t.date);
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
			})
		)
	).sort().reverse();

	// 월 필터 적용
	const filteredTransactions = filterMonth === 'all'
		? transactions
		: transactions.filter((t) => t.date.substring(0, 7) === filterMonth);

	// 날짜별 지출 데이터 생성
	const expenseByDate = filteredTransactions
		.filter((t) => t.type === 'expense')
		.reduce(
			(acc, transaction) => {
				const date = transaction.date;
				if (!acc[date]) {
					acc[date] = 0;
				}
				acc[date] += transaction.amount;
				return acc;
			},
			{} as Record<string, number>
		);

	// 날짜 순으로 정렬
	const sortedDates = Object.keys(expenseByDate).sort();

	// 누적 지출 계산
	let cumulativeExpense = 0;
	const chartData = sortedDates.map((date) => {
		cumulativeExpense += expenseByDate[date];
		return {
			date: date.split('-').slice(1).join('/'), // MM/DD 형식으로 변경
			fullDate: date,
			dailyExpense: expenseByDate[date],
			cumulativeExpense: cumulativeExpense,
		};
	});

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('ko-KR', {
			style: 'currency',
			currency: 'KRW',
			notation: 'compact',
			maximumFractionDigits: 0,
		}).format(value);
	};

	const formatMonth = (monthStr: string) => {
		const [year, month] = monthStr.split('-');
		return `${year}년 ${parseInt(month)}월`;
	};

	const CustomTooltip = ({ active, payload }: any) => {
		if (active && payload && payload.length) {
			return (
				<div className="chart-tooltip">
					<p className="tooltip-date">{payload[0].payload.fullDate}</p>
					<p className="tooltip-item">
						일일 지출:{' '}
						<span className="expense">{formatCurrency(payload[0].payload.dailyExpense)}</span>
					</p>
					<p className="tooltip-item">
						누적 지출: <span className="cumulative">{formatCurrency(payload[0].value)}</span>
					</p>
				</div>
			);
		}
		return null;
	};

	// 통계 계산
	const totalExpense = cumulativeExpense;
	const avgDailyExpense = chartData.length > 0 ? totalExpense / chartData.length : 0;
	const maxDailyExpense = Math.max(...chartData.map((d) => d.dailyExpense), 0);

	return (
		<div className="chart-container">
			{/* 월 필터 */}
			<div className="chart-filter">
				<span className="filter-label">기간:</span>
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
			</div>

			{/* 통계 카드 */}
			<div className="chart-stats">
				<div className="stat-card total">
					<div className="stat-label">총 지출</div>
					<div className="stat-value">{formatCurrency(totalExpense)}</div>
				</div>
				<div className="stat-card average">
					<div className="stat-label">일평균 지출</div>
					<div className="stat-value">{formatCurrency(avgDailyExpense)}</div>
				</div>
				<div className="stat-card max">
					<div className="stat-label">최대 일일 지출</div>
					<div className="stat-value">{formatCurrency(maxDailyExpense)}</div>
				</div>
			</div>

			{/* 그래프 */}
			{chartData.length === 0 ? (
				<div className="chart-empty">지출 데이터가 없습니다.</div>
			) : (
				<div className="chart-wrapper">
					<ResponsiveContainer width="100%" height={300}>
						<LineChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" stroke="var(--background-modifier-border)" />
							<XAxis dataKey="date" stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
							<YAxis
								stroke="var(--text-muted)"
								style={{ fontSize: '12px' }}
								tickFormatter={formatCurrency}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Legend wrapperStyle={{ fontSize: '14px' }} iconType="line" />
							<Line
								type="monotone"
								dataKey="cumulativeExpense"
								stroke="var(--color-red)"
								strokeWidth={3}
								name="누적 지출"
								dot={{ fill: 'var(--color-red)', r: 4 }}
								activeDot={{ r: 6 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			)}
		</div>
	);
}
