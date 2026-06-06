# Critic 最新審查報告

> 由 critic subagent 寫入。任何「視為完成」前必跑（紅線二）。
> 結果為 APPROVED / CHANGES_REQUIRED + 路徑+行號的具體意見。

---

（尚無 critic 報告）

---

## 格式

```
=== CRITIC REPORT @ YYYY-MM-DD HH:MM ===
Target: FOCUS-XXX / DR-XXX / mob session
Verdict: APPROVED / CHANGES_REQUIRED
Items:
  1. src/foo.ts L42: ...（severity: high/med/low）
  2. ...
Security flag (passed to vuln-verifier if any):
  - [若有]
=== END ===
```
