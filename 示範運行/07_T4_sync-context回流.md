# Sync-Context 回流範例：David 在 FOCUS-010 中發現硬編碼問題

> 此檔示範**個人軌 → 同步軌**的回流：個人成員在自己的 focus 中發現對團隊有價值的事，透過 `/sync-context` 注入。

---

## 背景

David 從 5/1 起在做 FOCUS-010「audit log table migration」。他主要動 backend，理論上與 design token 重建無關。

但 5/11 下午，他在審查 audit log UI（前端要顯示 audit 列表）時，意外發現：
- audit log UI 元件 `<AuditEntry>` 用了 7 處 inline hex 色值（`#3B82F6`、`#EF4444` 等）
- 這些不是設計師故意的「展示色」，是 2 年前快速 ship 時硬塞的
- 如果不處理，DR-007 Phase 2 遷移時 codemod 會跳警告，Chen 手動處理會花很多時間

David 想：「這個是個人軌發現，但對團隊有價值。我該怎麼處理？」

→ 走 `/sync-context`

---

## 執行 trace

```
[David 在自己 Claude session]
$ /sync-context

[系統]
請描述你的發現：

[David 輸入]
我在 FOCUS-010 audit log migration 中發現 <AuditEntry> 元件有 7 處 inline hex
色值（檔案：src/components/AuditEntry/index.tsx）。這不是設計師故意的，是
2 年前快速 ship 時硬塞的。

跨軌價值：
- DR-007 Phase 2 元件遷移時，codemod 會跳警告
- Chen 在批次跑時可能誤以為是「設計故意」而保留
- 整體會多花 30 分鐘人工 review

建議行動：
- 在 sync-context.md 標記，讓 Phase 2 遷移時直接知道這個元件要全自動處理
- 或我順手在本次 audit log migration 一起改（會多 1h）

[系統 詢問]
建議行動是「sync-context 標記」還是「順手改」？

[David]
我希望由團隊決定。優先看 Chen 與 Emma 意見。

[系統]
✅ 寫入 context/sync-context.md「個人軌回流」區
✅ 評估「是否觸發新 round-table」：
   - 影響範圍：1 個元件、1h 工作量 → 不到 round-table 門檻（跨 ≥ 2 職能、影響 ≥ 1 週）
   - 評估結果：不觸發 round-table，但通知相關 stakeholder
✅ 通知：建立 sync_queue 條目「<AuditEntry> 硬編碼處理方式」由 Chen + Emma 決定
✅ Facilitator Alex 下次同步軌 SessionStart 會看到
```

---

## 寫入 sync-context.md

```markdown
### 2026-05-11 14:30 | David 在 FOCUS-010 中發現
- **發現**：<AuditEntry> 元件有 7 處 inline hex 色值（src/components/AuditEntry/index.tsx）
   非設計師故意，是 2 年前快速 ship 時硬塞的
- **跨軌價值**：DR-007 Phase 2 遷移時，codemod 會跳警告，Chen 手動 review 會花 30 分鐘
- **建議行動**：
  - 選項 A：David 順手改（+ 1h，sprint-18 內完成）
  - 選項 B：Phase 2 由 Chen 統一處理（會多 30 分鐘人手 review）
- **狀態**：待 Chen + Emma 在下次同步窗決定（5/13 週三）
```

## 寫入 sync_queue（STATE.json）

```json
"sync_queue": [
  {
    "topic": "<AuditEntry> 硬編碼處理方式（David 5/11 發現）",
    "proposer": "David",
    "submitted_at": "2026-05-11 14:30",
    "wait_days": 0,
    "scope": "lightweight"  // 不需 round-table，由相關 stakeholder 決定
  }
]
```

## log

```
2026-05-11 14:30 | SYNC-CONTEXT | David | 發現 <AuditEntry> 7 處 inline hex | 建議: 待 Chen+Emma 決定
```

---

## 5/13 週三同步窗：Chen + Emma 看到後決定

Alex 開 Claude session，儀錶板顯示：

```
🚨 主動提醒：
  - sync_queue 有新發現「<AuditEntry> 硬編碼處理方式」由 David 5/11 注入
    → 建議今日窗中 5 分鐘決定
```

5/13 09:15，Alex Slack ping Chen + Emma 各自 emoji 投票：
- Chen 🟦 選項 A（David 順手改）— "David 你那邊 backend migration 這幾天有空嗎？"
- Emma 🟦 選項 A — "我希望進 Phase 2 時這個元件已經乾淨"
- David 🟦 OK — "我可以接，多排 1h 在 5/13 下午"

5 分鐘決定完。寫入 decision-log.md：

```
2026-05-13 09:20 | <AuditEntry> 硬編碼由 David 順手改 | 來源: lightweight sync (queue)
```

David 開 FOCUS-013（在 FOCUS-010 完成後）：

```
2026-05-13 13:00 | FOCUS-START | David | FOCUS-013 <AuditEntry> 7 處 inline hex 替換為 token
2026-05-13 14:00 | FOCUS-END | David | FOCUS-013 completed (1h)
```

---

## 此案例驗證的設計

| 設計 | 是否如預期運作 |
|---|---|
| 雙軌不互鎖：個人軌可主動回流同步軌 | ✅ David 個人發現 → 結構化注入 |
| 不是所有 sync 都需要 round-table：lightweight sync 機制 | ✅ 1 個元件、1h 工作量 → 5 分鐘 emoji 投票 |
| 決策仍寫入 decision-log（即使是 lightweight） | ✅ 留下歷史 |
| Facilitator 看得見：儀錶板自動標記 | ✅ Alex 5/13 開 session 立刻看到 |

---

## ⚠️ 此案例曝露的設計弱點

> 模擬曝露的問題，會在最終結論檔案彙整：

1. **「lightweight sync」機制目前沒有正式 skill** — 我們臨時用 emoji 投票 + 直接寫 decision-log，但範本沒有 `/lightweight-sync` 或類似 skill
2. **sync_queue 的 scope 欄位是 ad-hoc 加上的** — STATE.json schema 沒有預定義 scope: lightweight / heavyweight 兩種
3. **個人軌透過 `/sync-context` 回流的判斷規則模糊** — David 自己判斷「不到 round-table 門檻」是 ad-hoc，沒有明確規則

→ 進入下一個檔案 `08_T6_team-retro.md`
