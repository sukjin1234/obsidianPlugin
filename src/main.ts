import { Plugin, WorkspaceLeaf } from 'obsidian';
import { ExpenseView, VIEW_TYPE_EXPENSE } from './ExpenseView';
import { DataManager } from './DataManager';

export default class ExpenseTrackerPlugin extends Plugin {
	dataManager: DataManager;

	async onload() {
		this.dataManager = new DataManager(this.app);
		await this.dataManager.loadData();

		// 뷰 등록
		this.registerView(
			VIEW_TYPE_EXPENSE,
			(leaf) => new ExpenseView(leaf, this.dataManager)
		);

		// 리본 아이콘 추가 (사이드바 열기)
		this.addRibbonIcon('wallet', '가계부 열기', () => {
			this.activateSidebarView();
		});

		// 커맨드 추가: 사이드바에서 열기
		this.addCommand({
			id: 'open-expense-sidebar',
			name: '가계부 열기',
			callback: () => {
				this.activateSidebarView();
			},
		});
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXPENSE);
	}

	async activateSidebarView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_EXPENSE);

		if (leaves.length > 0) {
			// 이미 열려있는 뷰가 있으면 활성화
			leaf = leaves[0];
		} else {
			// 오른쪽 사이드바에 새로 열기
			leaf = workspace.getRightLeaf(false);
			if (leaf) {
				await leaf.setViewState({ type: VIEW_TYPE_EXPENSE, active: true });
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}
}
