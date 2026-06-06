# Git 工作流程：團隊端 + 個人端共用同一 repo

> 解答的問題：「團隊端的 sync-context 與個人端的 feature 分支怎麼同步？衝突怎麼解？哪些檔案在哪個分支？」

---

## 🧠 核心心智模型

**重點：團隊端與個人端用同一份 `.claude/`，差別只在「Skill 用法」**：
- 個人軌成員 = 開 Claude session 在 repo cwd → 跑 `/individual-focus`、`/implement`、`/lens [role]`
- Facilitator = 開 Claude session 在同一個 repo cwd → 跑 `/round-table`、`/design-review`、`/mob`

**不需要兩個 `.claude/` 設定。** 你不需要安裝獨立的「工程師端」或「HTML設計師端」範本，這些角色的職能都已被本範本的個人軌 skills + role agents 涵蓋。

唯一需要管理的是：**git 分支**。

---

## 🌿 分支策略

```
main                                  ← 同步軌的 source of truth
│
├── feature/FOCUS-007                 ← 個人軌：Chen 的 dark mode prototype
├── feature/FOCUS-012                 ← 個人軌：Fang 的 onboarding 視覺
│
├── design-review/DR-007              ← 提案者準備 DR-007 草稿（單人或少數人）
├── design-review/DR-008              ← 同上
│
├── mob/MOB-003                       ← Mob session 共用分支（多人同時 push）
│
└── release/v1.18.0                   ← Release 整合分支（v2.0 通常用 main 直接 release）
```

### 分支命名慣例

| Prefix | 用途 | 範例 |
|---|---|---|
| `feature/FOCUS-XXX` | 個人軌實作 | `feature/FOCUS-007` |
| `feature/BUG-XXX` | bug fix | `feature/BUG-042` |
| `design-review/DR-XXX` | DR 草稿準備 | `design-review/DR-007` |
| `mob/MOB-XXX` | Mob session 共用 | `mob/MOB-003` |
| `release/vX.Y.Z` | release 整合（必要時） | `release/v1.18.0` |
| `hotfix/XXX` | 緊急修復 | `hotfix/auth-leak` |

---

## 📂 哪些檔案在哪個分支

| 檔案 | main | feature 分支 | 說明 |
|---|---|---|---|
| **同步軌核心（main 唯一真相）** | | | |
| `context/STATE.json` 的 team 段 | ✅ commit | ❌ 不該改 | team.members、scale、cadence 是同步軌定義 |
| `context/STATE.json` 的 sync_queue / capacity_health / design_review_board | ✅ commit | ❌ 不該改 | 同步軌進度狀態 |
| `context/STATE.json` 的 subagent_states / active_lens / last_session | ⚠️ 個人 session 級 | ⚠️ 個人 session 級 | **建議走 .gitignore**（見下節）|
| `context/sync-context.md` | ✅ commit | ❌ 不該改 | 跨軌共識，由同步軌寫入 |
| `context/decision-log.md` | ✅ commit | ❌ 不該改 | 同步軌決策日誌 |
| `context/design-review-board.md` | ✅ commit | ⚠️ DR 草稿可在 design-review 分支改 | 看板狀態 |
| `context/capacity-board.md` | ✅ commit | ⚠️ session_stop 會 append（見衝突處理）| 容量看板 |
| `context/individual-tracks.md` | ✅ commit | ⚠️ 可改自己那段 | 個人 focus 詳細 |
| `context/current-sync.md` | ✅ commit（進行中時）| ❌ 不該改 | 進行中 sync session |
| `context/risk-register.md` | ✅ commit | ❌ 不該改 | 風險登記 |
| `context/roadmap.md` | ✅ commit | ❌ 不該改 | Roadmap |
| `context/metrics-register.md` | ✅ commit | ❌ 不該改 | 指標 |
| `context/critic-report.md` | ⚠️ 個人輸出 | ⚠️ 個人輸出 | **建議走 .gitignore** |
| `context/subagent-output.md` | ⚠️ 個人輸出 | ⚠️ 個人輸出 | **建議走 .gitignore** |
| **長期記憶（main 唯一真相）** | | | |
| `knowledge/PRINCIPLES.md` | ✅ commit | ❌ 改禁改清單，需 design-review | 工程原則 |
| `knowledge/ARCHITECTURE.md` | ✅ commit | ❌ 改禁改清單，需 design-review | 技術架構 |
| `knowledge/AGENTS.md` | ✅ commit | ❌ 改禁改清單，需 design-review | Subagent 協議 |
| `knowledge/CHANGELOG.md` | ✅ commit | ❌ 不該改 | 版本演進 |
| `knowledge/log.md` | ✅ commit（append-only）| ⚠️ 跨分支衝突高 | **建議走 .gitignore** 或用 git merge driver |
| `knowledge/round-tables/*.md` | ✅ commit | ❌ 不該新建 | 同步軌寫 |
| `knowledge/design-reviews/*.md` | ✅ commit | ⚠️ 草稿可在 design-review 分支 | DR 完成才合併 |
| `knowledge/decisions/ADR-*.md` | ✅ commit | ❌ 不該改 | 同步軌寫 |
| `knowledge/retros/*.md` | ✅ commit | ❌ 不該改 | retro 寫 |
| `knowledge/releases/*.md` | ✅ commit | ❌ 不該改 | release 寫 |
| **程式碼 / 設計檔** | | | |
| `src/`, `tokens/`, `tests/`, `docs/` 等 | ✅ commit | ✅ feature 分支自由改 | 標準 git 工作 |
| **其他** | | | |
| `.claude/` | ✅ commit | ❌ 改 agent/skill 算範本變動，走 Phase 5 | 範本本體 |
| `raw/` | ✅ commit | ✅ 個人軌可丟新 raw | 處理後標記已處理 |
| `output/` | ✅ commit | ❌ 不該在 feature 分支寫 | 對外輸出 |

---

## 🚫 推薦的 .gitignore

範本根目錄已附 `.gitignore`，內容說明見 [`Git 工作流程：.gitignore 詳解`](#gitignore-詳解) 段。

關鍵原則：
- **個人 session 級的暫存** → 不 commit（每個成員自己）
- **跨成員需要共享的真相** → commit

---

## ⚠️ 衝突處理三大場景

### 場景 1：兩個 feature 分支同時改 `context/individual-tracks.md`

**為什麼會發生**：Chen 和 Fang 各自在 feature 分支跑 `/individual-focus`，都改 individual-tracks.md 的「自己那段」。merge 時可能對齊問題。

**解法 A（建議）**：individual-tracks.md 用 git merge driver `union`：
```bash
# .gitattributes
context/individual-tracks.md merge=union
```
這會讓兩邊的 append 都保留，而不是衝突。

**解法 B**：每位成員只改自己那段，merge 工具能自動分辨。但如果兩段位置相鄰，仍可能衝突。

**解法 C**：individual-tracks.md 拆成 `individual-tracks/{name}.md` 一人一檔（schema v2.1 候選）。

### 場景 2：同步 session 進行中，feature 分支被 push 了改動

**為什麼會發生**：Facilitator 開了 round-table，進行中（active_sync_session ≠ null）。同時 Chen 在 feature 分支跑 `/implement`，commit 了程式碼。

**問題**：feature 分支的程式碼若依賴 round-table 還沒拍板的決策，可能會做白工。

**解法**：
- 個人軌成員的 SessionStart Hook 會檢查 `STATE.json.active_sync_session`，若 ≠ null：
  ```
  ⚠️ 同步 session 進行中：[type] 主題: [topic]
     建議：(1) 等同步結束再開始你的工作 (2) 確認你的 focus 不會被同步決策影響
  ```
- 即使繼續做，個人軌成員自己決定是否值得冒險

### 場景 3：session_stop.py 在 feature 分支跑，append `capacity-board.md`

**為什麼會發生**：個人軌成員在 feature 分支結束 session，hook 自動 append 工時到 capacity-board.md。但 capacity-board.md 是 main 分支的 source of truth。

**問題**：feature 分支的 capacity-board.md 變動，merge 回 main 時可能衝突 or 重複 entry。

**解法（v2.1 hooks 加入）**：session_stop.py 偵測當前分支：
- 若是 main → 直接 append capacity-board.md
- 若是 feature/* → append 到 `context/capacity-board.local.md`（gitignore），等成員主動 `/capacity-flush` 或下次 main checkout 時整合
- 或：個人軌成員的 capacity entry 暫存到 `context/.capacity-pending/{date}_{actor}.md`，由 Facilitator 定期 merge 到 capacity-board.md

詳見「Hook 與 git 整合」段。

---

## 🔄 典型一週的 git 操作

### Monday 早 — Facilitator

```bash
git checkout main
git pull
claude code            # 跑 SessionStart 看儀錶板
                       # 看到 sync_queue 有 Emma 的議題
/round-table 重建 design token 系統
                       # 9 agent 並行提案、收斂
                       # 寫入 knowledge/round-tables/2026-05-04_重建-design-token-系統.md
                       # 寫入 context/sync-context.md
                       # 寫入 context/decision-log.md
git add knowledge/round-tables/2026-05-04*.md context/sync-context.md context/decision-log.md context/STATE.json
git commit -m "chore(sync): round-table 2026-05-04 — 重建 design token 系統 (decided: split + design-review)"
git push origin main
```

### Monday 下午 — Emma 準備 DR-007

```bash
git checkout main && git pull
git checkout -b design-review/DR-007
claude code
/design-review design token 重建 — Phase 1: foundation
                       # 寫入 knowledge/design-reviews/2026-05-04_重建-design-token-系統-DR-007.md
                       # 受影響角色 verdict
                       # 結果：v1 BLOCKS（5 點）
git add knowledge/design-reviews/2026-05-04*.md context/design-review-board.md context/STATE.json
git commit -m "docs(dr): DR-007 v1 提交（sre BLOCKS 5 items）"
git push origin design-review/DR-007
```

### Tuesday 早 — Emma 提交 DR-007 v2

```bash
# 還在 design-review/DR-007 分支
git pull origin main --rebase   # 同步 main 上的 sync-context 變動（若有）
claude code
/design-review                  # rev2
                                # 全 APPROVED
                                # 觸發 mini-sync rescue（若 v1 BLOCKS ≥ 3，已修為 v2）
git add knowledge/design-reviews/2026-05-04* context/design-review-board.md context/decision-log.md
git commit -m "docs(dr): DR-007 v2 全 APPROVED"
# Merge 回 main（也可開 PR review）
git checkout main && git pull
git merge design-review/DR-007
git push origin main
git branch -d design-review/DR-007
```

### Wednesday — Chen 開 FOCUS-012 個人軌

```bash
git checkout main && git pull
git checkout -b feature/FOCUS-012
claude code
/individual-focus codemod 腳本完善 + Button/Input/Card 三元件遷移
                                # 系統檢查：sync 共識依據（DR-007）✅、容量 ✅、WIP=1 ✅
                                # 寫入 context/individual-tracks.md（Chen 那段）
                                # 寫入 context/STATE.json.active_individual_focuses[]
git add context/individual-tracks.md context/STATE.json
git commit -m "chore(focus): FOCUS-012 開卡 — codemod + 三元件遷移"
git push origin feature/FOCUS-012

# 接下來 Chen 在 feature/FOCUS-012 上開發
/implement
                                # 改 src/，跑 critic
                                # 完成後
git add src/
git commit -m "feat(tokens): codemod 完善 + Button/Input/Card 遷移"
git push origin feature/FOCUS-012

# 完成
/focus-end                      # critic 通過、無跨軌價值要回流
git add context/individual-tracks.md context/STATE.json
git commit -m "chore(focus): FOCUS-012 完成"
# 開 PR 由同事 review、merge 回 main
```

### Wednesday — David 從個人軌回流發現

```bash
# 還在 feature/FOCUS-010
claude code
/sync-context                   # 注入「<AuditEntry> 7 處 inline hex」發現
                                # 寫入 context/sync-context.md「個人軌回流」區
                                # STATE.json.sync_queue 加新條目
git add context/sync-context.md context/STATE.json
git commit -m "chore(sync): 個人軌回流 — <AuditEntry> 硬編碼發現"
git push origin feature/FOCUS-010

# Facilitator 下次 SessionStart 會看到此回流
```

### Friday — release

```bash
git checkout main && git pull
claude code
/integration                    # 全 role agent 同步檢查、全 GO
/release-cut                    # sre 主導環境推進
git add knowledge/releases/v1.18.0.md
git tag v1.18.0
git push origin main --tags
```

---

## 🪝 Hook 與 git 整合（v2.1 候選改進）

當前 v2.0 hooks 對 git 分支不敏感，下列調整建議在 v2.1 引入：

### session_stop.py：branch-aware

```python
# 偽碼示意
current_branch = subprocess.check_output(['git', 'symbolic-ref', '--short', 'HEAD']).strip()
if current_branch == 'main':
    append_to('context/capacity-board.md', entry)
else:
    # feature 分支：寫到 .capacity-pending/，避免污染 capacity-board.md
    append_to(f'context/.capacity-pending/{date}_{actor}.md', entry)
    print(f'[session_stop] 已暫存於 .capacity-pending/，下次 main checkout 時會 merge')
```

`.capacity-pending/` 加入 .gitignore，由 Facilitator 在 main 上跑 `/capacity-flush`（v2.1 新 skill）整合。

### subagent-start/stop.py：不寫 STATE.json 的 ephemeral 段

當前會寫 `subagent_states.{agent} = "running" / "idle"`。建議：
- ephemeral 段（subagent_states, active_lens, last_session）寫到 `context/STATE.local.json`（gitignore）
- Hooks 同時讀寫 STATE.json 與 STATE.local.json
- Facilitator 看儀錶板時優先讀 STATE.local.json 的 session 級資料

這需要 schema 拆分（schema_version 1.1 → 1.2），是 v2.1 候選。

### sync-guard.js：不變

當前 sync-guard.js 已根據 `STATE.json.active_sync_session` 判斷個人軌 vs 同步軌，行為正確。

### design-review-gate.js：v2.1 加 branch 檢查

當前只檢查 commit message。建議加：
- 若分支是 `design-review/DR-XXX`，直接放行（提案者準備中）
- 若是 main，檢查 commit message 與 design-review-board.md 對應 DR 為 approved

---

## 📋 設定 Checklist（新團隊 onboarding）

當你第一次部署本範本到團隊 repo：

- [ ] `git init` 或在既有 repo 加入 `.claude/`、`context/`、`knowledge/`
- [ ] `cp _系統/claude-code-範本/公司團隊同步工作端/.gitignore .gitignore`
- [ ] `git add .gitignore && git commit -m "chore: 套用公司團隊同步工作端 v2.0 .gitignore"`
- [ ] 建立 `.gitattributes` 加入 `context/individual-tracks.md merge=union`（避免 individual-tracks 衝突）
- [ ] 設定 main 分支保護（GitHub/GitLab）：禁止 force push、要求 PR review
- [ ] Facilitator 在 main 跑 `/team-kickoff`
- [ ] 各成員 `git pull` 後可開始用個人軌

---

## ❓ FAQ

**Q：個人軌成員可以在 feature 分支上跑 `/round-table` 嗎？**
A：**不建議**。round-table 寫入 `context/sync-context.md`、`knowledge/round-tables/` 都是同步軌真相，應該在 main 分支執行。若一定要在 feature 分支跑（如 mob session 群體開發中順便開個小 round-table），結束後 commit 並儘速 merge 回 main。

**Q：如果 main 分支上的 sync-context 在我 feature 分支工作期間變動了，我要做什麼？**
A：定期 `git pull origin main --rebase` 把 main 變動帶進 feature 分支。SessionStart Hook 會把最新 sync-context 顯示給你看。

**Q：兩個 feature 分支都改了 src/components/Button/，merge 衝突怎麼解？**
A：標準 git workflow，與本範本無關。Button 元件衝突由兩位成員協調或由 Facilitator 在 lightweight-sync 中決定。

**Q：可以用 PR review 取代 design-review 嗎？**
A：**不行**。PR review 是 git 機制，design-review 是同步軌儀式。兩者不同層次：
- design-review：實作前的方案評審（含 sre/qa/pm 等多角色 verdict）
- PR review：實作後的程式碼檢查（同事看 diff）
通過 design-review 後仍要 PR，PR 通過後才能 merge。

**Q：mob session 怎麼用 git？**
A：建立共用分支 `mob/MOB-XXX`，所有 driver 與 navigator 在這個分支 push。每 25 分鐘輪換時：上一位 push、下一位 pull。結束後 PR 回 main。

**Q：我能不能直接在 main 上工作（不開分支）？**
A：可以，但只限：
- Facilitator 寫 sync 紀錄
- 文件編輯（如修 PRINCIPLES.md typo，但要走 design-review）
- 不限制：個人軌的 individual-focus / implement 必須在 feature 分支

**Q：個人 session 的 critic-report.md 為什麼不 commit？**
A：critic 報告是個人軌過程中產生的暫存品，每個成員每次跑都會覆寫。如果 commit 會：(a) 跨成員衝突嚴重 (b) 無歷史價值（只是當下指引）。重要的 critic 結論應該寫進 PR comment 或 Lessons Learned。

**Q：CHANGELOG.md 與 log.md 的 git 處理為何不同？**
A：
- CHANGELOG.md = 範本版本演進，append 量小、由 Phase 5 流程寫，commit 沒問題
- log.md = 操作日誌，append 量大、每次 session 都寫，commit 容易衝突
建議 log.md 走 .gitignore（v2.0 預設），重要事件由 sync-context 或 decision-log 留存。若要保留 log.md 的審計歷史，可改用 syslog 或外部 log 系統。

---

## 🔗 進階閱讀

- [本範本 CLAUDE.md（v2.0）](../CLAUDE.md)
- [設計更新流程](設計更新流程.md)
- [.gitignore 範本](../.gitignore)
- [.gitattributes 建議](../.gitattributes)（範本未含，由團隊建立）

---

*v2.0 起此指南有效。Hook branch-aware 改進列為 v2.1 候選。*
