# Individual Focus 範例：FOCUS-012 Chen 主導 codemod 腳本與部分元件遷移

> 此檔示範**個人軌**如何運作，與同步軌（MOB-003）平行進行。

---

## 創建 FOCUS

時間：2026-05-08 11:45（mob 結束後立即）
執行：`/individual-focus codemod 腳本完善與 Button/Input/Card 三元件遷移`

### 步驟 trace

```
[Chen 在自己 Claude session 執行]
$ /individual-focus codemod 腳本完善與 Button/Input/Card 三元件遷移

[系統檢查]
✅ 依據檢查：sync-context.md 找到「2026-05-04 design token 重建分兩階段」共識，及 DR-007 APPROVED → 通過
✅ 容量檢查：Chen 本週已用 26h（5/8 mob 用了 2.5h），剩 9h，可吸收 8h focus → 通過
✅ WIP=1 檢查：Chen 之前的 FOCUS-009 dark mode prototype 已於 5/5 標記為「parked」（dark mode 延到 v1.19.0）→ 通過

[建立 FOCUS-012]
寫入 context/individual-tracks.md：

### Chen（engineer）
- **狀態**: FOCUS-012 in_progress
- **任務**: codemod 腳本完善 + Button/Input/Card 三元件遷移
- **依據**: DR-007 APPROVED + MOB-003 foundation 已上 staging
- **AC**:
  - [ ] codemod 對所有 inline hex/rgb/hsl 都偵測並警告
  - [ ] codemod 對 `style={{}}` 中的硬編碼色值偵測
  - [ ] Button 元件 100% 遷移（含 12 個 variant）
  - [ ] Input 元件 100% 遷移（含 8 個 variant）
  - [ ] Card 元件 100% 遷移（含 5 個 variant）
- **預估 / 已用**: 8h / 0h
- **下一步**: 先完善 codemod，再批次跑三元件

[更新 STATE.json]
active_individual_focuses[] +1：
  { "owner": "Chen", "id": "FOCUS-012", "title": "...", "started_at": "2026-05-08", "estimated_hours": 8 }

[log]
2026-05-08 11:45 | FOCUS-START | Chen | FOCUS-012 | 依據: DR-007 + MOB-003
```

---

## 執行（Chen 在個人 Claude session 內）

### 5/8 下午：完善 codemod（~3h）

```
[Chen]
$ /implement
[系統]
✅ FOCUS-012 active，開始實作
✅ 規模判斷：scripts/migrate-token.mjs 單一檔案 → P7 直接做（不需 planner）

[Chen 寫 code，補完 inline hex/rgb/hsl 偵測]
[完成、跑單元測試 → 通過]

$ critic
[critic subagent 審查]
=== CRITIC REPORT @ 14:30 ===
Verdict: APPROVED
Items:
  - migrate-token.mjs L120: regex 對 `rgb(255,0,0)` 不匹配（缺空格容錯），建議改 \s* 寬鬆
=== END ===

[Chen 修正、再 critic → APPROVED]
```

### 5/9 上午：Button 遷移（~2h）

```
[Chen]
$ node scripts/migrate-token.mjs src/components/Button
✅ 12 variant 全部遷移成功
⚠️  Button.stories.tsx L42 inline hex `#FF6600` 警告（codemod 不自動改）
   → Chen 手動評估：是 storybook 範例固意展示自訂色，保留 + 加註解

$ /implement
[執行視覺迴歸測試 chromatic]
✅ 12 snapshot diff = 0
$ critic → APPROVED
```

### 5/9 下午 + 5/12 上午：Input + Card 遷移（~3h）

```
類似流程，全部成功。
```

---

## 結束 FOCUS

時間：2026-05-12 11:00
執行：`/focus-end`

```
[系統]
✅ 所有 AC 完成
✅ critic 已通過
[詢問]
本次 focus 中，有哪些發現對其他軌道的人有價值？
[Chen]
> 沒有特別。codemod 警告了 4 個 inline hex，都是 storybook 範例，已加註解。
[系統]
✅ 不寫入 sync-context.md
✅ 從 STATE.json.active_individual_focuses[] 移除 FOCUS-012
✅ capacity-board 更新 Chen 本週已用：26 + 8 = 34h（97% 🟡 → 警告下週減）
```

```
2026-05-12 11:00 | FOCUS-END | Chen | FOCUS-012 | result: completed
```

---

## 個人軌與同步軌的對照觀察

| 維度 | 同步軌（MOB-003） | 個人軌（FOCUS-012） |
|---|---|---|
| WIP 規則 | 同時間 1 場 sync | Chen 個人同時 1 個 focus |
| 決策權 | 群體共議、寫入 decision-log | Chen 個人決策、不入 log |
| 依據 | DR-007（design-review） | DR-007 + MOB-003（先有 foundation 才能遷移） |
| critic | mob 結束強制跑 | 個人 implement 後強制跑 |
| 容量 | 全員時數記在 capacity-board | Chen 個人時數記在 capacity-board |
| 跨軌觸發 | 共識條目寫進 sync-context.md | `/sync-context` 主動注入回流 |

→ 進入下一個檔案 `07_T4_sync-context回流.md`，看 David 的個人軌如何透過 `/sync-context` 回流觸發新議題
