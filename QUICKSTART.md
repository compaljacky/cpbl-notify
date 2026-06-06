# 公司團隊同步工作端 v1.0 — 快速上手導覽

> **目標讀者**：第一次拿到這個範本的 Facilitator（通常是 Tech Lead 或 PM），與一般成員。
> **完整設計哲學**：見 `CLAUDE.md`。
> **本檔目的**：30 分鐘讓團隊跑起來。

---

## 🏃 30 秒概覽

把單人工作室端的「lens 切換」換成「Role agent 並行」。
一個議題拋出 → 6（small mode）或 9（medium mode）個 Role agent 同時從各自專業視角提案 → Facilitator 收斂共識 → 寫進決策紀錄。

工作分兩條軌：
- **同步軌**：Round Table、Design Review、Mob — 由 Facilitator 主持，全員（或代表）同步
- **個人軌**：每位成員自己的 Claude session，跑 implement/bug-fix 等深度工作

兩軌之間透過 `sync-context.md` 與 `decision-log.md` 連結。

---

## 📦 部署到新團隊

### 1. 複製範本到團隊共享 repo
```bash
cp -r _系統/claude-code-範本/公司團隊同步工作端/ ~/myteam-claude/
cd ~/myteam-claude/
git init && git add . && git commit -m "chore: 從公司團隊同步工作端 v1.0 範本初始化"
```

### 2. Facilitator 在自己機器跑 Claude
```bash
cd ~/myteam-claude/
claude code
```

### 3. 一般成員的 Claude session
- 一般成員不需要在 `~/myteam-claude/` 開 Claude
- 他們在自己的工程目錄（或設計目錄）開 Claude，搭配既有的工程師端／設計師端等
- 重大同步議題出現時，到 Facilitator 那邊參與 round-table

---

## 🎬 第一個 Session：跑 `/team-kickoff`

由 Facilitator 啟動 Claude，第一句話：
```
/team-kickoff
```

Claude 會問：
1. 團隊名稱、Facilitator 名字
2. 規模 mode：small (3–6) / medium (7–15)
3. 協作節奏（如 Mon/Wed/Fri 同步）
4. 各成員：name、role、expertise[]、weekly_capacity_hours、timezone
5. 既有產出（spec / ADR / 風險）若有

完成後會建立：
- `STATE.json` 含 team.members[]
- `knowledge/PRINCIPLES.md`（≥ 5 條工程原則）
- `knowledge/ARCHITECTURE.md`（含禁改清單）
- 推薦你跑第一場 round-table 制定團隊章程

---

## 🌳 決策樹（Facilitator 視角）

```
當前狀態？
│
├─ 有開放議題、跨 ≥ 2 職能
│  └─ /round-table [議題]
│     → 9 個 Role agent 並行提案 → 收斂 → 決定/再探索/暫緩
│
├─ 有成熟提案要進實作前評審
│  └─ /design-review [提案]
│     → 受影響角色並行審查 → APPROVED/CONCERNS/BLOCKS
│
├─ 關鍵實作要群體完成
│  └─ /mob [任務]
│     → Driver + Navigators 輪換
│
├─ 版本準備發版
│  └─ /integration → /release-cut
│
├─ Sprint 結束 / incident 後
│  └─ /team-retro
│
└─ 週度回顧
   └─ /weekly-sync
```

## 🌳 決策樹（一般成員視角）

```
當前狀態？
│
├─ 我有 sync 共識任務想開始
│  └─ /individual-focus [任務]
│     → 共識依據檢查 + 容量檢查 + WIP=1 寫入
│
├─ 開始實作
│  └─ /implement
│
├─ 修 bug
│  └─ /bug-fix
│
├─ 在 focus 中發現對團隊有價值的事
│  └─ /sync-context
│     → 注入到同步軌，可能觸發新 round-table
│
├─ 完成 / 中止 focus
│  └─ /focus-end
│
└─ 想暫時用其他角色視角思考
   └─ /lens [role]   ← 個人軌專用
```

---

## ⚠️ 三大常見陷阱

### 陷阱 1：個人軌靜默修改禁改清單
**症狀**：在自己的 Claude session 中改了 ARCHITECTURE.md，但沒走 design-review。
**Hook 會擋**：`sync-guard.js` 偵測到 active_sync_session = null + 修改禁改清單 → 阻擋。
**正確做法**：先在 Facilitator 那邊 `/design-review`，APPROVED 後再改。

### 陷阱 2：Round Table 中先說的人 anchor 後說的人
**症狀**：facilitator 順著時間順序問每個 agent，第一個說的意見影響後面的人。
**為什麼會發生**：人類傾向於認同先說的（confirmation bias）。
**正確做法**：本範本強制 Role agents **並行執行**而非順序。Facilitator 等所有 agent 都輸出後才開始收斂。

### 陷阱 3：容量🔴 仍排同步議題
**症狀**：Bob 已經超載，但下一場 round-table 的衍生 spike 又指派給他。
**Hook 會警告**：people-ops agent 在 round-table 提案時會主動標記。
**正確做法**：聽 people-ops 的，要嘛換人，要嘛先重排 Bob 的既有任務。

---

## 📅 一週的典型節奏（建議）

| 時間 | 活動 |
|---|---|
| 週一早 | Facilitator 跑 `/weekly-sync` |
| 週一 / 週三 / 週五 | 同步窗（依議題決定哪個） |
| 其餘時間 | 個人軌深度工作 |
| 週五晚 | 若有版本發版：`/integration` → `/release-cut` → `/team-retro` |

---

## 🧭 Role Agent 與 Lens 的差異

| | 單人工作室端 (lens) | 公司團隊同步工作端 (role agent) |
|---|---|---|
| 哲學 | 一個人切換腦袋 | 多個專業同步並行 |
| context | 共享（切換要儀式） | 各 agent 獨立 |
| 主流程 | LENS_SWITCH ritual | Round Table 並行收斂 |

**個人軌**仍可用 `/lens [role]`（沿用單人工作室端的儀式）。
**同步軌**不用切換，因為 Role agents 並行。

---

## ❓ FAQ

**Q：team.scale 從 small 升到 medium 怎麼遷移？**
A：執行 `/team-kickoff` 重跑。STATE.json 會保留現有成員，新增 tech-lead/design-lead/qa 三個 agent。

**Q：medium mode 下 engineer agent 還會被叫嗎？**
A：會被 tech-lead 取代直接出場。但個人軌仍可用 `/lens engineer`。

**Q：Round Table 一定要 9 個 agent 全到嗎？**
A：不一定。Facilitator 可以排除明顯不相關的（如純技術選型不需要 product）。但保留 people-ops 是好習慣（容量視角）。

**Q：成員的 Claude session 跟 Facilitator 的 Claude session 怎麼同步？**
A：透過 git。所有 context/ 與 knowledge/ 變動都 commit。成員的個人軌讀同一份 sync-context.md。

**Q：critic 在 mob 中跑出 CHANGES_REQUIRED，要怎麼處理？**
A：在 mob 內修，不能 mob end。critic 是紅線二，不可繞過。

**Q：可以同時開兩場 round-table 嗎？**
A：不可以。同時間最多一場同步 session，避免脈絡切割。其他議題進 sync_queue 排隊。

---

## 🔗 進階閱讀

- **完整行為規範**：`CLAUDE.md`
- **Subagent 詳細協議**：`knowledge/AGENTS.md`
- **設計緣由**：`wiki/概念/專案管理與協作/公司團隊同步工作端AI協作系統.md`
- **與單人工作室端的差異**：`knowledge/CHANGELOG.md` v1.0 區塊
- **採納來源各端**：`wiki/概念/專案管理與協作/{單人工作室|工程師|PM|產品|SRE|HTML設計師|HR|PMO}端AI協作系統.md`

---

## 🚀 真的就這樣？

對。剩下的 Claude 會邊跑邊提醒。

去跑 `/team-kickoff` 吧。
