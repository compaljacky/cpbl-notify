# 技術架構 + 禁改清單

> 由 engineer / sre / tech-lead role agents 共同維護。
> 任何修改本檔的提案必須走 design-review，且影響角色至少包含 engineer 與 sre。

---

## 系統定位

CPBL（中華職棒）比分通知 bot：定時抓取當日場次比分，偵測比分變化、結束等事件，推播到 Discord（LINE 模組保留備用）。

### 比分來源演進（重要背景）

| 階段 | 來源 | 結果 |
|---|---|---|
| 初版 | Playwright 直接爬 `cpbl.com.tw` 動態頁 | 本機可跑，但 **CPBL 擋機房 IP（403）**，GCP VM 抓不到 |
| 中繼 | Cloudflare Worker relay（乾淨 IP）轉抓 CPBL JSON API | 撐約一小時，**Cloudflare 的機房 IP 也被 CPBL 擋死（home 403）** |
| 現行（2026-06） | axios 直接抓 **atplayer WordPress JSON API**（CPBL 比分鏡像源） | atplayer 不擋機房 IP，VM 直連即可，**不需 relay、不需瀏覽器** |

**核心限制**：`cpbl.com.tw` 只放行住宅 IP，封鎖所有機房 IP。任何雲端常駐主機都無法直連官網，故改用不擋機房 IP 的第三方鏡像源。

## 技術選型總覽

| 層級 | 選型 | 為什麼 |
|---|---|---|
| Runtime | Node.js (CommonJS) | 輕量、生態成熟，適合 I/O 密集的抓取 + 推播 |
| 比分抓取 | axios GET atplayer JSON API（cpbl.js）；`CPBL_SOURCE_URL` 可覆寫端點 | 第三方鏡像源回乾淨 JSON、不擋機房 IP；已無需 Playwright/瀏覽器 |
| 排程 | `setTimeout` 隨機 5–10 分鐘輪詢（app.js）；另裝 node-cron 備用 | 隨機間隔、降低對來源的負載 |
| 推播 | Discord Webhook（discord.js，axios POST）；LINE Push API（line.js）保留 | Discord webhook 設定簡單、無 token 過期問題 |
| Webhook server | Express（webhook.js，用於取得 LINE userId/groupId） | 僅供設定階段抓 LINE 收件人 ID |
| 狀態儲存 | 本地 JSON 檔 `cpbl-state.json`（state.js 讀寫） | 單機單進程，無需 DB；記錄每場 snapshot 供事件 diff |
| 日誌 | 自製 logger.js，每日一檔寫入 `logs/YYYY-MM-DD.log`（Asia/Taipei 時戳） | 無外部觀測依賴 |
| 部署 | pm2（見近期 commit） | 常駐進程、自動重啟、log 管理 |

## 事件偵測邏輯（app.js checkScores）

以「上次 snapshot vs 本次 snapshot」diff 觸發推播：
- **比分更新**：`比賽中 → 比賽中` 且 scoreKey 改變（避開開賽 0:0 誤報）
- **比賽暫停 / 比賽恢復**：app.js 仍保有此邏輯，但**目前停用** —— atplayer 來源沒有 IsGameStop 之類的暫停欄位，永遠不會產生 `比賽暫停` 狀態，故此兩類通知不會觸發
- **比賽結束**：偵測到場次消失/離開 live 狀態時先標記 `pendingEnd`，下一輪二次確認才推「比賽結束」（避免來源瞬斷誤判）
- 已 `finished` 的場次帶入新 state，避免重複推結束通知

## 架構圖

```
node-cron / setTimeout(5~10min)
        │
        ▼
   checkScores() ──► fetchGames() ──► axios GET atplayer JSON API
        │                                   │
        ▼                                   ▼
   readState(cpbl-state.json)      過濾今日場次 + 映射成 snapshot shape
        │                                   │
        └────────── diff 比對 ◄─────────────┘
                        │
                        ▼
            pushDiscordMessage()（DRY_RUN 時僅 console）
                        │
                        ▼
            writeState(cpbl-state.json)
```

---

## 🚫 禁改清單（Hook 自動攔截）

個人軌不可直接修改以下檔案/目錄，必須走 design-review：

```
.env*
saves/
migrations/
infra/
.github/workflows/
knowledge/PRINCIPLES.md
knowledge/ARCHITECTURE.md
knowledge/AGENTS.md
context/STATE.json     ← 由 hook 而非人手編輯
```

---

## 共用契約（Contracts）

| Contract 名稱 | 涉及模組 | 變動需通知 | 文件 |
|---|---|---|---|
| game snapshot 結構 | cpbl.js（產出）↔ app.js（消費）↔ cpbl-state.json | 改欄位需同步三處 | 見 app.js `gameSnapshot()`；cpbl.js `fetchGames()` 回傳 `{gameId,status,awayTeam,homeTeam,awayScore,homeScore,place,inning}` |
| atplayer JSON schema | cpbl.js 依賴 `data.ok`、`data.games[]` 的 `id/date/status/inning/inning_half/home.name_local/home.score/away.*/venue_local` | 來源改版會失效；status 值 NS/IN*/FT/POST/CANC | cpbl.js `mapStatus()` / `fetchGames()` |
| 環境變數 | .env（DISCORD_WEBHOOK_URLS / LINE_* / STATE_FILE / PORT；選用 CPBL_SOURCE_URL） | 新增變數需更新 .env 與 README | discord.js / state.js / cpbl.js |

---

## 待退役（Deprecation Plan）

| 項目 | 退役日期 | 替代方案 | owner |
|---|---|---|---|
| LINE 推播（line.js） | 未定 | 目前主推 Discord，LINE 模組保留未接線 | jacky |
| Playwright 依賴 + 根目錄 debug-*.js / probe-api*.js | ✅ 2026-06-06 已移除 | 改 axios 抓 JSON，不再需要瀏覽器 | jacky |
| Cloudflare Worker relay（worker/cpbl-relay.js）+ .env CPBL_RELAY_URL/KEY | 待清 | 已棄用（relay 的 Cloudflare IP 也被 CPBL 擋）；保留無害但無作用，可移除 | jacky |
