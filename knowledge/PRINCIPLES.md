# 團隊工程原則 + Lessons Learned

> 團隊共同遵循的原則。Lessons Learned 在每場 retro 後 append。
> 任何同步軌決策遇到原則衝突 → 必須在 round-table 明確討論並更新原則或例外清單。

---

## 工程原則（團隊共筆）

1. **明確的 No 比模糊的 Yes 有價值** — 任何同步議題都要強迫產出明確結論
2. **在最早期讓所有專業同步介入** — Round Table 不是 PM 寫完才開
3. **設計評審不能跳過** — 即使是「小改動」，跨 ≥ 2 職能就要 review
4. **個人軌的依據必須來自同步軌** — 不是個人想做就做
5. **容量數字不是建議，是上限** — 紅燈時砍 scope，不砍睡眠
6. **自動化工具必須提供 confidence 維度**（v1.1 新增）— codemod、linter、migration script 對每個變動都要分「auto-applied / review-needed / refused」三類。一律警告 = 等於沒警告
7. **AI 生成的內容必過 critic**（v2.1 新增）— Claude / Cursor / Copilot 等 AI 產出的程式碼、設計、文件，commit 前都必須跑 critic subagent。AI 解了實作瓶頸，品質瓶頸轉移到 review；critic 是 review 的第一道防線。例外（typo / metadata / 純 reformat）需在 commit message 註明 `[no-critic: reason]`。
8. **每週至少一次 release**（v2.1 新增）— 累積一週的工作不該無限延後。週上版是時間驅動而非事件驅動：「這週做多少就上多少」，未完成的繼續到下週。連續 2 週無法上 weekly release → 強制 round-table 討論結構性原因。

（本範本初始 8 條，團隊在 T0-5 應補到 ≥ 10 條）

---

## Lessons Learned（append-only）

格式：
```
YYYY-MM-DD | [類別: 同步軌/個人軌/部署/設計/容量] | 問題：... → 解決：... → 預防：...
```

2026-05-15 | 同步軌 | 問題：design-review v1 有 5 個 BLOCKS 由提案者一人承擔 14 小時 → 解決：v1.1 在 `/design-review` 加入「BLOCKS ≥ 3 自動建議 mini-sync rescue」 → 預防：提案者孤立修正
2026-05-15 | 個人軌 | 問題：codemod 對 inline hex 一律警告，造成 30 分鐘人工 review → 解決：加 confidence score 分自動/手動 → 預防：v1.1 PRINCIPLES #6「自動化工具必須提供 confidence 維度」
2026-05-15 | 同步軌 | 問題：客戶合約限制（B2B §4.2）在 design-review v1 才被發現 → 解決：rev2 加入維護窗對齊 → 預防：pm role agent 必讀清單應加合約 scan（v1.2 候選，v1.1 暫不動 agent definition）
