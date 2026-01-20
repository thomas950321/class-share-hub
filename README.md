# 課表共享 (Class Share Hub)

這是一個課表共享工具，讓你和朋友交換課表，知道對方什麼時候有空。

## 功能

### 課表管理
你可以自訂每週的課程，輸入課程名稱、老師和教室。每堂課都可以設定不同顏色，看課表的時候比較清楚。系統會自動檢查時間衝突，避免重複排課。

### 好友系統
每個使用者都有一個好友代碼 (Friend Code)。你可以用這個代碼搜尋並加入朋友，對方同意後就能互相看到課表。

### 查詢空堂
想找人吃飯或約讀書的時候，可以直接查詢特定節次有哪些朋友是空堂，不用一個個問。

### 支援手機與電腦
介面會自動調整，用手機或電腦看都很清楚。

## 技術與架構

這個專案使用以下工具開發：

- **前端**：React、TypeScript、Vite
- **UI**：Tailwind CSS、shadcn/ui
- **後端**：Supabase (資料庫與認證)

## 如何執行

### 環境需求
你需要安裝 [Node.js](https://nodejs.org/) (建議 v18 以上)。

### 步驟

1.  **下載專案**
    ```bash
    git clone <YOUR_GIT_URL>
    cd class-share-hub
    ```

2.  **安裝套件**
    ```bash
    npm install
    ```

3.  **設定環境變數**
    複製 `.env.example` (如果沒有就直接建一個 `.env`) 並填入 Supabase 的資訊：
    ```env
    VITE_SUPABASE_PROJECT_ID="your_project_id"
    VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key"
    VITE_SUPABASE_URL="your_project_url"
    ```

4.  **啟動**
    ```bash
    npm run dev
    ```

## 授權

[MIT](LICENSE)
