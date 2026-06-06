<!-- 版本：公司團隊同步工作端 AI 協作系統 v2.1 | 最後更新：2026-05-25 -->
# CLAUDE.md — 公司團隊同步工作端 AI 協作工作環境 v2.1

> 這份文件定義 Claude 在「公司團隊同步工作端」目錄的完整行為規範。
> **每次 Session 開始時自動載入。**
> 適用情境：3–15 人團隊，工作形式從「階段交付」改為「同步討論 + 個人深度並行」。
> 初次設定：執行 `/team-kickoff` 完成 STATE.json 與團隊成員、能力地圖的初始化。

---

## 🎯 與既有角色端的根本差異

既有 7 個角色端（PM、產品、工程師、SRE、HTML設計師、HR、PMO）與單人工作室端的設計都假設**單一執行者**。本範本則是為**多人團隊**設計，且不採用「PM 寫 spec → 產品 review → 工程師接 → SRE 部署」的線性交付。

**核心轉換**：

```
[既有模式] 階段交付（Sequential Handoff）
  PM 完成 → 產品接 → 工程師接 → SRE 接 → 結案
  問題：交接時資訊損耗、各自為政、回頭修正成本高

[本範本] 同步討論 + 個人深度並行（Synchronous + Async Hybrid）
  Round Table：所有專業同步討論一個議題，各自從專業視角提案
  Design Review：提案者準備草稿 → 全角色同步審查 → Approve/Concerns/Blocks
  Mob：關鍵實作群體開發、輪流主駕、決策同步
  個人深度：日常實作仍在各自的軌道上跑（不被同步綁死）
```

**比喻**：既有 = 接力賽；本範本 = 圓桌會議 + 各自專注時間。

---

## 🏢 團隊定位

```
團隊名稱：      [填入]
Facilitator：   [填入]（負責主持同步軌的人，通常是 Tech Lead 或 PM）
團隊規模：      small（3–6 人） / medium（7–15 人）   ← 在 STATE.json 切換
團隊成員：      [見 context/STATE.json 的 team.members]
協作節奏：      [填入]（如 Mon/Wed/Fri 同步、其餘時間個人深度）
產品/專案：     [填入]
時區與工作時間：[填入]
```

**Mode 對應 subagent 編排（v2.0 簡化後）**：

| Mode | 適用團隊 | Role Agent 數量 | 同步討論型態 |
|---|---|---|---|
| **small** | 3–6 人 | 5 個（pm, product, engineer, designer, sre） | 全員參與、subagent 一對一映射 |
| **medium** | 7–15 人 | 8 個（small + tech-lead, design-lead, qa） | 各組推派代表，subagent 對應「組」而非「個人」 |

**v2.0 變更**：移除 people-ops / hr / pmo agent。理由：
- 容量、調度、單點故障 → **整併入 pm**（單一 owner，避免分散）
- 衝突調解、心理安全感、職涯發展 → **回歸真人主管 + 外部教練**（AI agent 不適合處理）
- 跨專案組合管理（PMO） → 不採納（本範本聚焦單團隊單專案）

---

## 🔒 三條紅線（公司團隊同步工作端特有）

針對團隊協作最大的三個失敗模式：

### 紅線一：重大決策必須走同步軌（No Silent Major Decision）
**「重大」定義**：跨 ≥ 2 個職能、影響 ≥ 1 週工作量、或變動 ARCHITECTURE/PRINCIPLES 的決策。
重大決策必須走 `/round-table` 或 `/design-review`，**不能在個人軌單獨拍板**。
個人軌靜默修改架構、自己決定棄用某個 API、自己改 design token — 都是違規。
sync-guard.js Hook 會在偵測到個人軌修改禁改清單時警告。

### 紅線二：設計評審不能跳過（Design Review is Non-Negotiable）
任何「視為完成」的提案進入實作前，**必須跑過 `/design-review`**。
評審輸出三類：APPROVED / CONCERNS（需回應但可繼續）/ BLOCKS（必須處理才能繼續）。
有 BLOCKS 未解 → 不能合併到主分支。
「我覺得 OK」「應該沒問題」「下次再 review」是違規。

### 紅線二補強（v2.1）：AI 生成內容必過 critic
PRINCIPLES #7：所有 AI（Claude / Cursor / Copilot 等）生成的程式碼、設計、文件，commit 前都必須跑 critic subagent。
v2.1 引入 **AI 自動化 + 每週上版**節奏後，AI 解了實作瓶頸，品質瓶頸轉移到 review。critic 是 review 的第一道防線，不可繞過。
詳見 `工作流程指南/每週上版流程.md`。

### 紅線三：團隊容量同步可視（Capacity Visible to All）
團隊版的 Energy Budget。每位成員的當前 WIP、focus block、本週剩餘容量都記錄在 `context/capacity-board.md`，由 SessionStart Hook 顯示給 Facilitator。
任何同步討論前，Facilitator 必須檢視容量看板。容量已紅燈仍排新任務 → 違規。
連續 2 週團隊容量超載 → 強制觸發 `/team-retro` 與優先順序重排。

**v2.0 擁有者**：本紅線由 PM role agent 主責（從 v1.x 的 people-ops 接手）。

---

## 🧠 兩層記憶 + 雙軌設計

```
context/                      ← ⚡ 即時工作記憶（會被覆寫，反映「現在」）
  STATE.json                  ← 團隊狀態橋樑（含 mode、members、active sync session）
  current-sync.md             ← 當前進行中的同步 session（round-table / design-review / mob）
  sync-context.md             ← 跨個人軌共享的同步知識（決策、共識、blockers）
  individual-tracks.md        ← 各成員當前 in-progress 任務一覽（capacity-board 的詳細版）
  capacity-board.md           ← 團隊容量看板（每位成員 WIP、focus block、本週剩餘小時）
  decision-log.md             ← 本週做出的所有決策（含決策來源 sync session）
  design-review-board.md      ← 待評審 / 評審中 / 已通過 的設計提案看板
  subagent-output.md          ← Role agent 與 task agent 的最新輸出
  critic-report.md            ← Critic 最新審查
  roadmap.md                  ← Now / Next / Later 三層
  risk-register.md            ← 風險登記
  metrics-register.md         ← 北極星指標與次要指標

knowledge/                    ← 🧠 長期記憶（Append-only，反映「歷史」）
  PRINCIPLES.md               ← 團隊工程規範 + Lessons Learned
  ARCHITECTURE.md             ← 技術架構 + 禁改清單
  AGENTS.md                   ← Subagent 啟動協議
  CHANGELOG.md                ← 本範本自身的迭代版本
  log.md                      ← Append-only 操作紀錄
  round-tables/               ← 圓桌討論完整紀錄（每場一個檔案）
    YYYY-MM-DD_{議題}.md
  design-reviews/             ← 設計評審完整紀錄
    YYYY-MM-DD_{提案}.md
  mob-sessions/               ← 群體開發紀錄
    YYYY-MM-DD_{任務}.md
  decisions/                  ← ADR（含「決策從哪場 sync session 而來」連結）
  retros/                     ← 團隊回顧
    sprint-retros/            ← Sprint 回顧
    incident-retros/          ← 事件回顧
  releases/                   ← 各版本發布紀錄
  explorations/               ← 團隊版的構思探索（與單人工作室端結構同源，但加入「提案者」欄位）
  index.md
```

**雙軌設計**：

```
[同步軌]                              [個人軌]
Round Table 圓桌討論                  個人成員自己的 Claude session
Design Review 設計評審                  ↓
Mob 群體開發                          /individual-focus 申請 focus block
  ↓                                   ↓
共識決策寫入 sync-context.md          完成後 /sync-context 注入同步軌
  ↓                                   ↓
個人軌據此執行                        重大發現 → 觸發新的 Round Table
```

---

## 🔄 Phase 系統總覽（T0–T7：團隊同步雙軌）

| Phase | 名稱 | 觸發 | 主要 Skill |
|---|---|---|---|
| **T0** | 團隊初始化 | 首次建立 / 新成員加入 / Mode 切換 | `/team-kickoff` |
| T1 | 情境啟動 | 每次 Session 開始 | 自動（SessionStart Hook + 團隊儀錶板） |
| **T2** | **構思圓桌** | 議題出現 / 「我們應該做 X 嗎」 | `/round-table` |
| T3 | 設計評審 | 提案成熟、進入實作前 | `/design-review` |
| T4 | 同步開發 | 任務派發 / 關鍵實作群體開發 | `/mob`、`/individual-focus`、`/implement` |
| T5 | 整合發版 | **每週至少一次**（v2.1：時間驅動）/ mid-week patch | `/integration`、`/weekly-release`、`/release-cut` |
| T6 | 共同回顧 | 每週五（v2.1：quick 30min 或 full 90min 雙模式）/ 重大 incident 後 | `/team-retro [quick/full/incident]` |
| T7 | 團隊健康 + 容量管理 | 每週固定 / 容量紅燈 / AI assist 比例異常 | `/team-health`、`/weekly-sync` |

```
[團隊啟動]
     ↓
T0 團隊初始化（一次性）
     ↓
T1 情境啟動（每次 Session）
     ↓
  ┌──┴──────────────────────────────────────────┐
  ↓                                             ↓
[同步軌]                                       [個人軌]
T2 構思圓桌 → T3 設計評審 ───共識/決策────→ T4 同步開發
                                                ↓
                                              個人 /implement
                                                ↓
                                              ←─/sync-context 回流
                                                ↓
                                              T5 整合發版
                                                ↓
                                              T6 共同回顧
                                                ↓
                                              T7 團隊健康（每週）
                                                ↓
                                              回到 T1
```

---

## Phase T0：團隊初始化

### 觸發
- 第一次部署 / `/team-kickoff` / 新成員加入 / mode 切換

### 步驟

**T0-1：選擇 mode 與基本資料**
- `small` (3–6 人) / `medium` (7–15 人)
- 團隊名稱、Facilitator、協作節奏、時區

**T0-2：建立成員與能力地圖**
- 編輯 `context/STATE.json` 的 `team.members[]`：每位成員填入 name、role、expertise[]、weekly_capacity_hours、timezone
- `expertise[]` 用於決定哪些 Role agent 該由誰主持（例如 expertise 含 "frontend" 的成員會被 designer agent 視為主要對話對象）

**T0-3：載入既有產出（若有）**
- 若團隊已有 spec / Roadmap / BMC，放入 `knowledge/` 對應位置：
  - spec → `knowledge/spec/`
  - 既有 ADR → `knowledge/decisions/`
  - 已知風險 → `context/risk-register.md`

**T0-4：建立第一場 Round Table（推薦）**
- `/round-table 團隊章程與工作節奏`
- 用同步軌方式定義：DOR/DOD、決策權、會議節奏、PR 流程、衝突處理

**T0-5：初始化 PRINCIPLES.md / ARCHITECTURE.md**
- 至少寫下 5 條團隊工程原則（從既有 codebase 反推 + 團隊文化）
- 禁改清單（哪些檔案個人軌不可碰）

**T0-6：建立 STATE.json + log.md 初始記錄**

---

## Phase T1：情境啟動

### 觸發
- Session 開始（不論是 Facilitator 主持的同步 session，或個人軌成員自己開的）

### 步驟

**T1-1：依序讀取（不可跳過）**
```
1. CLAUDE.md（本檔）
2. knowledge/PRINCIPLES.md（Lessons Learned 最後 5 條）
3. knowledge/ARCHITECTURE.md（禁改清單）
4. knowledge/AGENTS.md（Subagent 啟動協議）
5. context/STATE.json（mode、active_sync_session、team capacity）
6. context/sync-context.md（跨軌共享決策摘要）
7. knowledge/log.md 最後 10 行
8. context/capacity-board.md（團隊容量燈號）
9. context/current-sync.md（若有進行中同步 session）
```

**T1-2：判斷此次 session 是哪一軌**
- 若 `STATE.json.active_sync_session` ≠ null → 進入同步軌儀錶板
- 否則 → 個人軌儀錶板

**T1-3a：同步軌儀錶板（Facilitator 看到）**
```
╔══════════════════════════════════════════════╗
║         🤝 公司團隊同步軌儀錶板              ║
╚══════════════════════════════════════════════╝
日期：YYYY-MM-DD  |  Mode：small/medium  |  當前 Phase：T_

🎤 進行中同步 Session：
  類型：[round-table / design-review / mob]
  主題：[一句話]
  主持人：[Facilitator]
  到場 Role agents：[pm, product, engineer, designer, sre, ...]
  進行階段：[opening / proposing / converging / decision]

📋 待辦同步議題（sync queue）：
  [若有] 1. [議題] — 提出者：[name] — 等待：X 天
  [若有] 2. [議題] — ...

🚦 團隊容量燈號：
  🟢 [Alice] 18/30h | 🟡 [Bob] 26/30h | 🔴 [Carol] 32/30h
  本週團隊整體：78%（🟢 正常）
  [若有 🔴] ⚠️ Carol 容量超支，建議今日同步議題不再加派她

🧩 待評審設計（design-review board）：
  [若有] DR-007 [標題] — 等候：X 天 — 待評審角色：[engineer, sre]

✅ 本週決策（decision-log 摘要）：
  - YYYY-MM-DD | [決策摘要] | 來自：[round-table / design-review]
──────────────────────────────────────────────
今天要主持哪個議題？
```

**T1-3b：個人軌儀錶板（一般成員看到）**
```
╔══════════════════════════════════════════════╗
║         👤 個人軌儀錶板（[成員名稱]）        ║
╚══════════════════════════════════════════════╝
日期：YYYY-MM-DD  |  你的角色：[role]

🎯 你的當前 focus：
  [若有] FOCUS-XXX：[任務名稱]（剩 X 小時）
  [若無] 無 focus block — 從 sync-context 領一個共識任務或 /individual-focus

⚡ 你的本週容量：
  已用：XX / [週上限] 小時（XX%）— 燈號：🟢/🟡/🔴

🔁 上次同步軌共識（與你相關）：
  - [決策摘要]（YYYY-MM-DD round-table）
  - [決策摘要]（YYYY-MM-DD design-review）

📌 待你回應的設計評審：
  [若有] DR-007 [標題] — 等待你的 Approve/Concerns/Blocks（X 天）

🚨 主動提醒：
  [若有] sync-context 有新共識你尚未讀（last_synced_at < 上次同步時間）
  [若有] 你的個人軌修改觸及禁改清單，請走 /design-review
──────────────────────────────────────────────
今天想做什麼？
```

---

## Phase T2：構思圓桌（Round Table）

### 設計動機

階段交付的最大誤區：**PM 寫完 spec 才丟給工程師，工程師發現技術不可行；工程師蓋好系統才丟給設計師，設計師發現體驗很糟**。Round Table 的目的是**在最早期就把所有專業放在同一張桌子上**，避免下游發現問題、上游必須回頭。

### 觸發詞
- 「我們應該做 X 嗎」
- 「這個方向對嗎」
- 「不確定要怎麼處理 ____」
- 任何跨 ≥ 2 個職能的開放問題
- `/round-table [議題]`

### Round Table 流程

```
1. Facilitator 拋出議題
   /round-table 是否要從 REST API 切換到 GraphQL

2. 自動掃描 STATE.json.team.members → 派發 Role agents
   small mode → pm + product + engineer + designer + sre + people-ops 同步啟動
   medium mode → 各組代表 agent 啟動

3. 各 Role agent 並行讀取自己的必讀清單，並在 30 秒內提出：
   - Stance: support / oppose / depends
   - Reasoning: 從本角色視角的 3 條理由
   - Concerns: 本角色關心的風險
   - Conditions: 若要支持，需要滿足的前置條件

4. Facilitator 收斂：
   - 將各 agent 提案寫入 knowledge/round-tables/YYYY-MM-DD_{議題}.md
   - 整理共識區、衝突區、待驗證區
   - 提出「下一步行動」三選項（決定/再探索/暫緩）

5. 主導者選擇下一步：
   - 「決定」 → 寫入 decision-log.md + 建立 ADR
   - 「再探索」 → 派出 spike 任務（給 engineer / designer）
   - 「暫緩」 → 寫入 sync queue，記下 revisit 日期

6. 決策同步到 sync-context.md，個人軌下次 SessionStart 自動載入
```

### Role Agent 提案格式（強制）

```
=== ROUND-TABLE PROPOSAL: [agent name] @ HH:MM ===
Stance: support / oppose / depends
Reasoning:
  1. [從本角色專業視角的理由]
  2. ...
Concerns:
  - [本角色擔心的事]
Conditions (if support/depends):
  - [前置條件]
Alternative (if oppose):
  - [本角色建議的替代方案]
=== END ===
```

Facilitator 看到所有 agents 都輸出後，啟動收斂。

### 何時不該開 Round Table

- 純個人技術決策（如「用 useMemo 還是 useCallback」）→ 個人軌即可
- 已經有清楚的 spec、只剩執行細節 → 直接 `/implement`
- 可在 5 分鐘內找到答案的事實性問題 → 不必開議

---

## Phase T3：設計評審（Design Review）

### 設計動機

Round Table 處理「方向」，Design Review 處理「成熟提案」。一個提案要進入實作，必須讓**所有受影響的角色都看過**並回應。

### 觸發
- 提案者覺得方案成熟（spec/設計稿/技術方案有具體形體）
- 跨 ≥ 2 個職能的實作改動
- 修改禁改清單中的任何檔案
- `/design-review [提案]`

### Design Review 流程

```
1. 提案者執行 /design-review {提案名稱}
   → 系統建立 knowledge/design-reviews/YYYY-MM-DD_{提案}.md
   → 提案者填入：問題、方案、影響範圍、AC、回滾計畫

2. 系統自動派發給「受影響的角色」
   → 由提案中宣告的 affected_roles[] 決定
   → 例：affected_roles = [engineer, sre, designer] → 對應三個 Role agents 並行審查

3. 每個 Role agent 必須在指定時限內輸出：
   - Verdict: APPROVED / CONCERNS / BLOCKS
   - Items: 路徑+行號的具體意見（若有）
   - Required Changes: 若 BLOCKS，列出必須改什麼

4. 提案者整合反饋：
   - 全 APPROVED → 進入實作（更新 design-review-board.md 為 ✅ Approved）
   - 有 CONCERNS → 提案者回應（接受 or 解釋為何不採納），可進實作
   - 有 BLOCKS → 必須修正並重跑 review

5. 審查完成寫入 design-review-board.md + decision-log.md
```

### Design Review 模板

每場 review 的紀錄檔（`knowledge/design-reviews/YYYY-MM-DD_{提案}.md`）必含：

```markdown
# Design Review: [提案名稱]
日期：YYYY-MM-DD
提案者：[name]
受影響角色：[role1, role2, ...]
狀態：pending / in-review / approved / blocked

## 問題
## 方案（含關鍵設計決策）
## 影響範圍（檔案 / 模組 / 既有功能）
## Acceptance Criteria
## 回滾計畫（若新方案上線後出問題）

## 評審結果
### [role1] — APPROVED
- 意見...
### [role2] — CONCERNS
- 在 src/foo.ts L42：建議...
- 提案者回應：[接受 / 解釋]
### [role3] — BLOCKS
- 在 migrations/0042_xxx.sql：必須加 NOT NULL DEFAULT，否則上線會擋寫入
- 提案者回應：已修正，請重審
```

---

## Phase T4：同步開發

### 觸發
- Round Table 或 Design Review 已產生「可實作的任務」
- `/mob` （重大實作 → 群體開發）
- `/individual-focus` + `/implement`（一般實作 → 個人軌）

### 兩種實作型態

#### 1. Mob（群體開發）
**何時用**：
- 任務碰到禁改清單
- 任務涉及核心架構變動
- 任務的成敗會影響整個團隊

**流程**：
```
1. /mob {任務名稱}
2. 指定 Driver（敲鍵盤的人）與 Navigator(s)（指引方向的人，2–4 位）
3. 每 25 分鐘輪換 Driver
4. 主執行緒記錄到 knowledge/mob-sessions/YYYY-MM-DD_{任務}.md
5. 每個重要決策寫入 decision-log.md（含「來自 mob session」標記）
6. 結束時跑 critic subagent（強制）
```

#### 2. Individual Focus（個人深度）
**何時用**：
- 一般 feature 開發、bug fix、文件撰寫
- 任務範圍清楚、不需多人意見

**流程**：
```
1. /individual-focus {任務描述}
   → 從 sync-context 確認該任務有同步軌共識（不是個人想做就做）
   → 容量檢查（你的本週容量 < 100%）
   → 建立 FOCUS-XXX 寫入 individual-tracks.md
   → STATE.json.active_individual_focuses[] 追加

2. /implement
   → 走工程師端式的 P7/P9 流程（含 planner/critic/db-expert/vuln-verifier）
   → critic 必跑（紅線二）

3. /focus-end
   → 完成或中止 focus block
   → 將學到的東西注入 sync-context（若有跨軌價值）
```

### Subagent 編排

```
主執行緒（Facilitator 或個人成員）
  │
  ├── Role Agents（同步軌主用，v2.0 簡化版）
  │    ├── pm                ← Round Table、設計評審、里程碑、合約、**團隊容量、成員調度、單點故障**
  │    ├── product           ← BMC、Roadmap、指標
  │    ├── engineer          ← 技術可行性、架構影響
  │    ├── designer          ← UX 影響、設計系統
  │    ├── sre               ← 部署、可靠性、SLO 影響
  │    │   （以下三個僅 medium mode 啟用）
  │    ├── tech-lead         ← 工程組代表（協調多位 engineer）
  │    ├── design-lead       ← 設計組代表
  │    └── qa                ← 品質與測試策略
  │   （v2.0 移除：people-ops、hr、pmo — 見 §Role Agents 說明）
  │
  └── Task Agents（個人軌主用，從工程師端繼承）
       ├── planner           ← 任務涉及 3+ 檔案
       ├── critic            ← 任何「視為完成」前必跑
       ├── debugger          ← /bug-fix
       ├── db-expert         ← schema/migration 改動
       └── vuln-verifier     ← critic 標記安全疑慮
```

### Role Agent vs Lens 的差異

單人工作室端用「lens」概念（一個人切換腦袋），切換要走 LENS_SWITCH 儀式避免 context bleed。
本範本用「Role agent」概念（**多個獨立的人**，各自有自己的 context），不需要切換儀式，而是**並行執行**。
這個差異對應到「單人切腦袋」 vs 「多人圓桌」的根本不同。

---

## Phase T5：整合發版

### 觸發
- 一個版本（vX.Y.Z）的所有任務 done / `/release-cut` / `/integration`

### 步驟

**T5-1：整合前檢查**
```
□ 所有 design-review-board 上的 PENDING 都已處理
□ 所有 critic CHANGES_REQUIRED 已修復
□ 跨軌的 sync-context 衝突清空
□ 受影響的 ARCHITECTURE.md 章節已更新
□ Lessons Learned 已補
□ knowledge/releases/vX.Y.Z.md 草稿已寫
```

**T5-2：整合 session（同步軌）**
- 由 Facilitator 主持 `/integration`
- 各 Role agent 同步檢查本職能涉及的部分
- 全 APPROVED 才能進部署流程

**T5-3：部署（sre agent 主導）**
- 走環境推進：dev → staging → production
- 部署完成驗證、回滾計畫
- 更新 status / changelog

**T5-4：發版後**
- `knowledge/releases/vX.Y.Z.md` 補完整紀錄
- log.md 追加
- 觸發 `/team-retro`（T6）

---

## Phase T6：共同回顧

### 觸發
- 版本發布後 / Sprint 結束 / 重大 incident 後

### 共同回顧結構

由 Facilitator 主持，所有成員（不只 agent，是真人）參與：

```
=== Sprint/vX.Y.Z 團隊回顧 ===
日期：YYYY-MM-DD

📦 交付：
  - [本期完成的功能/修復清單]

🎤 同步軌統計：
  - Round Table 場數：X
  - Design Review 場數：X（APPROVED: X / BLOCKS: X）
  - Mob session 場數：X

⚡ 容量利用：
  - 整體：X%
  - 個別最高：[name] X%
  - 個別最低：[name] X%

✅ 做對了什麼（Continue）：
  - ...

❌ 做不好什麼（Stop）：
  - ...

💡 下次想試什麼（Try）：
  - ...

📚 新增 Lessons Learned：
  - YYYY-MM-DD | [類別] | 問題：... → 解決：... → 預防：...

🤝 團隊健康：
  - 心理安全感：1–10
  - 溝通頻寬：1–10
  - 是否有人持續超載：[yes/no, 若 yes 列名稱]
```

存入 `knowledge/retros/sprint-retros/YYYY-MM-DD_retro.md`，Lessons Learned 同時 append 到 `PRINCIPLES.md`。

---

## Phase T7：團隊健康 + 容量管理

### 觸發
- 每週固定一次（建議週一早，配合 weekly sync）
- 容量連續 2 週紅燈
- 任何成員主動觸發

### `/weekly-sync` 步驟

**T7-1：商業/產品面回顧**
- 北極星指標變化
- Roadmap 進度與健康燈號

**T7-2：容量看板更新**
- 各成員實際投入小時 vs 預算
- 紅燈成員需在 Round Table 提出「砍什麼」

**T7-3：團隊健康（people-ops agent 主導）**
- 心理安全感、衝突偵測
- 是否需要 cooldown 週

**T7-4：產出週報**
- 給 stakeholder（外部）：成果摘要
- 給團隊內部：容量、共識、待解問題

存入 `output/weekly/YYYY-MM-DD_週報.md`。

---

## ⚡ 容量看板詳解

### 設計動機
團隊協作最大失敗原因不是「能力不足」，是**有人持續超載而其他人沒看到**。借單人工作室端的 Energy Budget 概念，但**從個人擴展到團隊可視**。

### capacity-board.md 結構

```
| 成員 | 角色 | 本週上限 | 已用 | % | 燈號 | 當前 focus |
|---|---|---|---|---|---|---|
| Alice | engineer | 30 | 18 | 60 | 🟢 | FOCUS-007 |
| Bob | designer | 25 | 23 | 92 | 🟡 | FOCUS-005 |
| Carol | pm | 35 | 32 | 91 | 🟡 | （無 focus，協調中）|
| Dan | sre | 30 | 12 | 40 | 🟢 | （on-call） |

整體：85/120h（71%）— 🟢
```

### 燈號行為（v2.0：由 PM agent 執行）

| 燈號 | 條件 | Claude 行為 |
|---|---|---|
| 🟢 綠 | < 80% | 正常 |
| 🟡 黃 | 80–100% | PM 主動建議：「[成員] 容量已 X%，今日同步議題建議不再加派他」 |
| 🔴 紅 | ≥ 100% | PM 主動詢問：「[成員] 已超支，要進 cooldown 嗎？要重排哪些任務？」 |
| ⚫ 連紅 | 連續 2 週 🔴 | 強制觸發 `/team-retro` 與 portfolio/roadmap 重排 |

**容量原因**：PM 不揭露超支的個人原因（家庭、健康等）。若需要這類訊息協助決策，由 Facilitator 私下與當事人或主管溝通。

### 記錄方式
每位成員的 session_stop.py 在 Session 結束時詢問「今天工作幾小時」並 append 到 `context/capacity-board.md`：
```
2026-05-02 | Alice | 4.5h | 主要：FOCUS-007 implement | sync session 參與：1 場 round-table
```

---

## 🤖 Subagent 完整清單

### Role Agents（同步軌主力，v2.0 簡化版）

#### small mode（5 個）

| Agent | 角色定位 | 何時被呼叫 | 必讀文件 |
|---|---|---|---|
| `pm` | 專案經理（**v2.0 擴權：含團隊容量、成員調度、單點故障**） | Round Table、設計評審、里程碑/風險、接案脈絡、容量議題 | risk-register, roadmap, **capacity-board, individual-tracks** |
| `product` | 產品經理 + 創辦人 | Round Table 商業面、BMC、指標、優先順序 | BMC, roadmap, metrics-register |
| `engineer` | 工程代表 | Round Table 技術面、設計評審、可行性 | ARCHITECTURE, PRINCIPLES, sync-context |
| `designer` | 設計師 | Round Table UX 面、設計系統影響 | tokens, components/_INDEX, sync-context |
| `sre` | SRE / DevOps | 部署、可靠性、incident、SLO | runbooks, ARCHITECTURE, capacity-board |

#### medium mode（額外 3 個）

| Agent | 角色定位 | 何時被呼叫 | 必讀文件 |
|---|---|---|---|
| `tech-lead` | 工程組代表 | medium mode 下取代「engineer」直接出場，協調多位工程師 | ARCHITECTURE, individual-tracks（工程師組） |
| `design-lead` | 設計組代表 | medium mode 下取代「designer」直接出場 | tokens, individual-tracks（設計組） |
| `qa` | 品質與測試代表 | 任何 design-review 自動加入、release 前必到 | test 結構, design-review-board |

#### v2.0 移除的 agents

| 移除的 agent | 原因 | 功能去向 |
|---|---|---|
| ~~people-ops~~ | 「容量數字」與「衝突調解」是不同性質的工作，混在一個 agent 易造成混亂 | 容量／調度／單點故障 → **pm**；衝突／心理／職涯 → **真人主管 + 外部教練** |
| ~~hr~~（曾在 v1.x 嘗試） | 同上理由 | 同上 |
| ~~pmo~~ | 本範本聚焦單團隊單專案，不需跨專案儀錶板 | 不採納 |

### Task Agents（個人軌主力，5 個，繼承自工程師端）

| Agent | 角色定位 | 啟動時機 | 輸出格式 |
|---|---|---|---|
| `planner` | P9 Tech Lead | 任務涉及 3+ 檔案或 2+ 模組 | 六要素子任務佇列 |
| `critic` | Code Reviewer | 任何「視為完成」前必跑 | APPROVED / CHANGES_REQUIRED + 路徑+行號 |
| `debugger` | Debug Engineer | `/bug-fix` 觸發 | [DEBUG-COMPLETION] / [BLOCKED] |
| `db-expert` | DB Specialist | 偵測到 schema/migration 改動 | APPROVED / CHANGES_REQUIRED |
| `vuln-verifier` | Security Pentester | critic 發現安全疑慮 | CONFIRMED / FALSE_POSITIVE |

詳細定義見 `.claude/agents/*.md` 與 `knowledge/AGENTS.md`。

---

## 🛠️ Slash Commands 速查

### 啟動類
- `/team-kickoff` — 一次性，T0 初始化
- `/lens [role]` — 個人軌切到 role 視角（保留單人工作室端用法，個人 session 內適用）

### 同步軌（T2/T3/T4）
- `/round-table [議題]` — 圓桌討論：派發 Role agents 並行提案、Facilitator 收斂
- `/design-review [提案]` — 設計評審：受影響角色同步審查、APPROVED/CONCERNS/BLOCKS。**v1.1**：BLOCKS ≥ 3 自動建議 mini-sync rescue
- `/lightweight-sync [議題]` — **v1.1 新增**。輕量決策（≤ 3 人 + < 1 人天 + 不動禁改清單）的 emoji 投票機制，避免小議題佔用 round-table 名額
- `/mob [任務]` — 群體開發：Driver + Navigators 輪換、決策同步
- `/integration` — T5 整合 session：發版前全角色同步檢查

### 個人軌（T4）
- `/individual-focus [任務]` — 申請 focus block：sync-context 共識檢查 + 容量檢查 + WIP 寫入
- `/focus-end` — 結束 focus block：注入 sync-context（若有跨軌價值）
- `/implement` — 執行當前 focus（含 planner/critic/debugger 編排）
- `/bug-fix` — debugger 流程
- `/sync-context` — 從個人軌注入發現到同步軌（觸發新 round-table 或更新 sync-context.md）

### 週期類
- `/weekly-sync` — T7 週度同步（容量、健康、roadmap）
- `/weekly-release [weekly|patch]` — **v2.1 新增**。週上版 orchestration（integration → release-cut → quick retro）
- `/team-retro [quick|full|incident]` — **v2.1 三模式**。quick(30min) / full(90min, 雙週) / incident
- `/team-health` — 團隊健康儀錶板（PM 主導）
- `/capacity-flush` — Facilitator 在 main 整合 .capacity-pending（v2.0.1 新增）

### 工具類
- `/release-cut` — 純部署動作（被 weekly-release 內部呼叫）
- `/arch-decision` — 建立 ADR（連結來源 sync session）
- `/idea-spark [構思]` — 團隊版的探索（會帶上「提案者」與「相關 stakeholder」）
- `/read-raw` — 讀取 raw/ 暫存文件

---

## 🚫 禁止操作

**硬性阻擋（Hook 自動攔截）**：
- 個人軌直接 push 到 `main`（必須走 PR + design-review）
- 個人軌修改禁改清單上的檔案而沒有對應 design-review 通過紀錄
- 個人軌靜默變動 ARCHITECTURE.md、PRINCIPLES.md
- 容量🔴 的成員在個人軌開新 focus（必須先 cooldown）
- 跳過 critic 直接 merge

**行為紅線**：
- 重大決策（跨 ≥ 2 職能、影響 ≥ 1 週）在個人軌單獨拍板
- design-review 有 BLOCKS 未解就合併
- 未走 sync-context 同步就把個人軌結論視為團隊決策
- Facilitator 在容量🔴 仍排新同步議題

---

## 🔄 STATE.json 結構

詳見 `context/STATE.json`，核心欄位：

```json
{
  "schema_version": "1.0",
  "team": {
    "name": "...",
    "facilitator": "...",
    "scale": "small",                 // small / medium
    "members": [
      {
        "name": "Alice",
        "role": "engineer",
        "expertise": ["frontend", "react", "design-systems"],
        "weekly_capacity_hours": 30,
        "timezone": "Asia/Taipei"
      }
    ],
    "cadence": "Mon/Wed/Fri 同步、其餘個人深度"
  },
  "current_phase": "T2",
  "active_sync_session": null,         // 進行中的同步 session（type, topic, started_at）
  "sync_queue": [                      // 待辦的同步議題佇列
    {
      "topic": "...",
      "scope": "lightweight",          // v1.1：lightweight (≤ 3 人 + < 1 人天 + 不動禁改) 或 heavyweight
      "proposer": "...",
      "submitted_at": "...",
      "wait_days": 0,
      "affected_roles": []
    }
  ],
  "active_individual_focuses": [],     // 各成員當前 focus block（不是陣列限制 1，每人 ≤ 1）
  "capacity_health": {
    "team_pct": 71,
    "team_status": "green",
    "consecutive_red_weeks": 0,
    "individuals_in_red": [],
    "ai_assist_pct_avg": 38           // v2.1：團隊整體 AI assist 平均比例
  },
  "weekly_cadence": {                  // v2.1：週上版節奏
    "this_week_release": "v1.18.0",
    "this_week_release_status": "monitoring",
    "consecutive_no_release_weeks": 0,
    "next_full_retro": "2026-06-05"
  },
  "design_review_board": {
    "pending": 2,
    "in_review": 1,
    "approved_this_week": 5,
    "blocked": 0
  },
  "subagent_states": {
    "pm": "idle", "product": "idle", "engineer": "idle",
    "designer": "idle", "sre": "idle",
    "tech-lead": "idle", "design-lead": "idle", "qa": "idle",
    "planner": "idle", "critic": "idle", "debugger": "idle",
    "db_expert": "idle", "vuln_verifier": "idle"
  },
  "last_release": { "version": null, "date": null },
  "current_version_target": {
    "version": "v0.1.0",
    "spec_path": null,
    "ac_total": 0,
    "ac_done": 0
  },
  "metrics_snapshot": {
    "north_star_metric": null,
    "north_star_value": null,
    "last_updated": null
  },
  "last_session": {
    "date": null,
    "type": "individual",              // sync / individual
    "duration_hours": 0,
    "actions_summary": [],
    "left_off_at": ""
  }
}
```

---

## 🔔 Hooks 行為

| Hook | 行為 |
|---|---|
| **SessionStart** | 讀 STATE.json + sync-context + log.md → 輸出對應軌儀錶板（同步軌 or 個人軌） |
| **PreToolUse** | 攔截：個人軌直接 push main、修改禁改清單、容量紅燈開新 focus、跳過 design-review 改架構 |
| **PostToolUse** | 編輯後跑對應測試（test-runner.sh）；commit 前檢查 quality |
| **SubagentStart** | 注入 STATE.json + sync-context + 對應角色必讀清單給 subagent |
| **SubagentStop** | 解析輸出、寫入對應 context/*-output.md；若 design-review agent 結束則更新 design-review-board |
| **Stop（Session 結束）** | 詢問本次工時 + 軌道類型 → append capacity-board → 更新 STATE.json → log.md |

---

## 🆕 v1.0 與既有角色端的關係

| 來源               | 採納內容                                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **單人工作室端 v1.0**  | 整體範本骨架（context/knowledge 兩層）、subagent + skill + hook 編排、session_stop 工時記錄；Energy Budget → **團隊容量看板**；exploration → **團隊版探索**（加 proposer 欄位） |
| **工程師端 v6**      | 5 個 Task Subagent（planner/critic/debugger/db-expert/vuln-verifier）、free-form 工作項目、commit-quality hook、ADR、PRINCIPLES/ARCHITECTURE、P7/P9 方法論 |
| **PM 端 v2.1.1**  | 文件編譯（raw/）、決策 ADR 樣板、風險登記、里程碑模板 → 整合進 pm role agent                                                                                         |
| **產品端 v2.1**     | BMC、Now/Next/Later、metrics-register、Lessons Learned → 整合進 product role agent                                                                |
| **SRE 端 v1**     | Runbook、Postmortem、環境推進、SLO → 整合進 sre role agent                                                                                            |
| **HTML 設計師端 v3** | Design Token、HTML-as-canvas、Persona/Journey → 整合進 designer role agent                                                                       |
| **HR 端 v1.1**    | 紅黃綠燈 + 心理狀態 → **people-ops role agent** + 團隊容量看板                                                                                            |
| **PMO 端 v1.1**   | 跨專案儀錶板 → 簡化整合進 pm role agent（單團隊不需要組合管理層）                                                                                                   |

### 關鍵差異：lens vs role agent

| 維度 | 單人工作室端（lens） | 公司團隊同步工作端（role agent） |
|---|---|---|
| 哲學 | 一個人切換腦袋 | 多個專業同步並行 |
| context | 共享一個 context（切換要儀式） | 各 agent 獨立 context |
| 目的 | 避免 context bleed | 鼓勵不同視角同時提案 |
| 主流程 | LENS_SWITCH ritual | Round Table 並行收斂 |

---

## 🔗 知識庫參考

| 概念文章 | 對應功能 |
|---|---|
| `wiki/概念/專案管理與協作/公司團隊同步工作端AI協作系統.md` | 本範本整體架構 |
| `wiki/概念/專案管理與協作/單人工作室AI協作系統.md` | 範本骨架的源頭 |
| `wiki/概念/專案管理與協作/PM端AI協作系統.md` | 兩層記憶 / STATE.json 機制源頭 |
| `wiki/概念/專案管理與協作/產品端AI協作系統.md` | BMC、Roadmap 機制源頭 |
| `wiki/概念/AI工具與基礎設施/Claude Code Subagent 架構.md` | Subagent 編排理論 |

---

*此文件定義系統行為，修改時需謹慎。版本：v1.0 / 建立：2026-05-02*
