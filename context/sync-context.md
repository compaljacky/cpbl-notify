# 同步軌共識 Context

> 跨個人軌共享的同步軌知識：決策、共識、blockers。
> 個人軌每次 SessionStart 都會載入此檔案最新內容。
> 由 `/round-table`、`/design-review`、`/mob`、`/sync-context` 寫入。

---

## 最近共識（Top 10，依時間倒序）

（尚無共識，待第一場 round-table 寫入）

---

## 結構（每個共識條目）

```markdown
### YYYY-MM-DD | [一句話決策]
- **來源**：round-table / design-review / mob — `knowledge/.../YYYY-MM-DD_xxx.md`
- **影響角色**：[role1, role2, ...]
- **決策內容**：
- **行動項目**：
  - [ ] [name] 負責 [事項] by [date]
- **回頭點（revisit）**：（若無則「永久決策」）
```

---

## Active Blockers（跨軌障礙物）

（尚無）

格式：
```markdown
### BLOCKER-XXX | [描述]
- **由誰阻礙**：[原因]
- **阻擋什麼**：[FOCUS-XXX / DR-XXX / ...]
- **解法候選**：
- **誰負責推進**：[name]
```

---

## 個人軌回流（Cross-track Insights）

從個人軌透過 `/sync-context` 注入的發現：

（尚無）

格式：
```markdown
### YYYY-MM-DD | [name] 在 FOCUS-XXX 中發現
- **發現**：
- **跨軌價值**：（為何要回流到同步軌）
- **建議行動**：（觸發 round-table / 更新 ARCHITECTURE / 等）
```
