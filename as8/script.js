// Play/pause logic for chapter videos and thumbnail hover previews
(function(){
  const thumbVideos = document.querySelectorAll('.thumb-media video');
  const thumbs = document.querySelectorAll('.thumb');
  const chapterVideos = document.querySelectorAll('.chapter-video');

  // Pause all chapter videos except the provided one; keep onboarding thumbnails playing
  function pauseChapterVideosExcept(except){
    document.querySelectorAll('.chapter-video').forEach(v=>{
      if(v !== except){ try{ v.pause(); }catch(e){} }
    });
  }

  // Onboarding: autoplay all thumb videos (they are muted and looped)
  function autoplayThumbs(){
    thumbVideos.forEach(v=>{
      // attempt to play; muted videos typically are allowed to autoplay
      v.play().catch(()=>{});
    });
  }

  // Generate descriptions under each thumbnail
  function generateThumbDescriptions(){
    const sample = [
      '一個短小的預覽，帶出章節基調與視覺色調。',
      '預覽片段展示場景與氛圍，吸引讀者點入了解更多。',
      '快速片段呈現情緒與節奏，作為章節導引。',
      '畫面語言指向主題的核心，暗示下一步的敘事。'
    ];
    thumbs.forEach((t,i)=>{
      let desc = t.querySelector('.thumb-desc');
      if(!desc){
        desc = document.createElement('div');
        desc.className = 'thumb-desc';
        desc.textContent = sample[i % sample.length];
        t.appendChild(desc);
      }
    });
  }

  // Generate onboarding right-column text (ensures min-height ~200vh)
  function generateOnboardingText(){
    const container = document.querySelector('.onboard-text');
    if(!container) return;
    // sample paragraphs
    const paragraphs = [
      '歡迎來到本作品的導覽頁面。在左側你會看到四則短片，作為每個章節的視覺預覽。這裡的文字將以捲動方式呈現，帶領你進入更深入的章節。',
      '這段文字解說了專題的核心概念：視覺如何在時間中堆疊，聲音與光影如何為敘事提供節奏。每個預覽片段都對應一個核心章節，點選可以直接跳轉。',
      '在閱讀時注意影像的細節：色調、運鏡與剪輯節奏如何提示情緒。你也可以回到導覽區比對不同章節的基調差異。',
      '如果你想更深入，進入章節後會看到固定的背景影片與側邊捲動文字，文字會補述情節、脈絡與延伸的想像。',
      '這裡的文字是自動生成的範例內容，用於示範介面與捲動感受；正式稿件可替換為完整文案、字幕或旁白稿。',
      '繼續向下捲動以切換章節，影片會在視窗中停駐，文字將在影片上方或旁邊滾動以構成敘事節點。'
    ];

    // Preserve any existing user content inside .onboard-text.
    // Only append auto-generated paragraphs until the container reaches ~200vh.
    let idx = 0;
    const maxAdd = 20; // safety cap
    while(container.scrollHeight < window.innerHeight * 2 && idx < maxAdd){
      const p = document.createElement('p');
      p.style.margin = '20px 0';
      p.textContent = paragraphs[idx % paragraphs.length];
      p.className = 'generated-onboard-paragraph';
      container.appendChild(p);
      idx++;
    }
  }

  // Generate chapter text blocks dynamically (if there are fewer than desired)
  function generateChapterText(){
    const chapterSamples = [
      '在這一段，我們觀察主角的日常細節，微小的動作逐漸聚焦出主題。',
      '畫面慢慢拉近，音色與光影開始產生對話，情緒緩緩升起。',
      '一個轉折出現，場景的物件帶出過去的線索與未來的可能。',
      '視覺節奏加快，敘事層次開始疊合，情感的重量逐步累積。',
      '聲音與畫面的對應揭示了人物內心的矛盾與希望。',
      '結尾處留下一個開放的問題，讓讀者在下一章繼續探索。'
    ];

    document.querySelectorAll('.chapter').forEach((chapter, idx)=>{
      const container = chapter.querySelector('.chapter-text');
      if(!container) return;
      // if already has several text-blocks, keep them; otherwise ensure at least 6
      const existing = container.querySelectorAll('.text-block').length;
      const need = Math.max(6 - existing, 0);
      for(let i=0;i<need;i++){
        const div = document.createElement('div');
        div.className = 'text-block';
        // create slightly varied content
        div.textContent = chapterSamples[(idx*3 + i) % chapterSamples.length];
        container.appendChild(div);
      }
    });
  }

  // IntersectionObserver to auto play/pause chapter videos when in view
  const io = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const vid = entry.target.querySelector('.chapter-video');
      if(!vid) return;
      if(entry.intersectionRatio > 0.5){
        pauseChapterVideosExcept(vid);
        vid.play().catch(()=>{});
      } else {
        vid.pause();
      }
    });
  }, { threshold:[0.0,0.25,0.5,0.75,1.0] });

  document.querySelectorAll('.chapter').forEach(sec=> io.observe(sec));

  // Clicking a thumbnail scrolls to target and attempts to play its chapter video
  document.querySelectorAll('.thumb').forEach(t=>{
    t.addEventListener('click', e=>{
      const target = document.querySelector(t.getAttribute('data-target'));
      if(!target) return;
      setTimeout(()=>{
        const vid = target.querySelector('.chapter-video');
        if(vid){ pauseChapterVideosExcept(vid); vid.play().catch(()=>{}); }
      },450);
    });
  });

  // Accessibility: pause all videos on pagehide
  window.addEventListener('pagehide', ()=>{ document.querySelectorAll('video').forEach(v=>v.pause()) });

  // Init on DOM ready
  document.addEventListener('DOMContentLoaded', ()=>{
    autoplayThumbs();
    generateThumbDescriptions();
    generateChapterText();
    generateOnboardingText();
  });

})();
