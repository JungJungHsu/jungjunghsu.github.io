# AS#8 — Prompt & Project Summary

## 一句話目標
建立一個以影片為核心的專題頁面：Landing → Onboarding（多影片縮圖）→ 四個 Core Narrative Chapters（每章以影片為底、scroll-by 文字），影片均為 fullscreen（100vh）且自動播放（autoplay loop muted）。

## 關鍵需求（從使用者 Prompt 提取）
- Landing：hero 影片佔滿整個視窗（vh-100），文字垂直置中。
- Onboarding：左側 2x2 sticky video grid（縮小版）、右側為 200vh 可滾動文字區。
- 所有影片：取消 hover 攝影縮預覽改為直接自動（autoplay + loop + muted + playsinline），移除 `poster` 屬性。
- Core Narrative Chapters（4 個章節）：每章使用 full-bleed / vh-100 影片，影片 sticky-top，章節文字以 scroll-by 呈現；章節文字要保留使用者手動編寫的內容（停止自動覆寫）。
- UI finishing：章節文字加半透明白底以提升可讀性；頁面最底新增 10vh footer 文案：
  > © 2025 AS#8: Video-triggered Web | Designed by 老師上課教材、AI.

## 技術棧
- 原生 HTML / CSS / JavaScript
- HTML5 `<video>`（屬性：`autoplay loop muted playsinline preload="auto"`）
- CSS：sticky、grid、full-bleed 技術（`width:100vw` + `margin-left: calc(50% - 50vw)`）
- JS：過去使用過 IntersectionObserver 來控制播放/暫停，但目前改為嘗試直接自動 play 所有章節影片以符合使用者需求；也包含邏輯以保留使用者在 `.onboard-text` 中手動編寫的內容。

## 主要檔案（所在路徑）
- `as8/index.html` — 主頁面骨架：Landing、Onboarding、Chapter1-4、Footer。
- `as8/style.css` — 所有樣式：hero、onboarding grid、chapter full-bleed、`.chapter-text`、`.site-footer`（10vh）。
- `as8/script.js` — 影片播放邏輯、縮圖自動播放、清理舊的自動生成章節文字、保留使用者文字的邏輯。
- `as8/assets/` — 影片與佔位資源（請確認 `video*.mp4` 等實際存在且路徑正確）。

## 已完成的重要變更（摘要）
- 將縮圖與章節影片移除 `poster` 屬性，改為直接以影片呈現。
- 為所有章節影片與縮圖加入 `autoplay loop muted playsinline preload="auto"`。
- 取消自動覆寫使用者在 `.onboard-text` 的內容；加入函式來移除舊先前自動生成的示例段落（若存在）。
- 將章節影片設為 full-bleed（避免被父容器 max-width 裁切），調整 z-index 與 `.chapter-text` 背景為半透明白底以提高可讀性。
- 新增底部 `.site-footer`（高 10vh）與指定文案。

## 已知限制與注意事項
- 瀏覽器 autoplay 政策：大多數瀏覽器允許 muted 的 autoplay，但仍可能在某些環境（行動裝置/特定瀏覽器設定）被阻擋。
- 效能：同時播放多個影片會消耗 CPU/GPU 與網路，若出現卡頓或電力問題，建議改為 single sticky video + 動態替換 source 或 lazy-load 影片資源。
- 檔案存在性：請確認 `as8/assets/` 中的影片檔案實際存在且路徑大小寫正確，否則會出現 404 並導致無法播放。

## 本地測試步驟（快速）
在專案根目錄下啟動簡易 HTTP server：

```bash
cd ~/Documents/GitHub/jungjunghsu.github.io
python3 -m http.server 8000
```

打開瀏覽器並前往：

http://localhost:8000/as8/index.html

檢查：
- Network panel：是否有 404 或資源載入失敗。
- Console：是否有 `play()` 被拒或其他錯誤。
- 視覺：Landing、Onboarding、每個 chapter 的影片是否為自動播放的動態畫面，章節文字是否保留為作者手動內容。

## 推薦後續優化（選項）
- 若性能為問題：實作 single sticky-video（只渲染一個 `<video>`），在切換章節或進入章節時動態替換 `src` 並呼叫 `play()`，以降低同時播放影片數量。
- 自動播放被阻擋時：加入一個啟動按鈕/overlay（一次性的「啟用媒體播放」），以便用戶互動後能保證播放。
- Lazy-load：只在即將進入視窗時載入影片 `src`。

## 檔案位置
- 已建立： `as8/PROMPT_SUMMARY.md`（你正在讀取的檔案）。

---

若你要我把這份摘要調整為英文版、擴充為 README（加入更詳盡的測試步驟與 CI 指令），或直接實作 single-stick video 優化，告訴我下一個優先項目即可。