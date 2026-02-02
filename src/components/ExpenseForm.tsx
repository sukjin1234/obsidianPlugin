import { useState } from 'react';
import { Transaction } from '../types';

interface ExpenseFormProps {
	onAdd: (transaction: Omit<Transaction, 'id'>) => void;
}

export function ExpenseForm({ onAdd }: ExpenseFormProps) {
	const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
	const [type, setType] = useState<'expense' | 'income'>('expense');
	const [category, setCategory] = useState('');
	const [amount, setAmount] = useState('');
	const [description, setDescription] = useState('');

	const expenseCategories = ['식비', '교통', '쇼핑', '생활', '문화', '기타'];
	const incomeCategories = ['용돈', '월급', '부수입'];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!category || !amount) {
			return;
		}

		onAdd({
			date,
			type,
			category,
			amount: parseFloat(amount),
			description,
		});

		// 폼 초기화
		setCategory('');
		setAmount('');
		setDescription('');
	};

	const categories = type === 'expense' ? expenseCategories : incomeCategories;

	return (
		<form onSubmit={handleSubmit} className="expense-form">
			<div className="form-row">
				<div className="form-group">
					<label className="form-label">날짜</label>
					<input
						type="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						className="form-input"
					/>
				</div>
				<div className="form-group">
					<label className="form-label">구분</label>
					<select
						value={type}
						onChange={(e) => {
							setType(e.target.value as 'expense' | 'income');
							setCategory('');
						}}
						className="form-select"
					>
						<option value="expense">지출</option>
						<option value="income">수입</option>
					</select>
				</div>
			</div>

			<div className="form-row">
				<div className="form-group">
					<label className="form-label">카테고리</label>
					<select
						value={category}
						onChange={(e) => setCategory(e.target.value)}
						className="form-select"
					>
						<option value="">선택하세요</option>
						{categories.map((cat) => (
							<option key={cat} value={cat}>
								{cat}
							</option>
						))}
					</select>
				</div>
				<div className="form-group">
					<label className="form-label">금액</label>
					<input
						type="number"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder="0"
						className="form-input"
					/>
				</div>
			</div>

			<div className="form-row form-row-last">
				<div className="form-group">
					<label className="form-label">설명</label>
					<input
						type="text"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="내용을 입력하세요"
						className="form-input"
					/>
				</div>
				<div className="form-group form-group-action">
					<button type="submit" className="btn-primary btn-submit">
						등록하기
					</button>
				</div>
			</div>
		</form>
	);
}
