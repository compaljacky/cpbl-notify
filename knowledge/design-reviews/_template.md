# Design Review: [提案名稱]

DR-ID：DR-XXX
日期：YYYY-MM-DD
提案者：[name]
受影響角色：[engineer, sre, designer, ...]
qa agent 自動加入：是（medium mode）/ 否（small mode）
狀態：pending / in-review / approved / blocked

---

## 問題
（要解決什麼？為何這個 review 需要存在？）

## 方案
（包含關鍵設計決策、技術選型理由、與現有架構的關係）

## 影響範圍
- 檔案：
- 模組：
- 既有功能：
- 對其他軌道（個人軌正在做的事）的影響：

## Acceptance Criteria
- [ ] AC1
- [ ] AC2
- [ ] AC3

## 回滾計畫
（若新方案上線後發現嚴重問題，如何回滾？）

## 監測計畫
（上線後要看什麼指標確認方案有效？）

---

## 評審結果

### [role1] — Verdict: APPROVED / CONCERNS / BLOCKS
- Items（路徑+行號的具體意見）：
  - `src/foo.ts L42`：...
  - `migrations/0042_xxx.sql`：...
- Required Changes（若 BLOCKS）：
  1. ...
- 提案者回應：
  - 接受並修正：[commit hash]
  - 解釋為何不採納：

### [role2] — Verdict: ...
（同上格式）

---

## 最終結論

- [ ] 全 APPROVED → 進入實作
- [ ] 有 CONCERNS（已回應）→ 進入實作
- [ ] 有 BLOCKS（未解）→ 不可實作

關閉日期：YYYY-MM-DD
寫入 design-review-board.md：✅ Approved
寫入 decision-log.md：是

---

## 連結
- 來源 round-table：knowledge/round-tables/YYYY-MM-DD_xxx.md（若有）
- 衍生 ADR：knowledge/decisions/ADR-XXX-xxx.md（若有）
- 對應實作 focus：FOCUS-XXX（個人軌）or mob session（群體開發）
