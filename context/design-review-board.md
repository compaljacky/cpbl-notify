# 設計評審看板

> 待評審 / 評審中 / 已通過 的設計提案。
> 由 `/design-review` 寫入；提案 close 後封存到 `knowledge/design-reviews/`。

---

## 看板狀態

### 🟦 待提交
（尚無）

### 🟨 評審中
（尚無）

### 🟩 已通過（本週）
（尚無）

### 🟥 BLOCKED（必須處理）
（尚無）

---

## 條目格式

```markdown
### DR-XXX | [提案名稱]
- **狀態**：pending / in-review / approved / blocked
- **提案者**：[name]
- **建立**：YYYY-MM-DD
- **影響角色**：[engineer, sre, ...]
- **檔案連結**：`knowledge/design-reviews/YYYY-MM-DD_xxx.md`
- **評審進度**：
  - [x] engineer — APPROVED
  - [ ] sre — pending
  - [ ] designer — CONCERNS（已回應）
- **Blocker（若 blocked）**：
```

---

## 規則
- 任何「視為完成」的提案進入實作前必跑 design-review（紅線二）
- 有 BLOCKS 未解 → 不能合併到主分支
- design-review 的影響角色由提案者宣告，但 qa agent 自動加入（medium mode）
