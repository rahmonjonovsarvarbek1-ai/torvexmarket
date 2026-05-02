// ═══════════════════════════════════════════════════════════════
//  TORVEX — script.js  v2.1.0
//  Barcha funksiyalar ishlaydigan to'liq JavaScript
// ═══════════════════════════════════════════════════════════════

"use strict";

// ────────────────────────────────────────────────────────────────
// 1. FIREBASE CONFIGURATION
// ────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let db, auth, storage, currentUser = null;

function initFirebase() {
  try {
    if (typeof firebase !== "undefined") {
      if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
      db      = firebase.firestore();
      auth    = firebase.auth();
      storage = firebase.storage();
      auth.onAuthStateChanged(handleAuthStateChange);
    } else {
      console.warn("Firebase yuklanmadi — demo rejimda ishlayapti");
      loadDemoData();
    }
  } catch (e) {
    console.warn("Firebase xatosi:", e.message);
    loadDemoData();
  }
}

// ────────────────────────────────────────────────────────────────
// 2. DEMO / MOCK DATA
// ────────────────────────────────────────────────────────────────
const DEMO_MASTERS = [
  { id:"m1", name:"Jasur Qodirov",    job:"Elektrik",    rating:4.9, reviews:127, exp:8,  price:250000, region:"toshkent", online:true,  avatar:"https://i.pravatar.cc/80?img=1",  verified:true  },
  { id:"m2", name:"Bobur Toshmatov",  job:"Santexnik",   rating:4.8, reviews:98,  exp:12, price:200000, region:"toshkent", online:true,  avatar:"https://i.pravatar.cc/80?img=2",  verified:true  },
  { id:"m3", name:"Dilshod Yusupov",  job:"Malyar",      rating:4.7, reviews:85,  exp:6,  price:180000, region:"samarkand",online:false, avatar:"https://i.pravatar.cc/80?img=3",  verified:false },
  { id:"m4", name:"Mansur Holmatov",  job:"Kafelchi",    rating:4.9, reviews:143, exp:10, price:300000, region:"namangan", online:true,  avatar:"https://i.pravatar.cc/80?img=4",  verified:true  },
  { id:"m5", name:"Otabek Rahimov",   job:"Duradgor",    rating:4.6, reviews:62,  exp:5,  price:220000, region:"andijan",  online:false, avatar:"https://i.pravatar.cc/80?img=5",  verified:false },
  { id:"m6", name:"Sanjar Nazarov",   job:"Gipschi",     rating:4.8, reviews:109, exp:9,  price:240000, region:"buxoro",   online:true,  avatar:"https://i.pravatar.cc/80?img=6",  verified:true  },
  { id:"m7", name:"Firdavs Ergashev", job:"Konditsioner",rating:4.7, reviews:77,  exp:7,  price:280000, region:"fargona",  online:true,  avatar:"https://i.pravatar.cc/80?img=7",  verified:false },
  { id:"m8", name:"Alisher Mirzayev", job:"Payvandchi",  rating:4.5, reviews:55,  exp:11, price:350000, region:"toshkent", online:false, avatar:"https://i.pravatar.cc/80?img=8",  verified:true  },
  { id:"m9", name:"Hamza Sultonov",   job:"Arxitektor",  rating:4.9, reviews:201, exp:15, price:500000, region:"toshkent", online:true,  avatar:"https://i.pravatar.cc/80?img=9",  verified:true  },
  { id:"m10",name:"Zafar Ismoilov",   job:"Elektrik",    rating:4.6, reviews:88,  exp:6,  price:230000, region:"samarkand",online:true,  avatar:"https://i.pravatar.cc/80?img=10", verified:false },
  { id:"m11",name:"Nodir Xolmatov",   job:"Santexnik",   rating:4.8, reviews:115, exp:8,  price:210000, region:"namangan", online:false, avatar:"https://i.pravatar.cc/80?img=11", verified:true  },
  { id:"m12",name:"Bekzod Tursunov",  job:"Malyar",      rating:4.5, reviews:49,  exp:4,  price:170000, region:"andijan",  online:true,  avatar:"https://i.pravatar.cc/80?img=12", verified:false },
];

const DEMO_PRODUCTS = [
  { id:"p1",  name:"Portland Sement M400",    cat:"sement",  price:68000,  oldPrice:75000, unit:"qop",    stock:500, rating:4.8, reviews:312, img:"https://placehold.co/280x200/1a1a2e/7c6af7?text=Sement",    seller:"Qurilish Markazi",   discount:9  },
  { id:"p2",  name:"Armatura 12mm (12m)",     cat:"arma",    price:95000,  oldPrice:null,  unit:"dona",   stock:200, rating:4.7, reviews:156, img:"https://placehold.co/280x200/1a1a2e/4ade80?text=Armatura",  seller:"MetalTrade",         discount:0  },
  { id:"p3",  name:"Gips qorishma Knauf",     cat:"gips",    price:42000,  oldPrice:50000, unit:"qop",    stock:300, rating:4.9, reviews:428, img:"https://placehold.co/280x200/1a1a2e/f59e0b?text=Gips",      seller:"EuroStroy",          discount:16 },
  { id:"p4",  name:"Kabel NYM 3x2.5mm²",     cat:"elektr",  price:18500,  oldPrice:null,  unit:"metr",   stock:2000,rating:4.6, reviews:89,  img:"https://placehold.co/280x200/1a1a2e/60a5fa?text=Kabel",     seller:"ElektroShop",        discount:0  },
  { id:"p5",  name:"Polipropilen truba 25mm", cat:"santex",  price:12000,  oldPrice:14000, unit:"metr",   stock:500, rating:4.7, reviews:203, img:"https://placehold.co/280x200/1a1a2e/34d399?text=Truba",     seller:"Santex Pro",         discount:14 },
  { id:"p6",  name:"Perforator Bosch GBH 2", cat:"asbob",   price:1250000,oldPrice:null,  unit:"dona",   stock:45,  rating:4.9, reviews:567, img:"https://placehold.co/280x200/1a1a2e/f97316?text=Bosch",     seller:"Asbob Dunyo",        discount:0  },
  { id:"p7",  name:"Interior bo'yoq 25kg",   cat:"boyoq",   price:180000, oldPrice:200000,unit:"chelak", stock:80,  rating:4.5, reviews:134, img:"https://placehold.co/280x200/1a1a2e/a78bfa?text=Boyoq",     seller:"ColorMix",           discount:10 },
  { id:"p8",  name:"Tile fix yapishqoq 25kg",cat:"qorishma",price:55000,  oldPrice:null,  unit:"qop",    stock:400, rating:4.8, reviews:267, img:"https://placehold.co/280x200/1a1a2e/f43f5e?text=TileFix",   seller:"Qurilish Markazi",   discount:0  },
  { id:"p9",  name:"Laminat 8mm (1m²)",      cat:"yogoch",  price:85000,  oldPrice:95000, unit:"m²",     stock:300, rating:4.6, reviews:178, img:"https://placehold.co/280x200/1a1a2e/d97706?text=Laminat",  seller:"WoodMaster",         discount:11 },
  { id:"p10", name:"Gofrirovka truba 50m",   cat:"elektr",  price:35000,  oldPrice:null,  unit:"rulon",  stock:150, rating:4.4, reviews:67,  img:"https://placehold.co/280x200/1a1a2e/06b6d4?text=Gofra",     seller:"ElektroShop",        discount:0  },
  { id:"p11", name:"Shkurkali qogoz assort", cat:"asbob",   price:8500,   oldPrice:10000, unit:"to'plam",stock:600, rating:4.3, reviews:44,  img:"https://placehold.co/280x200/1a1a2e/84cc16?text=Shkurka",   seller:"Asbob Dunyo",        discount:15 },
  { id:"p12", name:"Sement M500 50kg",       cat:"sement",  price:82000,  oldPrice:null,  unit:"qop",    stock:700, rating:4.9, reviews:389, img:"https://placehold.co/280x200/1a1a2e/7c6af7?text=M500",      seller:"QurilishTrade",      discount:0  },
];

const DEMO_POSTS = [
  { id:"f1",  type:"sale",    author:"Jasur Q.",   avatar:"https://i.pravatar.cc/40?img=1",  time:"5 daqiqa oldin",   text:"Sement M400 optom narxda sotiladi! 68,000 so'm/qop. 50 qopdan yuqori buyurtmada 5% chegirma. Toshkent, Yunusobod.",      price:68000,  likes:24,  comments:8,  liked:false, saved:false, region:"toshkent" },
  { id:"f2",  type:"job",     author:"Mansur H.",  avatar:"https://i.pravatar.cc/40?img=4",  time:"15 daqiqa oldin",  text:"Kafel yotqizish ustasi kerak! Yangi qurilgan 3 xonali kvartira — 85m². Ish haqi muzokarali. Toshkent, Chilonzor.",                likes:12,  comments:5,  liked:false, saved:false, region:"toshkent" },
  { id:"f3",  type:"service", author:"Bobur T.",   avatar:"https://i.pravatar.cc/40?img=2",  time:"30 daqiqa oldin",  text:"Santexnik xizmatlari! Kran almashtirish, quvur yotqizish, vannaxona ta'miri. Kafolat bilan. +998 90 123 45 67",              likes:18,  comments:3,  liked:false, saved:false, region:"toshkent" },
  { id:"f4",  type:"sale",    author:"Dilshod Y.", avatar:"https://i.pravatar.cc/40?img=3",  time:"1 soat oldin",     text:"Arzon laminat! 8mm, turli ranglar. 85,000 so'm/m². Buyurtma bersangiz bepul yetkazib beramiz (Toshkent bo'ylab).",         price:85000,  likes:31,  comments:11, liked:true,  saved:false, region:"toshkent" },
  { id:"f5",  type:"buy",     author:"Alisher M.", avatar:"https://i.pravatar.cc/40?img=8",  time:"2 soat oldin",     text:"Perforator sotib olaman. Bosch yoki Makita, ishlangan bo'lsa ham bo'ladi. Narxi muzokarada. Aloqa: +998 91 234 56 78",      likes:7,   comments:2,  liked:false, saved:false, region:"toshkent" },
  { id:"f6",  type:"news",    author:"TORVEX",     avatar:"https://i.pravatar.cc/40?img=20", time:"3 soat oldin",     text:"🎉 TORVEX platformasida yangi funksiya! Endi ustalar bilan to'g'ridan-to'g'ri video qo'ng'iroq qilish mumkin. Sinab ko'ring!", likes:156, comments:43, liked:false, saved:false, region:"all"      },
  { id:"f7",  type:"service", author:"Hamza S.",   avatar:"https://i.pravatar.cc/40?img=9",  time:"5 soat oldin",     text:"Arxitektor xizmatlari. Uy loyihasi, interyer dizayn, 3D vizualizatsiya. Tajriba 15 yil. Konsultatsiya bepul!",                likes:44,  comments:9,  liked:false, saved:false, region:"toshkent" },
  { id:"f8",  type:"sale",    author:"Sanjar N.",  avatar:"https://i.pravatar.cc/40?img=6",  time:"1 kun oldin",      text:"Gips ishlari! m² dan 35,000 so'm. Devor va shiftga. Materiallar bilan. Sifat kafolati 2 yil. Toshkent va viloyatlar.",        price:35000,  likes:27,  comments:6,  liked:false, saved:true,  region:"toshkent" },
];

const DEMO_NEWS = [
  { id:"n1", cat:"market",   title:"Sement narxi yanvar oyida 8% ga tushdi",                    summary:"Qurilish materiallari bozorida narxlar kamaymoqda. Ekspertlar bunga import hajmining oshganini aytmoqda.",                  time:"2 soat oldin",  views:1240 },
  { id:"n2", cat:"platform", title:"TORVEX da 5000-chi usta ro'yxatdan o'tdi",                  summary:"Platforma tez sur'atda rivojlanmoqda. Bu yilning birinchi choragida foydalanuvchilar soni 3 baravar oshdi.",                time:"1 kun oldin",   views:3450 },
  { id:"n3", cat:"laws",     title:"Qurilish xizmatlari uchun yangi litsenziya talablari",       summary:"O'zbekiston Davlat Arxitektura Qo'mitasi yangi qoidalarni joriy qildi. Ustalar majburiy sertifikat olishlari kerak.",       time:"2 kun oldin",   views:892  },
  { id:"n4", cat:"tech",     title:"AI yordamida qurilish xarajatlarini hisoblash texnologiyasi",summary:"Yangi sun'iy intellekt asosidagi tizim loyiha xarajatlarini 95% aniqlik bilan hisoblay oladi.",                           time:"3 kun oldin",   views:2100 },
  { id:"n5", cat:"market",   title:"Armatura narxlari barqarorlashmoqda",                       summary:"Metalloprokat bozorida narxlar uch oylik ko'tarilishdan keyin barqarorlashdi. Qurilishchilar narxning pasayishini kutmoqda.", time:"4 kun oldin",   views:675  },
  { id:"n6", cat:"platform", title:"TORVEX mobil ilovasi App Store'da 1-o'ringa chiqdi",        summary:"O'zbek qurilish platformasi Uzbekistan App Store'da 'Biznes' kategoriyasida birinchi o'rinni egalladi.",                    time:"5 kun oldin",   views:5670 },
];

const DEMO_CATEGORIES = [
  { icon:"fas fa-bolt",          label:"Elektrik",    count:245, color:"#f59e0b", section:"ustalar" },
  { icon:"fas fa-faucet",        label:"Santexnika",  count:189, color:"#3b82f6", section:"ustalar" },
  { icon:"fas fa-paint-roller",  label:"Malyar",      count:312, color:"#10b981", section:"ustalar" },
  { icon:"fas fa-th-large",      label:"Kafelchi",    count:176, color:"#8b5cf6", section:"ustalar" },
  { icon:"fas fa-hammer",        label:"Duradgor",    count:134, color:"#ef4444", section:"ustalar" },
  { icon:"fas fa-cubes",         label:"Sement",      count:88,  color:"#6b7280", section:"bozor"   },
  { icon:"fas fa-tools",         label:"Asboblar",    count:220, color:"#f97316", section:"bozor"   },
  { icon:"fas fa-drafting-compass",label:"Arxitektor",count:67,  color:"#06b6d4", section:"ustalar" },
];

const DEMO_CHATS = [
  { id:"c1", name:"Jasur Qodirov",   avatar:"https://i.pravatar.cc/50?img=1",  last:"Xabar uchun rahmat!",     time:"10:24", unread:2, online:true  },
  { id:"c2", name:"Bobur Toshmatov", avatar:"https://i.pravatar.cc/50?img=2",  last:"Yaxshi, men boray",        time:"Kecha", unread:0, online:false },
  { id:"c3", name:"Mansur Holmatov", avatar:"https://i.pravatar.cc/50?img=4",  last:"Narxini yuboring",         time:"Dush",  unread:5, online:true  },
  { id:"c4", name:"TORVEX Support",  avatar:"https://i.pravatar.cc/50?img=20", last:"Muammoingiz hal qilindi!", time:"01.05", unread:0, online:true  },
];

const DEMO_NOTIFICATIONS = [
  { id:"notif1", type:"message",  icon:"fas fa-comment",    color:"blue",   title:"Jasur Qodirov xabar yozdi",     body:"Holat qanday? Ish boshladingizmi?",   time:"5 daqiqa oldin", read:false },
  { id:"notif2", type:"review",   icon:"fas fa-star",       color:"amber",  title:"Yangi sharh qoldirildi",         body:"Mansur H. sizga 5 yulduz berdi!",     time:"1 soat oldin",   read:false },
  { id:"notif3", type:"system",   icon:"fas fa-bell",       color:"purple", title:"TORVEX Premium taklif",          body:"Bugun 30% chegirma bilan obunacha ol",time:"3 soat oldin",   read:false },
  { id:"notif4", type:"order",    icon:"fas fa-shopping-bag",color:"green", title:"Buyurtma tasdiqlandi",           body:"Armatura 12mm x5 — yetkazib beriladi",time:"1 kun oldin",    read:true  },
  { id:"notif5", type:"price",    icon:"fas fa-tag",        color:"red",    title:"Narx o'zgardi",                  body:"Sement M400: 68,000 → 65,000 so'm",   time:"2 kun oldin",    read:true  },
];

const PRICE_TICKER_DATA = [
  { name:"Sement M400",   price:68000,  change:"-5%",   dir:"down"  },
  { name:"Armatura 12mm", price:95000,  change:"+2%",   dir:"up"    },
  { name:"Gips Knauf",    price:42000,  change:"-1%",   dir:"down"  },
  { name:"Kabel NYM 2.5", price:18500,  change:"0%",    dir:"same"  },
  { name:"Laminat 8mm",   price:85000,  change:"+3%",   dir:"up"    },
  { name:"Tile Fix 25kg", price:55000,  change:"-2%",   dir:"down"  },
  { name:"Bo'yoq 25kg",   price:180000, change:"+1%",   dir:"up"    },
];

const SERVICE_CATEGORIES = [
  { icon:"fas fa-bolt",           label:"Elektr ishlari",         desc:"O'rnatish, ta'mirlash, tarmoq",         color:"#f59e0b" },
  { icon:"fas fa-faucet",         label:"Santexnika",             desc:"Trubalar, kran, hammom",                color:"#3b82f6" },
  { icon:"fas fa-paint-roller",   label:"Malyar ishlari",         desc:"Bo'yash, shtukaturka, suvash",          color:"#10b981" },
  { icon:"fas fa-th-large",       label:"Kafel yotqizish",        desc:"Pol, devor, vannaxona",                 color:"#8b5cf6" },
  { icon:"fas fa-hammer",         label:"Duradgorlik",            desc:"Eshik, deraza, mebel",                  color:"#ef4444" },
  { icon:"fas fa-layer-group",    label:"Gips ishlari",           desc:"Shift, dekorativ elementlar",           color:"#6366f1" },
  { icon:"fas fa-snowflake",      label:"Konditsioner",           desc:"O'rnatish, ta'mirlash, servis",         color:"#06b6d4" },
  { icon:"fas fa-fire",           label:"Payvandlash",            desc:"Metall, truba, konstruksiya",           color:"#f97316" },
  { icon:"fas fa-drafting-compass",label:"Arxitektura",           desc:"Loyiha, dizayn, vizualizatsiya",        color:"#84cc16" },
  { icon:"fas fa-shield-alt",     label:"Xavfsizlik",             desc:"Kamera, signalizatsiya, qulf",          color:"#64748b" },
  { icon:"fas fa-trash-alt",      label:"Yuk tashlash",           desc:"Qurilish chiqindilarini olib ketish",   color:"#78716c" },
  { icon:"fas fa-hard-hat",       label:"Qurilish nazorati",      desc:"Texnik nazorat, ekspertiza",            color:"#a78bfa" },
];

// ────────────────────────────────────────────────────────────────
// 3. STATE
// ────────────────────────────────────────────────────────────────
const state = {
  currentSection: "dash",
  theme: localStorage.getItem("torvex-theme") || "dark",
  masters: [...DEMO_MASTERS],
  filteredMasters: [...DEMO_MASTERS],
  masterJobFilter: "all",
  masterRegionFilter: "all",
  products: [...DEMO_PRODUCTS],
  filteredProducts: [...DEMO_PRODUCTS],
  marketCatFilter: "all",
  posts: [...DEMO_POSTS],
  filteredPosts: [...DEMO_POSTS],
  cart: JSON.parse(localStorage.getItem("torvex-cart") || "[]"),
  favorites: JSON.parse(localStorage.getItem("torvex-favs") || "{}"),
  notifications: [...DEMO_NOTIFICATIONS],
  chats: [...DEMO_CHATS],
  messages: {},
  activeChat: null,
  postType: "sale",
  reviewStar: 0,
  calcTab: "material",
  analyticsPeriod: "month",
  searchHistory: JSON.parse(localStorage.getItem("torvex-search") || "[]"),
  onlineCount: 247,
  billingPeriod: "monthly",
  aiHistory: [],
  notifFilter: "all",
  projectView: "grid",
  marketView: "grid",
  composerLocation: null,
  feedSort: "recent",
  postsPage: 1,
  productsPage: 1,
  mastersPage: 1,
  news: [...DEMO_NEWS],
  newsFilter: "all",
  fabOpen: false,
  notifPanelOpen: false,
  cartOpen: false,
  sidebarOpen: false,
};

// ────────────────────────────────────────────────────────────────
// 4. INIT
// ────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initFirebase();
  applyTheme(state.theme);
  hideLoadingScreen();
  renderDashboard();
  setupKeyboardShortcuts();
  startLiveCounters();
  startPriceTicker();
  loadWeather();
  setupSearchDropdown();
  renderNotifications();
  updateCartBadge();
});

function hideLoadingScreen() {
  const screen = document.getElementById("loadingScreen");
  if (!screen) return;
  const fill = screen.querySelector(".loader-fill");
  if (fill) {
    let pct = 0;
    const iv = setInterval(() => {
      pct += Math.random() * 15;
      fill.style.width = Math.min(pct, 95) + "%";
      if (pct >= 95) clearInterval(iv);
    }, 120);
  }
  setTimeout(() => {
    if (fill) fill.style.width = "100%";
    setTimeout(() => {
      screen.style.opacity = "0";
      screen.style.transition = "opacity 0.5s ease";
      setTimeout(() => screen.remove(), 500);
    }, 300);
  }, 1800);
}

function loadDemoData() {
  setTimeout(() => {
    renderDashboard();
  }, 100);
}

// ────────────────────────────────────────────────────────────────
// 5. SECTION NAVIGATION
// ────────────────────────────────────────────────────────────────
function showSection(id) {
  // Hide all
  document.querySelectorAll(".section").forEach(s => {
    s.style.display = "none";
    s.classList.remove("active");
  });

  // Deactivate nav items
  document.querySelectorAll(".nav-item, .bn-item").forEach(n => {
    n.classList.remove("active");
    n.removeAttribute("aria-current");
  });

  // Show target
  const target = document.getElementById(id);
  if (!target) return;
  target.style.display = "";
  target.classList.add("active");

  // Activate nav
  const navEl = document.getElementById("nav-" + id);
  if (navEl) { navEl.classList.add("active"); navEl.setAttribute("aria-current", "page"); }
  const bnEl = document.getElementById("bn-" + id);
  if (bnEl) { bnEl.classList.add("active"); bnEl.setAttribute("aria-current", "page"); }

  // Update breadcrumb
  const names = {
    dash:"Dashboard", feed:"Lenta", ustalar:"Ustalar", bozor:"Bozor",
    xizmatlar:"Xizmatlar", muhokama:"Xabarlar", loyihalar:"Loyihalar",
    analitika:"Analitika", karta:"Xarita", yangiliklar:"Yangiliklar",
    sevimlilari:"Sevimlilar", profil:"Profil", sozlamalar:"Sozlamalar"
  };
  const bc = document.getElementById("tbSectionName");
  if (bc) bc.textContent = names[id] || id;

  state.currentSection = id;

  // Lazy-render sections
  const renderers = {
    dash: renderDashboard,
    feed: renderFullFeed,
    ustalar: renderMasters,
    bozor: renderMarket,
    xizmatlar: renderServices,
    muhokama: renderMessenger,
    loyihalar: renderProjects,
    analitika: renderAnalytics,
    yangiliklar: renderNews,
    sevimlilari: renderFavorites,
    profil: renderProfile,
    sozlamalar: renderSettings,
    karta: renderMap,
  };
  if (renderers[id]) renderers[id]();

  // Close mobile sidebar
  closeSidebar();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ────────────────────────────────────────────────────────────────
// 6. DASHBOARD
// ────────────────────────────────────────────────────────────────
function renderDashboard() {
  animateCounters();
  renderTopMasters();
  renderPriceTicker();
  renderTrendingCategories();
  renderPostsFeed();
  renderQuickContacts();
  renderProjectMiniList();
  startHeroParticles();
}

function animateCounters() {
  document.querySelectorAll(".stat-number[data-count]").forEach(el => {
    const target = parseInt(el.dataset.count);
    let current = 0;
    const step = Math.ceil(target / 60);
    const iv = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString("uz-UZ");
      if (current >= target) clearInterval(iv);
    }, 20);
  });
}

function renderTopMasters() {
  const list = document.getElementById("topMastersList");
  if (!list) return;
  const top5 = [...state.masters].sort((a, b) => b.rating - a.rating).slice(0, 5);
  list.innerHTML = top5.map((m, i) => `
    <li class="tm-item" onclick="openMasterModal('${m.id}')" role="button" tabindex="0">
      <span class="tm-rank">${i + 1}</span>
      <img src="${m.avatar}" alt="${m.name}" class="tm-avatar" loading="lazy" />
      <div class="tm-info">
        <span class="tm-name">${m.name}${m.verified ? ' <i class="fas fa-check-circle" style="color:#3b82f6;font-size:11px"></i>' : ''}</span>
        <span class="tm-job">${m.job}</span>
      </div>
      <div class="tm-rating">
        <i class="fas fa-star" style="color:#f59e0b;font-size:11px"></i>
        <span>${m.rating}</span>
      </div>
    </li>
  `).join("");
}

function renderPriceTicker() {
  const list = document.getElementById("priceTicker");
  if (!list) return;
  list.innerHTML = PRICE_TICKER_DATA.map(p => `
    <li class="pt-item">
      <span class="pt-name">${p.name}</span>
      <span class="pt-price">${formatPrice(p.price)}</span>
      <span class="pt-change ${p.dir === 'up' ? 'up' : p.dir === 'down' ? 'down' : ''}">
        <i class="fas fa-arrow-${p.dir === 'up' ? 'up' : p.dir === 'down' ? 'down' : 'right'}"></i>
        ${p.change}
      </span>
    </li>
  `).join("");
}

function startPriceTicker() {
  setInterval(() => {
    if (state.currentSection !== "dash") return;
    PRICE_TICKER_DATA.forEach(p => {
      const delta = (Math.random() - 0.5) * 0.02;
      p.price = Math.max(1000, Math.round(p.price * (1 + delta)));
      const pct = (delta * 100).toFixed(1);
      p.change = (delta > 0 ? "+" : "") + pct + "%";
      p.dir = delta > 0.005 ? "up" : delta < -0.005 ? "down" : "same";
    });
    renderPriceTicker();
  }, 8000);
}

function renderTrendingCategories() {
  const grid = document.getElementById("trendingGrid");
  if (!grid) return;
  grid.innerHTML = DEMO_CATEGORIES.map(c => `
    <div class="trend-card" onclick="showSection('${c.section}')" role="listitem" style="cursor:pointer;">
      <span class="trend-icon" style="background:${c.color}22;color:${c.color}">
        <i class="${c.icon}"></i>
      </span>
      <div class="trend-info">
        <strong>${c.label}</strong>
        <span>${c.count} ta</span>
      </div>
    </div>
  `).join("");
}

function renderPostsFeed(append = false) {
  const container = document.getElementById("postsFeed");
  if (!container) return;
  const skeleton = container.querySelector(".feed-skeleton");
  if (skeleton && !append) skeleton.remove();

  const posts = state.filteredPosts.slice(0, state.postsPage * 5);
  if (!append) container.innerHTML = "";

  posts.slice((state.postsPage - 1) * 5).forEach(p => {
    container.appendChild(createPostCard(p));
  });
}

function createPostCard(post) {
  const div = document.createElement("div");
  div.className = "post-card";
  div.dataset.postId = post.id;
  const typeLabel = { sale:"Sotiladi", buy:"Xarid", service:"Xizmat", job:"Ish", news:"Xabar" };
  const typeColor = { sale:"green", buy:"blue", service:"purple", job:"amber", news:"red" };
  div.innerHTML = `
    <div class="pc-header">
      <img src="${post.avatar}" alt="${post.author}" class="pc-avatar" loading="lazy" />
      <div class="pc-meta">
        <span class="pc-author">${post.author}</span>
        <span class="pc-time">${post.time}</span>
      </div>
      <span class="pc-type badge-${typeColor[post.type]}">${typeLabel[post.type]}</span>
    </div>
    <p class="pc-text">${post.text}</p>
    ${post.price ? `<div class="pc-price">${formatPrice(post.price)}</div>` : ""}
    <div class="pc-actions">
      <button class="pc-btn ${post.liked ? 'liked' : ''}" onclick="toggleLike('${post.id}',this)" aria-label="Like">
        <i class="${post.liked ? 'fas' : 'far'} fa-heart"></i> <span>${post.likes}</span>
      </button>
      <button class="pc-btn" onclick="openComments('${post.id}')" aria-label="Izoh">
        <i class="far fa-comment"></i> <span>${post.comments}</span>
      </button>
      <button class="pc-btn" onclick="sharePost('${post.id}')" aria-label="Ulashish">
        <i class="fas fa-share-alt"></i>
      </button>
      <button class="pc-btn ${post.saved ? 'saved' : ''}" onclick="toggleSavePost('${post.id}',this)" aria-label="Saqlash" style="margin-left:auto">
        <i class="${post.saved ? 'fas' : 'far'} fa-bookmark"></i>
      </button>
    </div>
  `;
  return div;
}

function toggleLike(postId, btn) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
  const icon = btn.querySelector("i");
  const count = btn.querySelector("span");
  icon.className = post.liked ? "fas fa-heart" : "far fa-heart";
  btn.classList.toggle("liked", post.liked);
  if (count) count.textContent = post.likes;
}

function toggleSavePost(postId, btn) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;
  post.saved = !post.saved;
  const icon = btn.querySelector("i");
  icon.className = post.saved ? "fas fa-bookmark" : "far fa-bookmark";
  btn.classList.toggle("saved", post.saved);
  showToast(post.saved ? "Saqlandi" : "Saqlashdan olib tashlandi", "success");
}

function openComments(postId) {
  showToast("Izohlar tez orada", "info");
}

function sharePost(postId) {
  if (navigator.share) {
    navigator.share({ title: "TORVEX e'lon", url: window.location.href })
      .catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href)
      .then(() => showToast("Havola nusxalandi", "success"))
      .catch(() => showToast("Nusxalab bo'lmadi", "error"));
  }
}

function loadMorePosts() {
  state.postsPage++;
  renderPostsFeed(true);
}

function changeFeedSort(val) {
  state.feedSort = val;
  state.postsPage = 1;
  if (val === "trending") {
    state.filteredPosts = [...state.posts].sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments));
  } else {
    state.filteredPosts = [...state.posts];
  }
  renderPostsFeed();
}

function renderQuickContacts() {
  const el = document.getElementById("quickContactsList");
  if (!el) return;
  el.innerHTML = state.chats.map(c => `
    <div class="qc-item" onclick="openChat('${c.id}')" role="button" title="${c.name}">
      <div style="position:relative;display:inline-block">
        <img src="${c.avatar}" alt="${c.name}" class="qc-avatar" loading="lazy" />
        ${c.online ? '<span class="qc-online-dot"></span>' : ''}
      </div>
      <span class="qc-name">${c.name.split(" ")[0]}</span>
    </div>
  `).join("");
}

function renderProjectMiniList() {
  const el = document.getElementById("projectMiniList");
  if (!el) return;
  // Demo: empty state shown
}

function startHeroParticles() {
  const container = document.getElementById("heroParticles");
  if (!container || container.children.length > 0) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement("span");
    p.className = "particle";
    p.style.cssText = `
      position:absolute;
      width:${Math.random() * 4 + 2}px;
      height:${Math.random() * 4 + 2}px;
      background:rgba(124,106,247,${Math.random() * 0.5 + 0.1});
      border-radius:50%;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation: particleFloat ${Math.random() * 10 + 8}s ease-in-out infinite;
      animation-delay:${Math.random() * 5}s;
    `;
    container.appendChild(p);
  }
  if (!document.getElementById("particleStyle")) {
    const style = document.createElement("style");
    style.id = "particleStyle";
    style.textContent = `
      @keyframes particleFloat {
        0%,100%{transform:translateY(0) scale(1);opacity:0.5}
        50%{transform:translateY(-30px) scale(1.2);opacity:1}
      }
    `;
    document.head.appendChild(style);
  }
}

// ────────────────────────────────────────────────────────────────
// 7. FULL FEED SECTION
// ────────────────────────────────────────────────────────────────
function renderFullFeed() {
  const container = document.getElementById("fullFeedContainer");
  if (!container) return;
  container.innerHTML = "";
  state.filteredPosts.forEach(p => container.appendChild(createPostCard(p)));
  const countEl = document.getElementById("feedCount");
  if (countEl) countEl.textContent = state.filteredPosts.length;
}

function filterFeed(type, btn) {
  document.querySelectorAll("#feed .feed-filter-btn").forEach(b => {
    b.classList.remove("active");
    b.setAttribute("aria-pressed", "false");
  });
  btn.classList.add("active");
  btn.setAttribute("aria-pressed", "true");
  state.filteredPosts = type === "all" ? [...state.posts]
    : state.posts.filter(p => p.type === type);
  renderFullFeed();
  const c = document.getElementById("postsFeed");
  if (c) { c.innerHTML = ""; state.filteredPosts.forEach(p => c.appendChild(createPostCard(p))); }
}

// ────────────────────────────────────────────────────────────────
// 8. MASTERS SECTION
// ────────────────────────────────────────────────────────────────
function renderMasters() {
  const grid = document.getElementById("mastersGrid");
  if (!grid) return;
  const total = document.getElementById("totalMasters");
  if (total) total.textContent = state.filteredMasters.length;
  grid.innerHTML = state.filteredMasters.map(m => createMasterCard(m)).join("");
}

function createMasterCard(m) {
  const stars = renderStars(m.rating);
  const isFav = state.favorites["master_" + m.id];
  return `
    <div class="master-card" role="listitem">
      <div class="mc-header">
        <div class="mc-avatar-wrap">
          <img src="${m.avatar}" alt="${m.name}" class="mc-avatar" loading="lazy" />
          ${m.online ? '<span class="mc-online-badge" title="Online"></span>' : ''}
        </div>
        <button class="mc-fav ${isFav ? 'active' : ''}" onclick="toggleMasterFav('${m.id}',this)" aria-label="Sevimlilarga qo'shish">
          <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
        </button>
      </div>
      <div class="mc-body">
        <div class="mc-name-row">
          <h3 class="mc-name">${m.name}</h3>
          ${m.verified ? '<i class="fas fa-check-circle mc-verified" title="Tasdiqlangan"></i>' : ''}
        </div>
        <span class="mc-job">${m.job}</span>
        <div class="mc-stars">${stars}</div>
        <div class="mc-meta">
          <span><i class="fas fa-star" style="color:#f59e0b"></i> ${m.rating} (${m.reviews})</span>
          <span><i class="fas fa-briefcase"></i> ${m.exp} yil</span>
          <span><i class="fas fa-map-marker-alt"></i> ${capitalize(m.region)}</span>
        </div>
        <div class="mc-price">${formatPrice(m.price)}<span>/kun</span></div>
      </div>
      <div class="mc-actions">
        <button class="btn-primary btn-sm" onclick="openMasterModal('${m.id}')">Ko'rish</button>
        <button class="btn-ghost btn-sm" onclick="contactMaster('${m.id}')">
          <i class="fas fa-comment"></i>
        </button>
        <button class="btn-ghost btn-sm" onclick="callMaster('${m.id}')">
          <i class="fas fa-phone"></i>
        </button>
      </div>
    </div>
  `;
}

function renderStars(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) stars += '<i class="fas fa-star" style="color:#f59e0b;font-size:12px"></i>';
    else if (i - 0.5 <= rating) stars += '<i class="fas fa-star-half-alt" style="color:#f59e0b;font-size:12px"></i>';
    else stars += '<i class="far fa-star" style="color:#f59e0b;font-size:12px"></i>';
  }
  return stars;
}

function searchMasters() {
  const q = document.getElementById("masterSearch")?.value.toLowerCase() || "";
  applyMasterFilters(q);
}

function filterByJob(job, btn) {
  document.querySelectorAll("#ustalar .chip").forEach(c => {
    c.classList.remove("active"); c.setAttribute("aria-pressed","false");
  });
  btn.classList.add("active"); btn.setAttribute("aria-pressed","true");
  state.masterJobFilter = job;
  applyMasterFilters();
}

function filterMastersByRegion(region) {
  state.masterRegionFilter = region;
  applyMasterFilters();
}

function sortMasters(val) {
  const sorts = {
    rating: (a, b) => b.rating - a.rating,
    exp: (a, b) => b.exp - a.exp,
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    reviews: (a, b) => b.reviews - a.reviews,
    online: (a, b) => (b.online ? 1 : 0) - (a.online ? 1 : 0),
  };
  if (sorts[val]) state.filteredMasters.sort(sorts[val]);
  renderMasters();
}

function applyMasterFilters(q = "") {
  if (!q) q = document.getElementById("masterSearch")?.value.toLowerCase() || "";
  state.filteredMasters = state.masters.filter(m => {
    const matchQ = !q || m.name.toLowerCase().includes(q) || m.job.toLowerCase().includes(q);
    const matchJob = state.masterJobFilter === "all" || m.job === state.masterJobFilter;
    const matchRegion = state.masterRegionFilter === "all" || m.region === state.masterRegionFilter;
    return matchQ && matchJob && matchRegion;
  });
  renderMasters();
}

function loadMoreMasters() {
  state.mastersPage++;
  showToast("Ko'proq ustalar yuklanmoqda...", "info");
}

function toggleMapView() {
  const grid = document.getElementById("mastersGrid");
  const map  = document.getElementById("mastersMapView");
  const btn  = document.getElementById("mapViewBtn");
  const isMap = map.style.display !== "none";
  grid.style.display = isMap ? "" : "none";
  map.style.display  = isMap ? "none" : "";
  btn.setAttribute("aria-pressed", String(!isMap));
  if (!isMap) {
    map.querySelector("p").textContent = "Xarita: " + state.filteredMasters.length + " ta usta topildi";
  }
}

function openMasterModal(masterId) {
  const m = state.masters.find(x => x.id === masterId);
  if (!m) return;
  const stars = renderStars(m.rating);
  const isFav = state.favorites["master_" + m.id];
  document.getElementById("masterModalContent").innerHTML = `
    <div class="mm-header" style="text-align:center;padding:1.5rem">
      <div style="position:relative;display:inline-block;margin-bottom:1rem">
        <img src="${m.avatar}" alt="${m.name}" style="width:90px;height:90px;border-radius:50%;border:3px solid var(--accent)" />
        ${m.online ? '<span style="position:absolute;bottom:4px;right:4px;width:14px;height:14px;background:#22c55e;border-radius:50%;border:2px solid var(--bg-card)"></span>' : ''}
      </div>
      <h3 style="font-size:1.3rem;margin:0">${m.name} ${m.verified ? '<i class="fas fa-check-circle" style="color:#3b82f6;font-size:14px"></i>' : ''}</h3>
      <p style="color:var(--text-muted);margin:4px 0">${m.job} • ${m.exp} yil tajriba</p>
      <div style="margin:8px 0">${stars}</div>
      <span style="font-size:1.5rem;font-weight:700;color:var(--accent)">${formatPrice(m.price)}/kun</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;padding:0 1.5rem;text-align:center">
      <div class="kpi-card" style="padding:12px">
        <strong>${m.rating}</strong><br><small>Reyting</small>
      </div>
      <div class="kpi-card" style="padding:12px">
        <strong>${m.reviews}</strong><br><small>Sharhlar</small>
      </div>
      <div class="kpi-card" style="padding:12px">
        <strong>${m.exp}</strong><br><small>Yil tajriba</small>
      </div>
    </div>
    <div style="padding:1.5rem;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn-primary" style="flex:1" onclick="contactMaster('${m.id}')">
        <i class="fas fa-comment"></i> Xabar yozish
      </button>
      <button class="btn-ghost" style="flex:1" onclick="callMaster('${m.id}')">
        <i class="fas fa-phone"></i> Qo'ng'iroq
      </button>
      <button class="btn-ghost btn-sm" onclick="openModal('reviewModal')" style="flex:0 0 auto">
        <i class="fas fa-star"></i>
      </button>
      <button class="btn-ghost btn-sm ${isFav ? 'liked' : ''}" onclick="toggleMasterFav('${m.id}',this)" style="flex:0 0 auto">
        <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
      </button>
    </div>
    <div style="padding:0 1.5rem 1.5rem">
      <h4 style="margin-bottom:8px">Hududlar</h4>
      <span class="chip active">${capitalize(m.region)}</span>
      <h4 style="margin:16px 0 8px">Portfolio</h4>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        ${[1,2,3].map(i => `<div style="background:var(--bg-secondary);border-radius:8px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;color:var(--text-muted)"><i class="fas fa-image"></i></div>`).join("")}
      </div>
    </div>
  `;
  openModal("masterModal");
}

function toggleMasterFav(masterId, btn) {
  const key = "master_" + masterId;
  state.favorites[key] = !state.favorites[key];
  saveFavorites();
  if (btn) {
    btn.querySelector("i").className = state.favorites[key] ? "fas fa-heart" : "far fa-heart";
    btn.classList.toggle("active", !!state.favorites[key]);
  }
  showToast(state.favorites[key] ? "Sevimlilarga qo'shildi" : "O'chirildi", "success");
}

function contactMaster(masterId) {
  const m = state.masters.find(x => x.id === masterId);
  if (!m) return;
  closeModal("masterModal");
  showSection("muhokama");
  setTimeout(() => openChat("c1"), 300);
}

function callMaster(masterId) {
  showToast("Qo'ng'iroq funksiyasi tez orada", "info");
}

// ────────────────────────────────────────────────────────────────
// 9. MARKET SECTION
// ────────────────────────────────────────────────────────────────
function renderMarket() {
  renderPromoBanners();
  renderProductGrid();
}

function renderPromoBanners() {
  const slides = document.getElementById("promoSlides");
  const dots   = document.getElementById("promoDots");
  if (!slides) return;
  const banners = [
    { bg:"linear-gradient(135deg,#7c3aed,#4f46e5)", title:"Bahor chegirmalari!", sub:"Barcha toifadagi materiallarda 20% gacha chegirma", btn:"Hozir xarid qiling" },
    { bg:"linear-gradient(135deg,#0891b2,#0e7490)", title:"Yangi yetkazuvchilar",  sub:"100+ yangi mahsulot qo'shildi. Ko'ring!",          btn:"Ko'rish" },
    { bg:"linear-gradient(135deg,#d97706,#b45309)", title:"Yigirma qop sementga bonuslar", sub:"Ulgurji xaridlarda qo'shimcha 5% chegirma",  btn:"Buyurtma berish" },
  ];
  let current = 0;
  slides.innerHTML = banners.map((b, i) => `
    <div class="promo-slide ${i === 0 ? 'active' : ''}" style="background:${b.bg};min-width:100%;padding:2rem;border-radius:12px;color:#fff;display:${i === 0 ? 'block' : 'none'}">
      <h3 style="font-size:1.4rem;font-weight:700;margin:0 0 8px">${b.title}</h3>
      <p style="opacity:.9;margin:0 0 16px">${b.sub}</p>
      <button class="btn-primary" style="background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.4)">${b.btn}</button>
    </div>
  `).join("");
  if (dots) {
    dots.innerHTML = banners.map((_, i) => `
      <button role="tab" class="promo-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})" aria-label="Slayd ${i + 1}"></button>
    `).join("");
  }
  setInterval(() => {
    current = (current + 1) % banners.length;
    goToSlide(current);
  }, 5000);
}

function goToSlide(idx) {
  document.querySelectorAll(".promo-slide").forEach((s, i) => s.style.display = i === idx ? "block" : "none");
  document.querySelectorAll(".promo-dot").forEach((d, i) => d.classList.toggle("active", i === idx));
}

function renderProductGrid() {
  const grid = document.getElementById("marketGrid");
  if (!grid) return;
  const view = state.marketView;
  grid.className = view === "list" ? "market-list" : "market-grid";
  grid.innerHTML = state.filteredProducts.map(p => createProductCard(p, view)).join("");
}

function createProductCard(p, view = "grid") {
  const isFav = state.favorites["product_" + p.id];
  const inCart = state.cart.find(c => c.id === p.id);
  return `
    <div class="product-card ${view === 'list' ? 'product-card-list' : ''}" role="listitem">
      <div class="prod-img-wrap" onclick="openProductModal('${p.id}')" style="cursor:pointer">
        <img src="${p.img}" alt="${p.name}" class="prod-img" loading="lazy" />
        ${p.discount ? `<span class="prod-discount">-${p.discount}%</span>` : ''}
        <button class="prod-fav ${isFav ? 'active' : ''}" onclick="event.stopPropagation();toggleProductFav('${p.id}',this)" aria-label="Sevimli">
          <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
        </button>
      </div>
      <div class="prod-body">
        <span class="prod-seller">${p.seller}</span>
        <h4 class="prod-name" onclick="openProductModal('${p.id}')" style="cursor:pointer">${p.name}</h4>
        <div class="prod-rating">
          <i class="fas fa-star" style="color:#f59e0b;font-size:11px"></i>
          <span>${p.rating} (${p.reviews})</span>
          <span class="prod-stock" style="margin-left:auto;color:${p.stock > 50 ? '#22c55e' : '#f59e0b'};font-size:11px">
            ${p.stock > 0 ? `${p.stock} ${p.unit}` : 'Tugagan'}
          </span>
        </div>
        <div class="prod-price-row">
          <span class="prod-price">${formatPrice(p.price)}<small>/${p.unit}</small></span>
          ${p.oldPrice ? `<span class="prod-old-price">${formatPrice(p.oldPrice)}</span>` : ''}
        </div>
        <button class="btn-primary full-width btn-sm ${inCart ? 'in-cart' : ''}" onclick="addToCart('${p.id}',this)">
          <i class="fas fa-${inCart ? 'check' : 'cart-plus'}"></i> ${inCart ? 'Savatda' : 'Savatga'}
        </button>
      </div>
    </div>
  `;
}

function openProductModal(productId) {
  const p = state.products.find(x => x.id === productId);
  if (!p) return;
  const isFav = state.favorites["product_" + p.id];
  document.getElementById("productModalContent").innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;padding:1.5rem" class="product-modal-inner">
      <div>
        <img src="${p.img}" alt="${p.name}" style="width:100%;border-radius:12px;aspect-ratio:4/3;object-fit:cover" />
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px">
          ${[1,2,3].map(_ => `<div style="background:var(--bg-secondary);border-radius:8px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;color:var(--text-muted)"><i class="fas fa-image"></i></div>`).join("")}
        </div>
      </div>
      <div>
        <span style="font-size:12px;color:var(--text-muted)">${p.seller}</span>
        <h3 style="font-size:1.3rem;margin:8px 0">${p.name}</h3>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <span style="color:#f59e0b"><i class="fas fa-star"></i> ${p.rating}</span>
          <span style="color:var(--text-muted)">(${p.reviews} sharh)</span>
        </div>
        <div style="margin-bottom:16px">
          <span style="font-size:1.8rem;font-weight:700;color:var(--accent)">${formatPrice(p.price)}</span>
          <small style="color:var(--text-muted)">/${p.unit}</small>
          ${p.oldPrice ? `<br><span style="text-decoration:line-through;color:var(--text-muted)">${formatPrice(p.oldPrice)}</span>` : ''}
          ${p.discount ? `<span class="prod-discount" style="position:static;display:inline-block;margin-left:8px">-${p.discount}%</span>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <label style="font-size:13px">Miqdor:</label>
          <div style="display:flex;align-items:center;gap:8px;background:var(--bg-secondary);border-radius:8px;padding:4px 8px">
            <button onclick="changeQty(-1)" class="btn-icon" style="width:28px;height:28px;font-size:16px">−</button>
            <span id="productQty">1</span>
            <button onclick="changeQty(1)" class="btn-icon" style="width:28px;height:28px;font-size:16px">+</button>
          </div>
          <span style="font-size:12px;color:${p.stock > 50 ? '#22c55e' : '#f59e0b'}">${p.stock} ${p.unit} bor</span>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn-primary" style="flex:1" onclick="addToCart('${p.id}',this);closeModal('productModal')">
            <i class="fas fa-cart-plus"></i> Savatga
          </button>
          <button class="btn-ghost" style="flex:1" onclick="buyNow('${p.id}')">
            <i class="fas fa-bolt"></i> Hozir xarid
          </button>
          <button class="btn-ghost btn-sm ${isFav ? 'liked' : ''}" onclick="toggleProductFav('${p.id}',this)">
            <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  openModal("productModal");
}

let productQty = 1;
function changeQty(delta) {
  productQty = Math.max(1, productQty + delta);
  const el = document.getElementById("productQty");
  if (el) el.textContent = productQty;
}

function searchMarket() {
  const q = document.getElementById("marketSearch")?.value.toLowerCase() || "";
  state.filteredProducts = state.products.filter(p =>
    p.name.toLowerCase().includes(q) || p.seller.toLowerCase().includes(q)
  );
  renderProductGrid();
}

function filterMarket(cat, btn) {
  document.querySelectorAll("#bozor .cat-btn").forEach(b => {
    b.classList.remove("active"); b.setAttribute("aria-pressed","false");
  });
  btn.classList.add("active"); btn.setAttribute("aria-pressed","true");
  state.marketCatFilter = cat;
  state.filteredProducts = cat === "all" ? [...state.products]
    : state.products.filter(p => p.cat === cat);
  renderProductGrid();
}

function sortMarket(val) {
  const sorts = {
    popular: (a, b) => b.reviews - a.reviews,
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    new: (a, b) => 0,
    discount: (a, b) => (b.discount || 0) - (a.discount || 0),
  };
  if (sorts[val]) state.filteredProducts.sort(sorts[val]);
  renderProductGrid();
}

function setMarketView(view, btn) {
  state.marketView = view;
  document.querySelectorAll("#bozor .view-btn").forEach(b => {
    b.classList.remove("active"); b.setAttribute("aria-pressed","false");
  });
  btn.classList.add("active"); btn.setAttribute("aria-pressed","true");
  renderProductGrid();
}

function toggleProductFav(productId, btn) {
  const key = "product_" + productId;
  state.favorites[key] = !state.favorites[key];
  saveFavorites();
  if (btn) {
    btn.querySelector("i").className = state.favorites[key] ? "fas fa-heart" : "far fa-heart";
    btn.classList.toggle("active", !!state.favorites[key]);
  }
  showToast(state.favorites[key] ? "Sevimlilarga qo'shildi" : "O'chirildi", "success");
}

function loadMoreProducts() {
  state.productsPage++;
  showToast("Ko'proq mahsulotlar yuklanmoqda...", "info");
}

function buyNow(productId) {
  addToCart(productId);
  toggleCart();
}

// ────────────────────────────────────────────────────────────────
// 10. CART
// ────────────────────────────────────────────────────────────────
function addToCart(productId, btn) {
  const p = state.products.find(x => x.id === productId);
  if (!p) return;
  const existing = state.cart.find(c => c.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({ ...p, qty: 1 });
  }
  saveCart();
  updateCartBadge();
  showToast(`${p.name} savatga qo'shildi`, "success");
  if (btn) {
    btn.innerHTML = '<i class="fas fa-check"></i> Savatda';
    btn.classList.add("in-cart");
  }
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(c => c.id !== productId);
  saveCart();
  updateCartBadge();
  renderCartDrawer();
}

function updateCartQty(productId, qty) {
  const item = state.cart.find(c => c.id === productId);
  if (!item) return;
  if (qty <= 0) { removeFromCart(productId); return; }
  item.qty = qty;
  saveCart();
  renderCartDrawer();
}

function saveCart() {
  localStorage.setItem("torvex-cart", JSON.stringify(state.cart));
}

function updateCartBadge() {
  const total = state.cart.reduce((s, c) => s + c.qty, 0);
  ["cartBadge", "cartCountLabel"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = total;
  });
}

function toggleCart() {
  state.cartOpen = !state.cartOpen;
  const drawer  = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  if (drawer) drawer.classList.toggle("open", state.cartOpen);
  if (overlay) {
    overlay.style.display = state.cartOpen ? "block" : "none";
    overlay.setAttribute("aria-hidden", String(!state.cartOpen));
  }
  if (state.cartOpen) renderCartDrawer();
}

function renderCartDrawer() {
  const itemsEl  = document.getElementById("cartItems");
  const emptyEl  = document.getElementById("cartEmpty");
  const footerEl = document.getElementById("cartFooter");
  if (!itemsEl) return;

  if (!state.cart.length) {
    itemsEl.innerHTML = '';
    if (emptyEl) { emptyEl.style.display = ""; itemsEl.appendChild(emptyEl); }
    if (footerEl) footerEl.style.display = "none";
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";
  if (footerEl) footerEl.style.display = "";

  itemsEl.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" class="ci-img" />
      <div class="ci-body">
        <span class="ci-name">${item.name}</span>
        <span class="ci-price">${formatPrice(item.price)}</span>
        <div class="ci-qty">
          <button onclick="updateCartQty('${item.id}',${item.qty - 1})" class="btn-icon" style="width:24px;height:24px">−</button>
          <span>${item.qty}</span>
          <button onclick="updateCartQty('${item.id}',${item.qty + 1})" class="btn-icon" style="width:24px;height:24px">+</button>
        </div>
      </div>
      <button onclick="removeFromCart('${item.id}')" class="ci-remove" aria-label="O'chirish">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join("");

  const subtotal = state.cart.reduce((s, c) => s + c.price * c.qty, 0);
  const subtotalEl = document.getElementById("cartSubtotal");
  const totalEl   = document.getElementById("cartTotal");
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (totalEl)    totalEl.textContent    = formatPrice(subtotal);
}

function applyPromo() {
  const code = document.getElementById("promoInput")?.value.trim().toUpperCase();
  const promos = { "TORVEX10": 10, "YANGI20": 20, "SALE15": 15 };
  if (promos[code]) {
    showToast(`Promo kod qabul qilindi! ${promos[code]}% chegirma`, "success");
  } else {
    showToast("Noto'g'ri promo kod", "error");
  }
}

function checkout() {
  if (!state.cart.length) return;
  showToast("Buyurtma berildi! Tez orada bog'lanamiz.", "success");
  state.cart = [];
  saveCart();
  updateCartBadge();
  renderCartDrawer();
  toggleCart();
}

// ────────────────────────────────────────────────────────────────
// 11. SERVICES SECTION
// ────────────────────────────────────────────────────────────────
function renderServices() {
  const catGrid  = document.getElementById("serviceCategoriesGrid");
  const svcGrid  = document.getElementById("servicesGrid");

  if (catGrid) {
    catGrid.innerHTML = SERVICE_CATEGORIES.map(c => `
      <div class="service-cat-card" style="cursor:pointer;border-radius:12px;background:var(--bg-card);padding:1.2rem;text-align:center;transition:.2s" onclick="filterServiceCat('${c.label}')">
        <span style="font-size:1.8rem;color:${c.color}"><i class="${c.icon}"></i></span>
        <h4 style="font-size:.9rem;margin:8px 0 4px">${c.label}</h4>
        <p style="font-size:.75rem;color:var(--text-muted);margin:0">${c.desc}</p>
      </div>
    `).join("");
  }

  if (svcGrid) {
    svcGrid.innerHTML = state.masters.slice(0, 6).map(m => `
      <div class="service-card" role="listitem">
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px">
          <img src="${m.avatar}" alt="${m.name}" style="width:50px;height:50px;border-radius:50%" loading="lazy" />
          <div>
            <strong>${m.name}</strong><br>
            <span style="font-size:12px;color:var(--text-muted)">${m.job}</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
          <span class="chip active" style="font-size:11px">${m.job}</span>
          <span class="chip" style="font-size:11px">${capitalize(m.region)}</span>
          ${m.verified ? '<span class="chip" style="font-size:11px;color:#3b82f6"><i class="fas fa-check-circle"></i> Tasdiqlangan</span>' : ''}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:700;color:var(--accent)">${formatPrice(m.price)}/kun</span>
          <button class="btn-primary btn-sm" onclick="openMasterModal('${m.id}')">
            Bog'lanish <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `).join("");
  }
}

function filterServiceCat(label) {
  showSection("ustalar");
  setTimeout(() => {
    const chip = [...document.querySelectorAll("#ustalar .chip")].find(c => c.textContent.trim().includes(label.split(" ")[0]));
    if (chip) { state.masterJobFilter = label; applyMasterFilters(); chip.classList.add("active"); }
  }, 300);
}

// ────────────────────────────────────────────────────────────────
// 12. MESSENGER
// ────────────────────────────────────────────────────────────────
function renderMessenger() {
  const list = document.getElementById("chatList");
  if (!list) return;
  list.innerHTML = state.chats.map(c => `
    <li class="chat-item ${c.id === state.activeChat ? 'active' : ''}" onclick="openChat('${c.id}')" role="button" tabindex="0">
      <div style="position:relative">
        <img src="${c.avatar}" alt="${c.name}" class="chat-item-avatar" loading="lazy" />
        ${c.online ? '<span style="position:absolute;bottom:1px;right:1px;width:10px;height:10px;background:#22c55e;border-radius:50%;border:2px solid var(--bg-card)"></span>' : ''}
      </div>
      <div class="chat-item-body">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${c.name}</strong>
          <span style="font-size:11px;color:var(--text-muted)">${c.time}</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:12px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:150px">${c.last}</span>
          ${c.unread > 0 ? `<span class="nav-unread" style="position:static;min-width:18px;height:18px;line-height:18px">${c.unread}</span>` : ''}
        </div>
      </div>
    </li>
  `).join("");
}

function filterChats(type, btn) {
  document.querySelectorAll(".ms-tab").forEach(t => {
    t.classList.remove("active"); t.setAttribute("aria-selected","false");
  });
  btn.classList.add("active"); btn.setAttribute("aria-selected","true");
}

function searchChats(q) {
  const items = document.querySelectorAll(".chat-item");
  items.forEach(item => {
    const name = item.querySelector("strong")?.textContent.toLowerCase() || "";
    item.style.display = name.includes(q.toLowerCase()) ? "" : "none";
  });
}

function openChat(chatId) {
  const chat = state.chats.find(c => c.id === chatId);
  if (!chat) return;
  state.activeChat = chatId;

  // Zero unread
  chat.unread = 0;
  const unreadEl = document.getElementById("unreadCount");
  const total = state.chats.reduce((s, c) => s + c.unread, 0);
  if (unreadEl) unreadEl.textContent = total;

  document.getElementById("msEmpty").style.display = "none";
  const conv = document.getElementById("msConversation");
  conv.style.display = "";

  document.getElementById("msPeerAvatar").src = chat.avatar;
  document.getElementById("msPeerName").textContent = chat.name;
  document.getElementById("msPeerStatus").textContent = chat.online ? "Online" : "Offline";

  // Init messages
  if (!state.messages[chatId]) {
    state.messages[chatId] = [
      { from:"them", text:"Salom! Qanday yordam bera olaman?", time: getTime() },
      { from:"me",   text:"Salom! Narxingizni bilmoqchi edim", time: getTime() },
      { from:"them", text:chat.last, time: getTime() },
    ];
  }

  renderMessages(chatId);
  renderMessenger();

  // On mobile, hide sidebar
  if (window.innerWidth < 768) {
    document.getElementById("messengerSidebar").style.display = "none";
    conv.style.display = "flex";
  }

  // Focus input
  setTimeout(() => document.getElementById("msInput")?.focus(), 100);
}

function renderMessages(chatId) {
  const el = document.getElementById("msMessages");
  if (!el) return;
  const msgs = state.messages[chatId] || [];
  el.innerHTML = `
    <div class="ms-date-sep"><span>Bugun</span></div>
    ${msgs.map(m => `
      <div class="ms-msg ${m.from === 'me' ? 'ms-msg-out' : 'ms-msg-in'}">
        <div class="ms-bubble">${escapeHtml(m.text)}</div>
        <span class="ms-msg-time">${m.time}</span>
      </div>
    `).join("")}
  `;
  el.scrollTop = el.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById("msInput");
  if (!input || !state.activeChat) return;
  const text = input.value.trim();
  if (!text) return;

  if (!state.messages[state.activeChat]) state.messages[state.activeChat] = [];
  state.messages[state.activeChat].push({ from:"me", text, time: getTime() });
  input.value = "";
  input.style.height = "auto";
  renderMessages(state.activeChat);

  // Simulate reply
  const chat = state.chats.find(c => c.id === state.activeChat);
  if (chat) chat.last = text;

  const typing = document.getElementById("msTyping");
  setTimeout(() => {
    if (typing) { typing.style.display = "flex"; typing.setAttribute("aria-hidden","false"); }
    setTimeout(() => {
      if (typing) { typing.style.display = "none"; typing.setAttribute("aria-hidden","true"); }
      const replies = ["Tushundim, rahmat!", "Yaxshi, ko'rib chiqamiz", "Albatta, yordam beramiz", "Bir oz kutib turing"];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      state.messages[state.activeChat].push({ from:"them", text: reply, time: getTime() });
      if (chat) chat.last = reply;
      renderMessages(state.activeChat);
      renderMessenger();
    }, 1500);
  }, 500);
}

function handleChatKey(e) {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function autoResizeTextarea(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

function notifyTyping() {}

function closeConversation() {
  document.getElementById("msConversation").style.display = "none";
  document.getElementById("msEmpty").style.display = "";
  document.getElementById("messengerSidebar").style.display = "";
  state.activeChat = null;
}

function attachFile() { showToast("Fayl biriktirish tez orada", "info"); }
function toggleEmoji() { showToast("Emoji tez orada", "info"); }
function toggleVoiceMessage() { showToast("Ovozli xabar tez orada", "info"); }
function startVoiceCall() { showToast("Ovozli qo'ng'iroq tez orada", "info"); }
function startVideoCall() { showToast("Video qo'ng'iroq tez orada", "info"); }
function openChatInfo() { showToast("Suhbat ma'lumotlari", "info"); }
function openChatMenu() { showToast("Menyu tez orada", "info"); }
function openNewGroup() { closeModal("newGroupModal"); showToast("Guruh yaratish tez orada", "info"); }
function searchUsers(q) {
  const list = document.getElementById("newChatResults");
  if (!list) return;
  const results = state.masters.filter(m => m.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5);
  list.innerHTML = results.length
    ? results.map(m => `
        <li class="chat-item" onclick="startChatWith('${m.id}')" role="button" tabindex="0">
          <img src="${m.avatar}" alt="${m.name}" class="chat-item-avatar" />
          <div class="chat-item-body"><strong>${m.name}</strong><br><small>${m.job}</small></div>
        </li>
      `).join("")
    : '<li style="padding:1rem;color:var(--text-muted)">Topilmadi</li>';
}
function startChatWith(masterId) {
  const m = state.masters.find(x => x.id === masterId);
  if (!m) return;
  closeModal("newChatModal");
  const newChat = { id:"new_"+masterId, name:m.name, avatar:m.avatar, last:"Yangi suhbat", time:"Hozir", unread:0, online:m.online };
  if (!state.chats.find(c => c.id === newChat.id)) state.chats.unshift(newChat);
  renderMessenger();
  openChat(newChat.id);
}

// ────────────────────────────────────────────────────────────────
// 13. PROJECTS
// ────────────────────────────────────────────────────────────────
const DEMO_PROJECTS = [
  { id:"pr1", title:"2-qavatli uy ta'miri",         status:"active",  progress:65, master:"Jasur Q.",   budget:15000000, deadline:"2025-08-01", category:"Ta'mir" },
  { id:"pr2", title:"Do'kon ichki bezatish",         status:"active",  progress:30, master:"Mansur H.",  budget:8000000,  deadline:"2025-07-15", category:"Dizayn" },
  { id:"pr3", title:"Hovli yo'lagini kafel qilish",  status:"pending", progress:0,  master:"Ko'rilmoqda",budget:3000000,  deadline:"2025-09-01", category:"Kafel"  },
  { id:"pr4", title:"Oshxona mebel o'rnatish",       status:"done",    progress:100,master:"Otabek R.",  budget:5500000,  deadline:"2025-05-10", category:"Mebel"  },
];

function renderProjects() {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;
  const filter = document.querySelector("#loyihalar .tab-btn.active")?.textContent.trim() || "Faol";
  const statusMap = { "Faol": "active", "Kutilmoqda": "pending", "Yakunlangan": "done" };
  const filterStatus = statusMap[filter] || "active";
  const filtered = DEMO_PROJECTS.filter(p => p.status === filterStatus);

  const counts = {
    activeProjectCount: DEMO_PROJECTS.filter(p => p.status === "active").length,
    pendingProjectCount: DEMO_PROJECTS.filter(p => p.status === "pending").length,
    doneProjectCount: DEMO_PROJECTS.filter(p => p.status === "done").length,
  };
  Object.entries(counts).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });

  grid.innerHTML = filtered.length ? filtered.map(p => `
    <div class="project-card" role="listitem">
      <div class="proj-header">
        <span class="chip ${p.status === 'done' ? 'active' : ''}" style="font-size:11px">${p.category}</span>
        <span class="badge-${p.status === 'active' ? 'updated' : p.status === 'done' ? 'updated' : ''}" style="font-size:11px;margin-left:auto">
          ${p.status === 'active' ? 'Faol' : p.status === 'pending' ? 'Kutilmoqda' : 'Yakunlangan'}
        </span>
      </div>
      <h4>${p.title}</h4>
      <p style="font-size:12px;color:var(--text-muted)">Usta: ${p.master}</p>
      <div style="margin:12px 0">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
          <span>Progress</span><span>${p.progress}%</span>
        </div>
        <div class="completion-bar" style="height:6px">
          <div class="completion-fill" style="width:${p.progress}%;background:${p.status === 'done' ? '#22c55e' : 'var(--accent)'}"></div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted)">
        <span><i class="fas fa-wallet"></i> ${formatPrice(p.budget)}</span>
        <span><i class="fas fa-calendar"></i> ${p.deadline}</span>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn-ghost btn-sm" onclick="showToast('Loyiha tafsilotlari', 'info')">Ko'rish</button>
        ${p.status !== 'done' ? '<button class="btn-primary btn-sm" onclick="showToast(\'Tahrirlandi\', \'success\')">Tahrirlash</button>' : ''}
      </div>
    </div>
  `).join("") : `<div class="widget-empty"><i class="fas fa-folder-open"></i><p>Loyiha topilmadi</p><button class="btn-sm" onclick="openModal('adModal')">Yaratish</button></div>`;
}

function filterProjects(status, btn) {
  document.querySelectorAll("#loyihalar .tab-btn").forEach(b => {
    b.classList.remove("active"); b.setAttribute("aria-selected","false");
  });
  btn.classList.add("active"); btn.setAttribute("aria-selected","true");
  renderProjects();
}

function setProjectView(view, btn) {
  state.projectView = view;
  document.querySelectorAll("#loyihalar .view-btn").forEach(b => {
    b.classList.remove("active"); b.setAttribute("aria-pressed","false");
  });
  btn.classList.add("active"); btn.setAttribute("aria-pressed","true");
  const grid = document.getElementById("projectsGrid");
  if (grid) grid.className = view === "list" ? "projects-list" : "projects-grid";
}

// ────────────────────────────────────────────────────────────────
// 14. ANALYTICS
// ────────────────────────────────────────────────────────────────
function renderAnalytics() {
  const data = getAnalyticsData(state.analyticsPeriod);
  document.getElementById("kpiViews").textContent     = data.views.toLocaleString("uz-UZ");
  document.getElementById("kpiCalls").textContent     = data.calls;
  document.getElementById("kpiRating").textContent    = data.rating;
  document.getElementById("kpiProjects").textContent  = data.projects;
  document.getElementById("kpiViewsDelta").textContent    = "+12%";
  document.getElementById("kpiCallsDelta").textContent    = "+8%";
  document.getElementById("kpiRatingDelta").textContent   = "+0.2";
  document.getElementById("kpiProjectsDelta").textContent = "+3%";
  renderCharts(data);
  renderActivityTable();
}

function getAnalyticsData(period) {
  const multipliers = { week:1, month:4, quarter:13, year:52 };
  const m = multipliers[period] || 4;
  return {
    views: Math.round(1240 * m * (0.9 + Math.random() * 0.2)),
    calls: Math.round(87 * m * (0.9 + Math.random() * 0.2)),
    rating: (4.5 + Math.random() * 0.4).toFixed(1),
    projects: Math.round(12 * m * (0.9 + Math.random() * 0.2)),
    chartLabels: period === "week"
      ? ["Du","Se","Ch","Pa","Ju","Sh","Ya"]
      : ["Yan","Feb","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Nov","Dek"].slice(0,7),
    chartData: Array.from({length:7}, () => Math.round(100 + Math.random() * 400)),
  };
}

function renderCharts(data) {
  // Simple SVG chart (no external lib needed)
  const canvas = document.getElementById("viewsChart");
  if (canvas) {
    const max = Math.max(...data.chartData);
    const w = 380, h = 180, pad = 20;
    const pts = data.chartData.map((v, i) => {
      const x = pad + i * (w - pad * 2) / (data.chartData.length - 1);
      const y = h - pad - (v / max) * (h - pad * 2);
      return `${x},${y}`;
    }).join(" ");
    const area = data.chartData.map((v, i) => {
      const x = pad + i * (w - pad * 2) / (data.chartData.length - 1);
      const y = h - pad - (v / max) * (h - pad * 2);
      return `${x},${y}`;
    });
    const areaPath = `M${area.join(" L")} L${pad + (data.chartData.length-1)*(w-pad*2)/(data.chartData.length-1)},${h-pad} L${pad},${h-pad} Z`;
    canvas.parentElement.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#7c6af7" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#7c6af7" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#chartGrad)"/>
        <polyline points="${pts}" fill="none" stroke="#7c6af7" stroke-width="2.5" stroke-linejoin="round"/>
        ${data.chartData.map((v,i) => {
          const x = pad + i * (w - pad*2)/(data.chartData.length-1);
          const y = h - pad - (v/max)*(h-pad*2);
          return `<circle cx="${x}" cy="${y}" r="4" fill="#7c6af7"/>`;
        }).join("")}
        ${data.chartLabels.map((l,i) => {
          const x = pad + i*(w-pad*2)/(data.chartLabels.length-1);
          return `<text x="${x}" y="${h-4}" text-anchor="middle" font-size="10" fill="#888">${l}</text>`;
        }).join("")}
      </svg>
    `;
  }

  const catCanvas = document.getElementById("categoryChart");
  if (catCanvas) {
    const cats = [
      { label:"Elektrik", val:30, color:"#f59e0b" },
      { label:"Santex",   val:22, color:"#3b82f6" },
      { label:"Malyar",   val:18, color:"#10b981" },
      { label:"Kafelchi", val:15, color:"#8b5cf6" },
      { label:"Boshqa",   val:15, color:"#64748b" },
    ];
    let total = cats.reduce((s,c) => s+c.val,0);
    let angle = -90;
    const cx=100, cy=100, r=80;
    const slices = cats.map(c => {
      const a = (c.val/total)*360;
      const start = angle; angle += a;
      const x1 = cx + r*Math.cos(start*Math.PI/180);
      const y1 = cy + r*Math.sin(start*Math.PI/180);
      const x2 = cx + r*Math.cos((start+a)*Math.PI/180);
      const y2 = cy + r*Math.sin((start+a)*Math.PI/180);
      const large = a > 180 ? 1 : 0;
      return `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z" fill="${c.color}" opacity="0.9"/>`;
    }).join("");
    const legend = cats.map((c,i) => `
      <div style="display:flex;align-items:center;gap:6px;font-size:11px;margin-bottom:4px">
        <span style="width:10px;height:10px;border-radius:50%;background:${c.color};display:inline-block"></span>
        ${c.label} (${c.val}%)
      </div>
    `).join("");
    catCanvas.parentElement.innerHTML = `
      <div style="display:flex;gap:24px;align-items:center;flex-wrap:wrap">
        <svg viewBox="0 0 200 200" style="width:140px;height:140px;flex-shrink:0">
          ${slices}
          <circle cx="${cx}" cy="${cy}" r="45" fill="var(--bg-card)"/>
        </svg>
        <div>${legend}</div>
      </div>
    `;
  }
}

function renderActivityTable() {
  const tbody = document.getElementById("activityTableBody");
  if (!tbody) return;
  const rows = [
    { event:"Ko'rishlar",   user:"Jasur Q.",   time:"5 daqiqa oldin",  status:"success" },
    { event:"Sharh",        user:"Mansur H.",  time:"1 soat oldin",    status:"success" },
    { event:"Buyurtma",     user:"Bobur T.",   time:"3 soat oldin",    status:"pending" },
    { event:"Yangi mesaj",  user:"Alisher M.", time:"1 kun oldin",     status:"success" },
    { event:"Profil yangi", user:"Siz",        time:"2 kun oldin",     status:"success" },
  ];
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.event}</td>
      <td>${r.user}</td>
      <td style="color:var(--text-muted);font-size:12px">${r.time}</td>
      <td><span style="color:${r.status === 'success' ? '#22c55e' : '#f59e0b'};font-size:12px">
        <i class="fas fa-circle" style="font-size:8px"></i> ${r.status === 'success' ? 'Muvaffaqiyatli' : 'Kutilmoqda'}
      </span></td>
    </tr>
  `).join("");
}

function changeAnalyticsPeriod(val) {
  state.analyticsPeriod = val;
  renderAnalytics();
}

function exportAnalytics() {
  const data = JSON.stringify(getAnalyticsData(state.analyticsPeriod), null, 2);
  const blob = new Blob([data], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "torvex-analytics.json"; a.click();
  URL.revokeObjectURL(url);
  showToast("Analitika yuklab olindi", "success");
}

function loadMoreActivity() { showToast("Ko'proq faollik yuklanmoqda", "info"); }

// ────────────────────────────────────────────────────────────────
// 15. MAP
// ────────────────────────────────────────────────────────────────
function renderMap() {
  const container = document.getElementById("mainMap");
  if (!container) return;

  // Try Leaflet if available, else placeholder
  if (typeof L !== "undefined") {
    container.innerHTML = '<div id="leafletMap" style="width:100%;height:100%"></div>';
    const map = L.map("leafletMap").setView([41.2995, 69.2401], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map);
    state.masters.forEach(m => {
      const lat = 41.2995 + (Math.random()-0.5)*0.1;
      const lng = 69.2401 + (Math.random()-0.5)*0.1;
      L.marker([lat, lng]).addTo(map).bindPopup(`<b>${m.name}</b><br>${m.job}<br>⭐ ${m.rating}`);
    });
  } else {
    container.innerHTML = `
      <div style="width:100%;height:100%;background:var(--bg-secondary);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:var(--text-muted)">
        <i class="fas fa-map-marked-alt" style="font-size:3rem;color:var(--accent)"></i>
        <h3>Toshkent xaritasi</h3>
        <p style="text-align:center">Bu yerda ${state.masters.length} ta usta joylashgan</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;max-width:600px;width:90%;margin-top:1rem">
          ${state.masters.slice(0,6).map(m => `
            <div style="background:var(--bg-card);padding:12px;border-radius:10px;text-align:center;cursor:pointer" onclick="openMasterModal('${m.id}')">
              <img src="${m.avatar}" style="width:40px;height:40px;border-radius:50%;margin-bottom:6px" />
              <div style="font-size:12px;font-weight:600">${m.name}</div>
              <div style="font-size:11px;color:var(--text-muted)">${m.job}</div>
              <div style="font-size:11px;color:#22c55e;margin-top:4px">${m.online ? '● Online' : ''}</div>
            </div>
          `).join("")}
        </div>
        <p style="font-size:12px;margin-top:8px">Xarita uchun OpenStreetMap integratsiyasi qo'shilsin</p>
      </div>
    `;
  }

  document.getElementById("mapResultsCount").textContent = state.masters.length + " ta natija";
}

function filterMap(type, btn) {
  document.querySelectorAll(".map-pill").forEach(p => {
    p.classList.remove("active"); p.setAttribute("aria-pressed","false");
  });
  btn.classList.add("active"); btn.setAttribute("aria-pressed","true");
  showToast("Xarita filtrlandi: " + btn.textContent.trim(), "info");
}

function searchOnMap(e) {
  if (e.key === "Enter") showToast("Xaritada qidirish: " + e.target.value, "info");
}

function closeMapPanel() {
  const panel = document.getElementById("mapSidebarPanel");
  if (panel) panel.style.display = "none";
}

// ────────────────────────────────────────────────────────────────
// 16. NEWS
// ────────────────────────────────────────────────────────────────
function renderNews() {
  const grid = document.getElementById("newsGrid");
  const trends = document.getElementById("newsTrends");
  if (!grid) return;

  const filtered = state.newsFilter === "all" ? state.news
    : state.news.filter(n => n.cat === state.newsFilter);

  grid.innerHTML = filtered.map(n => `
    <div class="news-card" role="listitem" onclick="openNewsDetail('${n.id}')" style="cursor:pointer">
      <div style="background:var(--bg-secondary);border-radius:8px;height:140px;display:flex;align-items:center;justify-content:center;margin-bottom:12px;color:var(--text-muted)">
        <i class="fas fa-newspaper" style="font-size:2rem"></i>
      </div>
      <span class="chip" style="font-size:11px;margin-bottom:8px;display:inline-block">${n.cat}</span>
      <h4 style="font-size:.95rem;margin:0 0 8px;line-height:1.4">${n.title}</h4>
      <p style="font-size:12px;color:var(--text-muted);margin:0 0 12px">${n.summary}</p>
      <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted)">
        <span><i class="fas fa-clock"></i> ${n.time}</span>
        <span><i class="fas fa-eye"></i> ${n.views}</span>
      </div>
    </div>
  `).join("");

  if (trends) {
    const trendItems = ["#Sement narxi","#Qurilish ustasi","#Armatura","#Elektrik","#Santexnika","#TORVEX"];
    trends.innerHTML = trendItems.map((t, i) => `
      <li style="padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer;display:flex;justify-content:space-between;align-items:center" onclick="showToast('${t} qidiruvi', 'info')">
        <span style="font-size:13px">${i+1}. ${t}</span>
        <i class="fas fa-arrow-trend-up" style="color:#22c55e;font-size:10px"></i>
      </li>
    `).join("");
  }

  document.getElementById("newsCount").textContent = filtered.length;
}

function filterNews(cat, btn) {
  document.querySelectorAll("#yangiliklar .feed-filter-btn").forEach(b => {
    b.classList.remove("active"); b.setAttribute("aria-pressed","false");
  });
  btn.classList.add("active"); btn.setAttribute("aria-pressed","true");
  state.newsFilter = cat;
  renderNews();
}

function openNewsDetail(id) {
  const n = state.news.find(x => x.id === id);
  if (!n) return;
  showToast(n.title, "info");
}

function subscribeNewsletter() {
  const input = document.querySelector(".subscribe-form input");
  if (!input?.value) { showToast("Email kiriting", "error"); return; }
  if (!validateEmail(input.value)) { showToast("Email noto'g'ri", "error"); return; }
  showToast("Muvaffaqiyatli obuna bo'ldingiz!", "success");
  input.value = "";
}

// ────────────────────────────────────────────────────────────────
// 17. FAVORITES
// ────────────────────────────────────────────────────────────────
function renderFavorites() {
  renderFavs("masters");
}

function filterFavs(type, btn) {
  document.querySelectorAll("#sevimlilari .tab-btn").forEach(b => {
    b.classList.remove("active"); b.setAttribute("aria-selected","false");
  });
  btn.classList.add("active"); btn.setAttribute("aria-selected","true");
  renderFavs(type);
}

function renderFavs(type) {
  const grid = document.getElementById("favsGrid");
  if (!grid) return;
  if (type === "masters") {
    const favMasters = state.masters.filter(m => state.favorites["master_" + m.id]);
    grid.innerHTML = favMasters.length
      ? favMasters.map(m => createMasterCard(m)).join("")
      : `<div class="widget-empty" style="grid-column:1/-1"><i class="fas fa-heart"></i><p>Hali sevimli ustalar yo'q</p><button class="btn-primary btn-sm" onclick="showSection('ustalar')">Ustalar</button></div>`;
  } else if (type === "products") {
    const favProds = state.products.filter(p => state.favorites["product_" + p.id]);
    grid.innerHTML = favProds.length
      ? favProds.map(p => createProductCard(p)).join("")
      : `<div class="widget-empty" style="grid-column:1/-1"><i class="fas fa-box"></i><p>Hali sevimli mahsulotlar yo'q</p><button class="btn-primary btn-sm" onclick="showSection('bozor')">Bozor</button></div>`;
  } else if (type === "posts") {
    const favPosts = state.posts.filter(p => p.saved);
    grid.innerHTML = favPosts.length
      ? favPosts.map(p => createPostCard(p).outerHTML).join("")
      : `<div class="widget-empty" style="grid-column:1/-1"><i class="fas fa-stream"></i><p>Saqlangan e'lonlar yo'q</p></div>`;
  } else {
    grid.innerHTML = `<div class="widget-empty" style="grid-column:1/-1"><i class="fas fa-tools"></i><p>Hali sevimli xizmatlar yo'q</p></div>`;
  }
}

function saveFavorites() {
  localStorage.setItem("torvex-favs", JSON.stringify(state.favorites));
}

// ────────────────────────────────────────────────────────────────
// 18. PROFILE
// ────────────────────────────────────────────────────────────────
function renderProfile() {
  if (!currentUser) {
    document.getElementById("profilAuthGate").style.display = "";
    document.getElementById("profilContent").style.display  = "none";
  } else {
    document.getElementById("profilAuthGate").style.display = "none";
    document.getElementById("profilContent").style.display  = "";
    populateProfileData();
  }
}

function populateProfileData() {
  const u = currentUser || { displayName:"Demo Foydalanuvchi", email:"demo@torvex.uz", photoURL:"https://i.pravatar.cc/80?img=15" };
  setEl("profileName",    u.displayName || "Foydalanuvchi");
  setEl("profileBio",     "TORVEX platformasi foydalanuvchisi");
  const av = document.getElementById("profileAvatar");
  if (av) av.src = u.photoURL || "https://i.pravatar.cc/80?img=15";
  setEl("profileRoleBadge","Mijoz");
  setEl("psPostCount",    "5");
  setEl("psRating",       "4.8");
  setEl("psReviews",      "12");
  setEl("psCompleted",    "3");
  setEl("psFollowers",    "28");
  document.getElementById("profileVerified").style.display = "inline";
  filterProfileTab("posts", document.querySelector("#profil .tab-btn"));
}

function filterProfileTab(tab, btn) {
  if (btn) {
    document.querySelectorAll("#profil .tab-btn").forEach(b => {
      b.classList.remove("active"); b.setAttribute("aria-selected","false");
    });
    btn.classList.add("active"); btn.setAttribute("aria-selected","true");
  }
  const content = document.getElementById("profileTabContent");
  if (!content) return;
  if (tab === "posts") {
    content.innerHTML = `<div class="posts-feed">${state.posts.slice(0,3).map(p => createPostCard(p).outerHTML).join("")}</div>`;
  } else if (tab === "reviews") {
    content.innerHTML = `<div class="reviews-list">
      ${[{user:"Jasur Q.",text:"Juda yaxshi xizmat!",rating:5},{user:"Bobur T.",text:"Tez va sifatli",rating:4}]
        .map(r => `<div class="review-card" style="padding:12px;background:var(--bg-card);border-radius:10px;margin-bottom:8px">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
            <img src="https://i.pravatar.cc/32?u=${r.user}" style="width:32px;height:32px;border-radius:50%"/>
            <strong>${r.user}</strong>
            <div style="margin-left:auto">${renderStars(r.rating)}</div>
          </div>
          <p style="margin:0;font-size:13px">${r.text}</p>
        </div>`).join("")}
    </div>`;
  } else if (tab === "info") {
    content.innerHTML = `
      <div class="settings-card">
        <div class="sc-body">
          <div class="setting-row"><label>Email</label><span style="color:var(--text-muted)">demo@torvex.uz</span></div>
          <div class="setting-row"><label>Telefon</label><span style="color:var(--text-muted)">+998 90 123 45 67</span></div>
          <div class="setting-row"><label>Viloyat</label><span style="color:var(--text-muted)">Toshkent</span></div>
          <div class="setting-row"><label>Ro'yxatga kirgan</label><span style="color:var(--text-muted)">May 2025</span></div>
        </div>
      </div>
    `;
  } else if (tab === "portfolio") {
    content.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px">
      ${Array(6).fill(0).map((_,i) => `<div style="aspect-ratio:1;background:var(--bg-secondary);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);cursor:pointer" onclick="showToast('Portfolio rasm ${i+1}','info')"><i class="fas fa-image" style="font-size:1.5rem"></i></div>`).join("")}
      <div style="aspect-ratio:1;background:var(--bg-secondary);border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:2px dashed var(--border)" onclick="showToast('Rasm yuklash','info')">
        <i class="fas fa-plus" style="font-size:1.5rem;color:var(--accent)"></i>
      </div>
    </div>`;
  } else if (tab === "activity") {
    const acts = [
      "E'lon berdi: Sement M400 sotiladi",
      "Sharh qoldirdi: Jasur Qodirov — 5 ⭐",
      "Bozordan xarid qildi: Knauf gips",
      "Loyiha yaratdi: 2-qavatli uy ta'miri",
      "Profilni yangiladi",
    ];
    content.innerHTML = `<ul style="list-style:none;padding:0">
      ${acts.map(a => `<li style="display:flex;gap:10px;padding:12px 0;border-bottom:1px solid var(--border)">
        <i class="fas fa-circle" style="color:var(--accent);font-size:8px;margin-top:5px"></i>
        <span style="font-size:13px">${a}</span>
      </li>`).join("")}
    </ul>`;
  }
}

function shareProfile() {
  navigator.share?.({ title:"TORVEX Profil", url: window.location.href })
    .catch(() => showToast("Havola nusxalandi", "success"));
}

function changeCoverPhoto() { showToast("Muqova rasmi o'zgartirish tez orada", "info"); }
function changeAvatar()      { showToast("Profil rasmi o'zgartirish tez orada", "info"); }

function saveProfile(e) {
  e.preventDefault();
  const name = document.getElementById("editName")?.value;
  if (name) setEl("profileName", name);
  const bio  = document.getElementById("editBio")?.value;
  if (bio)  setEl("profileBio",  bio);
  closeModal("editProfileModal");
  showToast("Profil saqlandi!", "success");
}

// ────────────────────────────────────────────────────────────────
// 19. SETTINGS
// ────────────────────────────────────────────────────────────────
function renderSettings() {
  const dm = document.getElementById("darkModeToggle");
  if (dm) dm.checked = state.theme === "dark";
}

function toggleCompact() {
  document.body.classList.toggle("compact-mode");
  showToast("Kompakt rejim", "success");
}

function toggleAnimations() {
  document.body.classList.toggle("no-animations");
}

function changeLanguage(lang) {
  localStorage.setItem("torvex-lang", lang);
  showToast("Til o'zgartirildi: " + lang, "success");
}

function changeFontSize(size) {
  const sizes = { sm:"14px", md:"16px", lg:"18px" };
  document.documentElement.style.fontSize = sizes[size] || "16px";
  localStorage.setItem("torvex-fontsize", size);
}

function saveNotifSettings() { showToast("Bildirishnoma sozlamalari saqlandi", "success"); }
function savePrivacy()       { showToast("Maxfiylik sozlamalari saqlandi", "success"); }
function toggle2FA() { showToast("2FA tez orada faollashtirish mumkin bo'ladi", "info"); }

function downloadMyData() {
  const data = { user: currentUser?.email || "demo", cart: state.cart, favorites: state.favorites };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "torvex-my-data.json"; a.click();
  URL.revokeObjectURL(url);
  showToast("Ma'lumotlar yuklab olindi", "success");
}

function confirmClearData() {
  showConfirm("Barcha ma'lumotlarni tozalamoqchimisiz?", () => {
    localStorage.clear();
    state.cart = []; state.favorites = {};
    updateCartBadge();
    showToast("Ma'lumotlar tozalandi", "success");
  });
}

function confirmDeleteAccount() {
  showConfirm("Hisobni o'chirishni tasdiqlaysizmi? Bu qaytarib bo'lmaydi!", () => {
    showToast("Hisob o'chirish uchun email tasdiqlanishi kerak", "info");
  }, "danger");
}

// ────────────────────────────────────────────────────────────────
// 20. AUTHENTICATION
// ────────────────────────────────────────────────────────────────
function handleAuthStateChange(user) {
  currentUser = user;
  if (user) {
    showUserInUI(user);
  } else {
    showGuestInUI();
  }
}

function showUserInUI(user) {
  const sfAuth = document.getElementById("sfAuthArea");
  const sfUser = document.getElementById("sfUserArea");
  if (sfAuth) sfAuth.style.display = "none";
  if (sfUser) sfUser.style.display = "";

  const sfAvatar = document.getElementById("sfAvatar");
  if (sfAvatar) sfAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || "U")}&background=7c6af7&color=fff`;

  setEl("sfName",  user.displayName || user.email?.split("@")[0] || "Foydalanuvchi");
  setEl("sfRole",  "Foydalanuvchi");

  const composerAvatar = document.getElementById("composerAvatar");
  if (composerAvatar) {
    composerAvatar.innerHTML = "";
    const img = document.createElement("img");
    img.src = user.photoURL || `https://ui-avatars.com/api/?name=U&background=7c6af7&color=fff`;
    img.style.cssText = "width:40px;height:40px;border-radius:50%";
    composerAvatar.appendChild(img);
  }

  const topbarUser = document.getElementById("topbarUser");
  if (topbarUser) {
    topbarUser.onclick = () => showSection("profil");
    topbarUser.innerHTML = `<img src="${user.photoURL || `https://ui-avatars.com/api/?name=U&background=7c6af7&color=fff`}" style="width:32px;height:32px;border-radius:50%"/>`;
  }
}

function showGuestInUI() {
  const sfAuth = document.getElementById("sfAuthArea");
  const sfUser = document.getElementById("sfUserArea");
  if (sfAuth) sfAuth.style.display = "";
  if (sfUser) sfUser.style.display = "none";
}

function handleAuth(e) {
  e.preventDefault();
  const email    = document.getElementById("authEmail")?.value.trim();
  const password = document.getElementById("authPass")?.value;
  const isLogin  = document.getElementById("tabLogin")?.classList.contains("active");

  clearAuthErrors();

  if (!validateEmail(email)) { showFieldError("authEmailErr","Email noto'g'ri"); return; }
  if (!password || password.length < 6) { showFieldError("authPassErr","Parol kamida 6 ta belgi"); return; }

  const btn     = document.getElementById("authBtn");
  const spinner = document.getElementById("authSpinner");
  if (btn) btn.disabled = true;
  if (spinner) spinner.style.display = "inline";

  if (auth) {
    const promise = isLogin
      ? auth.signInWithEmailAndPassword(email, password)
      : auth.createUserWithEmailAndPassword(email, password);
    promise
      .then(cred => {
        closeModal("authModal");
        showToast("Tizimga kirdingiz!", "success");
      })
      .catch(err => {
        const msgs = {
          "auth/user-not-found":     "Foydalanuvchi topilmadi",
          "auth/wrong-password":     "Parol noto'g'ri",
          "auth/email-already-in-use":"Bu email allaqachon ro'yxatda",
          "auth/weak-password":      "Parol juda zaif",
          "auth/invalid-email":      "Email noto'g'ri formatda",
        };
        showFieldError("authEmailErr", msgs[err.code] || err.message);
      })
      .finally(() => {
        if (btn) btn.disabled = false;
        if (spinner) spinner.style.display = "none";
      });
  } else {
    // Demo mode
    setTimeout(() => {
      const demoUser = { displayName: document.getElementById("authName")?.value || "Demo Foydalanuvchi", email, photoURL: null };
      currentUser = demoUser;
      showUserInUI(demoUser);
      closeModal("authModal");
      showToast("Demo rejimda kirdingiz!", "success");
      if (btn) btn.disabled = false;
      if (spinner) spinner.style.display = "none";
    }, 1000);
  }
}

function switchAuthTab(tab) {
  const isLogin = tab === "login";
  document.getElementById("tabLogin").classList.toggle("active", isLogin);
  document.getElementById("tabRegister").classList.toggle("active", !isLogin);
  document.getElementById("tabLogin").setAttribute("aria-selected", String(isLogin));
  document.getElementById("tabRegister").setAttribute("aria-selected", String(!isLogin));
  document.getElementById("registerFields").style.display  = isLogin ? "none" : "";
  document.getElementById("loginOptions").style.display    = isLogin ? "" : "none";
  document.getElementById("passStrengthWrap").style.display= isLogin ? "none" : "";
  document.getElementById("authBtnText").textContent       = isLogin ? "Kirish" : "Ro'yxat";
  document.getElementById("authSubtitle").textContent      = isLogin ? "Davom etish uchun hisobingizga kiring" : "Yangi hisob yarating";
  document.getElementById("authModalTitle").textContent    = isLogin ? "Xush kelibsiz!" : "Ro'yxatdan o'ting";
  if (!isLogin) {
    const passInput = document.getElementById("authPass");
    if (passInput) passInput.addEventListener("input", checkPasswordStrength);
  }
}

function checkPasswordStrength() {
  const pass = document.getElementById("authPass")?.value || "";
  const fill  = document.getElementById("psStrengthFill");
  const label = document.getElementById("psStrengthLabel");
  if (!fill || !label) return;
  let strength = 0;
  if (pass.length >= 8) strength++;
  if (/[A-Z]/.test(pass)) strength++;
  if (/[0-9]/.test(pass)) strength++;
  if (/[^A-Za-z0-9]/.test(pass)) strength++;
  const levels = [
    { pct:"25%",  color:"#ef4444", label:"Juda zaif" },
    { pct:"50%",  color:"#f97316", label:"Zaif"      },
    { pct:"75%",  color:"#f59e0b", label:"O'rta"     },
    { pct:"100%", color:"#22c55e", label:"Kuchli"    },
  ];
  const l = levels[strength - 1] || levels[0];
  fill.style.width = l.pct;
  fill.style.background = l.color;
  label.textContent = l.label;
}

function signOut() {
  if (auth) {
    auth.signOut().then(() => {
      currentUser = null;
      showGuestInUI();
      showToast("Tizimdan chiqildi", "success");
      showSection("dash");
    });
  } else {
    currentUser = null;
    showGuestInUI();
    showToast("Tizimdan chiqildi", "success");
    showSection("dash");
  }
}

function loginWithGoogle() {
  if (auth) {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(() => { closeModal("authModal"); showToast("Google bilan kirdingiz!", "success"); })
      .catch(err => showToast(err.message, "error"));
  } else {
    showToast("Demo: Google kirish simulyatsiyasi", "info");
    closeModal("authModal");
  }
}

function loginWithTelegram() { showToast("Telegram kirish tez orada", "info"); }

function loginWithPhone() {
  closeModal("authModal");
  openModal("otpModal");
  startOtpCountdown();
}

let otpTimer = null;
function startOtpCountdown() {
  clearInterval(otpTimer);
  let sec = 60;
  document.getElementById("resendOtpBtn").disabled = true;
  otpTimer = setInterval(() => {
    sec--;
    const el = document.getElementById("otpCountdown");
    if (el) el.textContent = sec;
    if (sec <= 0) {
      clearInterval(otpTimer);
      document.getElementById("resendOtpBtn").disabled = false;
    }
  }, 1000);
  // OTP input auto-focus chain
  const inputs = document.querySelectorAll(".otp-input");
  inputs.forEach((inp, i) => {
    inp.addEventListener("input", () => {
      if (inp.value && i < inputs.length - 1) inputs[i+1].focus();
    });
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !inp.value && i > 0) inputs[i-1].focus();
    });
  });
}

function verifyOtp() {
  const code = [...document.querySelectorAll(".otp-input")].map(i => i.value).join("");
  if (code.length < 6) { showToast("Kodni to'liq kiriting", "error"); return; }
  closeModal("otpModal");
  const demoUser = { displayName:"SMS Foydalanuvchi", email:"phone@torvex.uz", photoURL:null };
  currentUser = demoUser;
  showUserInUI(demoUser);
  showToast("Telefon raqam tasdiqlandi!", "success");
}

function resendOtp() { startOtpCountdown(); showToast("Kod qayta yuborildi", "success"); }

function sendPasswordReset(e) {
  e.preventDefault();
  const email = document.getElementById("resetEmail")?.value.trim();
  if (!validateEmail(email)) { showFieldError("resetEmailErr","Email noto'g'ri"); return; }
  if (auth) {
    auth.sendPasswordResetEmail(email)
      .then(() => { closeModal("forgotPassModal"); showToast("Email yuborildi!", "success"); })
      .catch(err => showFieldError("resetEmailErr", err.message));
  } else {
    closeModal("forgotPassModal");
    showToast("Parol tiklash emaili yuborildi (demo)", "success");
  }
}

function changePassword(e) {
  e.preventDefault();
  const np = document.getElementById("newPass")?.value;
  const cp = document.getElementById("confirmNewPass")?.value;
  if (np !== cp) { showFieldError("changePassErr","Parollar mos emas"); return; }
  if (np.length < 6) { showFieldError("changePassErr","Kamida 6 ta belgi"); return; }
  closeModal("changePassModal");
  showToast("Parol o'zgartirildi!", "success");
}

function toggleUserMenu() {
  const dd = document.getElementById("sfUserDropdown");
  if (!dd) return;
  const isOpen = dd.classList.contains("open");
  dd.classList.toggle("open", !isOpen);
  dd.setAttribute("aria-hidden", String(isOpen));
}

function closeUserMenu() {
  const dd = document.getElementById("sfUserDropdown");
  if (dd) { dd.classList.remove("open"); dd.setAttribute("aria-hidden","true"); }
}

function clearAuthErrors() {
  ["authEmailErr","authPassErr","authConfirmPassErr"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
}

function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon  = document.getElementById(iconId);
  if (!input) return;
  input.type = input.type === "password" ? "text" : "password";
  if (icon) icon.className = input.type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
}

// ────────────────────────────────────────────────────────────────
// 21. COMPOSER / POST
// ────────────────────────────────────────────────────────────────
let composerImagesData = [];

function openComposer(type = null) {
  if (!currentUser) {
    openModal("authModal");
    return;
  }
  openModal("composerModal");
  if (type) {
    const btn = document.querySelector(`[onclick="setPostType('${type}',this)"]`);
    if (btn) setPostType(type, btn);
  }
  const cfAvatar = document.getElementById("cfAvatar");
  if (cfAvatar) cfAvatar.src = currentUser?.photoURL || "https://i.pravatar.cc/40?img=15";
  setEl("cfName", currentUser?.displayName || "Foydalanuvchi");
}

function setPostType(type, btn) {
  state.postType = type;
  document.querySelectorAll(".cf-type-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  const fields = document.getElementById("postTypeFields");
  if (!fields) return;
  const templates = {
    sale:    `<div class="form-field"><label>Narx (so'm)</label><input type="number" id="postPrice" placeholder="150000" class="select-input" /></div><div class="form-field"><label>Kategoriya</label><select id="postCat" class="select-input"><option>Sement</option><option>Armatura</option><option>Gips</option><option>Boshqa</option></select></div>`,
    buy:     `<div class="form-field"><label>Maksimal narx (so'm)</label><input type="number" id="postMaxPrice" placeholder="200000" class="select-input" /></div>`,
    service: `<div class="form-field"><label>Mutaxassislik</label><select id="postSpec" class="select-input"><option>Elektrik</option><option>Santexnik</option><option>Malyar</option><option>Kafelchi</option><option>Duradgor</option></select></div><div class="form-field"><label>Narx (kunlik, so'm)</label><input type="number" id="postServicePrice" placeholder="200000" class="select-input" /></div>`,
    job:     `<div class="form-field"><label>Ish turi</label><select id="postJobType" class="select-input"><option>Bir martalik</option><option>Doimiy</option><option>Loyiha</option></select></div><div class="form-field"><label>Ish haqi (so'm)</label><input type="number" id="postJobSalary" placeholder="300000" class="select-input" /></div>`,
    news:    `<div class="form-field"><label>Teglar</label><input type="text" id="postTags" placeholder="#qurilish #ustalar" class="select-input" /></div>`,
  };
  fields.innerHTML = templates[type] || "";
}

function updateCharCount() {
  const text  = document.getElementById("composerText")?.value || "";
  const count = document.getElementById("composerCharCount");
  if (count) { count.textContent = `${text.length}/2000`; count.style.color = text.length > 1800 ? "#ef4444" : ""; }
}

function handleComposerMedia(e) {
  composerImagesData = [];
  const preview = document.getElementById("composerImagePreview");
  if (!preview) return;
  preview.innerHTML = "";
  [...e.target.files].forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = ev => {
      composerImagesData.push(ev.target.result);
      const div = document.createElement("div");
      div.style.cssText = "position:relative;display:inline-block";
      div.innerHTML = `<img src="${ev.target.result}" style="width:80px;height:80px;object-fit:cover;border-radius:8px" role="listitem" />
        <button onclick="this.parentElement.remove()" style="position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;border:none;border-radius:50%;width:18px;height:18px;cursor:pointer;line-height:18px;font-size:12px" aria-label="O'chirish">×</button>`;
      preview.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

function addPriceField() {
  const fields = document.getElementById("postTypeFields");
  if (!fields || document.getElementById("extraPrice")) return;
  const div = document.createElement("div");
  div.className = "form-field";
  div.innerHTML = '<label>Narx</label><input type="number" id="extraPrice" placeholder="0" class="select-input"/>';
  fields.appendChild(div);
}

function addPhoneField() {
  const fields = document.getElementById("postTypeFields");
  if (!fields || document.getElementById("extraPhone")) return;
  const div = document.createElement("div");
  div.className = "form-field";
  div.innerHTML = '<label>Telefon</label><input type="tel" id="extraPhone" placeholder="+998 90 123 45 67" class="select-input"/>';
  fields.appendChild(div);
}

function openLocationPicker() {
  openModal("locationModal");
}

function useCurrentLocation() {
  if (!navigator.geolocation) { showToast("Geolokatsiya qo'llab-quvvatlanmaydi", "error"); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    state.composerLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    setEl("locationSelectedText", `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
    showToast("Joylashuv aniqlandi", "success");
  }, () => showToast("Joylashuvni aniqlab bo'lmadi", "error"));
}

function confirmLocation() {
  const loc = state.composerLocation || { lat: 41.2995, lng: 69.2401 };
  setEl("composerLocationLabel", `Toshkent (${loc.lat.toFixed(3)}, ${loc.lng.toFixed(3)})`);
  const row = document.getElementById("composerLocationRow");
  if (row) row.style.display = "flex";
  closeModal("locationModal");
}

function clearLocation() {
  state.composerLocation = null;
  const row = document.getElementById("composerLocationRow");
  if (row) row.style.display = "none";
}

function openLocationFilter() { showToast("Hudud filtri tez orada", "info"); }

function submitPost() {
  const text = document.getElementById("composerText")?.value.trim();
  if (!text) { showToast("E'lon matni kiriting", "error"); return; }

  const newPost = {
    id: "fp" + Date.now(),
    type: state.postType,
    author: currentUser?.displayName || "Foydalanuvchi",
    avatar: currentUser?.photoURL || "https://i.pravatar.cc/40?img=15",
    time: "Hozir",
    text,
    price: document.getElementById("postPrice")?.value ? parseInt(document.getElementById("postPrice").value) : null,
    likes: 0, comments: 0, liked: false, saved: false,
    region: "toshkent",
  };

  state.posts.unshift(newPost);
  state.filteredPosts.unshift(newPost);

  closeModal("composerModal");
  document.getElementById("composerText").value = "";
  composerImagesData = [];
  document.getElementById("composerImagePreview").innerHTML = "";
  document.getElementById("postTypeFields").innerHTML = "";

  showToast("E'lon muvaffaqiyatli joylashtirildi!", "success");

  if (state.currentSection === "dash" || state.currentSection === "feed") {
    const feed = document.getElementById("postsFeed") || document.getElementById("fullFeedContainer");
    if (feed) {
      const card = createPostCard(newPost);
      card.style.animation = "slideInDown .4s ease";
      feed.prepend(card);
    }
  }

  const countEl = document.getElementById("feedCount");
  if (countEl) countEl.textContent = state.posts.length;
}

// ────────────────────────────────────────────────────────────────
// 22. NOTIFICATIONS
// ────────────────────────────────────────────────────────────────
function renderNotifications() {
  const list = document.getElementById("notifList");
  if (!list) return;
  const filtered = state.notifFilter === "all" ? state.notifications
    : state.notifFilter === "unread" ? state.notifications.filter(n => !n.read)
    : state.notifications.filter(n => n.type === "mention");

  list.innerHTML = filtered.map(n => `
    <li class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead('${n.id}')" role="button" tabindex="0">
      <span class="notif-icon-wrap" style="background:var(--${n.color === 'blue' ? 'accent' : n.color === 'amber' ? 'amber' : n.color === 'green' ? 'green' : n.color === 'red' ? 'red' : 'purple'}-10, #7c6af720)">
        <i class="${n.icon}" style="color:${n.color === 'amber' ? '#f59e0b' : n.color === 'green' ? '#22c55e' : n.color === 'red' ? '#ef4444' : 'var(--accent)'}"></i>
      </span>
      <div class="notif-body">
        <strong>${n.title}</strong>
        <p>${n.body}</p>
        <span class="notif-time">${n.time}</span>
      </div>
      ${!n.read ? '<span class="notif-unread-dot" aria-hidden="true"></span>' : ''}
    </li>
  `).join("") || '<li style="padding:1.5rem;text-align:center;color:var(--text-muted)">Bildirishnoma yo\'q</li>';

  const badge = document.getElementById("notifBadge");
  const unreadCount = state.notifications.filter(n => !n.read).length;
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? "" : "none";
  }
}

function filterNotif(filter, btn) {
  document.querySelectorAll(".notif-tab").forEach(t => { t.classList.remove("active"); t.setAttribute("aria-selected","false"); });
  btn.classList.add("active"); btn.setAttribute("aria-selected","true");
  state.notifFilter = filter;
  renderNotifications();
}

function markNotifRead(id) {
  const n = state.notifications.find(x => x.id === id);
  if (n) { n.read = true; renderNotifications(); }
}

function markAllRead() {
  state.notifications.forEach(n => n.read = true);
  renderNotifications();
  showToast("Hammasi o'qildi deb belgilandi", "success");
}

function toggleNotifPanel() {
  state.notifPanelOpen = !state.notifPanelOpen;
  const panel = document.getElementById("notifPanel");
  const trigger = document.getElementById("notifTrigger");
  if (panel) {
    panel.classList.toggle("open", state.notifPanelOpen);
    panel.setAttribute("aria-hidden", String(!state.notifPanelOpen));
  }
  if (trigger) trigger.setAttribute("aria-expanded", String(state.notifPanelOpen));
  if (state.notifPanelOpen) renderNotifications();
}

// ────────────────────────────────────────────────────────────────
// 23. AI ASSISTANT
// ────────────────────────────────────────────────────────────────
function handleAiKey(e) {
  if (e.key === "Enter") sendAiMessage();
}

async function sendAiMessage(msg = null) {
  const input = document.getElementById("aiInput");
  const text = msg || input?.value.trim();
  if (!text) return;
  if (input) input.value = "";

  const messagesEl = document.getElementById("aiMessages");
  if (!messagesEl) return;

  // User message
  const userDiv = document.createElement("div");
  userDiv.className = "ai-msg user";
  userDiv.innerHTML = `<p>${escapeHtml(text)}</p>`;
  messagesEl.appendChild(userDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // Typing indicator
  const typingDiv = document.createElement("div");
  typingDiv.className = "ai-msg assistant";
  typingDiv.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
  messagesEl.appendChild(typingDiv);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  state.aiHistory.push({ role:"user", content: text });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `Siz TORVEX platformasining yordamchi AI siz. TORVEX — O'zbekistonning qurilish va sanoat platformasi. Ustalar topish, qurilish materiallari narxlari, qurilish maslahatlari, e'lon yozish va boshqa savollarga yordam bering. O'zbek tilida javob bering. Qisqa, aniq va foydali bo'ling.`,
        messages: state.aiHistory,
      }),
    });
    const data = await res.json();
    const reply = data.content?.[0]?.text || getFallbackAiReply(text);
    typingDiv.remove();
    const botDiv = document.createElement("div");
    botDiv.className = "ai-msg assistant";
    botDiv.innerHTML = `<p>${escapeHtml(reply)}</p>`;
    messagesEl.appendChild(botDiv);
    state.aiHistory.push({ role:"assistant", content: reply });
  } catch {
    typingDiv.remove();
    const fallback = getFallbackAiReply(text);
    const botDiv = document.createElement("div");
    botDiv.className = "ai-msg assistant";
    botDiv.innerHTML = `<p>${escapeHtml(fallback)}</p>`;
    messagesEl.appendChild(botDiv);
  }
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function getFallbackAiReply(text) {
  const lw = text.toLowerCase();
  if (lw.includes("santexnik"))     return "Santexnik topish uchun 'Ustalar' bo'limiga o'ting. Bizda 189+ santexnik bor. Reyting va narxga qarab filtrlash mumkin.";
  if (lw.includes("elektrik"))      return "Elektrik ustalar uchun 'Ustalar' → 'Elektrik' ni bosing. Bizda 245+ elektrik bor.";
  if (lw.includes("sement") || lw.includes("narx")) return "Hozirgi narxlar: Sement M400 — 68,000 so'm/qop, M500 — 82,000 so'm/qop. Bozorda ko'proq ma'lumot bor.";
  if (lw.includes("hisob") || lw.includes("kalkulyator")) return "Kalkulyator uchun Dashboard → 'Hisoblash' tugmasini bosing yoki ⌘K bosib 'calc' kiriting.";
  if (lw.includes("e'lon") || lw.includes("reklama")) return "E'lon berish uchun '+' tugmasini yoki Dashboard → 'E'lon berish' ni bosing.";
  if (lw.includes("premium"))       return "Premium Basic — 49,000 so'm/oy, Pro — 99,000 so'm/oy, Business — 249,000 so'm/oy. Premium oynasi uchun yuqoridagi 'Premium' tugmasini bosing.";
  return "Savolingiz uchun rahmat! Men TORVEX AI yordamchisiman. Ustalar topish, mahsulot narxlari, e'lon berish va boshqa mavzularda yordam bera olaman.";
}

// ────────────────────────────────────────────────────────────────
// 24. CALCULATOR
// ────────────────────────────────────────────────────────────────
function switchCalcTab(tab, btn) {
  state.calcTab = tab;
  document.querySelectorAll(".calc-tab").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected","false"); });
  btn.classList.add("active"); btn.setAttribute("aria-selected","true");
  renderCalcContent();
}

function renderCalcContent() {
  const content = document.getElementById("calcContent");
  if (!content) return;
  if (state.calcTab === "material") {
    content.innerHTML = `
      <div class="form-field"><label>Xona maydoni (m²)</label><input type="number" id="calcArea" placeholder="50" class="select-input" oninput="calcMaterial()" /></div>
      <div class="form-field"><label>Devor balandligi (m)</label><input type="number" id="calcHeight" placeholder="2.7" class="select-input" oninput="calcMaterial()" /></div>
      <div class="form-field"><label>Material</label><select id="calcMat" class="select-input" onchange="calcMaterial()">
        <option value="sement">Sement (M400)</option>
        <option value="gips">Gips qorishmasi</option>
        <option value="kafel">Kafel (standart)</option>
        <option value="laminat">Laminat</option>
        <option value="boyoq">Bo'yoq</option>
      </select></div>
      <div id="calcResult" style="margin-top:1rem;padding:1rem;background:var(--bg-secondary);border-radius:10px;display:none">
        <h4 style="margin:0 0 8px">Hisoblash natijasi:</h4>
        <div id="calcResultContent"></div>
      </div>
    `;
  } else if (state.calcTab === "cost") {
    content.innerHTML = `
      <div class="form-field"><label>Maydon (m²)</label><input type="number" id="costArea" placeholder="100" class="select-input" oninput="calcCost()" /></div>
      <div class="form-field"><label>Ish turi</label><select id="costType" class="select-input" onchange="calcCost()">
        <option value="repair">Oddiy ta'mir</option>
        <option value="renovation">Kapital ta'mir</option>
        <option value="new">Yangi qurilish</option>
        <option value="decor">Faqat dekoratsiya</option>
      </select></div>
      <div class="form-field"><label>Sifat darajasi</label><select id="costQuality" class="select-input" onchange="calcCost()">
        <option value="economy">Ekonom</option>
        <option value="standard">Standart</option>
        <option value="premium">Premium</option>
      </select></div>
      <div id="costResult" style="margin-top:1rem;padding:1rem;background:var(--bg-secondary);border-radius:10px;display:none">
        <div id="costResultContent"></div>
      </div>
    `;
  } else {
    content.innerHTML = `
      <div class="form-field"><label>Uzunlik (m)</label><input type="number" id="areaL" placeholder="10" class="select-input" oninput="calcArea()" /></div>
      <div class="form-field"><label>Kenglik (m)</label><input type="number" id="areaW" placeholder="8"  class="select-input" oninput="calcArea()" /></div>
      <div class="form-field"><label>Balandlik (m, ixtiyoriy)</label><input type="number" id="areaH" placeholder="3" class="select-input" oninput="calcArea()" /></div>
      <div id="areaResult" style="margin-top:1rem;padding:1rem;background:var(--bg-secondary);border-radius:10px;display:none">
        <div id="areaResultContent"></div>
      </div>
    `;
  }
}

function calcMaterial() {
  const area   = parseFloat(document.getElementById("calcArea")?.value) || 0;
  const height = parseFloat(document.getElementById("calcHeight")?.value) || 2.7;
  const mat    = document.getElementById("calcMat")?.value || "sement";
  if (!area) return;

  const wallArea  = area * 2.3 * height;
  const results   = {
    sement:  { qty: Math.ceil(area * 0.25),       unit:"qop",    price:68000,  name:"Sement M400"  },
    gips:    { qty: Math.ceil(wallArea * 0.008),   unit:"qop",    price:42000,  name:"Gips qorishma"},
    kafel:   { qty: Math.ceil(area * 1.1),         unit:"m²",     price:85000,  name:"Kafel"        },
    laminat: { qty: Math.ceil(area * 1.08),        unit:"m²",     price:85000,  name:"Laminat 8mm"  },
    boyoq:   { qty: Math.ceil(wallArea / 10),      unit:"chelak", price:180000, name:"Bo'yoq 25kg"  },
  };
  const r = results[mat];
  const total = r.qty * r.price;

  const resultDiv = document.getElementById("calcResult");
  const content   = document.getElementById("calcResultContent");
  if (!resultDiv || !content) return;
  resultDiv.style.display = "";
  content.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">
      <div><strong>Material:</strong></div><div>${r.name}</div>
      <div><strong>Miqdor:</strong></div><div>${r.qty} ${r.unit}</div>
      <div><strong>Birlik narxi:</strong></div><div>${formatPrice(r.price)}</div>
      <div style="padding-top:8px;border-top:1px solid var(--border)"><strong>Jami:</strong></div>
      <div style="padding-top:8px;border-top:1px solid var(--border);color:var(--accent);font-weight:700">${formatPrice(total)}</div>
    </div>
    <button class="btn-primary btn-sm" style="margin-top:12px;width:100%" onclick="addCalcToCart('${mat}')">
      <i class="fas fa-cart-plus"></i> Bozordan xarid
    </button>
  `;
}

function calcCost() {
  const area    = parseFloat(document.getElementById("costArea")?.value) || 0;
  const type    = document.getElementById("costType")?.value || "repair";
  const quality = document.getElementById("costQuality")?.value || "standard";
  if (!area) return;

  const baseCosts = { repair: 500000, renovation: 1200000, new: 2500000, decor: 800000 };
  const qualMult  = { economy: 0.7, standard: 1.0, premium: 1.8 };
  const base      = baseCosts[type] * qualMult[quality] * area;
  const labor     = base * 0.4;
  const material  = base * 0.6;

  const resultDiv = document.getElementById("costResult");
  const content   = document.getElementById("costResultContent");
  if (!resultDiv || !content) return;
  resultDiv.style.display = "";
  content.innerHTML = `
    <h4 style="margin:0 0 12px">Xarajatlar taxmini:</h4>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">
      <div>Material:</div><div>${formatPrice(material)}</div>
      <div>Mehnat haqi:</div><div>${formatPrice(labor)}</div>
      <div style="padding-top:8px;border-top:1px solid var(--border)"><strong>Jami:</strong></div>
      <div style="padding-top:8px;border-top:1px solid var(--border);color:var(--accent);font-weight:700">${formatPrice(base)}</div>
    </div>
    <p style="font-size:11px;color:var(--text-muted);margin-top:8px">* Bu taxminiy hisob. Haqiqiy narx farq qilishi mumkin.</p>
  `;
}

function calcArea() {
  const l = parseFloat(document.getElementById("areaL")?.value) || 0;
  const w = parseFloat(document.getElementById("areaW")?.value) || 0;
  const h = parseFloat(document.getElementById("areaH")?.value) || 0;
  if (!l || !w) return;

  const floor   = l * w;
  const perimeter = 2 * (l + w);
  const wallArea  = h ? perimeter * h : 0;
  const volume    = h ? floor * h : 0;

  const resultDiv = document.getElementById("areaResult");
  const content   = document.getElementById("areaResultContent");
  if (!resultDiv || !content) return;
  resultDiv.style.display = "";
  content.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">
      <div>Pol maydoni:</div><div><strong>${floor.toFixed(2)} m²</strong></div>
      <div>Perimetr:</div><div><strong>${perimeter.toFixed(2)} m</strong></div>
      ${wallArea ? `<div>Devor maydoni:</div><div><strong>${wallArea.toFixed(2)} m²</strong></div>` : ''}
      ${volume   ? `<div>Hajm:</div><div><strong>${volume.toFixed(2)} m³</strong></div>` : ''}
    </div>
  `;
}

function addCalcToCart(mat) {
  const p = state.products.find(x => x.cat === mat);
  if (p) { addToCart(p.id); toggleCart(); }
  else showToast("Mahsulot bozorda topilmadi", "info");
}

// ────────────────────────────────────────────────────────────────
// 25. PREMIUM
// ────────────────────────────────────────────────────────────────
function setBilling(period, btn) {
  state.billingPeriod = period;
  document.querySelectorAll(".billing-btn").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-pressed","false"); });
  btn.classList.add("active"); btn.setAttribute("aria-pressed","true");
  const multiplier = period === "yearly" ? 0.8 : 1;
  document.getElementById("basicPrice").textContent    = formatNum(Math.round(49000 * multiplier));
  document.getElementById("proPrice").textContent      = formatNum(Math.round(99000 * multiplier));
  document.getElementById("businessPrice").textContent = formatNum(Math.round(249000 * multiplier));
}

function subscribePlan(plan) {
  if (!currentUser) { closeModal("premiumModal"); openModal("authModal"); return; }
  showToast(`${capitalize(plan)} obunasi aktivlashtirilmoqda...`, "info");
  setTimeout(() => {
    closeModal("premiumModal");
    showToast(`${capitalize(plan)} Premium muvaffaqiyatli faollashdi! 🎉`, "success");
  }, 1500);
}

// ────────────────────────────────────────────────────────────────
// 26. BECOME MASTER
// ────────────────────────────────────────────────────────────────
function submitBecomeMaster(e) {
  e.preventDefault();
  const specialty = document.getElementById("masterSpecialty")?.value;
  const exp       = document.getElementById("masterExp")?.value;
  const price     = document.getElementById("masterPrice")?.value;
  if (!specialty) { showToast("Mutaxassislik tanlang", "error"); return; }
  if (!exp || exp < 0) { showToast("Tajribani kiriting", "error"); return; }
  if (!price || price < 10000) { showToast("Narxni kiriting (min 10,000 so'm)", "error"); return; }

  closeModal("becomeMasterModal");
  showToast("Arizangiz qabul qilindi! Tez orada ko'rib chiqamiz.", "success");

  // Add to demo masters
  const newMaster = {
    id: "m_new_" + Date.now(),
    name: currentUser?.displayName || "Yangi Usta",
    job: specialty, rating: 0, reviews: 0,
    exp: parseInt(exp), price: parseInt(price),
    region: "toshkent", online: true,
    avatar: currentUser?.photoURL || "https://i.pravatar.cc/80?img=20",
    verified: false,
  };
  state.masters.push(newMaster);
  state.filteredMasters.push(newMaster);
}

function previewPortfolio(e) {
  const preview = document.getElementById("portfolioPreview");
  if (!preview) return;
  preview.innerHTML = "";
  [...e.target.files].slice(0, 6).forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = document.createElement("img");
      img.src = ev.target.result;
      img.style.cssText = "width:70px;height:70px;object-fit:cover;border-radius:8px";
      img.role = "listitem";
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

// ────────────────────────────────────────────────────────────────
// 27. REVIEW
// ────────────────────────────────────────────────────────────────
function setReviewStar(val) {
  state.reviewStar = val;
  const labels = ["","Yomon","Qoniqarli","Yaxshi","Juda yaxshi","A'lo"];
  document.querySelectorAll(".star-btn").forEach((btn, i) => {
    btn.style.color = i < val ? "#f59e0b" : "#666";
  });
  setEl("starLabel", labels[val]);
}

function toggleReviewTag(el) {
  el.classList.toggle("active");
}

function submitReview() {
  if (!state.reviewStar) { showToast("Reyting bering", "error"); return; }
  const text = document.getElementById("reviewText")?.value.trim();
  if (!text) { showToast("Izoh kiriting", "error"); return; }
  closeModal("reviewModal");
  showToast("Sharhingiz uchun rahmat! 🙏", "success");
  state.reviewStar = 0;
}

// ────────────────────────────────────────────────────────────────
// 28. SEARCH
// ────────────────────────────────────────────────────────────────
function setupSearchDropdown() {
  const input = document.getElementById("globalSearch");
  const dropdown = document.getElementById("searchDropdown");
  if (!input || !dropdown) return;

  document.addEventListener("click", e => {
    if (!e.target.closest(".topbar-search")) closeSearch();
  });

  renderRecentSearches();
}

function showSearchDropdown() {
  const dropdown = document.getElementById("searchDropdown");
  if (dropdown) { dropdown.style.display = ""; dropdown.setAttribute("aria-hidden","false"); }
}

function closeSearch() {
  const dropdown = document.getElementById("searchDropdown");
  const input    = document.getElementById("globalSearch");
  if (dropdown) { dropdown.style.display = "none"; dropdown.setAttribute("aria-hidden","true"); }
  if (input) input.value = "";
  const resultsSection = document.getElementById("searchResultsSection");
  const recentSection  = document.getElementById("searchRecentSection");
  if (resultsSection) resultsSection.style.display = "none";
  if (recentSection)  recentSection.style.display  = "";
}

function renderRecentSearches() {
  const list = document.getElementById("searchRecentList");
  if (!list) return;
  list.innerHTML = state.searchHistory.slice(0, 5).map(q => `
    <li style="padding:6px 8px;cursor:pointer;border-radius:6px;display:flex;align-items:center;gap:8px;font-size:13px" onclick="runSearch('${escapeHtml(q)}')" role="option">
      <i class="fas fa-history" style="color:var(--text-muted);font-size:11px"></i> ${escapeHtml(q)}
    </li>
  `).join("") || '<li style="padding:6px 8px;font-size:12px;color:var(--text-muted)">Qidiruv tarixi yo\'q</li>';
}

function handleGlobalSearch(e) {
  const q = e.target.value.trim().toLowerCase();
  const resultsSection = document.getElementById("searchResultsSection");
  const recentSection  = document.getElementById("searchRecentSection");
  const resultsList    = document.getElementById("searchResultsList");

  if (!q) {
    if (resultsSection) resultsSection.style.display = "none";
    if (recentSection)  recentSection.style.display  = "";
    return;
  }

  if (recentSection)  recentSection.style.display  = "none";
  if (resultsSection) resultsSection.style.display = "";

  const masterResults  = state.masters.filter(m  => m.name.toLowerCase().includes(q)  || m.job.toLowerCase().includes(q)).slice(0, 3);
  const productResults = state.products.filter(p => p.name.toLowerCase().includes(q)).slice(0, 3);

  if (resultsList) {
    resultsList.innerHTML = [
      ...masterResults.map(m => `<li style="padding:6px 8px;cursor:pointer;border-radius:6px;display:flex;align-items:center;gap:10px;font-size:13px" onclick="runSearch('${m.name}');openMasterModal('${m.id}')" role="option">
        <img src="${m.avatar}" style="width:28px;height:28px;border-radius:50%" loading="lazy"/> <div><strong>${m.name}</strong><br><small style="color:var(--text-muted)">${m.job}</small></div>
        <span class="chip" style="margin-left:auto;font-size:10px">Usta</span></li>`),
      ...productResults.map(p => `<li style="padding:6px 8px;cursor:pointer;border-radius:6px;display:flex;align-items:center;gap:10px;font-size:13px" onclick="runSearch('${p.name}');openProductModal('${p.id}')" role="option">
        <img src="${p.img}" style="width:28px;height:28px;border-radius:6px;object-fit:cover" loading="lazy"/> <div><strong>${p.name}</strong><br><small style="color:var(--text-muted)">${formatPrice(p.price)}</small></div>
        <span class="chip" style="margin-left:auto;font-size:10px">Mahsulot</span></li>`),
    ].join("") || '<li style="padding:6px 8px;font-size:12px;color:var(--text-muted)">Topilmadi</li>';
  }

  if (e.key === "Enter") runSearch(q);
}

function runSearch(q) {
  // Save to history
  state.searchHistory = [q, ...state.searchHistory.filter(h => h !== q)].slice(0, 10);
  localStorage.setItem("torvex-search", JSON.stringify(state.searchHistory));
  closeSearch();
  showToast(`"${q}" qidirilmoqda...`, "info");
}

// ────────────────────────────────────────────────────────────────
// 29. COMMAND PALETTE
// ────────────────────────────────────────────────────────────────
const COMMANDS = [
  { label:"Dashboard",         icon:"fas fa-chart-pie",  action: () => showSection("dash")        },
  { label:"Lenta",             icon:"fas fa-stream",     action: () => showSection("feed")        },
  { label:"Ustalar",           icon:"fas fa-hard-hat",   action: () => showSection("ustalar")     },
  { label:"Bozor",             icon:"fas fa-store",      action: () => showSection("bozor")       },
  { label:"Xizmatlar",         icon:"fas fa-tools",      action: () => showSection("xizmatlar")   },
  { label:"Xabarlar",          icon:"fas fa-comments",   action: () => showSection("muhokama")    },
  { label:"Loyihalar",         icon:"fas fa-briefcase",  action: () => showSection("loyihalar")   },
  { label:"Analitika",         icon:"fas fa-chart-bar",  action: () => showSection("analitika")   },
  { label:"Xarita",            icon:"fas fa-map",        action: () => showSection("karta")       },
  { label:"Yangiliklar",       icon:"fas fa-newspaper",  action: () => showSection("yangiliklar") },
  { label:"Sevimlilar",        icon:"fas fa-heart",      action: () => showSection("sevimlilari") },
  { label:"Profil",            icon:"fas fa-user",       action: () => showSection("profil")      },
  { label:"Sozlamalar",        icon:"fas fa-cog",        action: () => showSection("sozlamalar")  },
  { label:"E'lon berish",      icon:"fas fa-plus",       action: () => openComposer()             },
  { label:"AI Yordamchi",      icon:"fas fa-robot",      action: () => openModal("aiModal")       },
  { label:"Kalkulyator",       icon:"fas fa-calculator", action: () => openModal("calcModal")     },
  { label:"Premium",           icon:"fas fa-crown",      action: () => openModal("premiumModal")  },
  { label:"Savat",             icon:"fas fa-shopping-cart",action: () => toggleCart()             },
  { label:"Tungi rejim",       icon:"fas fa-moon",       action: () => toggleTheme()              },
  { label:"Yordam",            icon:"fas fa-headset",    action: () => openModal("supportModal")  },
];

let cmdSelected = 0;
function filterCommands(q) {
  const list = document.getElementById("cmdResults");
  if (!list) return;
  const filtered = q
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(q.toLowerCase()))
    : COMMANDS;
  cmdSelected = 0;
  list.innerHTML = filtered.map((c, i) => `
    <li role="option" class="cmd-item ${i === 0 ? 'selected' : ''}" onclick="executeCommand(${COMMANDS.indexOf(c)})" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;cursor:pointer;transition:.15s;${i === 0 ? 'background:var(--bg-secondary)' : ''}">
      <span style="width:30px;height:30px;border-radius:8px;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;color:var(--accent)">
        <i class="${c.icon}"></i>
      </span>
      ${c.label}
    </li>
  `).join("") || '<li style="padding:12px;text-align:center;color:var(--text-muted)">Topilmadi</li>';
}

function navigateCommands(e) {
  const items = document.querySelectorAll(".cmd-item");
  if (!items.length) return;
  if (e.key === "ArrowDown") { cmdSelected = (cmdSelected+1) % items.length; }
  if (e.key === "ArrowUp")   { cmdSelected = (cmdSelected-1+items.length) % items.length; }
  if (e.key === "Enter")     { items[cmdSelected]?.click(); return; }
  items.forEach((item, i) => {
    item.classList.toggle("selected", i === cmdSelected);
    item.style.background = i === cmdSelected ? "var(--bg-secondary)" : "";
  });
  items[cmdSelected]?.scrollIntoView({ block:"nearest" });
}

function executeCommand(idx) {
  COMMANDS[idx]?.action();
  closeModal("commandPalette");
}

// ────────────────────────────────────────────────────────────────
// 30. SIDEBAR
// ────────────────────────────────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const shell   = document.getElementById("appShell");
  sidebar?.classList.toggle("collapsed");
  shell?.classList.toggle("sidebar-collapsed");
}

function openSidebar() {
  state.sidebarOpen = true;
  document.getElementById("sidebar")?.classList.add("mobile-open");
  document.getElementById("sidebarOverlay").style.display = "";
}

function closeSidebar() {
  state.sidebarOpen = false;
  document.getElementById("sidebar")?.classList.remove("mobile-open");
  const overlay = document.getElementById("sidebarOverlay");
  if (overlay) overlay.style.display = "none";
}

// ────────────────────────────────────────────────────────────────
// 31. FAB
// ────────────────────────────────────────────────────────────────
function toggleFabMenu() {
  state.fabOpen = !state.fabOpen;
  document.getElementById("fabMenu").classList.toggle("open", state.fabOpen);
  document.getElementById("fabMenu").setAttribute("aria-hidden", String(!state.fabOpen));
  document.getElementById("fabMainBtn").setAttribute("aria-expanded", String(state.fabOpen));
  const icon = document.getElementById("fabIcon");
  if (icon) { icon.className = state.fabOpen ? "fas fa-times" : "fas fa-plus"; }
}

function closeFabMenu() {
  state.fabOpen = false;
  document.getElementById("fabMenu").classList.remove("open");
  document.getElementById("fabMenu").setAttribute("aria-hidden","true");
  document.getElementById("fabMainBtn").setAttribute("aria-expanded","false");
  const icon = document.getElementById("fabIcon");
  if (icon) icon.className = "fas fa-plus";
}

// ────────────────────────────────────────────────────────────────
// 32. THEME
// ────────────────────────────────────────────────────────────────
function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme(state.theme);
  localStorage.setItem("torvex-theme", state.theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const icon = document.getElementById("themeIcon");
  if (icon) icon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
  const darkToggle = document.getElementById("darkModeToggle");
  if (darkToggle) darkToggle.checked = theme === "dark";
}

// ────────────────────────────────────────────────────────────────
// 33. WEATHER
// ────────────────────────────────────────────────────────────────
async function loadWeather() {
  try {
    const res = await fetch("https://wttr.in/Tashkent?format=j1");
    const data = await res.json();
    const current = data.current_condition[0];
    setEl("weatherTemp", current.temp_C + "°C");
    setEl("weatherHumidity", current.humidity);
    setEl("weatherWind", Math.round(current.windspeedKmph / 3.6));
    setEl("weatherCity", "Toshkent");
    const desc = current.weatherDesc[0].value;
    const advice = desc.toLowerCase().includes("rain") ? "Yog'ingarchilik bor — qurilish ishlarini rejalashtiring" : "Qurilish ishlari uchun qulay kun";
    setEl("weatherAdvice", advice);
  } catch {
    // Use demo data
    setEl("weatherTemp", "28°C");
    setEl("weatherHumidity", "45");
    setEl("weatherWind", "3");
    setEl("weatherAdvice", "Qurilish ishlari uchun qulay kun");
  }
  setEl("regionMasters", state.masters.filter(m => m.region === "toshkent").length.toString());
}

// ────────────────────────────────────────────────────────────────
// 34. LIVE COUNTERS
// ────────────────────────────────────────────────────────────────
function startLiveCounters() {
  setInterval(() => {
    const delta = Math.floor((Math.random() - 0.5) * 10);
    state.onlineCount = Math.max(200, state.onlineCount + delta);
    setEl("onlineCount", state.onlineCount.toString());
  }, 5000);
}

// ────────────────────────────────────────────────────────────────
// 35. MODAL SYSTEM
// ────────────────────────────────────────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden","false");
  document.body.classList.add("modal-open");
  // Focus trap
  setTimeout(() => {
    const firstInput = modal.querySelector("input, button, select, textarea");
    firstInput?.focus();
  }, 100);
  // Render calc when opened
  if (id === "calcModal") renderCalcContent();
  // Filter commands when palette opened
  if (id === "commandPalette") { filterCommands(""); setTimeout(() => document.getElementById("cmdInput")?.focus(), 100); }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.style.display = "none";
  modal.setAttribute("aria-hidden","true");
  if (!document.querySelector(".modal-overlay[style*='flex']")) {
    document.body.classList.remove("modal-open");
  }
}

function handleOverlayClick(e, id) {
  if (e.target.id === id) closeModal(id);
}

// ────────────────────────────────────────────────────────────────
// 36. TOAST NOTIFICATIONS
// ────────────────────────────────────────────────────────────────
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  const icons = { success:"fas fa-check-circle", error:"fas fa-times-circle", info:"fas fa-info-circle", warning:"fas fa-exclamation-triangle" };
  toast.innerHTML = `
    <i class="${icons[type] || icons.info}" aria-hidden="true"></i>
    <span>${escapeHtml(message)}</span>
    <button onclick="this.parentElement.remove()" aria-label="Yopish" style="background:none;border:none;color:inherit;margin-left:auto;cursor:pointer;opacity:.7;font-size:16px">×</button>
  `;
  toast.style.cssText = `
    display:flex;align-items:center;gap:10px;
    padding:12px 16px;border-radius:10px;
    background:${type === 'success' ? '#166534' : type === 'error' ? '#991b1b' : type === 'warning' ? '#92400e' : '#1e3a5f'};
    color:#fff;box-shadow:0 4px 20px rgba(0,0,0,.3);
    min-width:260px;max-width:380px;
    animation:slideInRight .3s ease;
    margin-bottom:8px;
  `;
  container.appendChild(toast);

  if (!document.getElementById("toastStyle")) {
    const s = document.createElement("style");
    s.id = "toastStyle";
    s.textContent = `
      @keyframes slideInRight{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
      @keyframes slideInDown{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}
      #toastContainer{position:fixed;top:80px;right:20px;z-index:9999;display:flex;flex-direction:column;pointer-events:none}
      #toastContainer .toast{pointer-events:all}
    `;
    document.head.appendChild(s);
  }

  setTimeout(() => {
    toast.style.animation = "slideInRight .3s ease reverse";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ────────────────────────────────────────────────────────────────
// 37. CONFIRM DIALOG
// ────────────────────────────────────────────────────────────────
function showConfirm(message, onConfirm, type = "warning") {
  setEl("confirmMessage", message);
  const modal = document.getElementById("confirmModal");
  const okBtn = document.getElementById("confirmOkBtn");
  if (modal) modal.style.display = "flex";
  if (okBtn) {
    okBtn.onclick = () => {
      closeModal("confirmModal");
      onConfirm();
    };
    okBtn.className = type === "danger" ? "btn-danger" : "btn-primary";
  }
}

// ────────────────────────────────────────────────────────────────
// 38. SUPPORT
// ────────────────────────────────────────────────────────────────
function toggleFaq(el) {
  const isOpen = el.getAttribute("aria-expanded") === "true";
  el.setAttribute("aria-expanded", String(!isOpen));
  const answer = el.querySelector(".faq-answer");
  if (answer) {
    if (isOpen) answer.setAttribute("hidden","");
    else answer.removeAttribute("hidden");
  }
  const icon = el.querySelector(".fa-chevron-down, .fa-chevron-up");
  if (icon) icon.className = isOpen ? "fas fa-chevron-down" : "fas fa-chevron-up";
}

function openLiveChat() {
  closeModal("supportModal");
  showSection("muhokama");
  showToast("Live chat ochildi", "success");
}

// ────────────────────────────────────────────────────────────────
// 39. PAGE PROGRESS BAR
// ────────────────────────────────────────────────────────────────
function showProgress() {
  const bar  = document.getElementById("pageProgressBar");
  const fill = document.getElementById("ppbFill");
  if (!bar || !fill) return;
  bar.setAttribute("aria-hidden","false");
  fill.style.width = "0%";
  fill.style.transition = "width .5s ease";
  setTimeout(() => fill.style.width = "70%", 50);
}

function hideProgress() {
  const fill = document.getElementById("ppbFill");
  const bar  = document.getElementById("pageProgressBar");
  if (!fill || !bar) return;
  fill.style.width = "100%";
  setTimeout(() => {
    bar.setAttribute("aria-hidden","true");
    fill.style.width = "0%";
  }, 400);
}

// ────────────────────────────────────────────────────────────────
// 40. KEYBOARD SHORTCUTS
// ────────────────────────────────────────────────────────────────
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", e => {
    if (e.target.matches("input, textarea, select")) return;
    const shortcuts = {
      "g h": () => showSection("dash"),
      "g u": () => showSection("ustalar"),
      "g b": () => showSection("bozor"),
      "g m": () => showSection("muhokama"),
      "n":   () => openComposer(),
      "?":   () => openModal("supportModal"),
      "/":   () => { e.preventDefault(); document.getElementById("globalSearch")?.focus(); },
    };
    const key = e.key;
    if (shortcuts[key]) { e.preventDefault(); shortcuts[key](); }
  });
}

// ────────────────────────────────────────────────────────────────
// 41. UTILITIES
// ────────────────────────────────────────────────────────────────
function formatPrice(num) {
  if (!num) return "0 so'm";
  return num.toLocaleString("uz-UZ") + " so'm";
}

function formatNum(num) {
  return num.toLocaleString("uz-UZ");
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getTime() {
  const d = new Date();
  return d.getHours().toString().padStart(2,"0") + ":" + d.getMinutes().toString().padStart(2,"0");
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

// ────────────────────────────────────────────────────────────────
// 42. MISC FUNCTIONS CALLED FROM HTML
// ────────────────────────────────────────────────────────────────
function openModal_wrapper(id) { openModal(id); }
function downloadMyData_btn() { downloadMyData(); }
function aboutModal() { openModal("aboutModal"); }
function privacyModal() { openModal("privacyModal"); }
function termsModal() { openModal("termsModal"); }
function licenseModal() { openModal("licenseModal"); }
function importProjectModal() { showToast("Import funksiyasi tez orada", "info"); }
function sellProductModal() { openModal("sellProductModal") || showToast("Mahsulot qo'shish tez orada", "info"); }
function addServiceModal() { showToast("Xizmat qo'shish tez orada", "info"); }
function priceRangeModal() { showToast("Narx diapazoni filtri tez orada", "info"); }
function masterFilterModal() { showToast("Kengaytirilgan filtr tez orada", "info"); }
function notifSettingsModal() { showSection("sozlamalar"); closeModal("notifPanel"); }
function activeSessions() { showToast("Faol seanslar tez orada", "info"); }
function newGroupModal() { showToast("Guruh yaratish tez orada", "info"); }

// Global exposure for HTML inline handlers
window.showSection = showSection;
window.openModal   = openModal;
window.closeModal  = closeModal;
window.handleOverlayClick = handleOverlayClick;
window.toggleTheme = toggleTheme;
window.toggleSidebar = toggleSidebar;
window.openSidebar   = openSidebar;
window.closeSidebar  = closeSidebar;
window.toggleFabMenu = toggleFabMenu;
window.closeFabMenu  = closeFabMenu;
window.toggleCart    = toggleCart;
window.toggleNotifPanel = toggleNotifPanel;
window.toggleUserMenu   = toggleUserMenu;
window.closeUserMenu    = closeUserMenu;
window.sendMessage   = sendMessage;
window.handleChatKey = handleChatKey;
window.autoResizeTextarea = autoResizeTextarea;
window.notifyTyping  = notifyTyping;
window.openChat      = openChat;
window.closeConversation = closeConversation;
window.attachFile    = attachFile;
window.toggleEmoji   = toggleEmoji;
window.toggleVoiceMessage = toggleVoiceMessage;
window.startVoiceCall= startVoiceCall;
window.startVideoCall= startVideoCall;
window.openChatInfo  = openChatInfo;
window.openChatMenu  = openChatMenu;
window.searchUsers   = searchUsers;
window.filterChats   = filterChats;
window.searchChats   = searchChats;
window.switchAuthTab = switchAuthTab;
window.handleAuth    = handleAuth;
window.signOut       = signOut;
window.loginWithGoogle  = loginWithGoogle;
window.loginWithTelegram= loginWithTelegram;
window.loginWithPhone   = loginWithPhone;
window.verifyOtp     = verifyOtp;
window.resendOtp     = resendOtp;
window.sendPasswordReset = sendPasswordReset;
window.changePassword    = changePassword;
window.togglePasswordVisibility = togglePasswordVisibility;
window.openComposer  = openComposer;
window.setPostType   = setPostType;
window.updateCharCount = updateCharCount;
window.handleComposerMedia = handleComposerMedia;
window.submitPost    = submitPost;
window.addPriceField = addPriceField;
window.addPhoneField = addPhoneField;
window.openLocationPicker = openLocationPicker;
window.useCurrentLocation = useCurrentLocation;
window.confirmLocation = confirmLocation;
window.clearLocation = clearLocation;
window.openLocationFilter = openLocationFilter;
window.toggleLike    = toggleLike;
window.toggleSavePost= toggleSavePost;
window.openComments  = openComments;
window.sharePost     = sharePost;
window.loadMorePosts = loadMorePosts;
window.changeFeedSort= changeFeedSort;
window.filterFeed    = filterFeed;
window.openMasterModal  = openMasterModal;
window.toggleMasterFav  = toggleMasterFav;
window.contactMaster = contactMaster;
window.callMaster    = callMaster;
window.searchMasters = searchMasters;
window.filterByJob   = filterByJob;
window.filterMastersByRegion = filterMastersByRegion;
window.sortMasters   = sortMasters;
window.loadMoreMasters = loadMoreMasters;
window.toggleMapView = toggleMapView;
window.addToCart     = addToCart;
window.removeFromCart= removeFromCart;
window.updateCartQty = updateCartQty;
window.applyPromo    = applyPromo;
window.checkout      = checkout;
window.openProductModal = openProductModal;
window.changeQty     = changeQty;
window.searchMarket  = searchMarket;
window.filterMarket  = filterMarket;
window.sortMarket    = sortMarket;
window.setMarketView = setMarketView;
window.toggleProductFav = toggleProductFav;
window.loadMoreProducts = loadMoreProducts;
window.buyNow        = buyNow;
window.filterServiceCat = filterServiceCat;
window.filterProjects= filterProjects;
window.setProjectView= setProjectView;
window.changeAnalyticsPeriod = changeAnalyticsPeriod;
window.exportAnalytics = exportAnalytics;
window.loadMoreActivity = loadMoreActivity;
window.filterMap     = filterMap;
window.searchOnMap   = searchOnMap;
window.closeMapPanel = closeMapPanel;
window.filterNews    = filterNews;
window.openNewsDetail= openNewsDetail;
window.subscribeNewsletter = subscribeNewsletter;
window.filterFavs    = filterFavs;
window.filterProfileTab = filterProfileTab;
window.shareProfile  = shareProfile;
window.changeCoverPhoto = changeCoverPhoto;
window.changeAvatar  = changeAvatar;
window.saveProfile   = saveProfile;
window.toggleCompact = toggleCompact;
window.toggleAnimations = toggleAnimations;
window.changeLanguage= changeLanguage;
window.changeFontSize= changeFontSize;
window.saveNotifSettings = saveNotifSettings;
window.savePrivacy   = savePrivacy;
window.toggle2FA     = toggle2FA;
window.downloadMyData= downloadMyData;
window.confirmClearData = confirmClearData;
window.confirmDeleteAccount = confirmDeleteAccount;
window.setBilling    = setBilling;
window.subscribePlan = subscribePlan;
window.submitBecomeMaster = submitBecomeMaster;
window.previewPortfolio   = previewPortfolio;
window.setReviewStar = setReviewStar;
window.toggleReviewTag = toggleReviewTag;
window.submitReview  = submitReview;
window.markAllRead   = markAllRead;
window.filterNotif   = filterNotif;
window.toggleFaq     = toggleFaq;
window.openLiveChat  = openLiveChat;
window.switchCalcTab = switchCalcTab;
window.calcMaterial  = calcMaterial;
window.calcCost      = calcCost;
window.calcArea      = calcArea;
window.addCalcToCart = addCalcToCart;
window.sendAiMessage = sendAiMessage;
window.handleAiKey   = handleAiKey;
window.filterCommands= filterCommands;
window.navigateCommands = navigateCommands;
window.executeCommand= executeCommand;
window.goToSlide     = goToSlide;
window.markNotifRead = markNotifRead;
window.handleGlobalSearch = handleGlobalSearch;
window.showSearchDropdown = showSearchDropdown;
window.closeSearch   = closeSearch;
window.startChatWith = startChatWith;