# Subagent 輸出緩衝區

> Role agents 與 Task agents 的最新輸出寫入此處。
> 主執行緒讀取後消化 / 收斂。
> 同步 session 進行中時，多個 Role agent 的輸出會以時間順序 append。

---

（尚無輸出）

---

## 格式範例

### Round Table 場景

```
=== ROUND-TABLE PROPOSAL: pm @ HH:MM ===
Stance: depends
Reasoning:
  1. 切換 GraphQL 對里程碑風險中性，但 ramp-up 約 2 週
  2. 接案合約對 API 形態無限制
Concerns:
  - 既有客戶整合若依賴 REST 會破壞契約
Conditions (if support):
  - 至少預留 1 個 sprint 學習與重寫
Alternative (if oppose): N/A
=== END ===

=== ROUND-TABLE PROPOSAL: engineer @ HH:MM ===
Stance: support
Reasoning:
  1. 既有 over-fetching 問題明顯，前端寫法已開始 hacky
  2. 團隊已有 Apollo 經驗，學習曲線可接受
Concerns:
  - N+1 query 風險需要早期介入
Conditions: 引入 dataloader from day 1
=== END ===
```

### Design Review 場景

```
=== DESIGN-REVIEW VERDICT: sre @ HH:MM ===
DR: DR-007 切換 GraphQL
Verdict: BLOCKS
Items:
  - migrations/0042_session.sql L8 改 NOT NULL DEFAULT，否則上線會擋寫入
  - infra/k8s/api-deploy.yaml 缺 PodDisruptionBudget
Required Changes:
  1. 補 default value
  2. 加 PDB minAvailable=1
=== END ===
```
