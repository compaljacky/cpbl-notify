# Mob Session: design token foundation rebuild

日期：2026-05-08（週四）09:00–11:30
任務 ID：MOB-003
依據 sync 來源：DR-007（v2 approved 2026-05-05）

觸發原因：
- [x] 任務涉及核心架構變動（修改 ARCHITECTURE.md「Token Architecture」段）
- [ ] 任務碰到禁改清單 — 是的，但已 design-review APPROVED
- [x] 成敗影響整個團隊（後續 30+ 元件遷移都依賴此 foundation）

參與者（真人）：
- Driver（開始）：Chen
- Navigators：Alex（Tech Lead）、Emma（Design Lead）

## 會前準備
- [x] 共享環境已就緒（VSCode Live Share）
- [x] 必讀文件已分發（DR-007、ADR-014、Radix Colors reference）
- [x] AC 清楚（從 DR-007 帶入 7 條 AC）

---

## 進行紀錄（每 25 分鐘輪換 Driver）

### 第 1 段（09:00–09:25）— Driver: Chen

**完成**：
- 建立 `tokens/primitive.css` 骨架，填入灰階 10 階（gray-50…gray-900）
- 建立 `scripts/migrate-token.mjs` 主結構（讀檔 → AST 解析 → 替換 → 寫回）

**重大決策**：
- ✅ **採 OKLCH 色彩空間**（而非 HSL）— 業界往 OKLCH 走（Tailwind v4、Radix v3）
  - **append 到 decision-log.md**：「primitive 採 OKLCH」

**Blocker**：（無）

### 第 2 段（09:25–09:50）— Driver: Emma

**完成**：
- 填入剩餘 7 個色階：blue / green / red / yellow / purple / teal / orange
- 每色 10 階，皆用 OKLCH

**重大決策**：
- ✅ **brand color 不寫死，預留 `--brand-color-h`、`--brand-color-c` 兩個 CSS variable**
  - 支援 B2B 客戶 brand color 自訂（DR-007 邊界 checklist 第 4 項）
  - **append 到 decision-log.md**：「brand color 採 OKLCH 三變數動態」

**Blocker**：
- 🟡 OKLCH 在 Safari 16 之前不支援。當前 5% 流量還用舊 Safari。
  - 暫緩決策：請 Greg 在 navigator 角色提意見（雖然他不在會議）

### 第 3 段（09:50–10:15）— Driver: Alex

**完成**：
- 改寫 `tokens/semantic.css`：
  - `--color-primary` 從 `#2563EB` 改為 `var(--blue-600)`
  - 30 個 semantic token 全部改寫（用之前實驗的 codemod 雛型批次處理 → 1 分鐘完成）
- 加 OKLCH fallback：每個 semantic token 加 `@supports not (color: oklch(0% 0 0))` 區塊用 hex
  - 解決舊 Safari 問題（Emma 的 blocker）

**重大決策**：
- ✅ **OKLCH 採用，並加 hex fallback**（不阻擋 5% 舊 Safari 流量）
  - **append 到 decision-log.md**：「OKLCH + hex fallback 雙路徑」

**Blocker**：（無）

### 第 4 段（10:15–10:40）— Driver: Chen（輪回）

**完成**：
- 完成 `scripts/migrate-token.mjs` codemod
- 用 5 個樣本元件測試：Button, Input, Card, Modal, Toast
  - 4 個通過；Toast 失敗（用了 inline style 寫 `style="color:#FF0000"` 而非 CSS variable）
  - 修正 codemod：偵測 inline hex 並警告（不自動轉，因為可能是設計師故意）

**重大決策**：
- ✅ **codemod 對 inline hex 採「警告而非自動轉」**
  - **append 到 decision-log.md**：「inline hex 由 codemod 警告而非自動轉換」

**Blocker**：（無）

### 第 5 段（10:40–11:05）— Driver: Emma

**完成**：
- 更新 `knowledge/ARCHITECTURE.md` 的「Token Architecture」段：
  - 新增 dual-tier 圖（mermaid）
  - 列出命名慣例
  - 列出 brand color 自訂機制

**重大決策**：（無，文件描述既有決策）

**Blocker**：（無）

### 第 6 段（11:05–11:30）— Driver: Alex

**完成**：
- service worker stale-while-revalidate 升級實作
  - 約 80 行 JS 改動
  - 加入 `self.addEventListener('fetch', ...)` 對 CSS 採 SWR
- AC checklist 對照：
  - [x] AC1 primitive.css 8 色 × 10 階 ✅
  - [x] AC2 semantic.css 全引用 primitive ✅
  - [x] AC3 codemod 5 個樣本通過 ✅
  - [ ] AC4 chromatic 全 30+ 元件 → 部署 staging 後跑
  - [x] AC5 ARCHITECTURE.md 更新 ✅
  - [ ] AC6 e2e 5 個關鍵畫面 → staging 後跑
  - [x] AC7 service worker 升級實作 ✅（測試待 staging）

---

## Critic 結果（強制）

```
=== CRITIC REPORT @ 11:35 ===
Target: MOB-003 (DR-007 implementation)
Verdict: APPROVED with minor suggestions
Items:
  1. tokens/primitive.css L42–48: gray-500 對比度與 gray-400 太接近（僅 1.2:1），
     建議調 gray-500 OKLCH L 值從 0.55 → 0.50（severity: low）
  2. scripts/migrate-token.mjs L88: try/catch 太寬，建議分開 parse error 與 IO error
     (severity: low)
  3. service-worker.js L120: SWR 對未認證資源仍應加 max-age（severity: medium，建議在
     v1.18.1 hotfix 修，但不擋本次部署）

Security flag: 無
=== END ===
```

Chen 採納 #1 #2，立即修。#3 開 followup ticket（FOCUS-014）給 v1.18.1。

---

## 寫入決策日誌（本次 mob 4 個重大決策）

```
2026-05-08 | primitive 色階採 OKLCH 色彩空間 | 來源: mob MOB-003 | 後續: ADR-015
2026-05-08 | brand color 採 OKLCH 三變數動態 | 來源: mob MOB-003 | 後續: ADR-015
2026-05-08 | OKLCH 採 hex fallback 雙路徑（@supports）| 來源: mob MOB-003 | 後續: ADR-015
2026-05-08 | codemod 對 inline hex 警告而非自動轉 | 來源: mob MOB-003
```

## ARCHITECTURE.md 變動

「Token Architecture」段新增 dual-tier 圖，禁改清單仍涵蓋。

## PRINCIPLES.md 新增 Lessons

```
2026-05-08 | 同步軌/Mob | 問題：Toast 元件用 inline hex 規避 token 系統，導致 codemod 失敗
           → 解決：codemod 加警告而非自動轉
           → 預防：PR review 加 lint rule 偵測 inline color hex
```

---

## 心得

- **哪一段最有效率？** 第 3 段（Alex 用之前的 codemod 雛型 1 分鐘改 30 個 token）
- **哪一段卡住？** 第 2 段（OKLCH 相容性，但靠後續 fallback 解決，沒拖太久）
- **下次 mob 要如何改進？** 預先準備「相容性矩陣」table，避免在 mob 中查 caniuse.com

---

## 後續步驟

- staging 部署：5/9 09:00（觸發 chromatic + e2e）
- 內部 dogfood：5/12（週一）
- 客戶 B2B 維護窗：5/14 19:00
- prod 部署：5/14 19:00–20:00
- 24 小時觀察：5/15 全天

## log

```
2026-05-08 09:00 | MOB-START | Alex | MOB-003 design token foundation
2026-05-08 11:30 | MOB-END | Alex | MOB-003 完成、critic APPROVED with minor
2026-05-08 11:30 | DECISION | Alex | 4 個重大決策已寫入 decision-log
```
