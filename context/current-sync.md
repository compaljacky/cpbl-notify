# 當前進行中同步 Session

> 由 Round Table / Design Review / Mob Skill 寫入；session 結束後清空。
> 同時間至多一場同步 session（避免脈絡切割）。

---

## 狀態：無進行中同步 session

最後一場同步 session：（尚無）

---

## 結構（同步 session 進行中時）

```markdown
## 同步 Session：[type] @ YYYY-MM-DD HH:MM
類型：round-table / design-review / mob
主題：[一句話]
主持人（Facilitator）：[name]
到場 Role agents：[list]
進行階段：opening / proposing / converging / decision
參與成員（真人）：[list]

### 議題敘述
...

### 各 Role agent 提案
[由各 agent 並行寫入]

### 收斂中的共識
[由 Facilitator 整理]

### 衝突待解
[列出尚未達成共識的點]

### 下一步
（決定 / 再探索 / 暫緩）
```
