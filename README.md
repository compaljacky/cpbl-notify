# 公司團隊同步工作端 v1.0

> Claude Code 範本：把單人工作室端「lens 切換」模型升級為多人團隊「Role agent 並行」模型，工作形式從階段交付改為同步討論 + 個人深度並行。

## 起手三步

1. 讀 [`QUICKSTART.md`](QUICKSTART.md) — 30 分鐘上手
2. 在 Claude 裡跑 `/team-kickoff`
3. 開始 `/round-table 團隊章程與工作節奏`

## 範本結構

```
公司團隊同步工作端/
├── README.md           ← 入口（你正在看）
├── QUICKSTART.md       ← 快速上手導覽
├── CLAUDE.md           ← 完整行為規範（每次 Session 自動載入）
├── .claude/
│   ├── agents/         ← 14 個 subagent（9 個 role + 5 個 task）
│   ├── skills/         ← 18 個 slash commands
│   ├── hooks/          ← 9 個 hooks
│   └── settings.json   ← Hook 註冊
├── context/            ← 即時工作記憶
│   ├── STATE.json                ← 團隊狀態（含 members、active_sync_session、capacity）
│   ├── current-sync.md           ← 當前同步 session
│   ├── sync-context.md           ← 跨軌共享共識
│   ├── individual-tracks.md      ← 各成員 focus 詳細
│   ├── capacity-board.md         ← 團隊容量看板
│   ├── decision-log.md           ← 本週決策
│   ├── design-review-board.md    ← 設計評審看板
│   └── ...
├── knowledge/          ← 長期記憶（append-only）
│   ├── round-tables/   ← 圓桌討論完整紀錄
│   ├── design-reviews/ ← 設計評審完整紀錄
│   ├── mob-sessions/   ← 群體開發紀錄
│   ├── decisions/      ← ADR
│   ├── retros/         ← 團隊回顧
│   ├── releases/       ← 版本紀錄
│   └── explorations/   ← 團隊版構思探索
├── raw/                ← 原始素材暫存
├── output/             ← 對外輸出（週報、release notes）
├── 工作流程指南/       ← 角色 × 任務 的逐步流程
│   ├── 設計更新流程.md ← 設計師如何改設計（Scope A/B/C/D）
│   └── Git 工作流程.md ← 分支策略、檔案 commit policy、衝突處理
├── 示範運行/           ← v1.0 模擬測試（深度 5 phase trace）
├── .gitignore          ← v2.0.1：個人 session 暫存等不入 repo 的檔案
└── .gitattributes      ← v2.0.1：individual-tracks 等用 union merge 避衝突
```

## 設計哲學

- **Round Table**：所有專業同步並行提案，取代「PM 寫完才丟給工程師」
- **Design Review**：受影響角色同步審查，APPROVED/CONCERNS/BLOCKS 三類
- **Mob**：關鍵實作群體開發、輪流 Driver
- **個人深度並行**：日常實作仍在各自軌道，不被同步綁死
- **容量同步可視**：每位成員的 WIP / 容量燈號全團隊可見
- **Role agent 並行**（取代單人工作室端的 lens 切換）：避免「先說 anchor 後說」

## 三條紅線

1. **重大決策必須走同步軌**（跨 ≥ 2 職能、影響 ≥ 1 週、變動 ARCHITECTURE/PRINCIPLES）
2. **設計評審不能跳過**
3. **團隊容量同步可視**

## 適用情境

✅ 3–15 人團隊，要打破階段交付、追求跨職能同步協作
✅ 有專屬 Facilitator（Tech Lead 或 PM）能主持同步軌
✅ 已有基本的個人軌工具（個別成員可同時用工程師端 / 設計師端 / 產品端）

❌ 單人開發（用 [單人工作室端](../單人工作室端/)）
❌ 純線性交付沒有意願改變協作模式

## 文件

- [QUICKSTART.md](QUICKSTART.md) — 快速上手
- [CLAUDE.md](CLAUDE.md) — 完整規範
- [knowledge/CHANGELOG.md](knowledge/CHANGELOG.md) — 版本演進
- 設計緣由：`wiki/概念/專案管理與協作/公司團隊同步工作端AI協作系統.md`

## 版本

v1.0（2026-05-02）— 首版發布
