# Sprint-18 團隊回顧

日期：2026-05-15 16:00（v1.18.0 發版後 24h）
類型：sprint-retro
主持人：Alex
參與真人成員：全員 8 人

依據：
- v1.18.0 已於 5/14 19:30 完成 prod 部署、24h 觀察期通過
- DR-007 Phase 1 已上線
- audit log Phase 2 仍如期 5/15 上線

---

## 📦 交付

- v1.18.0 發版（5/14）
- DR-007 Phase 1: design token foundation
- audit log Phase 2
- service worker stale-while-revalidate 升級
- ADR-014 Dual-tier design token architecture（連結 DR-007）
- ADR-015 OKLCH + hex fallback（連結 MOB-003）

---

## 🎤 同步軌統計

- Round Table 場數：**2** 場
  - 5/4 重建 design token 系統 ⭐（核心議題）
  - 5/8 v1.18.0 部署窗對齊（小議題）
- Design Review 場數：**3** 場（APPROVED 2 / BLOCKS 1 → 修正後 APPROVED）
  - DR-007 design token 重建（v1 BLOCKS → v2 APPROVED）
  - DR-008 audit log Phase 2（一次過 APPROVED）
  - DR-009 service worker SWR 升級（一次過 APPROVED）
- Mob session 場數：**1** 場（MOB-003 design token foundation）
- Lightweight sync：**3** 次（含 5/13 <AuditEntry> 處理方式）

---

## ⚡ 容量利用

- 整體：**245/250h（98%）** — 🟡 略高（接近預算上限）
- 個別最高：Chen 34/35h（97%）— 🟡
- 個別最低：Greg 18/30h（60%）— 🟢
- 中位數：Hanna 19/25h（76%）— 🟢
- 連續超載：無
- Fang 從 sprint 開始 90% 🟡 → sprint 結束 75% 🟢（Alex 把 token 工作排到 sprint-19，成功保護）

---

## ✅ 做對了什麼（Continue）

由全員 round-robin 收集：

- **Alex**：「Round Table 並行提案真的避免了我下意識先說 anchor 別人」
- **Bella**：「sre 在 v1 BLOCKS 那 5 點，全部都是合約風險，要是 v1 直接上會違約」
- **Chen**：「mob 的 25 分鐘輪換比想像中有效，特別是 OKLCH fallback 那段」
- **David**：「sync-context 回流讓我不必為小事跑 facilitator」
- **Emma**：「v1 → v2 的 BLOCKS 處理流程很清楚，我知道要修什麼」
- **Fang**：「people-ops agent 在 round-table 主動標我容量🟡，我才知道團隊有看到」
- **Greg**：「sre verdict 被認真對待，不是『SRE 又在擋』」
- **Hanna**：「medium mode 9 個 agent 都到場，沒有人被遺漏」

---

## ❌ 做不好什麼（Stop）

- **Alex**：「v1 → v2 之間有 14 小時，Emma 一個人扛 5 個 BLOCKS。下次有 BLOCKS 應該開臨時 mini-sync 一起想」
- **Chen**：「codemod 對 inline hex 警告，但我在 mob 後面元件遷移時還是花了時間 review。下次 codemod 應該分『安全自動轉』與『需 review』」
- **Emma**：「我在 v1 沒把 sre 的 round-table 警告寫進去，浪費了 v1 的時間」
- **David**：「audit log Phase 2 與 design token 並行有時間衝突，5/12 那天 staging 滿擠」
- **Bella**：「客戶 B2B §4.2 我也是 v1 才 review，應該在 round-table 前就準備好」

---

## 💡 下次想試什麼（Try）

- **Try 1（Emma）**：BLOCKS 多於 3 點時，自動觸發「mini-sync」（30 分鐘 facilitator + 提案者 + blocker agent 對應的真人）解決方案
  - → 寫入 `/round-table` skill 提案
- **Try 2（Chen）**：codemod 引入「confidence score」，分自動/手動兩類
- **Try 3（Bella）**：合約相關議題在 round-table 前由 pm agent 強制做「合約 scan」
- **Try 4（Alex）**：mob session 開始前 5 分鐘讓 navigator 把參考資料貼進 chat（caniuse, MDN）避免 mob 中查資料

---

## 📚 新增 Lessons Learned（append 到 PRINCIPLES.md）

```
2026-05-15 | 同步軌 | 問題：design-review v1 有 5 個 BLOCKS 由提案者一人承擔
           → 解決：14 小時內提交 v2 通過
           → 預防：BLOCKS ≥ 3 自動觸發 mini-sync（待寫入 /round-table skill）
2026-05-15 | 個人軌 | 問題：codemod 對 inline hex 一律警告，造成不必要 review 時間
           → 解決：加 confidence score 分自動/手動
           → 預防：未來 codemod 設計都要有 confidence 維度
2026-05-15 | 同步軌 | 問題：客戶合約限制（B2B §4.2）在 v1 才被發現
           → 解決：rev2 加入維護窗對齊
           → 預防：pm agent 必讀清單加入合約 scan 步驟
```

---

## 🤝 團隊健康

- 心理安全感（1–10 全員平均）：**8.4**
- 溝通頻寬（1–10 全員平均）：**8.0**（去 sprint 是 7.5，提升）
- 是否有人持續超載：無

people-ops（Hanna）補充：
> 「Fang 從 90% 降到 75% 是 sprint 中我最開心的事。代表機制有用。但 Chen 連續兩個 sprint 都接近 95%，下個 sprint 我們要主動安排他取消一個 OKR 承諾。」

---

## 🔄 衍生行動項目

由 Stop / Try 衍生，會在下次 sprint-19 round-table 討論落地：

- [ ] 在 `/round-table` skill 加「BLOCKS ≥ 3 自動觸發 mini-sync」邏輯（Alex）
- [ ] codemod confidence score 設計（Chen，spike 4h）
- [ ] pm agent 必讀清單加入「合約 scan」（Bella + Alex）
- [ ] sprint-19 主動為 Chen 砍一個 OKR（Hanna 在 1-1 與 Chen 討論）
- [ ] 下次 mob 開始前 5 分鐘參考資料貼上（Alex）

---

## 寫入紀錄

- 路徑：`knowledge/retros/sprint-retros/2026-05-15_sprint-18_retro.md`
- Lessons 同時 append 到 `knowledge/PRINCIPLES.md`
- 衍生行動寫入 `context/sync-context.md`「未決議的下次議題」區

## log

```
2026-05-15 16:00 | TEAM-RETRO | Alex | 期間: v1.18.0 / sprint-18 | 新增 lessons: 3
2026-05-15 17:30 | TEAM-RETRO | Alex | 結束（90 分鐘）
```
