# 課表共享 (Class Share Hub)

一個簡單易用的課表共享應用程式，讓你輕鬆管理課程並與好友分享課表。

## ✨ 主要功能 (Features)

*   **📅 課表管理 (Schedule Management)**
    *   自訂每週課程，支援設定課程名稱、授課教師及教室地點。
    *   多元色彩標籤：為不同課程設定專屬顏色，讓課表一目瞭然。
    *   衝堂偵測：新增課程時自動偵測時間衝突，避免排課錯誤。

*   **👥 好友系統 (Friend System)**
    *   **專屬好友代碼**：每位使用者都有獨一無二的 Friend Code，方便好友搜尋。
    *   **好友請求管理**：發送、接受或拒絕好友邀請。
    *   **好友列表**：一覽所有已加入的好友。

*   **🤝 課表共享與互動 (Sharing & Interaction)**
    *   **查看好友課表**：點擊好友即可查看對方的完整課表。
    *   **空堂查詢 (Available Friends)**：想找人吃飯或唸書？查看特定節次有哪些好友也是空堂。

*   **📱 響應式設計 (Responsive Design)**
    *   完美支援桌機與手機介面，隨時隨地查看課表。

## 🛠️ 技術堆疊 (Tech Stack)

本專案使用現代化前端技術構建：

*   [Vite](https://vitejs.dev/) - 極速的前端建置工具
*   [React](https://react.dev/) - 用戶介面庫
*   [TypeScript](https://www.typescriptlang.org/) - 型別安全的 JavaScript
*   [shadcn/ui](https://ui.shadcn.com/) - 精美的 UI 元件庫
*   [Tailwind CSS](https://tailwindcss.com/) - 實用優先的 CSS 框架
*   [Supabase](https://supabase.com/) - 後端資料庫與認證服務

## 🚀 快速開始 (Getting Started)

請依照以下步驟在本地端執行專案：

### 先決條件

*   請確保已安裝 [Node.js](https://nodejs.org/) (建議 v18 以上)

### 安裝步驟

1.  **複製專案 (Clone Repository)**
    ```bash
    git clone <YOUR_GIT_URL>
    ```

2.  **進入專案目錄**
    ```bash
    cd class-share-hub
    ```

3.  **安裝依賴套件**
    ```bash
    npm install
    ```

4.  **設定環境變數**
    複製 `.env.example` (若無則直接建立 `.env`) 並填入 Supabase 連接資訊：
    ```env
    VITE_SUPABASE_PROJECT_ID="your_project_id"
    VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key"
    VITE_SUPABASE_URL="your_project_url"
    ```

5.  **啟動開發伺服器**
    ```bash
    npm run dev
    ```

## 📄 授權 (License)

[MIT](LICENSE)
