# Releases 發版紀錄

每個版本一個檔案：`vX.Y.Z.md`，由 `/release-cut` skill 建立。

## 模板
```markdown
# Release vX.Y.Z

日期：YYYY-MM-DD
類型：major / minor / patch / hotfix
sre owner：[name]

## 變更摘要
- ...

## 來源
- 設計評審：DR-XXX, DR-YYY
- Round table 共識：YYYY-MM-DD round-table

## 部署紀錄
- dev: HH:MM passed
- staging: HH:MM passed
- production: HH:MM completed

## 回滾計畫
（已測試？）

## 上線後監測
（前 24h 觀察重點）
```
