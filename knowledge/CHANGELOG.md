# 公司團隊同步工作端 CHANGELOG

> 本檔記錄公司團隊同步工作端 AI 協作系統的版本演進。每次 Phase 5 範本迭代都會在此追加版本條目。
> 最新版本永遠在最頂端。

---

## v2.1（2026-05-25）

**類型**：節奏 + 品質 — 引入週上版與 AI 自動化品質閘門

### 觸發背景

團隊開始大量採用 AI 自動化（Claude / Cursor / Copilot 等）產出程式碼、設計、文件。同時轉向「每週上版一次」的時間驅動 release。

兩個轉變同時發生，需要範本層支援：
- **節奏轉變**：release 從事件驅動 → 時間驅動（每週至少一次）
- **品質轉變**：實作瓶頸消失 → review/decision 成為新瓶頸 → critic 角色強化

### 新增

**Skills**（+ 1）：
- `/weekly-release [weekly|patch]` — 週上版 orchestration（integration → release-cut → quick retro）

**PRINCIPLES**（+ 2）：
- #7 **AI 生成的內容必過 critic** — Claude/Cursor/Copilot 等 AI 產出，commit 前必跑 critic subagent。例外（typo / metadata / 純 reformat）需 commit message 註明 `[no-critic: reason]`
- #8 **每週至少一次 release** — 累積一週的工作不該無限延後；連續 2 週無法上 weekly release → 強制 round-table 討論結構性原因

**工作流程指南**（+ 1）：
- `工作流程指南/每週上版流程.md`（500+ 行）— 週節奏（Mon-Fri）、AI 自動化下的個人軌、品質閘門、雙模式 retro、5 個常見坑

**STATE.json schema 1.1 → 1.2**：
- `capacity_health.ai_assist_pct_avg` — 團隊 AI assist 比例平均
- `weekly_cadence` 段（this_week_release、consecutive_no_release_weeks、next_full_retro 等）
- `last_session.ai_assist_hours / ai_pct / critic_result / branch`

**capacity-board.md** 加 AI assist 欄位

### 修改

- **`/team-retro`**：v2.0 單一模式 → **v2.1 三模式**：`quick`（30min, weekly）/ `full`（90min, bi-weekly + 4 週彙整）/ `incident`
- **`session_stop.py`**：詢問加 AI hours、critic result。AI > 0 但 critic = not-run 時警告（PRINCIPLES #7）
- **CLAUDE.md**：T5/T6 描述加週節奏、紅線二補強段（AI 必過 critic）、Slash Commands 速查、STATE.json 結構範例
- **PRINCIPLES.md**：6 條 → **8 條**

### 與 v2.0.1 相容性

⚠️ **schema 1.1 → 1.2 加新欄位（向後相容，舊資料缺欄位時用預設）**：
- `capacity_health.ai_assist_pct_avg` 缺 → 視為 0
- `weekly_cadence` 缺 → 視為新團隊（無 release 紀錄）
- `last_session.ai_assist_hours` 缺 → 視為 0

✅ **行為變更（非破壞性）**：
- session_stop 額外問 2 個問題，可全按 Enter 跳過（為 0 / not-run）
- `/team-retro` 不指定 mode → 預設 quick（與 v2.0 預設規模類似）
- `/release-cut` 仍可單獨呼叫，但建議走 `/weekly-release`

### 跨系統影響

兩個新原則可考慮回流既有端：
- **PRINCIPLES #7（AI 必過 critic）**：所有採 AI 自動化的角色端都適用
  - 工程師端 v6：critic 已是 P9 一部分，本原則只是強化
  - HTML設計師端 v3：可加「AI 生成設計需自評清單」
- **PRINCIPLES #8（週上版）**：團隊規模團隊都適用
  - PM 端 v2.1.1：可加「上版節奏」章節
  - 單人工作室端 v1.0：對 indie 也很有幫助（解決「永遠不發版」反模式）
- 已加入 `知識庫結構/迭代記錄/跨系統待同步.md`

### 模擬產出

未隨本版本更新模擬（`示範運行/`）。若日後重做模擬，可用「8 人團隊全體採 AI 自動化、走週上版」當情境，預期會曝露：
- AI 產出量大、critic 跟不上
- 週四發現議題擠壓週五 release
- AI PR 描述虛胖難 review
- AI 比例 100% focus 進核心

這些已在 `工作流程指南/每週上版流程.md` 「5 個常見坑」段預先描述。

---

## v2.0.1（2026-05-21）

**類型**：補丁 — Git workflow 整合

### 新增
- `工作流程指南/Git 工作流程.md`（500+ 行完整指南：分支策略、檔案 commit policy、衝突處理、典型一週 git 操作、FAQ）
- `工作流程指南/設計更新流程.md`（已於 v2.0 加入，本版本補上交叉引用）
- 範本根 `.gitignore`（推薦排除清單）
- 範本根 `.gitattributes`（individual-tracks/capacity-board 等用 union merge 避衝突）
- `/capacity-flush` skill（Facilitator 在 main 整合 .capacity-pending/）

### 修改
- `session_stop.py`：branch-aware
  - main 分支 → 直接 append `capacity-board.md`
  - feature/* 分支 → append `.capacity-pending/{date}_{actor}.md`（避免 merge 衝突）
- `STATE.json.last_session` 加 `branch` 欄位
- `log.md` 預設加入 `.gitignore`（避免跨分支衝突，重要事件由 sync-context 留存）

### 與 v2.0 相容性
- ✅ 完全相容：所有變動都是 additive 或行為改善
- ⚠️ 既有 v2.0 部署若已 commit log.md，可選擇：
  - 保留並讓 git 繼續追蹤（接受偶爾衝突）
  - 從 git 移除：`git rm --cached knowledge/log.md`，加入 .gitignore

### 跨系統影響
- branch-aware hook 模式可考慮回流：
  - 工程師端 v6：commit-quality hook 可加 branch 維度
  - 單人工作室端 v1.0：單人通常只在 main，但若採 git flow 則同樣有效

---

## v2.0（2026-05-20）

**類型**：架構簡化（**大版本** — 移除 Subagent + 職責整併）

### 變更摘要

把 v1.x 的「人事相關」設計全面簡化：
- 🗑️ **移除 `people-ops` agent**（v1.0 起就有，曾在 v1.1 加揭露原則但未根本解決混雜問題）
- 🗑️ **拒絕引入 `hr` 與 `pmo` agent**（雖在實作前曾考慮，最終決定不採納）
- 📦 **PM agent 接管所有「人員量化」職責**：團隊容量、成員調度、單點故障偵測、容量揭露原則
- 🚫 **明確排除「人員質化」職責**：衝突調解、心理安全感、職涯發展 — 這些功能整體從本範本移除

### 設計動機

v1.x 模擬與實戰反饋發現：
1. **「容量數字」與「衝突調解」是不同性質的工作**，混在一個 agent 易造成 Facilitator 找錯人提問
2. **AI agent 對心理狀態的判讀風險高**，記錄在 git 也有隱私問題
3. **真人主管 + 1-1 + 外部教練是 irreplaceable 的人事支援**，AI 不該替代
4. **單一 owner 比分散 owner 更清楚**：team capacity 的決策若要找誰，永遠是 PM

### 變更明細

**Agent 數量**：
- v1.x small mode：6 個 → **v2.0 small mode：5 個**
- v1.x medium mode：9 個 → **v2.0 medium mode：8 個**
- 移除：people-ops（v1.0 起 / v1.1 強化過揭露原則）
- 不採納：hr, pmo

**PM agent 擴權**：
- 必讀清單加：`capacity-board.md`、`individual-tracks.md`
- Round Table 提案格式加「容量影響」「單點故障檢查」「容量條件」三段
- Design Review Verdict 加「容量不足 → BLOCKS」「容量🟡→🔴 → CONCERNS」「單點故障 → CONCERNS」
- 主導 `/team-health` 全段（v1.x 由 people-ops 主導）
- 維護 `capacity-board.md`、共筆 `individual-tracks.md`
- 揭露原則：容量數字／燈號／事實 ✅ 公開；超支個人原因 🚫 不公開

**Skills 修改**：
- `/team-health`：主導 agent 改為 pm；移除心理／職涯／衝突段；加單點故障段
- `/weekly-sync`：第 3 段「團隊健康」改由 pm 主導
- `/lens`：移除 `/lens people-ops`、`/lens hr` 的可用性
- `/round-table`：派發名單去掉 people-ops（small 5 個、medium 7 個）

**STATE.json**：
- `subagent_states` 移除 `people-ops` 條目

**CLAUDE.md**：
- §三條紅線 #3 加註「PM 主責（從 v1.x people-ops 接手）」
- §Mode 對應 subagent 編排 表更新
- §Subagent 編排圖更新（去 people-ops）
- §容量看板燈號行為 標註「v2.0：由 PM agent 執行」
- §STATE.json 結構範例同步

**knowledge/AGENTS.md**：
- small mode role agent 表去 people-ops、pm 加註擴權
- 並行啟動協議派發名單更新
- 個人軌 lens 可用對象表加 ~~people-ops/hr~~

### 與 v1.1 的相容性

⚠️ **破壞性變更**：
- 既有 v1.x 部署的 STATE.json 含 `subagent_states.people-ops` 欄位 → 升級時需手動移除（或忽略，v2.0 hook 不會讀寫此欄位）
- 既有 round-table 紀錄中提到的 people-ops 提案 → 視為歷史，不需重寫
- 過去由 people-ops 主導的 `/team-health` 報告中含「心理安全感」「衝突調解」段 → 視為歷史，未來報告不再產生這些段

✅ **保留**：
- 容量看板（capacity-board.md）格式不變
- capacity-guard.js / sync-guard.js / 其他 hook 不變
- T0–T7 phase 系統、三條紅線、雙軌設計皆不變

### 跨系統影響

- 「PM 接管人員量化」設計可考慮回流至：
  - 單人工作室端 v1.0：portfolio-curator lens 與 pm-coordinator lens 可考慮整併
  - PM 端 v2.1.1：strengthen capacity 章節（PM 端原本就有，但本範本進一步明確擁有權）
- 「衝突／心理／職涯不入 AI agent」原則可作為其他角色端設計的參考
- 已加入 `知識庫結構/迭代記錄/跨系統待同步.md`

### 模擬產出引用

- v1.0 模擬（`示範運行/`）中 people-ops 的提案範例已成為「歷史紀錄」，文件不刪但需註記「v2.0 起此 agent 已移除」
- 未來重做模擬時，原 people-ops 的提案改為由 pm 提出（容量段）；衝突／心理／職涯議題不出現在 round-table 中

---

## v1.1（2026-05-15）

**類型**：弱點修正（小版本升級）

### 來源
v1.0 模擬測試（`示範運行/`）曝露 7 個設計弱點，本版本修正全部 7 條。

### 新增
- **新增 `/lightweight-sync` skill**（弱點 #1，高優先）— 輕量決策（≤ 3 人 + < 1 人天 + 不動禁改清單）的 emoji 投票機制
- **新增 4 個 knowledge 子目錄**：`round-tables/_drafts/`、`design-reviews/_drafts/`、`retros/incident-retros/_drafts/`、`contracts/`（弱點 #7）
- **新增 PRINCIPLES #6**「自動化工具必須提供 confidence 維度」（弱點 #4）
- **新增 3 條 Lessons Learned** 進 PRINCIPLES.md（5/15 retro 衍生）

### 修改
- **`/design-review` skill**（弱點 #2，高優先）— 加入「BLOCKS 數量檢查」步驟 5.5：BLOCKS ≥ 3 自動建議 mini-sync rescue。新增「Mini-Sync Rescue 流程」與「Rescue Session 紀錄」格式
- **STATE.json schema 1.0 → 1.1**（弱點 #3）— `sync_queue[]` 加入 `scope` 欄位（lightweight / heavyweight）。CLAUDE.md 結構描述同步更新
- **`/lens` skill**（弱點 #5）— 明確區分個人視角 lens（engineer/designer/product/pm/sre/qa/people-ops）vs 協調代表 lead 身分（tech-lead/design-lead 不可由個人軌切換）
- **`knowledge/AGENTS.md`** — 加入「可切換 lens 的明確界線」表
- **`people-ops` agent**（弱點 #6）— 新增「揭露原則」表（7 類資料 × 揭露界線）、違反原則的後果流程、個人軌 `/lens people-ops`「對自己用」限制
- **`/read-raw` skill**（弱點 #7）— 補完 6 條分流路徑（v1.0 只列 4 條）、新增「分流規則判斷流程」7 步驟、強制 `_drafts/` 含「來源 raw 檔名」與 sync_queue 帶 scope

### 不修改
- 14 個 subagent 數量不變（pm/product/engineer/designer/sre/people-ops/tech-lead/design-lead/qa + 5 task agents）
- T0–T7 Phase 系統架構不變
- 三條紅線不變
- Hooks 結構不變

### 與 v1.0 相容性
- ✅ STATE.json schema 1.0 → 1.1：往後相容（新增欄位，舊欄位都保留）
  - 已有 v1.0 資料的團隊：sync_queue 內既有條目可缺 scope 欄位，預設視為 heavyweight
- ✅ 既有 round-table / design-review 紀錄不需重寫
- ✅ 既有 ADR 不需重寫
- ⚠️ 行為變更：`/design-review` BLOCKS ≥ 3 時會主動詢問是否開 mini-sync（v1.0 直接讓提案者修）。Facilitator 可選擇拒絕，但會被詢問

### 跨系統影響
- `/lightweight-sync` 的「emoji 投票決定」模式可考慮回流至：
  - **PM 端 v2.1.1**：合約決策中常見 ad-hoc 投票，可正式化
  - **PMO 端 v1.1**：跨專案小決策可採用
  - 已在 `知識庫結構/迭代記錄/跨系統待同步.md` 加入評估條目

### 模擬產出引用
全部 7 條修正都對應 `示範運行/99_測試結論.md` 的弱點編號（#1–#7）。

---

## v1.0（2026-05-02）

**類型**：新範本建立（首版）

### 新增

- 建立 `_系統/claude-code-範本/公司團隊同步工作端/` 完整範本
- 設計八階段 Phase 系統（T0–T7），核心是**同步軌 + 個人軌雙軌設計**：
  - T0 團隊初始化、T1 情境啟動
  - **T2 構思圓桌（Round Table）** — 所有專業同步並行提案，取代 PM → 工程師線性交付
  - T3 設計評審（Design Review）— APPROVED / CONCERNS / BLOCKS 三類結果
  - T4 同步開發（Mob 群體開發 + Individual Focus 並行）
  - T5 整合發版、T6 共同回顧、T7 團隊健康 + 容量管理
- 三條紅線：**重大決策必須走同步軌**、**設計評審不能跳過**、**團隊容量同步可視**
- **團隊容量看板**（仿單人工作室端的 Energy Budget，但從個人擴展到團隊可視）：每位成員 WIP、focus、本週剩餘小時、🟢🟡🔴 燈號
- 雙模式 STATE.json：`team.scale: "small" | "medium"`，影響 Role agent 編排
  - small mode：6 個 Role agent（pm, product, engineer, designer, sre, people-ops）
  - medium mode：額外加入 tech-lead, design-lead, qa（共 9 個）
- 14 個 Subagent：
  - Task agents（5）：planner、critic、debugger、db-expert、vuln-verifier（繼承自工程師端 v6）
  - Role agents（9）：pm、product、engineer、designer、sre、people-ops、tech-lead、design-lead、qa
- **Role agent 並行執行協議**取代「Lens 切換」：避免「先說 anchor 後說」的 confirmation bias
- Slash Commands（19 個）：
  - 啟動：`/team-kickoff`、`/lens [role]`
  - 同步軌：`/round-table`、`/design-review`、`/mob`、`/integration`
  - 個人軌：`/individual-focus`、`/focus-end`、`/implement`、`/bug-fix`、`/sync-context`
  - 週期：`/weekly-sync`、`/team-retro`、`/team-health`
  - 工具：`/release-cut`、`/arch-decision`、`/idea-spark`、`/read-raw`
- `knowledge/round-tables/`、`knowledge/design-reviews/`、`knowledge/mob-sessions/` 三個同步軌歷史紀錄目錄
- `context/sync-context.md` 跨軌共享決策摘要、`context/capacity-board.md` 團隊容量看板

### 採納來源

| 來源端 | 採納內容 |
|---|---|
| **單人工作室端 v1.0** | 整體骨架（context/knowledge 兩層）、subagent + skill + hook 架構、session_stop 工時記錄、explorations 結構（加 proposer 欄位） |
| 工程師端 v6 | 5 個 Task Subagent、free-form 工作項目、commit-quality hook、ADR、PRINCIPLES/ARCHITECTURE、P7/P9 方法論 |
| PM 端 v2.1.1 | 文件編譯（raw/）、ADR 樣板、風險登記、里程碑模板 → 整合進 pm role agent |
| 產品端 v2.1 | BMC、Now/Next/Later、metrics-register、Lessons Learned → 整合進 product role agent |
| SRE 端 v1 | Runbook、Postmortem、環境推進、SLO → 整合進 sre role agent |
| HTML 設計師端 v3 | Design Token、HTML-as-canvas、Persona/Journey → 整合進 designer role agent |
| HR 端 v1.1 | 紅黃綠燈 + 心理狀態 → people-ops role agent + 團隊容量看板 |
| PMO 端 v1.1 | 跨專案儀錶板 → 簡化整合進 pm role agent（單團隊不需要組合管理層） |

### 與單人工作室端的關鍵差異

| 維度 | 單人工作室端（lens） | 公司團隊同步工作端（role agent） |
|---|---|---|
| 執行模型 | 一個人切換腦袋 | 多個專業並行 |
| context | 共享一個 context（切換要儀式） | 各 agent 獨立 context |
| 主要儀式 | LENS_SWITCH ritual | Round Table 並行收斂 |
| WIP 規則 | 主執行緒 WIP=1（嚴） | 每位成員 WIP=1（個人軌）+ 同步軌例外 |
| 容量機制 | Energy Budget（單人時數燈號） | 團隊容量看板（多人燈號 + 團隊整體燈號） |

### 跨系統影響

- 新增「Role agent 並行模型」設計，可考慮回流至：
  - 單人工作室端：在團隊外包合作場景下，可借用 round-table 機制與外部協作（待評估）
  - PM 端：design-review 機制可加強 P3/P4 階段的跨職能評審（待評估）
- 已加入 `知識庫結構/迭代記錄/跨系統待同步.md`（Phase 5 步驟四）

### 與前版相容性

- 無前版（首版發布），不存在相容性問題

---
