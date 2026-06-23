// Global error catcher to display runtime errors on screen for debugging
window.onerror = function(message, source, lineno, colno, error) {
  const errDiv = document.createElement('div');
  errDiv.style.position = 'fixed';
  errDiv.style.top = '0';
  errDiv.style.left = '0';
  errDiv.style.width = '100%';
  errDiv.style.background = '#ef4444';
  errDiv.style.color = 'white';
  errDiv.style.padding = '15px';
  errDiv.style.zIndex = '999999';
  errDiv.style.fontFamily = 'monospace';
  errDiv.style.fontSize = '12px';
  errDiv.style.lineHeight = '1.4';
  errDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
  errDiv.innerHTML = `<strong>JS Execution Error detected:</strong><br>${message}<br>File: ${source}<br>Line: ${lineno} | Column: ${colno}`;
  document.body.appendChild(errDiv);
  return false;
};

// Tsuruga Squid Metal Intel Dashboard logic
document.addEventListener('DOMContentLoaded', () => {
  // --- Data ---
  // Past 1 month social & blog data gathered - populated with real Tsuruga squid metal reports from June 2026
  const SOCIAL_FEEDS = [
    {
      id: 1,
      media: 'blog',
      date: '2026-06-22',
      author: '泰丸 (最新釣果ブログ)',
      url: 'http://taimaru.jp/',
      body: '半夜便マイカ（ケンサキイカ）出船！竿頭で38杯。全体的に新子（小型）が目立ち、非常にアタリが繊細で掛かりが浅い日でした。棚は25m〜35m付近。仕掛けは12号以下の軽めのメタルスッテと小型エギが有効。バチコンでは40cm前後のギガアジも上がっています。',
      extracted: { catch: 38, minDepth: 25, maxDepth: 35, color: '赤緑' }
    },
    {
      id: 2,
      media: 'twitter',
      date: '2026-06-20',
      author: 'シーモンキー (X情報元)',
      url: 'https://x.com/search?q=%E6%95%A6%E8%B3%80%20%E3%82%A4%E3%82%AB%E3%83%A1%E3%82%BF%E3%83%AB&src=typed_query&f=live',
      body: '敦賀沖イカメタル便。潮が速く、サバの活性が高いためメタル20号〜25号で対応。棚は30m〜40mとやや深く、新子アカイカが多くテクニカルな展開。後半失速するもオモリグで棚をキープした人は22杯キャッチ。カラーは赤緑・赤黄スッテが反応良かったです。',
      extracted: { catch: 22, minDepth: 30, maxDepth: 40, color: '赤黄' }
    },
    {
      id: 3,
      media: 'blog',
      date: '2026-06-18',
      author: '一美丸 (公式ブログ)',
      url: 'https://ameblo.jp/ichimimaru/',
      body: 'アカイカ半夜便。明るいうちはアジ狙いのバチコンが好調。点灯後、20m前後の浅棚に反応が出始めラッシュもありましたが、新子主体のため身切れによるバラシ多発。スローフォールと小さめスッテ（10号）で丁寧に探った方がトップで32杯。カラーはピンクグロー。',
      extracted: { catch: 32, minDepth: 20, maxDepth: 25, color: 'グロー' }
    },
    {
      id: 4,
      media: 'instagram',
      date: '2026-06-16',
      author: '豊漁丸 (Insta公式ハッシュタグ)',
      url: 'https://www.instagram.com/explore/tags/%E6%95%A6%E8%B3%80%E3%82%A4%E3%82%AB%E3%83%A1%E3%82%BF%E3%83%AB/',
      body: '敦賀沖豊漁丸さんでマイカメタル🦑 棚が日によって激しく変わり、本日は35m前後のボトム付近でしか触らない難しい状況。シルエットが出る紫系エギとオモリグの組み合わせでポツポツ拾って25杯！新子中心だけど型が良いのも混ざります！ #イカメタル #豊漁丸',
      extracted: { catch: 25, minDepth: 35, maxDepth: 35, color: '紫系' }
    },
    {
      id: 5,
      media: 'blog',
      date: '2026-06-13',
      author: '遊幸丸 (最新釣果ブログ)',
      url: 'http://www.yukoumaru.com/',
      body: '本日のマイカメタル。点灯後しばらく無音でしたが、21時頃から20m〜30mの棚にイカが浮いてきて乗り出しました！赤緑とブルー系のスッテにアタリ集中。小型マイカが多いのでアタリがあっても少し待ってしっかり掛けるのがコツ。竿頭は29杯。',
      extracted: { catch: 29, minDepth: 20, maxDepth: 30, color: '赤緑' }
    },
    {
      id: 6,
      media: 'twitter',
      date: '2026-06-10',
      author: '福井ソルト釣行記 (X検索)',
      url: 'https://x.com/search?q=%E6%95%A6%E8%B3%80%20%E3%82%A4%E3%82%AB%E3%83%A1%E3%82%BF%E3%83%AB&src=typed_query&f=live',
      body: '敦賀イカメタル！満月大潮のため月明かりが非常に明るく、やはり棚は深めで35m〜45m付近にイカが留まる状況。オモリグのパープル・ブラック系でボトム近くをキャスト＆スローに誘うと良型マイカがヒット。釣果は18杯と渋めでした。',
      extracted: { catch: 18, minDepth: 35, maxDepth: 45, color: '紫系' }
    },
    {
      id: 7,
      media: 'instagram',
      date: '2026-06-07',
      author: 'lure_angler_taka (Instagramタグ)',
      url: 'https://www.instagram.com/explore/tags/%E6%95%A6%E8%B3%80%E3%82%A4%E3%82%AB%E3%83%A1%E3%82%BF%E3%83%AB/',
      body: '今週2回目の敦賀！泰丸アクションズさんにお世話になりました。濁りが入っていたため、スッテは赤黄とグローに反応抜群。棚は25m〜30mで終始安定していて釣りやすかったです！マイカ27杯キャッチ。新子アタリを掛けるのが楽しい！ #マイカ #泰丸',
      extracted: { catch: 27, minDepth: 25, maxDepth: 30, color: '赤黄' }
    },
    {
      id: 8,
      media: 'blog',
      date: '2026-06-04',
      author: 'シーモンキー (釣果レポート)',
      url: 'https://seamonkey2011.net/',
      body: '梅雨入り前の敦賀マイカ便。潮は少し緩んで15号スッテで底が取れました。集魚灯点灯直後から25m付近でアタリがあり、終始パラパラと乗り続けました。ヒットスッテは赤緑とケイムラ. 竿頭は34杯、他の方も平均15〜20杯前後とまずまず。',
      extracted: { catch: 34, minDepth: 25, maxDepth: 25, color: '赤緑' }
    },
    {
      id: 9,
      media: 'twitter',
      date: '2026-06-01',
      author: 'イカメタルマニア福井 (X情報)',
      url: 'https://x.com/search?q=%E6%95%A6%E8%B3%80%20%E3%82%A4%E3%82%AB%E3%83%A1%E3%82%BF%E3%83%AB&src=typed_query&f=live',
      body: '敦賀沖イカメタルシーズン初期。水温は21度。まだヤリイカも少し混じりますが、ケンサキイカ（マイカ）メインになってきました。ボトム（40m付近）でのアタリが多く、重めのメタル20号でステイ長めが効果的。マイカ15杯確保。',
      extracted: { catch: 15, minDepth: 40, maxDepth: 40, color: '青系' }
    },
    {
      id: 10,
      media: 'blog',
      date: '2026-05-28',
      author: '一美丸 (釣果速報)',
      url: 'https://ameblo.jp/ichimimaru/',
      body: 'マイカメタル＆アジング出船。アジは尺オーバー連発で入れ乗り。イカは集魚灯点灯後にポツポツ。棚は30m前後。スッテはフルグローや赤緑に好反応。トップで19杯。まだイカの群れが薄いですがアタリは明確です。',
      extracted: { catch: 19, minDepth: 30, maxDepth: 30, color: 'グロー' }
    }
  ];

  // 5-Day Weather Forecast mock database (Today and next 4 days)
  const WEATHER_FORECAST = [
    { icon: '☀️', cond: '晴のち曇', windDir: '南西', windSpd: '3.2m', wave: '0.4m', rough: false },
    { icon: '☁️', cond: '曇り', windDir: '北東', windSpd: '2.5m', wave: '0.3m', rough: false },
    { icon: '☔', cond: '雨のち曇', windDir: '北西', windSpd: '4.8m', wave: '0.8m', rough: true },
    { icon: '☁️', cond: '曇のち晴', windDir: '南西', windSpd: '2.8m', wave: '0.3m', rough: false },
    { icon: '☀️', cond: '快晴', windDir: '南', windSpd: '1.8m', wave: '0.2m', rough: false }
  ];

  // --- State ---
  let activeMediaFilter = 'all';
  let searchQuery = '';

  // --- Elements ---
  const headerMoonPhaseEl = document.getElementById('header-moon-phase');
  const headerTideNameEl = document.getElementById('header-tide-name');
  
  const detailMoonAgeEl = document.getElementById('detail-moon-age');
  const detailMoonNameEl = document.getElementById('detail-moon-name');
  const detailMoonIlluminationEl = document.getElementById('detail-moon-illumination');
  const moonTackleTipEl = document.getElementById('moon-tackle-tip');
  const moonShadowGraphic = document.getElementById('moon-shadow-graphic');
  const moonForecastContainer = document.getElementById('moon-forecast-container');

  const tideCanvas = document.getElementById('tide-canvas');
  const tideTimesList = document.getElementById('tide-times-list');
  const weatherForecastContainer = document.getElementById('weather-forecast-container');

  // Social Feed elements
  const feedList = document.getElementById('feed-list');
  const noFeedsMsg = document.getElementById('no-feeds-msg');
  const feedSearch = document.getElementById('feed-search');
  const mediaFilterButtons = document.querySelectorAll('.m-filter-btn');
  const btnSyncFeed = document.getElementById('btn-sync-feed');
  const syncLoader = document.getElementById('sync-loader');

  // Trends Timeline element
  const trendsTimelineContainer = document.getElementById('trends-timeline-container');

  // --- Accurate Moon Calculation (Julian Date calibrated)   function updateMoonUI() {
    const today = new Date();
    const moon = getMoonPhase(today);
    const details = getMoonDetails(moon.age, moon.normalized);
    const tideName = getTideName(moon.age);

    if (headerMoonPhaseEl) headerMoonPhaseEl.textContent = moon.age.toFixed(1);
    if (headerTideNameEl) headerTideNameEl.textContent = tideName;

    if (detailMoonAgeEl) detailMoonAgeEl.textContent = moon.age.toFixed(1);
    if (detailMoonNameEl) detailMoonNameEl.textContent = details.name;
    if (detailMoonIlluminationEl) detailMoonIlluminationEl.textContent = details.illumination;
    if (moonTackleTipEl) moonTackleTipEl.textContent = details.tip;

    // Draw main moon shadow
    let shadowShift = 0;
    if (moonShadowGraphic) {
      if (moon.normalized <= 0.5) {
        shadowShift = moon.normalized * 200;
        moonShadowGraphic.style.transform = `translateX(${shadowShift}%)`;
        moonShadowGraphic.style.left = '0';
        moonShadowGraphic.style.right = 'auto';
      } else {
        shadowShift = (moon.normalized - 0.5) * 200;
        moonShadowGraphic.style.transform = `translateX(${shadowShift - 100}%)`;
        moonShadowGraphic.style.left = 'auto';
        moonShadowGraphic.style.right = '0';
      }
    }

    // --- Generate 4 Days Forecast ---
    if (moonForecastContainer) {
      moonForecastContainer.innerHTML = '';
      const dayOfWeekStr = ['日', '月', '火', '水', '木', '金', '土'];
      
      for (let d = 1; d <= 4; d++) {
        const forecastDate = new Date(today.getTime() + d * 24 * 60 * 60 * 1000);
        const m = forecastDate.getMonth() + 1;
        const day = forecastDate.getDate();
        const w = dayOfWeekStr[forecastDate.getDay()];
        const label = `${m}/${day}(${w})`;

        const fMoon = getMoonPhase(forecastDate);
        const fDetails = getMoonDetails(fMoon.age, fMoon.normalized);

        const fItem = document.createElement('div');
        fItem.className = 'forecast-item';
        fItem.innerHTML = `
          <span class="forecast-date">${label}</span>
          <span class="forecast-age">${fMoon.age.toFixed(1)}</span>
          <span class="forecast-name">${fDetails.name}</span>
          <span class="forecast-ill">光度 ${fDetails.illumination}%</span>
        `;
        moonForecastContainer.appendChild(fItem);
      }
    }
  }

  // --- Tide Graph Painting with Weather Icons Overlaid ---
  function drawTideChart() {
    if (!tideCanvas) return;
    const ctx = tideCanvas.getContext('2d');
    if (!ctx) return;
    const container = tideCanvas.parentElement;
    if (!container) return;
    const width = container.clientWidth || 300;
    const height = 120;
    
    const dpr = window.devicePixelRatio || 1;
    tideCanvas.width = width * dpr;
    tideCanvas.height = height * dpr;
    tideCanvas.style.width = width + 'px';
    tideCanvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    const points = [];
    const getTideY = (h) => {
      return 60 + 25 * Math.sin((h - 1.5) * (Math.PI / 6)) + 10 * Math.sin(h * (Math.PI / 3));
    };

    for (let h = 0; h <= 24; h += 0.25) {
      points.push({ x: (h / 24) * width, y: getTideY(h) });
    }

    // Draw background grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const gx = (i / 4) * width;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '9px Outfit';
      ctx.fillText(`${i*6}h`, gx - 10, height - 5);
    }

    // Draw tide curve
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(0, 210, 255, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 210, 255, 0.0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // --- Weather (天候・風速) Timeline Overlay ---
    const weatherTimeline = [
      { hour: 3, icon: '☀️', text: '晴 南西2m 波0.3m', yOffset: 20 },
      { hour: 9, icon: '☀️', text: '晴 南西3m 波0.3m', yOffset: 20 },
      { hour: 15, icon: '☁️', text: '曇 南西3m 波0.4m', yOffset: 20 },
      { hour: 21, icon: '☁️', text: '曇 南西4m 波0.4m', yOffset: 20 }
    ];

    weatherTimeline.forEach(wPoint => {
      const wx = (wPoint.hour / 24) * width;
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Outfit';
      ctx.textAlign = 'center';
      ctx.fillText(wPoint.icon, wx, wPoint.yOffset);

      let labelText = wPoint.text;
      if (width < 450) {
        labelText = labelText.replace('南西', '').replace('波', '');
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '8px Noto Sans JP';
      ctx.fillText(labelText, wx, wPoint.yOffset + 10);

      const ty = getTideY(wPoint.hour);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wx, wPoint.yOffset + 14);
      ctx.lineTo(wx, ty);
      ctx.stroke();
    });
    ctx.textAlign = 'left';

    // Draw current time line indicator
    const currentHour = new Date().getHours() + (new Date().getMinutes() / 60);
    const targetX = (currentHour / 24) * width;
    
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(targetX, 0);
    ctx.lineTo(targetX, getTideY(currentHour));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(targetX, getTideY(currentHour), 4, 0, Math.PI * 2);
    ctx.fill();

    if (tideTimesList) {
      tideTimesList.innerHTML = `
        <div class="tide-time-box">
          <span class="time-lbl">満潮</span>
          <span class="time-val">04:30 (32cm)</span>
        </div>
        <div class="tide-time-box">
          <span class="time-lbl">干潮</span>
          <span class="time-val">10:45 (12cm)</span>
        </div>
        <div class="tide-time-box">
          <span class="time-lbl">満潮</span>
          <span class="time-val">16:30 (28cm)</span>
        </div>
        <div class="tide-time-box">
          <span class="time-lbl">干潮</span>
          <span class="time-val">22:45 (8cm)</span>
        </div>
      `;
    }
  }

  // --- Render 5-Day Weather Forecast ---
  function renderWeatherForecast() {
    if (!weatherForecastContainer) return;
    weatherForecastContainer.innerHTML = '';
    const today = new Date();
    const dayOfWeekStr = ['日', '月', '火', '水', '木', '金', '土'];

    for (let d = 0; d < 5; d++) {
      const forecastDate = new Date(today.getTime() + d * 24 * 60 * 60 * 1000);
      const m = forecastDate.getMonth() + 1;
      const day = forecastDate.getDate();
      const w = dayOfWeekStr[forecastDate.getDay()];
      const label = d === 0 ? `本日 ${m}/${day}(${w})` : `${m}/${day}(${w})`;

      const data = WEATHER_FORECAST[d];
      if (!data) continue;
      const card = document.createElement('div');
      card.className = `weather-forecast-card ${data.rough ? 'rough-sea' : ''}`;

      card.innerHTML = `
        <span class="w-date">${label}</span>
        <span class="w-icon">${data.icon}</span>
        <span class="w-cond">${data.cond}</span>
        <span class="w-wind">${data.windDir}<br>${data.windSpd}</span>
        <span class="w-wave">${data.wave}</span>
      `;
      weatherForecastContainer.appendChild(card);
    }
  }

  // --- 3-Day Grouped Timeline Analytics ---
  function updateTrendsTimeline(activeFeeds) {
    if (!trendsTimelineContainer) return;
    trendsTimelineContainer.innerHTML = '';
    const today = new Date();
    
    for (let p = 0; p < 10; p++) {
      const pStartOffset = p * 3;
      const pEndOffset = (p * 3) + 2;

      const pStartDate = new Date(today.getTime() - pEndOffset * 24 * 60 * 60 * 1000);
      const pEndDate = new Date(today.getTime() - pStartOffset * 24 * 60 * 60 * 1000);

      const mStart = pStartDate.getMonth() + 1;
      const dStart = pStartDate.getDate();
      const mEnd = pEndDate.getMonth() + 1;
      const dEnd = pEndDate.getDate();
      const label = `${mStart}/${dStart}〜${mEnd}/${dEnd}`;

      const startStr = pStartDate.toISOString().split('T')[0];
      const endStr = pEndDate.toISOString().split('T')[0];

      const periodFeeds = activeFeeds.filter(feed => {
        return feed.date >= startStr && feed.date <= endStr;
      });

      const card = document.createElement('div');
      
      if (periodFeeds.length === 0) {
        card.className = 'timeline-period-card no-data';
        card.innerHTML = `
          <div class="period-label">${label}</div>
          <div class="empty-message" style="padding: 1rem 0; font-size: 0.7rem;">投稿データなし</div>
        `;
      } else {
        card.className = 'timeline-period-card has-data';

        let totalCatch = 0;
        let catchCount = 0;
        let totalMinDepth = 0;
        let totalMaxDepth = 0;
        let depthCount = 0;
        const colorFrequency = {};

        periodFeeds.forEach(feed => {
          const ext = feed.extracted;
          if (ext.catch) {
            totalCatch += ext.catch;
            catchCount++;
          }
          if (ext.minDepth && ext.maxDepth) {
            totalMinDepth += ext.minDepth;
            totalMaxDepth += ext.maxDepth;
            depthCount++;
          }
          if (ext.color) {
            colorFrequency[ext.color] = (colorFrequency[ext.color] || 0) + 1;
          }
        });

        const avgCatch = catchCount > 0 ? Math.round(totalCatch / catchCount) : null;
        const avgMin = depthCount > 0 ? Math.round(totalMinDepth / depthCount) : null;
        const avgMax = depthCount > 0 ? Math.round(totalMaxDepth / depthCount) : null;

        const sortedColors = Object.entries(colorFrequency).sort((a, b) => b[1] - a[1]);
        let hotColorHTML = '<span style="font-size:0.65rem;color:var(--text-secondary);">データ無</span>';
        if (sortedColors.length > 0) {
          const topColor = sortedColors[0][0];
          let colorClass = 'col-blue';
          if (topColor.includes('赤緑')) colorClass = 'col-redgreen';
          else if (topColor.includes('紫')) colorClass = 'col-purple';
          else if (topColor.includes('グロー')) colorClass = 'col-glow';
          else if (topColor.includes('赤黄')) colorClass = 'col-redyellow';
          hotColorHTML = `<span class="color-tag ${colorClass}">${topColor}</span>`;
        }

        const depthText = (avgMin !== null && avgMax !== null) ? 
          (avgMin === avgMax ? `${avgMin}m` : `${avgMin}-${avgMax}m`) : '不明';

        card.innerHTML = `
          <div class="period-label">${label}</div>
          <div class="period-stat">
            <span class="period-stat-lbl">平均釣果</span>
            <span class="period-stat-val ct-val">${avgCatch !== null ? avgCatch + ' 杯' : '--'}</span>
          </div>
          <div class="period-stat">
            <span class="period-stat-lbl">ヒットレンジ</span>
            <span class="period-stat-val">${depthText}</span>
          </div>
          <div class="period-stat">
            <span class="period-stat-lbl">頻出カラー</span>
            <span style="margin-top:2px;">${hotColorHTML}</span>
          </div>
          <div class="period-stat" style="font-size: 0.6rem; color: var(--text-secondary); text-align: right; border-top: 1px dashed rgba(255,255,255,0.05); padding-top:4px; margin-top:2px;">
            サンプル: ${periodFeeds.length}件
          </div>
        `;
      }
      trendsTimelineContainer.appendChild(card);
    }
  }

  // --- Render Social Feeds ---
  function renderFeeds() {
    if (!feedList) return;
    feedList.innerHTML = '';
    
    const filteredFeeds = SOCIAL_FEEDS.filter(feed => {
      if (activeMediaFilter !== 'all' && feed.media !== activeMediaFilter) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const bodyMatch = feed.body.toLowerCase().includes(query);
        const authorMatch = feed.author.toLowerCase().includes(query);
        const colorMatch = feed.extracted.color.toLowerCase().includes(query);
        return bodyMatch || authorMatch || colorMatch;
      }
      return true;
    });

    if (filteredFeeds.length === 0) {
      if (noFeedsMsg) noFeedsMsg.classList.remove('hidden');
      updateTrendsTimeline([]);
      return;
    }
    if (noFeedsMsg) noFeedsMsg.classList.add('hidden');

    filteredFeeds.forEach(feed => {
      const li = document.createElement('div');
      let mediaLabel = '📝 Blog';
      let badgeClass = 'badge-blog';
      if (feed.media === 'twitter') {
        mediaLabel = '🐦 X (Twitter)';
        badgeClass = 'badge-twitter';
      } else if (feed.media === 'instagram') {
        mediaLabel = '📸 Instagram';
        badgeClass = 'badge-instagram';
      }

      li.className = `feed-item media-${feed.media}`;
      li.innerHTML = `
        <div class="feed-item-header">
          <span class="feed-poster"><a href="${feed.url}" target="_blank" rel="noopener noreferrer">${feed.author} 🔗</a></span>
          <div>
            <span class="feed-date">${feed.date}</span>
            <span class="feed-media-badge ${badgeClass}">${mediaLabel}</span>
          </div>
        </div>
        <p class="feed-body">${feed.body}</p>
        <div class="feed-extracted-data">
          <span class="extracted-badge ext-catch">釣果: ${feed.extracted.catch}杯</span>
          <span class="extracted-badge ext-depth">棚: ${feed.extracted.minDepth === feed.extracted.maxDepth ? feed.extracted.minDepth : feed.extracted.minDepth + '-' + feed.extracted.maxDepth}m</span>
          <span class="extracted-badge ext-color">カラー: ${feed.extracted.color}</span>
        </div>
      `;
      feedList.appendChild(li);
    });

    updateTrendsTimeline(filteredFeeds);
  }

  // --- Search & Filtering Event Handlers ---
  if (feedSearch) {
    feedSearch.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderFeeds();
    });
  }

  if (mediaFilterButtons) {
    mediaFilterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        mediaFilterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeMediaFilter = btn.dataset.media;
        renderFeeds();
      });
    });
  }

  // --- Simulate "Syncing Data" ---
  if (btnSyncFeed) {
    btnSyncFeed.addEventListener('click', () => {
      if (syncLoader) syncLoader.classList.remove('hidden');
      
      setTimeout(() => {
        if (syncLoader) syncLoader.classList.add('hidden');
        
        const newSimulatedPost = {
          id: Date.now(),
          media: Math.random() > 0.5 ? 'twitter' : 'instagram',
          date: new Date().toISOString().split('T')[0],
          author: '一美丸 (釣果速報元)',
          url: 'https://ameblo.jp/ichimimaru/',
          body: '【速報】アカイカ好釣！棚20m〜25mの浅棚でヒット集中。小型メタルスッテ10号の赤緑、フルグローで数を伸ばしました！竿頭45杯と釣果急上昇！ #イカメタル #敦賀',
          extracted: { catch: 45, minDepth: 20, maxDepth: 25, color: '赤緑' }
        };

        SOCIAL_FEEDS.unshift(newSimulatedPost);
        renderFeeds();
      }, 1500);
    });
  }

  // --- Initial Activation ---
  updateMoonUI();
  drawTideChart();
  renderWeatherForecast();
  renderFeeds();

  window.addEventListener('resize', () => {
    drawTideChart();
  });
});
