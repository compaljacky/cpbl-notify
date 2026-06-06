# Round Table: 重建 design token 系統（dual-tier semantic + primitive 架構）

日期：2026-05-04 09:30
主持人（Facilitator）：Alex
參與真人成員：Alex, Bella, Chen, David, Emma, Fang, Greg, Hanna（全到）
到場 Role agents：pm、product（Bella 兼）、tech-lead、design-lead、sre、qa、people-ops（medium mode 預設不派 engineer/designer，因為已有 lead）

---

## 議題敘述

Emma 提案重建 design token 系統，從目前的「semantic-only」（如 `--color-primary`）改為「dual-tier semantic + primitive」（如 semantic 引用 primitive：`--color-primary: var(--blue-500)`）。

當前痛點：
1. dark mode 即將上線，semantic-only 結構導致 30+ token 各自要寫一份 dark 變體
2. 設計師加新顏色時不確定該命名為 semantic 還是直接寫原色
3. 工程師在 dark mode prototype 中發現 token 結構難擴充

提案範圍：
- 新增 `tokens/primitive.css` 包含完整 color/spacing/radius/shadow/font 原色
- 改寫 `tokens/semantic.css` 引用 primitive
- 全部 30+ 既有元件遷移
- 修改 `knowledge/ARCHITECTURE.md` 的「設計系統」章節（**禁改清單**項目）

## 觸發脈絡

- 從哪裡來：Emma 在 dark mode 對齊會議中發現結構問題（FOCUS-009 by Chen）
- 何時要做決定：本 sprint（Sprint-18，5/4–5/15）內若做不到，下個 sprint 也得做（dark mode 上線需要）

---

## 各 Role Agent 並行提案（30 秒內）

> 系統並行呼叫 7 個 role agent，傳入議題與各自必讀清單。所有 agent 同時間獨立思考，避免 anchor bias。下方依 agent 名字字母順序排列輸出（不代表發言先後）。

---

### 🟢 design-lead（Verdict: support）

```
=== ROUND-TABLE PROPOSAL: design-lead @ 09:30 ===
Stance: support

組內共識（pre-poll）:
  - Emma（提案者，自身）: support — 是她提案的
  - Fang: depends — 擔心 sprint 中段切換命名會破壞她在做的 onboarding 視覺

Reasoning:
  1. 對 Persona [P1: HR Manager / P2: Analyst] 影響：無直接影響（後端結構），但 dark mode 是
     P2 強需求（夜間做月報），dual-tier 是 dark mode 前置
  2. 對 Journey [J3: 月底報表夜間操作]：dark mode 上線後改善體驗
  3. 設計系統一致性：當前 semantic-only 碎片化，新加色號無規則可循。dual-tier 是
     業界最佳實踐（Material 3, Radix Colors 都用此模式）

Concerns:
  - 微互動 / loading / error / empty 是否被考慮：本次只動 token 不動互動，相對安全
  - a11y：semantic 改名後，自動化對比度檢查腳本需更新

Conditions:
  - Fang 的 FOCUS-011 onboarding 視覺需先完成或定義「freeze 區」，避免重構打架
  - 提供 codemod 腳本給 frontend 同步重命名，不靠人手 grep
=== END ===
```

---

### 🟡 people-ops（Verdict: depends）

```
=== ROUND-TABLE PROPOSAL: people-ops @ 09:30 ===
Stance: depends

Reasoning:
  1. 容量影響：本次 sprint 已排 12 個 AC，僅完成 4。新增此重構估約 24 人小時：
     - Emma + Fang: token 設計（Emma 8h、Fang 6h）
     - Chen 主導 frontend 遷移（10h）
     - Greg 部署檢查（2h）
     對「目前可用容量」(本週剩 130h) 是 18%，可吸收
  2. 心理安全：Emma 已準備一個多月，若這次又「下次再說」，會打擊提案動力
  3. 技能差距：團隊有 Radix Colors / Material 3 經驗，無 ramp-up

Concerns:
  - Fang 已 🟡 90%，再加 6h 會直接 🔴
  - 此 sprint 已有 OKR「v1.18.0 發版」承諾，若塞重構會擠掉「audit log Phase 2」(Bella 對外承諾)

Conditions:
  - Fang 的 6h 必須先重排既有任務（FOCUS-011 onboarding 視覺）才接
  - Bella 必須對外溝通「audit log Phase 2 延一週」或重構分兩階段
=== END ===
```

---

### 🟡 pm（Verdict: depends）

```
=== ROUND-TABLE PROPOSAL: pm @ 09:30 ===
Stance: depends

Reasoning:
  1. 對里程碑 M3（v1.18.0 發版 5/15）：原排程已用掉 5 天 buffer（DR-006 那次）
     新增重構 24h ≈ 3 個工程日，會吃掉剩餘 buffer
  2. 對合約：3 個合約客戶在「audit log Phase 2」清單上，承諾 5/15 上線
     若延 → Bella 需個別通知客戶
  3. 對團隊容量：與 people-ops 同樣判斷可吸收，但代價是 Phase 2 延

Concerns:
  - 風險：類似議題上次（2026-Q4「重寫 form 元件」）也是 sprint 中段提，
    最後拖到下季才完成（見 knowledge/round-tables/2024-12-08_重寫form元件.md）
  - 依賴：dark mode（已承諾的 v1.19.0 feature）依賴此重構

Conditions:
  - 必須有 owner（誰擔保 Sprint-18 仍能 release）
  - 必須有時間估算（不是「應該可以做完」）
  - 必須事先決定是否延 audit log Phase 2

Alternative (if oppose):
  - 先做 token foundation（不動既有元件），既有元件分批遷移到 v1.19/v1.20，
    這樣 sprint-18 只需 12h 不是 24h
=== END ===
```

---

### 🟢 product（Verdict: support，但要 split）

```
=== ROUND-TABLE PROPOSAL: product @ 09:30 ===
Stance: support（但建議 split）

Reasoning:
  1. 對北極星指標 MAU：間接（dark mode 是次要驅動）。短期 +0% 預估
  2. 對 BMC 變動：無
  3. Now/Next/Later 排序建議：
     - Now（v1.18.0）：token foundation 上線（無視覺變化）
     - Next（v1.19.0）：完整遷移 + dark mode

Concerns:
  - 機會成本：Now 槽位若全給此重構，會擠掉「audit log Phase 2」承諾
  - 「應該不會影響使用者」是最常見的回頭咬人陷阱

Conditions:
  - 必須先補 metric 假設：「dual-tier 上線後，新增主題的開發時間從 2 天降到 0.5 天」
    （內部開發效率指標，不是使用者指標）
  - 提供 visual regression 自動測試報告

Alternative：split 成兩階段
=== END ===
```

---

### 🟡 qa（Verdict: CONCERNS — round-table 中為前置警告）

```
=== ROUND-TABLE PROPOSAL: qa @ 09:30 ===
Stance: depends

Reasoning:
  此議題若進入 design-review，QA 將要求：
  - visual regression 自動化測試覆蓋全部 30+ 元件
  - 每個 PR 跑 chromatic 或 percy snapshot
  - dark mode preview 環境

Concerns:
  - AC 缺對「迴歸測試覆蓋率」要求
  - 沒有 e2e 測試覆蓋「使用者在 setting 切換主題」流程
  - 邊界：客戶自訂 brand color（B2B 客戶要求）的 fallback 路徑沒被討論

Conditions:
  - design-review 中必須加入「測試策略」章節
  - 需要 chromatic 預算（每月 $149）

邊界案例 checklist（要在 design-review 補）:
  - [ ] 客戶自訂 brand color
  - [ ] 內嵌 iframe 第三方元件（slack 整合）
  - [ ] 列印樣式
  - [ ] 高對比模式 a11y
=== END ===
```

---

### 🔴 sre（Verdict: oppose — 部署風險高）

```
=== ROUND-TABLE PROPOSAL: sre @ 09:30 ===
Stance: oppose（除非滿足條件）

Reasoning:
  1. 對 SLO 影響：短期可能下降 2–3%（CSS bundle 變化會 invalidate CDN cache）
  2. 部署風險：高
     - 全站 CSS 重建會讓既有客戶在 30 分鐘 cache 過渡期間看到「混合樣式」
     - 我們的 service worker 對 CSS 沒有 stale-while-revalidate
  3. 回滾策略：無一鍵回滾。若 token 結構改了再回頭會很痛
  4. 觀測性需求：缺「使用者看到的 CSS 是否一致」的監控

Concerns:
  - Error Budget 已用 12%（本月有 DR-006 的 audit log 部署），這個變更會吃掉約 5%
  - 客戶 B2B 在 SLA 上對視覺一致性有條款（合約 §4.2）
  - 沒有 canary 計畫：CSS 是全有全無，不像 API 可逐步 rollout

Conditions（必須全滿足才轉 support）:
  - 必須 canary：先在 staging + 內部 dogfood 環境跑 3 天
  - 必須 service worker 加 stale-while-revalidate
  - 必須有 rollback runbook（含 CSS revert + cache purge 步驟）
  - 必須跟客戶 B2B 提前 5 天通知（合約義務）

Alternative (if oppose stays):
  - 此次 sprint 只做 primitive 層 + 新元件用，既有元件不動
  - 待 v1.19.0（給 service worker 升級時間）再全面遷移
=== END ===
```

---

### 🟡 tech-lead（Verdict: support — 但要 split）

```
=== ROUND-TABLE PROPOSAL: tech-lead @ 09:30 ===
Stance: support（建議 split + tooling 投資）

組內共識（pre-poll）:
  - Chen（frontend，FOCUS-009 dark mode prototype 中）: support — Chen 已親身體驗 token 結構痛點
  - David（backend，FOCUS-010 audit log）: 中性 — 不直接受影響，但提到「sprint 中段大重構通常壞事」
  - Alex（自身，Tech Lead）: support — 與 Chen 多次討論過

Reasoning:
  1. 技術可行性：綠（業界最佳實踐，Radix/Material 3 已是 reference）
  2. 對 ARCHITECTURE 影響：全面（修改設計系統章節，且影響全部前端元件）
     ⚠️ 修改 ARCHITECTURE.md 在禁改清單上，必須走 design-review
  3. 實作規模估計：
     - foundation：1 檔案（primitive.css）+ 1 檔案改寫（semantic.css）→ 4h
     - codemod 腳本：約 6h（投資型，後續批次遷移會用到）
     - 既有 30+ 元件遷移：分批，每批 5 元件約 2h
  4. 可逆性：foundation 半可逆（primitive 層加上去無痛），元件遷移不可逆

Concerns:
  - 技術債：若這個不做，dark mode 會堆出更多 token 重複
  - 安全/效能：CSS bundle size 會增加約 8KB（gzip 後 +2KB），可接受
  - 與 sre 同樣的 CDN cache 顧慮

Conditions:
  - 與 sre 對齊 canary 與 service worker 升級
  - codemod 腳本必須先寫並通過驗證才開始遷移
  - Sprint 中段不切：foundation 在 sprint-18 完成；元件遷移分散到 sprint-18/19/20
=== END ===
```

---

## 🎯 Facilitator Alex 收斂

> Alex 等所有 7 個 agent 都輸出完才開始整理。**注意**：他並不順著時間順序問人，避免「先說 anchor 後說」。

### 共識區（≥ 5 個 agent 一致）

1. **不應該整體一次重構**，要 **split 成 foundation + 漸進遷移**（design-lead 的條件、pm 的 alternative、product 的 split、tech-lead 的 condition、sre 的 alternative 都指向這個）
2. **Sprint-18 範圍縮為「foundation only」**（只動 primitive.css + semantic.css 改寫，不動既有元件）
3. **必須走 design-review**（修禁改清單 + 跨 ≥ 2 職能）
4. **codemod 腳本必須先準備**（tech-lead + design-lead 條件）

### 衝突區

| 議題 | 不同立場 | 真人 Facilitator 拍板 |
|---|---|---|
| dark mode 部分要不要在本 sprint 上線？ | design-lead/product 想推、sre/pm 認為太擠 | **延到 v1.19.0**（給 service worker 升級時間） |
| Fang 是否參與本 sprint 的 token 設計？ | Emma 想要 Fang 一起、people-ops 警告容量🟡 | **延到 sprint-19 再參與**（保護容量） |
| audit log Phase 2 是否延？ | pm 提（合約風險）vs product 想 split | **不延**（split 後 sprint-18 只多 12h，可吸收） |

### 待驗證區

- sre 的「客戶 B2B SLA §4.2 視覺一致性條款」具體限制是什麼？由 Bella 在 design-review 前 review 合約並回報。
- service worker stale-while-revalidate 升級的工期？由 Greg 在 design-review 中提供估算。

---

## 下一步

選項：
- [x] **決定**：split 為兩階段，sprint-18 只做 foundation。寫入 decision-log + 觸發 design-review
- [ ] 再探索
- [ ] 暫緩

最終選擇：**決定 + 走 design-review**
理由：核心方向 7 個 agent 都 support 或 depends（無 oppose 留下），剩下都是執行細節，由 design-review 處理。

---

## 行動項目

- [ ] **Emma** 起草 DR-007「design token 重建 — Phase 1: foundation」by 2026-05-04 EOD
- [ ] **Bella** review 客戶 B2B 合約 §4.2 並回報限制 by 2026-05-04 EOD
- [ ] **Greg** 估 service worker 升級工期 by 2026-05-05 中午
- [ ] **Alex** 把 Fang 與 token 設計的時程同步到 sprint-19，保護其本週容量
- [ ] **Chen** 開始準備 codemod 腳本草稿（半天 spike，可整合進 FOCUS-009）

---

## 寫入 sync-context.md（共識同步）

```markdown
### 2026-05-04 | design token 重建分兩階段
- **來源**：round-table 2026-05-04 — `knowledge/round-tables/2026-05-04_重建-design-token-系統.md`
- **影響角色**：design-lead, tech-lead, sre, qa, pm, people-ops
- **決策內容**：
  - Phase 1 (sprint-18)：只做 foundation（primitive.css + semantic.css 改寫 + codemod 腳本）
  - Phase 2 (sprint-19/20)：既有 30+ 元件分批遷移
  - dark mode 上線延到 v1.19.0
- **行動項目**：
  - [ ] Emma 起草 DR-007 by 2026-05-04 EOD
  - [ ] Bella review 合約 §4.2 by 2026-05-04 EOD
  - [ ] Greg 估 service worker 升級 by 2026-05-05
  - [ ] Alex 將 Fang 移出本 sprint token 工作
- **回頭點**：sprint-18 結束（5/15）回顧 Phase 1 是否如期、再決定 Phase 2 細節
```

---

## 寫入 decision-log.md

```
2026-05-04 | design token 重建分兩階段（foundation 先行） | 來源: round-table 2026-05-04 | ADR 待建（DR-007 通過後）
```

---

## log

```
2026-05-04 09:30 | ROUND-TABLE | Alex | 議題: 重建 design token 系統 | 結論: decided (split + design-review)
2026-05-04 09:55 | ROUND-TABLE | Alex | 結束（時長 25 分鐘）
```

---

## 連結
- 觸發此議題的 raw：`raw/2026-05-03_design-token-rebuild.md`（已標記 已處理）
- 衍生的 design-review：DR-007（待 Emma 建立）
- 衍生的 ADR：（待 DR-007 通過後建立）
