# 團隊容量看板

> 每位成員本週時數投入燈號。
> 由 session_stop.py 自動 append；`/weekly-sync` 重置。
> SessionStart Hook 會把整體燈號顯示在儀錶板。

---

## 本週容量（YYYY-WW）

v2.1 起加入 **AI assist** 欄位追蹤 effective output。

| 成員 | 角色 | 本週上限 | 已用 | AI assist | % | 燈號 | 當前 focus |
|---|---|---|---|---|---|---|---|
| [範例-Alice] | engineer | 30 | 0 | 0 | 0 | 🟢 | （無） |

整體：0/30h（0%）— 🟢
AI assist 整體：0h（佔總工時 0%）

### 欄位定義
- **已用**：人坐在電腦前的真實時數（含 AI iteration、review、思考）
- **AI assist**：其中由 AI 主導產出的時段（人主要在 review/iteration）
- **比例**：AI assist / 已用，PM 看此判斷 effective output

---

## 燈號規則

| 燈號 | 條件 | 行為 |
|---|---|---|
| 🟢 綠 | < 80% | 正常 |
| 🟡 黃 | 80–100% | Claude 主動建議：「[成員] 容量已 X%，今日同步議題建議不再加派他」 |
| 🔴 紅 | ≥ 100% | Claude 主動詢問：「[成員] 已超支，要進 cooldown 嗎？要重排哪些任務？」 |
| ⚫ 連紅 | 連續 2 週 🔴 | 強制觸發 `/team-retro` 與 portfolio/roadmap 重排 |

---

## 本週時數記錄（append-only）

格式（v2.1）：
```
YYYY-MM-DD | [成員] | Xh total / Yh AI | track: sync/individual | branch: [branch] | 主要：[任務] | critic: approved/changes/not-run | sync 參與：[X 場 round-table / Y 場 design-review]
```

（尚無記錄）

---

## 連續紅燈追蹤

```
週次 | 整體燈號 | 連紅週數 | 個別紅燈成員
YYYY-WW | green | 0 | （無）
```
