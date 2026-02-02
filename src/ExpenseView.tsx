import { ItemView, WorkspaceLeaf } from 'obsidian';
import { StrictMode } from 'react';
import { Root, createRoot } from 'react-dom/client';
import { DataManager } from './DataManager';
import App from './App';

export const VIEW_TYPE_EXPENSE = 'expense-tracker-view';

export class ExpenseView extends ItemView {
	root: Root | null = null;
	dataManager: DataManager;

	constructor(leaf: WorkspaceLeaf, dataManager: DataManager) {
		super(leaf);
		this.dataManager = dataManager;
	}

	getViewType(): string {
		return VIEW_TYPE_EXPENSE;
	}

	getDisplayText(): string {
		return '가계부';
	}

	getIcon(): string {
		return 'wallet';
	}

	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1];
		container.empty();
		container.addClass('expense-tracker-container');

		this.root = createRoot(container);
		this.root.render(
			<StrictMode>
				<App dataManager={this.dataManager} />
			</StrictMode>
		);
	}

	async onClose(): Promise<void> {
		if (this.root) {
			this.root.unmount();
			this.root = null;
		}
	}
}
