# Design Review: design token 重建 — Phase 1: foundation（v1）

DR-ID：DR-007
日期：2026-05-04 16:30（Emma 提交）→ 17:00 各 agent 完成審查
提案者：Emma
受影響角色：tech-lead, sre, qa, design-lead, pm
qa agent 自動加入：是（medium mode）
狀態：**blocked**（v1 結果）

---

## 問題

當前 design token 結構為「semantic-only」，無 primitive 層。痛點：
- dark mode 即將上線，30+ semantic token 各自要寫一份 dark variant
- 設計師加新顏色時無系統規則
- 工程師在 dark mode prototype 中發現結構難擴充

來源 round-table：knowledge/round-tables/2026-05-04_重建-design-token-系統.md

## 方案（Phase 1: Foundation）

### 新增
- `tokens/primitive.css`：完整 primitive 色階（gray-50…gray-900、blue-50…blue-900 等共 8 色 × 10 階 = 80 token）
- 同步 spacing、radius、shadow、font 的 primitive 層

### 改寫
- `tokens/semantic.css`：原本 `--color-primary: #2563EB` 改為 `--color-primary: var(--blue-600)`
- 約 30 個 semantic token 全部改為引用 primitive

### 不動
- 既有 30+ 元件的程式碼（Phase 2/3 才動，由 codemod 自動化）
- ARCHITECTURE.md 的「設計系統」章節僅修「Token Architecture」段，其餘不動

### 工具
- `scripts/migrate-token.mjs`（codemod）：把元件中的硬編碼色值與舊 semantic 用法批次替換

## 影響範圍
- 檔案：
  - 新增：`tokens/primitive.css`、`scripts/migrate-token.mjs`
  - 改寫：`tokens/semantic.css`、`knowledge/ARCHITECTURE.md` (Token Architecture 段)
  - 既有元件：**不動**（v1 階段）
- 模組：design-system 模組 root 變動，但 import API 不變
- 既有功能：理論上 0 影響（semantic token 名稱不變）

## Acceptance Criteria
- [ ] AC1：新增 primitive.css 含 8 色 × 10 階
- [ ] AC2：改寫 semantic.css 全部引用 primitive
- [ ] AC3：codemod 腳本通過 5 個元件樣本測試
- [ ] AC4：visual regression（chromatic）跑 30+ 元件，diff = 0
- [ ] AC5：ARCHITECTURE.md 「Token Architecture」段更新

## 回滾計畫
- 一鍵回滾：git revert 該 commit
- CSS 回滾後，CDN cache purge 指令：`./scripts/purge-cdn.sh tokens`
- 預期回滾後 5 分鐘內全用戶看到舊樣式

## 監測計畫
- chromatic snapshot diff 全 0
- 部署後 24 小時觀測：CDN cache hit 率、頁面 LCP、CLS

---

## 評審結果（v1）

### tech-lead — Verdict: **APPROVED**（with conditions）

```
=== DESIGN-REVIEW VERDICT: tech-lead @ 17:02 ===
DR: DR-007
Verdict: APPROVED

組內共識:
  - Chen: APPROVED — codemod 腳本草稿 chen 已寫一半，可整合
  - David: 中性（不直接受影響）
  - Alex: APPROVED

Items:
  - tokens/primitive.css 結構符合 PRINCIPLES.md #4「設計系統一致性」
  - codemod 是好決策（避免人手 grep 出錯）

Reviewer assignment:
  - frontend 部分：Chen
  - codemod 驗證：Chen + Alex pair
=== END ===
```

### design-lead — Verdict: **APPROVED**

```
=== DESIGN-REVIEW VERDICT: design-lead @ 17:03 ===
DR: DR-007
Verdict: APPROVED

組內共識:
  - Emma（自身）: APPROVED — 是提案
  - Fang: 中性（本 sprint 不涉入，sprint-19 才介入）

Items:
  - 命名遵循 Radix Colors 慣例
  - dark variant 預留結構正確
=== END ===
```

### pm — Verdict: **CONCERNS**

```
=== DESIGN-REVIEW VERDICT: pm @ 17:05 ===
DR: DR-007
Verdict: CONCERNS

Items:
  - 影響里程碑 M3：原排程已用 5 天 buffer，新增 12h 會吃掉剩餘 buffer 約 1.5 天
    若 Phase 1 之外又冒出 issue，M3 將延
  - 沒有列出「audit log Phase 2」是否仍能 5/15 上線的明確承諾
  - Bella 已 review 客戶 B2B 合約 §4.2：條款限制是「視覺一致性必須在公告維護窗外保持」
    本次部署若不在維護窗就是違約
=== END ===
```

### qa — Verdict: **CONCERNS**

```
=== DESIGN-REVIEW VERDICT: qa @ 17:06 ===
DR: DR-007
Verdict: CONCERNS

Items:
  - AC4 visual regression 提到 chromatic 但沒指定 baseline 比對策略
  - 缺 e2e 測試覆蓋「使用者登入後看到首頁的 5 個關鍵畫面」（最常見的 cache 過渡破綻處）
  - 邊界 checklist 只提 5 項，缺：列印樣式、a11y 高對比模式、客戶自訂 brand color

提案者回應建議：
  - 在 AC4 補上「baseline 取自 main 分支 5/3 commit」
  - 新增 AC6: 5 個關鍵畫面 e2e 通過
  - 在「邊界案例」章節補完 8 項 checklist
=== END ===
```

### sre — Verdict: **🚫 BLOCKS**

```
=== DESIGN-REVIEW VERDICT: sre @ 17:08 ===
DR: DR-007
Verdict: BLOCKS

Items:
  1. ❌ tokens/semantic.css 改寫會讓 CSS bundle 全部失效，CDN cache 過渡期間（30 分鐘）
     使用者會看到「混合樣式」。客戶 B2B 合約 §4.2 直接違約風險。
     (file: tokens/semantic.css)
  2. ❌ 沒有 service worker 升級計畫。當前 sw 對 CSS 是 cache-first，沒有
     stale-while-revalidate，無法在使用者瀏覽器層平滑切換。
     (file: 缺 — 需新增 sw upgrade plan 章節)
  3. ❌ 「回滾計畫」說 git revert + cache purge，但實際情況：
     - cache purge 後 origin 仍是 v1 → 需先 revert deploy 再 purge
     - 步驟順序錯，會放大事件
     (file: 「回滾計畫」章節順序錯誤)
  4. ❌ 沒有 canary 計畫。我已在 round-table 提過 — 但這份 DR 沒寫入。
  5. ❌ Greg 估 service worker 升級需 6h（已回報 5/5 中午），但本 DR
     沒把 sw 升級納入 Phase 1 範圍

Required Changes (for re-review):
  1. 把 service worker stale-while-revalidate 升級納入 Phase 1 範圍
     (預期工時 +6h，但 Phase 1 仍可在 sprint 內完成)
  2. 新增 canary 階段：staging 跑 3 天 + 內部 dogfood 1 天
  3. 修正回滾順序：(1) 先 revert deploy (2) 再 cache purge (3) 再驗證
  4. 加上「客戶 B2B 合約 §4.2 維護窗對齊」段，說明部署窗安排
  5. 補 runbook 連結（暫時可空，但要列出「即將建立」)
=== END ===
```

---

## 最終結論（v1）

- [ ] 全 APPROVED → 進入實作
- [ ] 有 CONCERNS（已回應）→ 進入實作
- [x] **🚫 有 BLOCKS（未解）→ 不可實作**

提案者必須處理 sre 的 5 項 BLOCKS、回應 pm 與 qa 的 CONCERNS，然後 `/design-review` 重跑。

關閉日期：（v1 未通過，待 v2）
寫入 design-review-board.md：🟥 BLOCKED

---

## 寫入 design-review-board.md

```
🟥 BLOCKED（必須處理）
### DR-007 | design token 重建 — Phase 1: foundation
- **狀態**: blocked
- **提案者**: Emma
- **建立**: 2026-05-04
- **影響角色**: tech-lead, sre, qa, design-lead, pm
- **檔案**: knowledge/design-reviews/2026-05-04_重建-design-token-系統-DR-007.md
- **評審進度**:
  - [x] tech-lead — APPROVED
  - [x] design-lead — APPROVED
  - [x] pm — CONCERNS（待提案者回應）
  - [x] qa — CONCERNS（待提案者回應）
  - [x] sre — 🚫 BLOCKS（5 項，待提案者修正）
- **Blocker**: sre 的 5 項要求需先全部處理
```

---

## log

```
2026-05-04 16:30 | DESIGN-REVIEW | Emma | DR-007 v1 提交
2026-05-04 17:08 | DESIGN-REVIEW | sre | DR-007 v1 BLOCKS（5 items）
2026-05-04 17:30 | DESIGN-REVIEW | facilitator | DR-007 v1 結果整合：必須 rev2
```

---

## Emma 的反應（真人）

> "好，sre 的 5 點都合理。我之前沒把 service worker 一起想進來。今天先收工，明天早上 rev2 提交。"

→ 進入下一個檔案 `04_T3_design-review_v2.md`
