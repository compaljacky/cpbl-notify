# Subagent / Role Agent 啟動協議

> 本範本與單人工作室端最大的差異：用「Role Agent」並行替代「Lens 切換」。
> Role agents 各自有獨立 context，避免「一個腦袋切換」造成的偏見漏失。

---

## Role Agents（同步軌主用）

### small mode（5 個，預設；v2.0 從 6 個減為 5 個）

| Agent | 觸發 | 必讀 | 輸出位置 |
|---|---|---|---|
| pm | round-table、design-review、里程碑、合約、**團隊容量**、單點故障 | risk-register, roadmap, sync-context, **capacity-board, individual-tracks** | subagent-output.md / capacity-board |
| product | round-table 商業面、BMC、指標、Now/Next/Later 重排 | metrics-register, roadmap, business-model | subagent-output.md |
| engineer | round-table 技術面、design-review、可行性 | ARCHITECTURE, PRINCIPLES, sync-context | subagent-output.md |
| designer | round-table UX 面、設計系統影響 | tokens, components/_INDEX, sync-context | subagent-output.md |
| sre | 部署、可靠性、incident、SLO | runbooks, ARCHITECTURE, capacity-board | subagent-output.md |
| ~~people-ops~~ | **v2.0 移除** — 容量/調度/單點故障 → pm；衝突/心理/職涯 → 真人主管 + 外部教練 | — | — |

### medium mode（額外 3 個）

| Agent | 觸發 | 必讀 | 輸出位置 |
|---|---|---|---|
| tech-lead | medium mode 下取代 engineer 直接出場、協調多位工程師 | ARCHITECTURE, individual-tracks（工程師組） | subagent-output.md |
| design-lead | medium mode 下取代 designer 直接出場 | tokens, individual-tracks（設計組） | subagent-output.md |
| qa | 任何 design-review 自動加入、release 前必到 | test 結構, design-review-board | subagent-output.md |

---

## Task Agents（個人軌主用，從工程師端 v6 繼承，5 個）

| Agent | 觸發 | 必讀 | 輸出位置 |
|---|---|---|---|
| planner | P9 任務（≥ 3 模組） | current focus, ARCHITECTURE | subagent-output.md |
| critic | 任何「視為完成」前 | 變動的程式碼 | critic-report.md |
| debugger | /bug-fix | 錯誤訊息 + 相關檔案 | subagent-output.md |
| db-expert | schema/migration 改動 | DB 變更 | subagent-output.md |
| vuln-verifier | critic 標記安全疑慮 | 漏洞描述 | subagent-output.md |

---

## 並行啟動協議（Round Table 場景，強制）

Round Table 是 Role agent 的「主場」：

```
1. 主執行緒（Facilitator）讀 STATE.json，依 mode 決定派發哪些 Role agents
   - small mode → pm, product, engineer, designer, sre 全派（v2.0：刪除 people-ops，人員量化議題整併入 pm）
   - medium mode → pm, product, tech-lead, design-lead, sre, qa（依議題加減；v2.0：刪除 people-ops）

2. 並行（不是順序）呼叫各 Role agent，傳入：
   - 議題（topic）
   - 議題敘述（context）
   - 各自必讀清單

3. 各 Role agent 在 30 秒內輸出標準格式 PROPOSAL（見 CLAUDE.md T2 區塊）

4. 主執行緒收齊所有 PROPOSAL → 進入「收斂」階段
   - 整理共識區、衝突區、待驗證區
   - 寫入 knowledge/round-tables/YYYY-MM-DD_xxx.md

5. 主執行緒提問 Facilitator：「下一步：決定 / 再探索 / 暫緩？」

6. 寫入 decision-log.md（若決定）→ 寫入 sync-context.md（共識條目）
```

### 為什麼是並行不是順序

順序執行會造成「先說的人 anchor 了後說的人」（confirmation bias）。並行執行讓每個專業視角獨立成形再對撞，更能暴露真正的分歧。

---

## Design Review 啟動協議

```
1. 提案者執行 /design-review，建立 knowledge/design-reviews/YYYY-MM-DD_xxx.md
2. 提案者宣告 affected_roles[]
3. 系統並行呼叫對應 Role agents（+ qa agent 自動加入）
4. 每個 agent 在指定時限內輸出 VERDICT（APPROVED / CONCERNS / BLOCKS）
5. 提案者整合反饋，回應 CONCERNS、修正 BLOCKS
6. 全 APPROVED 才能寫入 design-review-board.md 為 ✅
```

---

## Mob 啟動協議

```
1. 主執行緒（Facilitator）執行 /mob {任務}
2. 指定 Driver + Navigator(s)（2–4 位真人成員）
3. Role agents 在 mob 進行中以「諮詢」身分被動呼叫（不像 round-table 主動並行）
4. 每 25 分鐘輪換 Driver，主執行緒記錄輪換點
5. 結束時強制跑 critic subagent
6. 寫入 knowledge/mob-sessions/YYYY-MM-DD_xxx.md
```

---

## Lens 切換（個人軌使用，與單人工作室端相同）

個人軌成員若要在自己的 session 內切換腦袋，仍可使用 `/lens [role]`。
**注意**：這只在個人軌有效。同步軌不需要切換，因為 Role agents 並行執行。

切換儀式（個人軌）：
```
1. 主執行緒宣告「即將切到 [lens]」
2. 寫入 LENS_SWITCH 區塊到 subagent-output.md
3. 更新 STATE.json 的 active_lens
4. 執行 lens 工作協議
5. lens 結束寫入 OUTPUT 區塊
6. 主執行緒寫入 LENS_RETURN 區塊
7. 更新 STATE.json 的 active_lens 為 null
```

### v1.1：可切換 lens 的明確界線

| Role | 個人軌可切換？ | 原因 |
|---|---|---|
| engineer / designer / product / pm / sre / qa | ✅ 可 | 個人專業視角 |
| ~~people-ops / hr~~ | 🗑️ **v2.0 移除** | 容量視角去 pm；衝突／心理／職涯回歸真人 |
| **tech-lead / design-lead** | 🚫 **不可** | 「組內共識代表」身分，個人軌無法 poll 組內，會輸出虛假代表性 |
| facilitator | 🚫 不適用 | facilitator 是真人主持身分，非 role agent |

詳見 `.claude/skills/lens.md`。
