# Design Review: design token 重建 — Phase 1: foundation（v2）

DR-ID：DR-007（rev2）
日期：2026-05-05 09:00（Emma 提交 v2）→ 09:45 各 agent 完成審查
提案者：Emma
受影響角色：tech-lead, sre, qa, design-lead, pm
狀態：**approved**

---

## v1 → v2 變動摘要（diff）

| 區塊 | v1 | v2 |
|---|---|---|
| 範圍 | foundation only | foundation + service worker stale-while-revalidate 升級 |
| AC | 5 條 | 7 條（+ AC6 e2e、AC7 sw 升級） |
| 部署策略 | 一次性 | canary（staging 3 天 + 內部 dogfood 1 天 → prod）|
| 回滾計畫 | 順序錯 | 順序修正：(1) revert deploy (2) 等 sw 對齊 (3) cache purge (4) 驗證 |
| 客戶溝通 | 無 | 加段：對齊 5/14 維護窗、提前 5 天通知客戶 B2B |
| 邊界 checklist | 5 項 | 8 項（+ 列印樣式、a11y 高對比、客戶自訂 brand color） |

---

## 修訂後完整內容（精簡）

### Acceptance Criteria（v2）
- [ ] AC1：新增 primitive.css 含 8 色 × 10 階
- [ ] AC2：改寫 semantic.css 全部引用 primitive
- [ ] AC3：codemod 腳本通過 5 個元件樣本測試
- [ ] AC4：visual regression（chromatic）跑 30+ 元件，diff = 0（baseline = main 5/3 commit）
- [ ] AC5：ARCHITECTURE.md 「Token Architecture」段更新
- [ ] **AC6（新）**：5 個關鍵畫面 e2e 測試通過（login, dashboard, report, setting, billing）
- [ ] **AC7（新）**：service worker stale-while-revalidate 升級上線

### 部署策略（新章節）
1. PR merge 到 main：自動部署 staging
2. staging 跑 3 個工作天，含 chromatic + e2e
3. 內部 dogfood 1 天（公司全員當客戶用）
4. **5/14 對外維護窗**（19:00–20:00 GMT+8，已對齊客戶 B2B 合約 §4.2）
5. 部署 prod
6. 部署後 24 小時觀察期

### 回滾計畫（v2 修正）
1. （順序：先 revert deploy）`kubectl rollout undo deployment/web -n prod`
2. （次序：等 sw 對齊）等 sw stale-while-revalidate 把舊 CSS 同步進使用者瀏覽器（≤ 5 min）
3. （第三：cache purge）`./scripts/purge-cdn.sh tokens`
4. （最後：驗證）抽樣 5 個客戶 IP 確認看到舊樣式

### 邊界 checklist（v2 補完）
- [x] 客戶自訂 brand color
- [x] 內嵌 iframe 第三方元件（slack 整合）
- [x] 列印樣式
- [x] 高對比模式 a11y
- [x] 行動瀏覽器 Safari iOS 17 cache 行為
- [x] WebView in 客戶 native app（5 家客戶用）
- [x] LCP / CLS Web Vital 對 SLO 影響
- [x] 多語言（繁中/英文/日文）排版

---

## 評審結果（v2）

### sre — Verdict: **✅ APPROVED**

```
=== DESIGN-REVIEW VERDICT: sre @ 09:32 ===
DR: DR-007 (v2)
Verdict: APPROVED

Items:
  - 5 項 BLOCKS 全部處理 ✅
  - service worker 升級納入範圍 ✅
  - canary 階段清楚 ✅
  - 回滾順序修正（先 revert 後 purge）✅
  - 客戶維護窗對齊 5/14 19:00 ✅
  - runbook 待 deployment 前完成（已加入 AC7 完成標準）

備註：service worker 升級需 6h，請 Chen 與我配對
=== END ===
```

### qa — Verdict: **✅ APPROVED**

```
=== DESIGN-REVIEW VERDICT: qa @ 09:34 ===
DR: DR-007 (v2)
Verdict: APPROVED

Items:
  - AC6 加入 e2e 5 個關鍵畫面 ✅
  - 邊界 checklist 完整 ✅
  - chromatic baseline 明確 ✅

備註：chromatic 月費 $149 已由 PM 確認預算
=== END ===
```

### pm — Verdict: **✅ APPROVED**

```
=== DESIGN-REVIEW VERDICT: pm @ 09:35 ===
DR: DR-007 (v2)
Verdict: APPROVED

Items:
  - 5/14 維護窗對齊客戶合約 §4.2 ✅
  - audit log Phase 2 仍能 5/15 上線（split 後 sprint-18 容量足夠）✅

備註：我會在 5/9 寄客戶 B2B 維護窗預告信
=== END ===
```

### tech-lead — Verdict: **✅ APPROVED（已通過 v1，v2 維持）**

```
=== DESIGN-REVIEW VERDICT: tech-lead @ 09:30 ===
DR: DR-007 (v2)
Verdict: APPROVED (carried from v1)
=== END ===
```

### design-lead — Verdict: **✅ APPROVED（已通過 v1，v2 維持）**

```
=== DESIGN-REVIEW VERDICT: design-lead @ 09:31 ===
DR: DR-007 (v2)
Verdict: APPROVED (carried from v1)
=== END ===
```

---

## 最終結論（v2）

- [x] **全 APPROVED → 進入實作** ✅
- [ ] 有 CONCERNS
- [ ] 有 BLOCKS

關閉日期：2026-05-05 09:45
寫入 design-review-board.md：🟩 已通過
寫入 decision-log.md：是

---

## 寫入 design-review-board.md（更新）

```
🟩 已通過（本週）
### DR-007 | design token 重建 — Phase 1: foundation（v2）
- **狀態**: approved
- **提案者**: Emma
- **建立**: 2026-05-04 / **rev2**: 2026-05-05
- **影響角色**: tech-lead, sre, qa, design-lead, pm
- **檔案**: knowledge/design-reviews/2026-05-04_重建-design-token-系統-DR-007.md
- **評審進度**:
  - [x] tech-lead — APPROVED
  - [x] design-lead — APPROVED
  - [x] pm — APPROVED (was CONCERNS)
  - [x] qa — APPROVED (was CONCERNS)
  - [x] sre — APPROVED (was 🚫 BLOCKS)
- **後續**:
  - 對應實作：mob session 2026-05-08 + Chen FOCUS-012
```

## 寫入 decision-log.md

```
2026-05-05 | DR-007「design token 重建 Phase 1」APPROVED | 來源: design-review (v2)
2026-05-05 | service worker 升級到 stale-while-revalidate | 來源: DR-007 條件 | ADR 待建
```

## log

```
2026-05-05 09:00 | DESIGN-REVIEW | Emma | DR-007 v2 提交
2026-05-05 09:45 | DESIGN-REVIEW | facilitator | DR-007 v2 全 APPROVED ✅
2026-05-05 10:00 | ADR | Alex | ADR-014「Dual-tier design token architecture」建立（連結 DR-007 + round-table 2026-05-04）
```

---

## ✅ 進入下一階段

- mob session 排定 2026-05-08（週四）— Alex + Chen + Emma
- Chen 的 FOCUS-012「primitive.css 與 codemod 腳本」開卡

→ 進入下一個檔案 `05_T4_mob-session.md`
