# Obsidian 가계부 플러그인

Obsidian에서 수입과 지출을 간편하게 관리할 수 있는 가계부 플러그인입니다.

<img width="863" alt="img" src="https://github.com/sukjin1234/obsidianPlugin/issues/1#issue-3883964438">

## 주요 기능

- **거래 등록**: 수입/지출을 날짜, 카테고리, 금액, 설명과 함께 기록
- **거래 내역**: 등록된 거래를 테이블 형태로 조회, 수정, 삭제
- **월별 필터링**: 원하는 월의 거래만 필터링하여 조회
- **차트**: 누적 지출 그래프로 지출 추이 확인
- **캘린더**: 달력에서 일별 수입/지출 한눈에 확인
- **자동 저장**: 모든 데이터는 Vault 내 `expenses.json` 파일에 자동 저장

## 설치 방법

### 방법 1: 수동 설치 (권장)

1. [Releases](https://github.com/sukjin1234/obsidianPlugin/releases/tag/v1.0) 페이지에서 최신 버전 다운로드
2. `main.js`, `manifest.json`, `styles.css` 파일을 다운로드
3. Obsidian Vault 폴더로 이동
4. `.obsidian/plugins/` 폴더 내에 `expense-tracker` 폴더 생성
5. 다운로드한 3개 파일을 `expense-tracker` 폴더에 복사
6. Obsidian 재시작
7. 설정 → 커뮤니티 플러그인 → "가계부" 활성화

```
YourVault/
└── .obsidian/
    └── plugins/
        └── expense-tracker/
            ├── main.js
            ├── manifest.json
            └── styles.css
```

### 방법 2: 직접 빌드

1. 저장소 클론
```bash
git clone https://github.com/sukjin1234/obsidianPlugin.git
```

2. 의존성 설치
```bash
npm install
```

3. 빌드
```bash
npm run build
```

4. 생성된 `main.js`, `manifest.json`, `styles.css` 파일을 Vault의 `.obsidian/plugins/expense-tracker/` 폴더에 복사

5. Obsidian 재시작 후 플러그인 활성화

## 사용 방법

### 플러그인 열기

- **리본 아이콘**: 왼쪽 사이드바의 지갑(💰) 아이콘 클릭
- **커맨드 팔레트** (`Ctrl/Cmd + P`):
  - "가계부 사이드바에서 열기" - 오른쪽 사이드바에서 열기
  - "가계부 새 탭에서 열기" - 메인 영역에서 탭으로 열기

### 거래 등록

1. "새로운 거래 등록" 섹션에서 정보 입력
   - **날짜**: 거래 날짜 선택
   - **구분**: 지출 또는 수입 선택
   - **카테고리**: 해당하는 카테고리 선택
   - **금액**: 금액 입력 (자동으로 천 단위 콤마 추가)
   - **설명**: 거래에 대한 메모
2. "등록하기" 버튼 클릭

### 거래 내역 조회

- **월별 필터**: 특정 월의 거래만 조회
- **구분 필터**: 지출/수입만 필터링
- **카테고리 필터**: 특정 카테고리만 필터링
- **검색**: 설명이나 카테고리로 검색

### 거래 수정/삭제

- **수정**: 연필 아이콘 클릭 → 수정 → 체크 아이콘으로 저장
- **삭제**: 휴지통 아이콘 클릭

## 카테고리

### 지출 카테고리
- 식비, 교통, 쇼핑, 생활, 문화, 기타

### 수입 카테고리
- 용돈, 월급, 부수입

## 데이터 저장

모든 데이터는 Vault 루트 폴더의 `expenses.json` 파일에 JSON 형식으로 저장됩니다.

- Obsidian 검색으로 거래 내역 검색 가능
- 다른 기기와 동기화 시 데이터도 함께 동기화
- 백업 및 복원이 간편

## 개발

### 개발 모드 실행

```bash
npm run dev
```

파일 변경 시 자동으로 재빌드됩니다.

### 프로덕션 빌드

```bash
npm run build
```

## 기술 스택

- TypeScript
- React
- Recharts (차트 라이브러리)
- Lucide React (아이콘)
- Obsidian Plugin API

## 라이선스

MIT License

## 기여

버그 리포트, 기능 제안, PR 모두 환영합니다!
