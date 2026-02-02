import { useState } from 'react';
import { Transaction } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ExpenseCalendarProps {
	transactions: Transaction[];
}

export function ExpenseCalendar({ transactions }: ExpenseCalendarProps) {
	const [currentDate, setCurrentDate] = useState(new Date());

	// 현재 월의 첫 날과 마지막 날
	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);

	// 달력 시작 날짜 (이전 달 포함)
	const startDay = new Date(firstDay);
	startDay.setDate(startDay.getDate() - firstDay.getDay());

	// 달력 끝 날짜 (다음 달 포함)
	const endDay = new Date(lastDay);
	endDay.setDate(endDay.getDate() + (6 - lastDay.getDay()));

	// 날짜별 거래 데이터 정리
	const transactionsByDate = transactions.reduce(
		(acc, transaction) => {
			const date = transaction.date;
			if (!acc[date]) {
				acc[date] = { expenses: 0, incomes: 0, count: 0 };
			}
			if (transaction.type === 'expense') {
				acc[date].expenses += transaction.amount;
			} else {
				acc[date].incomes += transaction.amount;
			}
			acc[date].count += 1;
			return acc;
		},
		{} as Record<string, { expenses: number; incomes: number; count: number }>
	);

	// 달력 날짜 생성
	const calendarDays: Date[] = [];
	const current = new Date(startDay);
	while (current <= endDay) {
		calendarDays.push(new Date(current));
		current.setDate(current.getDate() + 1);
	}

	const formatCurrency = (amount: number) => {
		if (amount >= 1000000) {
			return `${(amount / 10000).toFixed(0)}만`;
		} else if (amount >= 10000) {
			return `${(amount / 10000).toFixed(1)}만`;
		}
		return `${(amount / 1000).toFixed(0)}천`;
	};

	const goToPreviousMonth = () => {
		setCurrentDate(new Date(year, month - 1, 1));
	};

	const goToNextMonth = () => {
		setCurrentDate(new Date(year, month + 1, 1));
	};

	const goToToday = () => {
		setCurrentDate(new Date());
	};

	const isToday = (date: Date) => {
		const today = new Date();
		return date.toDateString() === today.toDateString();
	};

	const isCurrentMonth = (date: Date) => {
		return date.getMonth() === month;
	};

	const getDateString = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	return (
		<div className="calendar-container">
			{/* 헤더 */}
			<div className="calendar-header">
				<h3 className="calendar-title">
					{year}년 {month + 1}월
				</h3>
				<div className="calendar-nav">
					<button onClick={goToToday} className="btn-secondary">
						오늘
					</button>
					<button onClick={goToPreviousMonth} className="btn-icon">
						<ChevronLeft size={20} />
					</button>
					<button onClick={goToNextMonth} className="btn-icon">
						<ChevronRight size={20} />
					</button>
				</div>
			</div>

			{/* 요일 헤더 */}
			<div className="calendar-weekdays">
				{['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
					<div
						key={day}
						className={`weekday ${index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}`}
					>
						{day}
					</div>
				))}
			</div>

			{/* 캘린더 그리드 */}
			<div className="calendar-grid">
				{calendarDays.map((date, index) => {
					const dateString = getDateString(date);
					const dayData = transactionsByDate[dateString];
					const isTodayDate = isToday(date);
					const isCurrentMonthDate = isCurrentMonth(date);

					return (
						<div
							key={index}
							className={`calendar-day ${!isCurrentMonthDate ? 'other-month' : ''} ${isTodayDate ? 'today' : ''}`}
						>
							<div
								className={`day-number ${
									isTodayDate
										? 'today-number'
										: date.getDay() === 0
											? 'sunday'
											: date.getDay() === 6
												? 'saturday'
												: ''
								}`}
							>
								{date.getDate()}
							</div>

							{dayData && (
								<div className="day-transactions">
									{dayData.incomes > 0 && (
										<div className="transaction-badge income">
											+{formatCurrency(dayData.incomes)}
										</div>
									)}
									{dayData.expenses > 0 && (
										<div className="transaction-badge expense">
											-{formatCurrency(dayData.expenses)}
										</div>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* 범례 */}
			<div className="calendar-legend">
				<div className="legend-item">
					<div className="legend-color income"></div>
					<span>수입</span>
				</div>
				<div className="legend-item">
					<div className="legend-color expense"></div>
					<span>지출</span>
				</div>
			</div>
		</div>
	);
}
