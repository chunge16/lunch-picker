import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChevronDown, MapPin, RefreshCcw } from 'lucide-react';
import './styles.css';

const AMAP_JS_KEY = import.meta.env.VITE_AMAP_JS_KEY || import.meta.env.VITE_AMAP_KEY;
const AMAP_SECURITY_CODE = import.meta.env.VITE_AMAP_SECURITY_CODE;
const AMAP_RESTAURANT_TYPE = '050000';
const AMAP_LOAD_TIMEOUT = 10000;
const COLLAPSED_CANDIDATE_COUNT = 10;
let amapLoaderPromise = null;

const lunchPool = [
  {
    name: '番茄牛腩饭',
    type: '热乎盖饭',
    mood: ['随便但好吃', '想吃热乎的'],
    budget: ['20-35', '35-60'],
    time: ['20分钟', '40分钟'],
    taste: ['不辣', '高蛋白'],
    price: '28',
    minutes: 18,
    heat: 2,
    reason: '酸甜汤汁拌米饭很稳，肉菜主食一次解决。',
    sides: ['加溏心蛋', '配青菜', '少饭多汤'],
    color: '#f36f45',
  },
  {
    name: '藤椒鸡腿拌面',
    type: '醒脑面食',
    mood: ['随便但好吃', '赶时间'],
    budget: ['20以内', '20-35'],
    time: ['10分钟', '20分钟'],
    taste: ['微辣', '重口', '高蛋白'],
    price: '22',
    minutes: 12,
    heat: 4,
    reason: '有香气、有肉、有碳水，下午开会前能迅速回血。',
    sides: ['加黄瓜丝', '少油', '配冰豆浆'],
    color: '#78a542',
  },
  {
    name: '椰香咖喱鸡饭',
    type: '柔和下饭',
    mood: ['想吃热乎的', '狠狠奖励'],
    budget: ['20-35', '35-60'],
    time: ['20分钟', '40分钟'],
    taste: ['不辣', '重口'],
    price: '32',
    minutes: 22,
    heat: 1,
    reason: '浓郁但不刺激，适合想吃点有幸福感的工作日中午。',
    sides: ['加土豆', '配酸梅汤', '饭少一点'],
    color: '#d79a2b',
  },
  {
    name: '牛肉河粉',
    type: '汤粉',
    mood: ['想吃热乎的', '随便但好吃'],
    budget: ['20-35', '35-60'],
    time: ['20分钟', '40分钟'],
    taste: ['清爽', '高蛋白', '不辣'],
    price: '30',
    minutes: 16,
    heat: 1,
    reason: '汤底清亮，午后不会太困，牛肉也够有存在感。',
    sides: ['多葱花', '加豆芽', '配柠檬茶'],
    color: '#4fa0a4',
  },
  {
    name: '麻辣香锅小份',
    type: '组队友好',
    mood: ['狠狠奖励', '随便但好吃'],
    budget: ['35-60', '不设限'],
    time: ['40分钟', '慢慢吃'],
    taste: ['重口', '微辣'],
    price: '48',
    minutes: 28,
    heat: 5,
    reason: '选择权很多，适合今天真的不想妥协。',
    sides: ['藕片必加', '午餐肉', '少油中辣'],
    color: '#cf3f34',
  },
  {
    name: '日式肥牛饭',
    type: '低风险快餐',
    mood: ['赶时间', '随便但好吃'],
    budget: ['20-35', '35-60'],
    time: ['10分钟', '20分钟'],
    taste: ['不辣', '高蛋白'],
    price: '29',
    minutes: 10,
    heat: 1,
    reason: '出餐快，甜咸稳定，适合不想思考的中午。',
    sides: ['温泉蛋', '七味粉另放', '配味噌汤'],
    color: '#b46b48',
  },
  {
    name: '鸡胸藜麦沙拉',
    type: '轻食',
    mood: ['轻一点', '赶时间'],
    budget: ['20-35', '35-60'],
    time: ['10分钟', '20分钟'],
    taste: ['清爽', '高蛋白', '不辣'],
    price: '35',
    minutes: 8,
    heat: 0,
    reason: '清爽、负担低，适合下午还想保持脑子清醒。',
    sides: ['酱分装', '加牛油果', '配美式'],
    color: '#65a878',
  },
  {
    name: '菌菇蔬菜汤饭',
    type: '暖胃素食',
    mood: ['轻一点', '想吃热乎的'],
    budget: ['20以内', '20-35'],
    time: ['20分钟', '40分钟'],
    taste: ['清爽', '不辣'],
    price: '21',
    minutes: 15,
    heat: 0,
    reason: '热汤舒服，蔬菜够多，吃完不容易犯困。',
    sides: ['加豆腐', '饭半份', '配海苔碎'],
    color: '#8aa35d',
  },
  {
    name: '酸菜鱼单人餐',
    type: '酸辣下饭',
    mood: ['狠狠奖励', '想吃热乎的'],
    budget: ['35-60', '不设限'],
    time: ['40分钟', '慢慢吃'],
    taste: ['微辣', '重口', '高蛋白'],
    price: '52',
    minutes: 30,
    heat: 4,
    reason: '酸辣汤底很开胃，鱼片比炸物更适合午饭。',
    sides: ['加金针菇', '少油', '配米饭半份'],
    color: '#d5b245',
  },
  {
    name: '虾仁滑蛋饭',
    type: '温柔盖饭',
    mood: ['轻一点', '随便但好吃'],
    budget: ['20-35', '35-60'],
    time: ['20分钟', '40分钟'],
    taste: ['不辣', '清爽', '高蛋白'],
    price: '34',
    minutes: 17,
    heat: 0,
    reason: '蛋香和虾仁都很友好，是不想吃太重时的稳妥解。',
    sides: ['加青豆', '饭少一点', '配紫菜汤'],
    color: '#e4b755',
  },
  {
    name: '重庆小面加煎蛋',
    type: '快手面',
    mood: ['赶时间', '随便但好吃'],
    budget: ['20以内', '20-35'],
    time: ['10分钟', '20分钟'],
    taste: ['微辣', '重口'],
    price: '18',
    minutes: 9,
    heat: 4,
    reason: '便宜、快、够香，适合今天只想速战速决。',
    sides: ['青菜加量', '少麻', '配豆奶'],
    color: '#d84a36',
  },
  {
    name: '韩式拌饭',
    type: '蔬菜碳水',
    mood: ['轻一点', '狠狠奖励', '随便但好吃'],
    budget: ['20-35', '35-60'],
    time: ['20分钟', '40分钟'],
    taste: ['微辣', '清爽'],
    price: '31',
    minutes: 18,
    heat: 3,
    reason: '菜多但不寡淡，拌开以后每一口都不太一样。',
    sides: ['酱少放', '加肥牛', '配海带汤'],
    color: '#d75c4a',
  },
  {
    name: '馄饨',
    type: '汤食',
    price: '18',
    minutes: 10,
    calories: 430,
    protein: 18,
    reason: '热汤暖胃，份量刚好，适合不想吃太撑的中午。',
  },
  {
    name: '兰州拉面',
    type: '面食',
    price: '22',
    minutes: 12,
    calories: 620,
    protein: 24,
    reason: '汤面稳妥，出餐快，牛肉和碳水都在线。',
  },
  {
    name: '热干面',
    type: '拌面',
    price: '16',
    minutes: 8,
    calories: 680,
    protein: 18,
    reason: '芝麻酱香气足，适合想快速解决又要有满足感。',
  },
  {
    name: '刀削面',
    type: '面食',
    price: '24',
    minutes: 14,
    calories: 650,
    protein: 23,
    reason: '面条厚实有嚼劲，热乎又顶饱。',
  },
  {
    name: '油泼面',
    type: '拌面',
    price: '23',
    minutes: 12,
    calories: 720,
    protein: 17,
    reason: '香、辣、快，适合今天想吃点有冲击力的。',
  },
  {
    name: '炸酱面',
    type: '拌面',
    price: '24',
    minutes: 13,
    calories: 700,
    protein: 22,
    reason: '酱香浓，黄瓜丝解腻，是很稳的工作日午餐。',
  },
  {
    name: '米线',
    type: '汤粉',
    price: '22',
    minutes: 10,
    calories: 560,
    protein: 18,
    reason: '清爽热汤，配菜选择多，吃完负担不大。',
  },
  {
    name: '酸辣粉',
    type: '粉面',
    price: '18',
    minutes: 9,
    calories: 540,
    protein: 10,
    reason: '酸辣开胃，适合没什么胃口但想吃点刺激的中午。',
  },
  {
    name: '土豆粉',
    type: '粉面',
    price: '21',
    minutes: 11,
    calories: 580,
    protein: 14,
    reason: '口感弹，汤底香，适合想吃热乎粉类的时候。',
  },
  {
    name: '螺蛳粉',
    type: '粉面',
    price: '25',
    minutes: 15,
    calories: 650,
    protein: 16,
    reason: '酸笋和汤底存在感强，适合今天想吃重口一点。',
  },
  {
    name: '凉皮',
    type: '小吃',
    price: '16',
    minutes: 7,
    calories: 450,
    protein: 9,
    reason: '清凉爽口，适合天气热或者午后不想犯困。',
  },
  {
    name: '麻辣烫',
    type: '自选',
    price: '32',
    minutes: 18,
    calories: 720,
    protein: 28,
    reason: '想吃什么自己夹，选择权很高，适合多人意见不统一。',
  },
  {
    name: '肉夹馍',
    type: '小吃',
    price: '17',
    minutes: 6,
    calories: 520,
    protein: 24,
    reason: '便宜快速，肉香直接，适合赶时间。',
  },
  {
    name: '羊肉汤',
    type: '汤食',
    price: '35',
    minutes: 18,
    calories: 580,
    protein: 32,
    reason: '热汤和蛋白质都足，适合想吃暖一点的时候。',
  },
  {
    name: '炒饭',
    type: '快餐',
    price: '20',
    minutes: 10,
    calories: 760,
    protein: 20,
    reason: '简单直接，出餐快，适合不想纠结。',
  },
  {
    name: '卤肉饭',
    type: '盖饭',
    price: '28',
    minutes: 13,
    calories: 780,
    protein: 28,
    reason: '卤汁下饭，满足感强，是很稳的午饭答案。',
  },
  {
    name: '黄焖鸡米饭',
    type: '盖饭',
    price: '29',
    minutes: 18,
    calories: 820,
    protein: 35,
    reason: '鸡肉、土豆、米饭组合稳定，汤汁拌饭很舒服。',
  },
  {
    name: '烤肉饭',
    type: '盖饭',
    price: '30',
    minutes: 14,
    calories: 850,
    protein: 34,
    reason: '肉香明显，适合今天想吃扎实一点。',
  },
  {
    name: '酸菜鱼',
    type: '鱼肉',
    price: '45',
    minutes: 25,
    calories: 680,
    protein: 38,
    reason: '鱼片高蛋白，酸辣开胃，适合想认真吃一顿。',
  },
  {
    name: '披萨',
    type: '西式',
    price: '42',
    minutes: 25,
    calories: 900,
    protein: 32,
    reason: '奶酪和碳水带来快乐，适合奖励型午餐。',
  },
  {
    name: '汉堡',
    type: '西式',
    price: '32',
    minutes: 10,
    calories: 720,
    protein: 30,
    reason: '拿了就走，蛋白质和碳水都够，适合赶时间。',
  },
  {
    name: '炸鸡',
    type: '西式',
    price: '35',
    minutes: 14,
    calories: 880,
    protein: 36,
    reason: '酥脆快乐，但更适合今天想放纵一下。',
  },
  {
    name: '寿司',
    type: '日料',
    price: '38',
    minutes: 12,
    calories: 520,
    protein: 22,
    reason: '清爽轻巧，适合不想吃热汤热饭的时候。',
  },
  {
    name: '煎饼果子',
    type: '小吃',
    price: '14',
    minutes: 5,
    calories: 560,
    protein: 18,
    reason: '便宜快手，适合把午饭简单解决掉。',
  },
  {
    name: '生煎',
    type: '小吃',
    price: '22',
    minutes: 10,
    calories: 620,
    protein: 20,
    reason: '外脆内香，配一碗汤就是舒服的一餐。',
  },
  {
    name: '烤鸭饭',
    type: '盖饭',
    price: '34',
    minutes: 14,
    calories: 820,
    protein: 32,
    reason: '鸭皮香、米饭稳，适合想吃点有仪式感。',
  },
  {
    name: '川菜小炒',
    type: '炒菜',
    price: '38',
    minutes: 22,
    calories: 760,
    protein: 30,
    reason: '下饭能力强，适合想吃热菜热饭。',
  },
  {
    name: '烤串',
    type: '烧烤',
    price: '45',
    minutes: 28,
    calories: 860,
    protein: 42,
    reason: '香气足，适合今天想把午饭吃得更开心。',
  },
];

function getDishFacts(item) {
  return {
    calories: item.calories || 650,
    protein: item.protein || 22,
    minutes: item.minutes || 15,
    priceLabel: item.price && Number.isFinite(Number(item.price)) ? `约 ${item.price} 元` : item.source === '高德' ? '高德附近' : '约 25 元',
  };
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 1000 * 60 * 5,
      timeout: 8000,
    });
  });
}

function loadAmap() {
  if (window.AMap) return Promise.resolve(window.AMap);
  if (amapLoaderPromise) return amapLoaderPromise;

  if (!AMAP_JS_KEY || !AMAP_SECURITY_CODE) {
    return Promise.reject(new Error('缺少高德 Web端 Key 或安全密钥'));
  }

  window._AMapSecurityConfig = {
    securityJsCode: AMAP_SECURITY_CODE,
  };

  amapLoaderPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('amap-jsapi');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    const timeoutId = window.setTimeout(() => {
      script.remove();
      amapLoaderPromise = null;
      reject(new Error('高德 JS API 加载超时'));
    }, AMAP_LOAD_TIMEOUT);

    script.id = 'amap-jsapi';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_JS_KEY}&plugin=AMap.PlaceSearch`;
    script.async = true;
    script.onload = () => {
      window.clearTimeout(timeoutId);
      if (window.AMap) {
        resolve(window.AMap);
        return;
      }

      amapLoaderPromise = null;
      reject(new Error('高德 JS API 未就绪'));
    };
    script.onerror = () => {
      window.clearTimeout(timeoutId);
      amapLoaderPromise = null;
      reject(new Error('高德 JS API 加载失败'));
    };
    document.head.appendChild(script);
  });

  return amapLoaderPromise;
}

function getAmapStatusText(error) {
  if (error?.code === 1) {
    return '点击开启定位';
  }

  if (error?.code === 3) {
    return '定位超时';
  }

  if (error?.message?.includes('加载')) {
    return '附近暂不可用';
  }

  return '附近暂不可用';
}

async function fetchAmapRestaurants() {
  const AMap = await loadAmap();
  const position = await getCurrentPosition();
  const { longitude, latitude } = position.coords;
  const placeSearch = new AMap.PlaceSearch({
    type: AMAP_RESTAURANT_TYPE,
    pageSize: 25,
    pageIndex: 1,
    extensions: 'all',
  });

  const pois = await new Promise((resolve, reject) => {
    placeSearch.searchNearBy('', [longitude, latitude], 3000, (status, result) => {
      if (status === 'complete' && result?.poiList?.pois) {
        resolve(result.poiList.pois);
        return;
      }

      reject(new Error(result?.info || '高德没有返回附近餐饮'));
    });
  });

  return pois
    .filter((poi) => poi.name)
    .map((poi) => {
      const cost = poi.biz_ext?.cost && poi.biz_ext.cost !== '[]' ? Math.round(Number(poi.biz_ext.cost)) : '';
      const rating = poi.biz_ext?.rating && poi.biz_ext.rating !== '[]' ? poi.biz_ext.rating : '';

      return {
        name: poi.name,
        type: poi.type?.split(';').at(-1) || '附近餐饮',
        price: cost ? String(cost) : '附近',
        minutes: Math.max(6, Math.min(30, Math.round((Number(poi.distance) || 900) / 80))),
        calories: 650,
        protein: 22,
        reason: `${poi.address || '附近'}${rating ? `，高德评分 ${rating}` : ''}`,
        source: '高德',
      };
    });
}

function App() {
  const [selectedLunch, setSelectedLunch] = useState(lunchPool[3]);
  const [previewLunch, setPreviewLunch] = useState(lunchPool[3]);
  const [remoteLunches, setRemoteLunches] = useState([]);
  const [sourceMode, setSourceMode] = useState('local');
  const [sourceStatus, setSourceStatus] = useState('本地推荐');
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasHit, setHasHit] = useState(false);
  const [isCandidatesOpen, setIsCandidatesOpen] = useState(false);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const hitTimeoutRef = useRef(null);
  const nearbyRequestRef = useRef(0);

  const hasAmapConfig = Boolean(AMAP_JS_KEY && AMAP_SECURITY_CODE);
  const isUsingNearby = sourceMode === 'nearby' && remoteLunches.length > 0;
  const availableLunches = isUsingNearby ? remoteLunches : lunchPool;
  const shownLunch = isDrawing ? previewLunch : selectedLunch;
  const shownFacts = getDishFacts(shownLunch);
  const collapsedLunches = availableLunches.some((item, index) => item.name === selectedLunch.name && index < COLLAPSED_CANDIDATE_COUNT)
    ? availableLunches.slice(0, COLLAPSED_CANDIDATE_COUNT)
    : [selectedLunch, ...availableLunches.filter((item) => item.name !== selectedLunch.name)].slice(0, COLLAPSED_CANDIDATE_COUNT);
  const visibleLunches = isCandidatesOpen ? availableLunches : collapsedLunches;
  const hiddenCandidateCount = Math.max(0, availableLunches.length - visibleLunches.length);

  const drawLunch = () => {
    if (isDrawing) return;

    if (hitTimeoutRef.current) {
      window.clearTimeout(hitTimeoutRef.current);
      hitTimeoutRef.current = null;
    }

    setIsDrawing(true);
    setHasHit(false);

    let ticks = 0;
    intervalRef.current = window.setInterval(() => {
      ticks += 1;
      setPreviewLunch(availableLunches[(ticks * 5 + Math.floor(Math.random() * availableLunches.length)) % availableLunches.length]);
    }, 70);

    timeoutRef.current = window.setTimeout(() => {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      const pool = availableLunches.filter((item) => item.name !== selectedLunch.name);
      const drawable = pool.length > 0 ? pool : availableLunches;
      const nextLunch = drawable[Math.floor(Math.random() * drawable.length)];
      setSelectedLunch(nextLunch);
      setPreviewLunch(nextLunch);
      setIsDrawing(false);
      setHasHit(true);
      hitTimeoutRef.current = window.setTimeout(() => {
        setHasHit(false);
      }, 620);
    }, 920);
  };

  const loadNearbyLunches = () => {
    if (!hasAmapConfig) {
      setSourceStatus('需要配置高德');
      return;
    }

    const requestId = nearbyRequestRef.current + 1;
    nearbyRequestRef.current = requestId;
    setIsLoadingNearby(true);
    setSourceStatus('读取附近中');
    fetchAmapRestaurants()
      .then((restaurants) => {
        if (nearbyRequestRef.current !== requestId) return;
        if (restaurants.length === 0) {
          setSourceStatus('附近暂无结果');
          return;
        }

        setRemoteLunches(restaurants);
        setSelectedLunch(restaurants[0]);
        setPreviewLunch(restaurants[0]);
        setSourceStatus(`附近推荐 · ${restaurants.length} 家`);
      })
      .catch((error) => {
        if (nearbyRequestRef.current === requestId) {
          setSourceStatus(getAmapStatusText(error));
        }
      })
      .finally(() => {
        if (nearbyRequestRef.current === requestId) {
          setIsLoadingNearby(false);
        }
      });
  };

  const selectLocalSource = () => {
    nearbyRequestRef.current += 1;
    setSourceMode('local');
    setSourceStatus('本地推荐');
    setIsLoadingNearby(false);
    setIsCandidatesOpen(false);

    if (!lunchPool.some((item) => item.name === selectedLunch.name)) {
      setSelectedLunch(lunchPool[3]);
      setPreviewLunch(lunchPool[3]);
    }
  };

  const selectNearbySource = () => {
    setSourceMode('nearby');
    setIsCandidatesOpen(false);

    if (remoteLunches.length > 0 && !isLoadingNearby) {
      setSelectedLunch(remoteLunches[0]);
      setPreviewLunch(remoteLunches[0]);
      setSourceStatus(`附近推荐 · ${remoteLunches.length} 家`);
      return;
    }

    loadNearbyLunches();
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (hitTimeoutRef.current) window.clearTimeout(hitTimeoutRef.current);
    };
  }, []);

  return (
    <main className="minimal-shell min-h-screen px-6 py-10 sm:px-10">
      <header className="minimal-nav mx-auto flex max-w-5xl items-center justify-between">
        <span>Lunch?</span>
        <div className="source-control">
          <div className="source-switch" aria-label="选择推荐来源">
            <button
              className={sourceMode === 'local' ? 'active' : ''}
              type="button"
              onClick={selectLocalSource}
              aria-pressed={sourceMode === 'local'}
            >
              本地
            </button>
            <button
              className={sourceMode === 'nearby' ? 'active' : ''}
              type="button"
              onClick={selectNearbySource}
              disabled={isLoadingNearby}
              aria-pressed={sourceMode === 'nearby'}
              title="使用附近餐饮"
            >
              <MapPin size={13} />
              附近
            </button>
          </div>
          <span className="source-hint">{sourceStatus}</span>
        </div>
      </header>
      <section className="minimal-stage mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-center">
        <div className="glass-card">
          <p className="minimal-kicker">今天中午</p>
          <h1>中午吃什么</h1>

          <button
            className={`answer-button ${isDrawing ? 'rolling' : ''} ${hasHit ? 'hit' : ''}`}
            type="button"
            onClick={drawLunch}
            disabled={isDrawing}
            aria-label="随机抽一份午饭"
          >
            <span className="result-word">{shownLunch.name}</span>
            <RefreshCcw size={22} />
          </button>

          <p className="minimal-note">{isDrawing ? '正在想...' : shownLunch.reason}</p>

          <div className="dish-facts" aria-label="菜品基础信息">
            <span>热量约 {shownFacts.calories} kcal</span>
            <span>蛋白质 {shownFacts.protein}g</span>
            <span>{shownFacts.minutes} 分钟</span>
            <span>{shownFacts.priceLabel}</span>
          </div>

          <div className="food-cloud-head">
            <span>{isUsingNearby ? '附近候选' : '本地候选'}</span>
            {availableLunches.length > COLLAPSED_CANDIDATE_COUNT && (
              <button
                className={`food-cloud-toggle ${isCandidatesOpen ? 'open' : ''}`}
                type="button"
                onClick={() => setIsCandidatesOpen((current) => !current)}
              >
                {isCandidatesOpen ? '收起' : `更多 ${hiddenCandidateCount}`}
                <ChevronDown size={14} />
              </button>
            )}
          </div>

          <div className="food-cloud" aria-label="午饭候选">
            {visibleLunches.map((item) => (
              <button
                key={item.name}
                type="button"
                className={item.name === selectedLunch.name ? 'active' : ''}
                onClick={() => {
                  setSelectedLunch(item);
                  setPreviewLunch(item);
                  setHasHit(false);
                }}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
