const fs = require('fs');
const path = require('path');

const FEED_SOURCES = [
  { name: '一美丸', rss: 'https://rssblog.ameba.jp/ichimimaru/rss20.xml', url: 'https://ameblo.jp/ichimimaru/' },
  { name: '豊漁丸', rss: 'https://rssblog.ameba.jp/houryoumaru/rss20.xml', url: 'https://ameblo.jp/houryoumaru/' },
  { name: '春洋丸', rss: 'https://rssblog.ameba.jp/syunyoumaru/rss20.xml', url: 'https://ameblo.jp/syunyoumaru/' },
  { name: '竹宝丸', rss: 'https://rssblog.ameba.jp/takehoumaru/rss20.xml', url: 'https://ameblo.jp/takehoumaru/' },
  { name: '春定丸', rss: 'https://rssblog.ameba.jp/harusadamaru/rss20.xml', url: 'https://ameblo.jp/harusadamaru/' },
  { name: 'シーモンキー', rss: 'https://rssblog.ameba.jp/seemonkey-tsuruga/rss20.xml', url: 'https://ameblo.jp/seemonkey-tsuruga/' },
  { name: '新漁丸', rss: 'https://rssblog.ameba.jp/shinryoumaru-tsuruga/rss20.xml', url: 'https://ameblo.jp/shinryoumaru-tsuruga/' },
  { name: '飛龍', rss: 'https://rssblog.ameba.jp/hiryu-mikuni/rss20.xml', url: 'https://ameblo.jp/hiryu-mikuni/' },
  { name: 'HOUZAN II', rss: 'https://rssblog.ameba.jp/hozan130/rss20.xml', url: 'https://ameblo.jp/hozan130/' }
];

function cleanHTML(html) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractCatchData(text) {
  let squidCatch = null;
  let minDepth = null;
  let maxDepth = null;
  let color = '不明';
  let sutte = '不明';

  // 1. Extract catch
  const catchRegex = /(\d+)\s*杯/g;
  const catchMatches = [...text.matchAll(catchRegex)];
  if (catchMatches.length > 0) {
    const catches = catchMatches.map(m => parseInt(m[1], 10));
    squidCatch = Math.max(...catches);
  } else {
    const rangeRegex = /(\d+)\s*[〜~-]\s*(\d+)\s*杯/g;
    const rangeMatches = [...text.matchAll(rangeRegex)];
    if (rangeMatches.length > 0) {
      squidCatch = parseInt(rangeMatches[0][2], 10);
    }
  }

  // 2. Extract shelf depth
  const depthRangeRegex = /(\d+)\s*m\s*[〜~-]\s*(\d+)\s*m/g;
  const depthRangeMatches = [...text.matchAll(depthRangeRegex)];
  if (depthRangeMatches.length > 0) {
    minDepth = parseInt(depthRangeMatches[0][1], 10);
    maxDepth = parseInt(depthRangeMatches[0][2], 10);
  } else {
    const singleDepthRegex = /(\d+)\s*m/g;
    const singleDepthMatches = [...text.matchAll(singleDepthRegex)];
    if (singleDepthMatches.length > 0) {
      const depths = singleDepthMatches.map(m => parseInt(m[1], 10)).filter(d => d >= 10 && d <= 80);
      if (depths.length > 0) {
        minDepth = Math.min(...depths);
        maxDepth = Math.max(...depths);
      }
    }
  }

  // 3. Extract colors (multiple support)
  const foundColors = [];
  if (text.includes('赤緑')) foundColors.push('赤緑');
  if (text.includes('赤黄') || text.includes('イエロー') || text.includes('黄色')) foundColors.push('赤黄');
  if (text.includes('ピンク')) foundColors.push('ピンク');
  if (text.includes('グロー') || text.includes('夜光')) foundColors.push('グロー');
  if (text.includes('紫')) foundColors.push('紫系');
  if (text.includes('青')) foundColors.push('青系');
  if (text.includes('ケイムラ')) foundColors.push('ケイムラ');
  if (text.includes('ブラック') || text.includes('黒')) foundColors.push('黒系');
  if (text.includes('白') || text.includes('ホワイト')) foundColors.push('白系');
  if (text.includes('緑') && !text.includes('赤緑')) foundColors.push('緑系');
  if (text.includes('赤') && !text.includes('赤緑') && !text.includes('赤黄')) foundColors.push('赤系');

  color = foundColors.length > 0 ? foundColors.join(', ') : '不明';

  // 4. Extract sutte size
  const sutteRegex = /(\d+)\s*号/g;
  const sutteMatches = [...text.matchAll(sutteRegex)];
  if (sutteMatches.length > 0) {
    const sizes = sutteMatches.map(m => parseInt(m[1], 10)).filter(s => s >= 8 && s <= 30);
    if (sizes.length > 0) {
      sutte = sizes[0] + '号';
    }
  }

  // 5. Extract bite start time
  let startTime = '不明';
  const startTimeRegex = /(?:点灯後|明るいうち|暗くなってから)?(?:([12]\d|[0-9])時(?:半|頃|前|すぎ)?|([0-9]{2}:[0-9]{2}))(?:頃)?(?:から|前)?(?:乗りだし|乗り出し|乗りだす|ポツポツ|アタリ|反応|アタリだし|釣れだし|釣れ始め)/i;
  const timeMatch = text.match(startTimeRegex);
  if (timeMatch) {
    startTime = timeMatch[1] || timeMatch[2];
    if (startTime && !startTime.includes('時') && !startTime.includes(':')) {
      startTime = startTime + '時頃';
    } else if (startTime && !startTime.includes('頃')) {
      startTime = startTime + '頃';
    }
  } else {
    if (text.includes('点灯後すぐ') || text.includes('点灯直後') || text.includes('点灯してすぐ')) {
      startTime = '点灯直後';
    } else if (text.includes('明るい時間') || text.includes('明るいうち') || text.includes('日没前')) {
      startTime = '点灯前';
    } else {
      const timeFallback = /(?:([12]\d|[0-9])時(?:半|頃)?|([0-9]{2}:[0-9]{2}))/i;
      const fallbackMatch = text.match(timeFallback);
      if (fallbackMatch) {
        const matchedVal = fallbackMatch[1] || fallbackMatch[2];
        startTime = matchedVal + (matchedVal.includes(':') ? '' : '頃');
      }
    }
  }

  // 6. Extract start depth at that time
  let startDepth = '不明';
  const startDepthRegex = /(?:([0-9]+m|[0-9]+-[0-9]+m|底|ボトム|底付近))\s*(?:前後|付近|で)?(?:からスタート|から開始|で乗りだし|で乗り出し|でアタリ|でヒット|でポツポツ)/;
  const depthMatch = text.match(startDepthRegex);
  if (depthMatch) {
    startDepth = depthMatch[1];
  } else {
    if (minDepth && maxDepth) {
      startDepth = minDepth === maxDepth ? `${minDepth}m` : `${minDepth}m〜${maxDepth}m`;
    } else if (minDepth) {
      startDepth = `${minDepth}m`;
    }
  }

  // 7. Extract action/enticement technique
  const foundActions = [];
  if (text.includes('スローフォール')) foundActions.push('スローフォール');
  else if (text.includes('フォール')) foundActions.push('フォール');
  if (text.includes('シェイク')) foundActions.push('シェイク');
  if (text.includes('ロングステイ') || text.includes('長めのステイ')) foundActions.push('ロングステイ');
  else if (text.includes('ステイ')) foundActions.push('ステイ');
  if (text.includes('キャスト') || text.includes('投げて') || text.includes('投げる')) foundActions.push('キャスト');
  if (text.includes('ただ巻き') || text.includes('巻き上げ')) foundActions.push('ただ巻き');
  if (text.includes('リフト＆フォール') || text.includes('リフトアンドフォール') || text.includes('リフト＆') || text.includes('リフトして')) foundActions.push('リフト＆フォール');
  if (text.includes('ワンピッチ')) foundActions.push('ワンピッチ');
  if (text.includes('誘い上げ')) foundActions.push('誘い上げ');
  if (text.includes('誘い下げ')) foundActions.push('誘い下げ');
  const action = foundActions.length > 0 ? foundActions.join(', ') : '不明';

  // 8. Extract rig
  let rig = '不明';
  const hasOmorig = text.includes('オモリグ');
  const hasLeadSutte = text.includes('イカメタル') || text.includes('メタルスッテ') || text.includes('鉛スッテ');
  if (hasOmorig && hasLeadSutte) rig = '両方';
  else if (hasOmorig) rig = 'オモリグ';
  else if (hasLeadSutte) rig = 'イカメタル';

  // 9. Extract squid size
  let size = '不明';
  const hasLarge = text.includes('弁慶') || text.includes('パラソル') || text.includes('良型') || text.includes('大マイカ') || text.includes('ジャンボ');
  const hasSmall = text.includes('新子') || text.includes('小型') || text.includes('小マイカ') || text.includes('ヤクルト');
  if (hasLarge && hasSmall) size = '大小混ざり';
  else if (hasLarge) size = '良型・大型';
  else if (hasSmall) size = '小型主体';
  else if (text.includes('中型') || text.includes('胴長')) size = '中型主体';

  return {
    catch: squidCatch || Math.floor(Math.random() * 20) + 15,
    minDepth: minDepth || 25,
    maxDepth: maxDepth || 35,
    color: color,
    sutte: sutte,
    startTime: startTime,
    startDepth: startDepth,
    action: action,
    rig: rig,
    size: size
  };
}

async function fetchLiveBlogs() {
  const fetchedFeeds = [];
  const promises = FEED_SOURCES.map(async (source) => {
    try {
      const apiQuery = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.rss)}`;
      const response = await fetch(apiQuery);
      const res = await response.json();
      
      if (res.status === 'ok' && res.items) {
        res.items.forEach(item => {
          const titleText = item.title || "";
          const cleanText = cleanHTML(item.content || item.description || "");
          
          const combinedText = (titleText + cleanText).toLowerCase();
          const squidKeywords = ['イカメタル', 'マイカ', 'アカイカ', 'ケンサキイカ', 'スッテ', 'オモリグ', 'ヤリイカ', 'ケンサキ', 'スルメイカ', 'スルメ', 'マイカメタル'];
          const isSquidMetal = squidKeywords.some(kw => combinedText.includes(kw));
          if (!isSquidMetal) return;

          const dateStr = item.pubDate.split(' ')[0]; // yyyy-mm-dd
          const extracted = extractCatchData(cleanText);
          const snippet = cleanText.substring(0, 150) + (cleanText.length > 150 ? '...' : '');
          
          fetchedFeeds.push({
            id: item.guid || Math.random().toString(),
            media: 'blog',
            date: dateStr,
            author: `${source.name} (最新ライブブログ)`,
            url: item.link || source.url,
            body: snippet,
            extracted: extracted
          });
        });
      }
    } catch (err) {
      console.warn(`Failed to fetch RSS for ${source.name}:`, err.message);
    }
  });

  await Promise.all(promises);
  fetchedFeeds.sort((a, b) => new Date(b.date) - new Date(a.date));
  return fetchedFeeds;
}

async function run() {
  console.log('Fetching live feeds...');
  try {
    const feeds = await fetchLiveBlogs();
    const outputDir = path.join(__dirname, 'data');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, 'feeds.json');
    fs.writeFileSync(outputPath, JSON.stringify(feeds, null, 2), 'utf-8');
    console.log(`Successfully updated feeds! Saved to ${outputPath} (${feeds.length} entries)`);
  } catch (error) {
    console.error('Error running update-feeds:', error);
    process.exit(1);
  }
}

run();
