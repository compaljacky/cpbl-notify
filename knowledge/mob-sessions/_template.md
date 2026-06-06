# Mob Session: [任務名稱]

日期：YYYY-MM-DD HH:MM
任務 ID：MOB-XXX
觸發原因：（為何用 mob 而非 individual focus？）
- [ ] 任務碰到禁改清單
- [ ] 涉及核心架構變動
- [ ] 成敗影響整個團隊

參與者（真人）：
- Driver（開始）：[name]
- Navigators：[name1, name2, ...]

依據 sync 來源：design-review DR-XXX / round-table YYYY-MM-DD

---

## 會前準備
- [ ] 共享環境已就緒（VSCode Live Share / 螢幕分享）
- [ ] 必讀文件已分發
- [ ] AC 清楚（從 design-review 帶入）

---

## 進行紀錄（每 25 分鐘輪換 Driver）

### 第 1 段（HH:MM – HH:MM）— Driver: [name1]
- 完成：
- 決策：（重大決策列出來，會 append 到 decision-log.md）
- Blocker：

### 第 2 段（HH:MM – HH:MM）— Driver: [name2]
（同上格式）

### ...

---

## Critic 結果

由 critic subagent 審查（強制）：
- Verdict: APPROVED / CHANGES_REQUIRED
- Items: 見 `context/critic-report.md`

---

## 寫入決策日誌

- [ ] 重大決策已寫入 `context/decision-log.md`
- [ ] ARCHITECTURE.md 變動已更新（若有）
- [ ] PRINCIPLES.md 新增 Lessons Learned（若有）

---

## 心得（可選）

- 哪一段最有效率？
- 哪一段卡住？為什麼？
- 下次 mob 要如何改進？
