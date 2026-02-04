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
	filterMonth?: string;
}

export function ExpenseChart({ transactions, filterMonth }: ExpenseChartProps) {
	// 날짜별 지출 데이터 생성 (이미 필터링된 transactions가 전달됨)
	const expenseByDate = transactions
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
