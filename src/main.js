
/* ═══════════════════════════════════════════
   SECURITY UTILITIES (client-side only)
   ═══════════════════════════════════════════ */

/** Escape HTML to prevent XSS when injecting any dynamic string */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/** Validate a DD/MM/YYYY or YYYY-MM-DD date string against real-calendar + bounds */
function validateDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    return { valid: false, error: 'Please enter your date of birth.' };
  }
  
  // Parse DD/MM/YYYY format
  let month, day, year;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    [day, month, year] = dateStr.split('/').map(Number);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    [year, month, day] = dateStr.split('-').map(Number);
  } else {
    return { valid: false, error: 'Invalid date format. Please use DD/MM/YYYY.' };
  }
  
  const nowYear = new Date().getFullYear();
  if (year < 1900 || year > nowYear) {
    return { valid: false, error: 'Year must be between 1900 and today.' };
  }
  if (month < 1 || month > 12) {
    return { valid: false, error: 'Month must be between 1 and 12.' };
  }
  const maxDay = new Date(year, month, 0).getDate();
  if (day < 1 || day > maxDay) {
    return { valid: false, error: `Day must be between 1 and ${maxDay} for that month.` };
  }
  const parsed = new Date(year, month - 1, day);
  if (isNaN(parsed.getTime())) {
    return { valid: false, error: 'The date entered is not valid.' };
  }
  if (parsed > new Date()) {
    return { valid: false, error: 'Date of birth cannot be in the future.' };
  }
  return { valid: true, error: '', parsedDate: parsed };
}

/** Simple client-side rate limiter: max `limit` calls within `windowMs` */
function createRateLimiter(limit, windowMs) {
  const calls = [];
  return function isAllowed() {
    const now = Date.now();
    while (calls.length && calls[0] < now - windowMs) calls.shift();
    if (calls.length >= limit) return false;
    calls.push(now);
    return true;
  };
}
const rateLimiter = createRateLimiter(10, 60000);

/* ═══════════════════════════════════════════
   DATE-OF-BIRTH FEATURE COMPUTATION
   ═══════════════════════════════════════════ */

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getWesternZodiac(month, day) {
  const signs = [
    ['Capricorn', '♑', 1, 20], ['Aquarius', '♒', 2, 19], ['Pisces', '♓', 3, 21],
    ['Aries', '♈', 4, 20], ['Taurus', '♉', 5, 21], ['Gemini', '♊', 6, 21],
    ['Cancer', '♋', 7, 23], ['Leo', '♌', 8, 23], ['Virgo', '♍', 9, 23],
    ['Libra', '♎', 10, 23], ['Scorpio', '♏', 11, 22], ['Sagittarius', '♐', 12, 22],
  ];
  for (const [sign, sym, m, d] of signs) {
    if (month < m || (month === m && day < d)) return { sign, symbol: sym };
  }
  return { sign: 'Capricorn', symbol: '♑' };
}

function getChineseZodiac(year) {
  const animals = [
    ['Rat', '🐀'], ['Ox', '🐂'], ['Tiger', '🐅'], ['Rabbit', '🐇'],
    ['Dragon', '🐉'], ['Snake', '🐍'], ['Horse', '🐴'], ['Goat', '🐐'],
    ['Monkey', '🐒'], ['Rooster', '🐓'], ['Dog', '🐕'], ['Pig', '🐖'],
  ];
  const idx = (((year - 1900) % 12) + 12) % 12;
  return { sign: animals[idx][0], symbol: animals[idx][1] };
}

function getBirthstone(month) {
  return ['', 'Garnet', 'Amethyst', 'Aquamarine', 'Diamond', 'Emerald', 'Pearl',
    'Ruby', 'Peridot', 'Sapphire', 'Opal', 'Topaz', 'Turquoise'][month] || '';
}
function getBirthFlower(month) {
  return ['', 'Carnation', 'Violet', 'Daffodil', 'Daisy', 'Lily of the Valley', 'Rose',
    'Larkspur', 'Poppy', 'Aster', 'Marigold', 'Chrysanthemum', 'Narcissus'][month] || '';
}
function getGeneration(year) {
  if (year <= 1945) return 'Silent Generation';
  if (year <= 1964) return 'Baby Boomer';
  if (year <= 1980) return 'Generation X';
  if (year <= 1996) return 'Millennial';
  if (year <= 2012) return 'Generation Z';
  return 'Generation Alpha';
}
function getLifeStage(years) {
  if (years < 1) return 'Infant';
  if (years < 3) return 'Toddler';
  if (years < 12) return 'Child';
  if (years < 18) return 'Teenager';
  if (years < 30) return 'Young Adult';
  if (years < 45) return 'Adult';
  if (years < 60) return 'Middle-Aged Adult';
  if (years < 75) return 'Senior';
  return 'Elderly';
}
function getSeason(month, day) {
  if ((month === 12 && day >= 21) || month <= 2 || (month === 3 && day < 20)) return 'Winter ❄️';
  if ((month === 3 && day >= 20) || month <= 5 || (month === 6 && day < 21)) return 'Spring 🌸';
  if ((month === 6 && day >= 21) || month <= 8 || (month === 9 && day < 23)) return 'Summer ☀️';
  return 'Autumn 🍂';
}

function computeDobFeatures(birthDate) {
  const birth = birthDate instanceof Date ? birthDate : new Date(birthDate);
  const today = new Date();
  const bYear = birth.getFullYear();
  const bMonth = birth.getMonth() + 1;
  const bDay = birth.getDate();

  let years = today.getFullYear() - bYear;
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - bDay;
  if (days < 0) { months--; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }

  const totalDays = Math.floor((today - birth) / 86400000);
  const totalMonths = years * 12 + months;
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;
  const totalSeconds = totalMinutes * 60;

  let nextBday = new Date(today.getFullYear(), birth.getMonth(), bDay);
  const isToday = nextBday.toDateString() === today.toDateString();
  if (nextBday <= today && !isToday) nextBday = new Date(today.getFullYear() + 1, birth.getMonth(), bDay);
  const nextBirthdayDays = isToday ? 0 : Math.ceil((nextBday - today) / 86400000);

  const western = getWesternZodiac(bMonth, bDay);
  const chinese = getChineseZodiac(bYear);
  const retirementYear = bYear + 65;
  const retirementIn = Math.max(0, retirementYear - today.getFullYear());
  const planetAge = (orbital) => parseFloat((totalDays / orbital).toFixed(1));

  const rawStr = `${bYear}${String(bMonth).padStart(2, '0')}${String(bDay).padStart(2, '0')}`;
  let sum = rawStr.split('').reduce((a, c) => a + parseInt(c, 10), 0);
  while (sum > 9) sum = String(sum).split('').reduce((a, c) => a + parseInt(c, 10), 0);

  return {
    years, months, days, totalDays, totalMonths, totalWeeks, totalHours, totalMinutes, totalSeconds,
    dayOfWeek: DAYS_OF_WEEK[today.getDay()],
    dayOfWeekBorn: DAYS_OF_WEEK[birth.getDay()],
    nextBirthdayDays, isToday,
    westernZodiac: western.sign, westernZodiacSymbol: western.symbol,
    chineseZodiac: chinese.sign, chineseZodiacSymbol: chinese.symbol,
    birthstone: getBirthstone(bMonth), birthFlower: getBirthFlower(bMonth),
    generation: getGeneration(bYear), lifeStage: getLifeStage(years),
    retirementYear, retirementIn,
    dogAge: Math.round(years * 7), catAge: Math.round(years * 5),
    heartbeats: Math.round(totalDays * 100000), breathsTaken: Math.round(totalDays * 20000),
    mercuryAge: planetAge(87.97), venusAge: planetAge(224.7), marsAge: planetAge(686.97),
    jupiterAge: planetAge(4332.59), saturnAge: planetAge(10759.22),
    season: getSeason(bMonth, bDay), luckyNumber: sum,
  };
}

/* ═══════════════════════════════════════════
   RENDER HELPERS
   ═══════════════════════════════════════════ */

const fmt = (n) => Number(n).toLocaleString();

function statBox(label, value) {
  return `<div class="stat-box"><p class="val">${escapeHtml(String(value))}</p><p class="lbl">${escapeHtml(label)}</p></div>`;
}
function row(k, v, accent) {
  return `<div class="data-row"><span class="k">${escapeHtml(k)}</span><span class="v${accent ? ' accent' : ''}">${escapeHtml(v)}</span></div>`;
}

function renderTab(tab, r) {
  switch (tab) {
    case 'overview':
      return `
        <div class="stat-grid">
          ${statBox('Total Days', fmt(r.totalDays))}
          ${statBox('Total Weeks', fmt(r.totalWeeks))}
          ${statBox('Total Months', fmt(r.totalMonths))}
          ${statBox('Total Hours', fmt(r.totalHours))}
        </div>
        <div class="rows gap-top">
          ${row('Life Stage', r.lifeStage)}
          ${row('Generation', r.generation)}
          ${row('Born in Season', r.season)}
          ${row('Lucky Number', '#' + r.luckyNumber)}
          ${row('Next Birthday', r.isToday ? '🎂 Today!' : `In ${r.nextBirthdayDays} days`, true)}
        </div>`;
    case 'time':
      return `
        <div class="stat-grid">
          ${statBox('Years', fmt(r.years))}
          ${statBox('Months', fmt(r.totalMonths))}
          ${statBox('Weeks', fmt(r.totalWeeks))}
          ${statBox('Days', fmt(r.totalDays))}
          ${statBox('Hours', fmt(r.totalHours))}
          ${statBox('Minutes', fmt(r.totalMinutes))}
          ${statBox('Seconds (approx)', fmt(r.totalSeconds))}
        </div>`;
    case 'astrology':
      return `
        <div class="rows">
          ${row('Western Zodiac', `${r.westernZodiacSymbol} ${r.westernZodiac}`)}
          ${row('Chinese Zodiac', `${r.chineseZodiacSymbol} ${r.chineseZodiac}`)}
          ${row('Birthstone', `💎 ${r.birthstone}`)}
          ${row('Birth Flower', `🌸 ${r.birthFlower}`)}
          ${row('Born in Season', r.season)}
          ${row('Lucky Number', '#' + r.luckyNumber, true)}
        </div>
        <div class="note note-amber"><strong>Disclaimer:</strong> Zodiac signs and lucky numbers are provided for entertainment purposes only. They have no scientific basis.</div>`;
    case 'life':
      return `
        <div class="rows">
          ${row('Life Stage', r.lifeStage)}
          ${row('Generation', r.generation)}
          ${row('Retirement Year', `${r.retirementYear} (age 65)`)}
          ${row('Retirement In', r.retirementIn > 0 ? `~${r.retirementIn} years` : 'Already retirement age!', true)}
          ${row('Day You Were Born', r.dayOfWeekBorn)}
          ${row('Today Is', r.dayOfWeek)}
        </div>
        <div class="note note-slate"><strong>Note:</strong> Retirement age is based on a general guideline of 65 years. Actual retirement age varies by country and personal circumstances.</div>`;
    case 'fun':
      return `
        <div class="stat-grid">
          ${statBox('🐕 Dog Age Equivalent', r.dogAge + ' yrs')}
          ${statBox('🐈 Cat Age Equivalent', r.catAge + ' yrs')}
        </div>
        <div class="stat-grid gap-top">
          ${statBox('❤️ Est. Heartbeats', fmt(r.heartbeats))}
          ${statBox('💨 Est. Breaths', fmt(r.breathsTaken))}
        </div>
        <div class="note note-slate">Heartbeat estimate based on ~100,000 beats/day. Breath estimate based on ~20,000 breaths/day. These are approximate averages — actual values vary per individual.</div>`;
    case 'planets':
      return `
        <div class="rows">
          ${row('🌍 Earth (reference)', r.years + ' yrs')}
          ${row('☿ Mercury', r.mercuryAge + ' Mercury years')}
          ${row('♀ Venus', r.venusAge + ' Venus years')}
          ${row('♂ Mars', r.marsAge + ' Mars years')}
          ${row('♃ Jupiter', r.jupiterAge + ' Jupiter years')}
          ${row('♄ Saturn', r.saturnAge + ' Saturn years')}
        </div>
        <div class="note note-blue">Planet ages are calculated using each planet's orbital period around the Sun relative to how long you have been alive in Earth days.</div>`;
    default:
      return '';
  }
}

/* ═══════════════════════════════════════════
   CALCULATOR WIRING
   ═══════════════════════════════════════════ */

let currentResult = null;
let activeTab = 'overview';

const form = document.getElementById('ageForm');
const dobInput = document.getElementById('dob');
const dobPicker = document.getElementById('dobPicker');
const calendarBtn = document.getElementById('calendarBtn');
const errorBox = document.getElementById('dobError');
const resultsEl = document.getElementById('results');
const tabPanels = document.getElementById('tabPanels');

// Set max date to today on the picker
dobPicker.max = new Date().toISOString().split('T')[0];
dobPicker.min = '1900-01-01';

// Auto-format DD/MM/YYYY as user types
dobInput.addEventListener('input', (e) => {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length > 8) value = value.slice(0, 8);
  
  if (value.length >= 4) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4) + (value.length > 4 ? '/' + value.slice(4) : '');
  } else if (value.length >= 2) {
    value = value.slice(0, 2) + (value.length > 2 ? '/' + value.slice(2) : '');
  }
  
  e.target.value = value;
});

// Calendar button opens the date picker
calendarBtn.addEventListener('click', () => {
  if (dobPicker.showPicker) {
    dobPicker.showPicker();
  } else {
    dobPicker.click();
  }
});

// Sync date picker to text input (YYYY-MM-DD -> DD/MM/YYYY)
dobPicker.addEventListener('change', (e) => {
  const pickerValue = e.target.value;
  if (pickerValue) {
    const [year, month, day] = pickerValue.split('-');
    dobInput.value = `${day}/${month}/${year}`;
  }
});

function showError(msg) {
  errorBox.textContent = '⚠️ ' + msg;
  errorBox.hidden = false;
  dobInput.classList.add('invalid');
}
function clearError() {
  errorBox.hidden = true;
  errorBox.textContent = '';
  dobInput.classList.remove('invalid');
}

function renderResults() {
  const r = currentResult;
  document.getElementById('rYears').textContent = r.years;
  document.getElementById('rMonths').textContent = r.months;
  document.getElementById('rDays').textContent = r.days;

  const bannerLabel = document.getElementById('bannerLabel');
  if (r.isToday) {
    bannerLabel.textContent = '🎂 Happy Birthday!';
  } else {
    bannerLabel.textContent = 'You Are';
  }

  let sub = `Born on a <strong>${escapeHtml(r.dayOfWeekBorn)}</strong>`;
  if (r.nextBirthdayDays > 0) {
    sub += ` &bull; Next birthday in <span class="hl">${r.nextBirthdayDays} day${r.nextBirthdayDays !== 1 ? 's' : ''}</span>`;
  }
  document.getElementById('bannerSub').innerHTML = sub;

  tabPanels.innerHTML = renderTab(activeTab, r);
  resultsEl.hidden = false;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  clearError();

  if (!rateLimiter()) {
    showError('Too many calculations. Please wait a moment before trying again.');
    return;
  }

  const { valid, error, parsedDate } = validateDate(dobInput.value);
  if (!valid) {
    resultsEl.hidden = true;
    showError(error);
    return;
  }

  try {
    currentResult = computeDobFeatures(parsedDate);
    activeTab = 'overview';
    document.querySelectorAll('.tab').forEach((t) =>
      t.classList.toggle('active', t.dataset.tab === 'overview')
    );
    renderResults();
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch {
    showError('An unexpected error occurred. Please try again.');
  }
});

document.getElementById('resetBtn').addEventListener('click', () => {
  form.reset();
  dobPicker.value = '';
  clearError();
  resultsEl.hidden = true;
  currentResult = null;
  dobInput.focus();
});

// Tab switching
document.getElementById('tabs').addEventListener('click', (e) => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  activeTab = btn.dataset.tab;
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === btn));
  if (currentResult) tabPanels.innerHTML = renderTab(activeTab, currentResult);
});

/* ═══════════════════════════════════════════
   MOBILE MENU
   ═══════════════════════════════════════════ */
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
navToggle.addEventListener('click', () => {
  const isOpen = !mobileNav.hidden;
  mobileNav.hidden = isOpen;
  navToggle.setAttribute('aria-expanded', String(!isOpen));
  navToggle.textContent = isOpen ? '☰' : '✕';
});
mobileNav.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    mobileNav.hidden = true;
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.textContent = '☰';
  })
);

/* ═══════════════════════════════════════════
   BLOG DATA + RENDER
   ═══════════════════════════════════════════ */
const posts = [
  {
    slug: 'how-to-calculate-age-manually',
    title: 'How to Calculate Your Age Manually — Step by Step',
    excerpt: 'Ever wondered how age is calculated by hand? Learn the exact method to find your age in years, months, and days without any tool.',
    date: 'June 10, 2025', readTime: '5 min read', category: 'Guide', tag: 'how to calculate age',
    body: [
      'Calculating your age seems simple — you just subtract your birth year from the current year, right? Well, almost. Getting the exact age in years, months, and days requires a few extra steps.',
      'Step 1 — Start with years: Subtract your birth year from the current year. For example, born in 1990 and it is 2025, you get 35 as a starting point.',
      'Step 2 — Check the month: Has your birthday month already passed this year? If not, subtract one from your year count.',
      'Step 3 — Count remaining months: Find the difference between the current month and your birth month. If negative, borrow a year and add 12.',
      'Step 4 — Count remaining days: Subtract your birth day from today\'s date. If negative, borrow a month and add the number of days in the previous month.',
      'This method is exactly what our online age calculator does behind the scenes — handling leap years and varying month lengths automatically so you get a precise result every time.',
    ],
  },
  {
    slug: 'western-zodiac-signs-explained',
    title: 'Western Zodiac Signs: What Your Birthday Reveals',
    excerpt: 'From Aries to Pisces — a complete guide to the 12 western zodiac signs, their date ranges, and key personality traits.',
    date: 'June 4, 2025', readTime: '7 min read', category: 'Astrology', tag: 'zodiac signs by birthday',
    body: [
      'Western astrology divides the year into 12 zodiac signs based on the position of the Sun at the time of your birth. Each sign spans roughly 30 days.',
      'Aries (Mar 21 – Apr 19): A fire sign associated with boldness, energy, and leadership.',
      'Taurus (Apr 20 – May 20): An earth sign linked to reliability, practicality, and a love of comfort.',
      'Gemini (May 21 – Jun 20): An air sign associated with curiosity, adaptability, and communication.',
      'Cancer (Jun 21 – Jul 22): A water sign linked to intuition, sensitivity, and strong family bonds.',
      'Leo (Jul 23 – Aug 22): A fire sign associated with confidence, creativity, and generosity.',
      'Virgo (Aug 23 – Sep 22): An earth sign linked to analytical thinking and attention to detail.',
      'Libra (Sep 23 – Oct 22): An air sign associated with balance, fairness, and a love of beauty.',
      'Scorpio (Oct 23 – Nov 21): A water sign linked to intensity, passion, and resourcefulness.',
      'Sagittarius (Nov 22 – Dec 21): A fire sign associated with optimism and adventure.',
      'Capricorn (Dec 22 – Jan 19): An earth sign linked to discipline, ambition, and responsibility.',
      'Aquarius (Jan 20 – Feb 18): An air sign associated with originality and independence.',
      'Pisces (Feb 19 – Mar 20): A water sign linked to empathy, imagination, and spiritual depth.',
      'Important note: Zodiac signs are cultural tradition and intended for entertainment. They are not scientifically validated.',
    ],
  },
  {
    slug: 'chinese-zodiac-years',
    title: 'Chinese Zodiac Animals: Find Your Sign by Birth Year',
    excerpt: 'The Chinese zodiac follows a 12-year cycle, each year named after an animal. Discover your birth-year animal and its meaning.',
    date: 'May 28, 2025', readTime: '6 min read', category: 'Astrology', tag: 'Chinese zodiac birth year',
    body: [
      'The Chinese zodiac, known as Shengxiao, is a repeating 12-year cycle where each year is associated with an animal.',
      'Rat (1948, 1960, 1972, 1984, 1996, 2008, 2020): Associated with wit, resourcefulness, and versatility.',
      'Ox (1949, 1961, 1973, 1985, 1997, 2009, 2021): Represents diligence, strength, and dependability.',
      'Tiger (1950, 1962, 1974, 1986, 1998, 2010, 2022): Linked to bravery, ambition, and unpredictability.',
      'Rabbit (1951, 1963, 1975, 1987, 1999, 2011, 2023): Associated with kindness, elegance, and caution.',
      'Dragon (1952, 1964, 1976, 1988, 2000, 2012, 2024): The most coveted sign — luck, power, and success.',
      'Snake (1953, 1965, 1977, 1989, 2001, 2013, 2025): Linked to wisdom, intuition, and elegance.',
      'Horse (1954, 1966, 1978, 1990, 2002, 2014, 2026): Associated with energy, passion, and independence.',
      'The cycle continues with Goat, Monkey, Rooster, Dog, and Pig before repeating. Use our calculator to instantly see your Chinese zodiac sign.',
    ],
  },
  {
    slug: 'generations-explained',
    title: 'Generations Explained: Millennial, Gen Z, or Boomer?',
    excerpt: 'Generational labels are everywhere. Here is a clear breakdown of each generation, the years they span, and what defines them.',
    date: 'May 20, 2025', readTime: '6 min read', category: 'Culture', tag: 'generational labels by birth year',
    body: [
      'Generational labels describe groups of people born in similar eras who share cultural experiences.',
      'Silent Generation (1928–1945): Born during the Great Depression and WWII. Known for conformity, loyalty, and hard work.',
      'Baby Boomers (1946–1964): Born during the post-WWII boom, in an era of prosperity and social movements.',
      'Generation X (1965–1980): Grew up during rising divorce rates and the early PC era. Known for independence and resilience.',
      'Millennials (1981–1996): The first generation to come of age with the internet. Experienced 9/11 and the 2008 crisis.',
      'Generation Z (1997–2012): True digital natives who grew up with smartphones. Known for pragmatism and diversity.',
      'Generation Alpha (2013–present): The children of Millennials, growing up in the age of AI and smart devices.',
      'Note: generational labels are broad generalisations. Individual experiences vary enormously within any generation.',
    ],
  },
  {
    slug: 'birthstones-by-month',
    title: 'Birthstones by Month: History, Meaning, and Significance',
    excerpt: 'Every birth month has a gemstone. Discover your birthstone, its history, and what it traditionally represents.',
    date: 'May 12, 2025', readTime: '5 min read', category: 'Trivia', tag: 'birthstone by month',
    body: [
      'Birthstones correspond to a person\'s birth month. The tradition has roots in the Bible\'s Book of Exodus.',
      'January — Garnet: Associated with protection, health, and friendship.',
      'February — Amethyst: Linked to clarity of thought and sobriety.',
      'March — Aquamarine: A sea-blue gem associated with courage and calmness.',
      'April — Diamond: The hardest natural material — a symbol of love and clarity.',
      'May — Emerald: A rich green gem associated with rebirth and wisdom.',
      'June — Pearl: An organic gem associated with purity and innocence.',
      'July — Ruby: A vivid red stone symbolising passion and protection.',
      'August — Peridot: A lime-green gem associated with strength and healing.',
      'September — Sapphire: A deep blue gem linked to wisdom and virtue.',
      'October — Opal: A multi-coloured gem associated with creativity and hope.',
      'November — Topaz: A golden gem linked to love and good luck.',
      'December — Turquoise: A blue-green gem associated with friendship and success.',
    ],
  },
  {
    slug: 'life-expectancy-by-country',
    title: 'Life Expectancy Around the World — Key Facts',
    excerpt: 'How long do people live in different countries? Explore global life expectancy data and the trends behind it.',
    date: 'April 30, 2025', readTime: '7 min read', category: 'Health', tag: 'life expectancy by country',
    body: [
      'Life expectancy is the average number of years a person born in a given year and place can expect to live.',
      'Global average: As of recent WHO data, global life expectancy at birth is about 73 years. Women tend to live longer than men.',
      'Highest: Japan, Switzerland, South Korea, and Singapore rank at the top, above 83 years, thanks to diet and healthcare.',
      'Lower: Countries in sub-Saharan Africa often fall below 65 years due to healthcare access and disease burden.',
      'Factors include healthcare access, diet, physical activity, smoking, air quality, and clean water access.',
      'The good news: global life expectancy rose from around 31 years in 1900 to about 73 years today.',
      'COVID-19 caused a temporary decline in 2020–2021, though most nations have since recovered toward prior trends.',
      'Knowing general life expectancy can help with retirement and health planning — but lifestyle choices matter most for individuals.',
    ],
  },
];

const blogGrid = document.getElementById('blogGrid');
blogGrid.innerHTML = posts
  .map(
    (p) => `
    <article class="blog-card">
      <div class="inner">
        <div class="blog-meta-top">
          <span class="badge ${p.category}">${escapeHtml(p.category)}</span>
          <span class="read-time">${escapeHtml(p.readTime)}</span>
        </div>
        <h3>${escapeHtml(p.title)}</h3>
        <p class="excerpt">${escapeHtml(p.excerpt)}</p>
        <div class="blog-foot">
          <span class="blog-date">${escapeHtml(p.date)}</span>
          <button class="read-more" data-slug="${escapeHtml(p.slug)}" aria-label="Read article: ${escapeHtml(p.title)}">Read More →</button>
        </div>
      </div>
    </article>`
  )
  .join('');

/* Blog modal */
const modal = document.getElementById('blogModal');
const modalCategory = document.getElementById('modalCategory');
const modalTitle = document.getElementById('modalTitle');
const modalMeta = document.getElementById('modalMeta');
const modalBody = document.getElementById('modalBody');

function openPost(slug) {
  const p = posts.find((x) => x.slug === slug);
  if (!p) return;
  modalCategory.className = 'badge ' + p.category;
  modalCategory.textContent = p.category;
  modalTitle.textContent = p.title;
  modalMeta.textContent = `${p.date} • ${p.readTime}`;
  modalBody.innerHTML =
    p.body.map((para) => `<p>${escapeHtml(para)}</p>`).join('') +
    `<div class="modal-tag"><span class="tlabel">Topic:</span><span class="tval">${escapeHtml(p.tag)}</span></div>`;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  window.scrollTo({ top: 0 });
}
function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
}

blogGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.read-more');
  if (btn) openPost(btn.dataset.slug);
});
document.getElementById('modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

/* ═══════════════════════════════════════════
   FAQ (with schema.org microdata)
   ═══════════════════════════════════════════ */
const faqData = [
  { q: 'How accurate is this age calculator?', a: 'Our age calculator is highly accurate. It calculates your age by comparing your birth date with the current date, correctly accounting for leap years and varying month lengths. Results show your exact age in years, months, and days.' },
  { q: 'Is my personal information safe?', a: 'Yes, completely. All calculations run directly in your web browser using JavaScript. Your birth date is never sent to any server, stored in a database, or shared with third parties. The tool works entirely offline once the page loads.' },
  { q: 'What extra features does the calculator include?', a: 'Beyond your basic age, the calculator shows: total days, weeks, hours, minutes, and seconds lived; your western zodiac sign; your Chinese zodiac animal; your birth month\'s birthstone and flower; your generation; your life stage; an estimated retirement year; dog and cat age equivalents; estimated heartbeats and breaths; and your age on every planet in the solar system.' },
  { q: 'Does the zodiac information have any scientific basis?', a: 'No. Western and Chinese zodiac signs, lucky numbers, and related features are provided for entertainment and cultural interest only. They have no scientific validity, and our site displays a clear disclaimer on these features.' },
  { q: 'How is my planet age calculated?', a: 'Planet ages are calculated by dividing your total number of days alive by each planet\'s orbital period in Earth days. For example, a Martian year is about 687 Earth days.' },
  { q: 'Does this tool work for leap year birthdays (February 29)?', a: 'Yes. The calculator correctly handles leap day birthdays using full date arithmetic that accounts for all leap years from 1900 to today.' },
  { q: 'How is the dog age equivalent calculated?', a: 'The dog age figure multiplies your age in years by 7 — the popular rule of thumb. Note this is a rough approximation; actual dog ageing varies by breed and size.' },
  { q: 'What does the "generation" label mean?', a: 'Generation labels (Silent Generation, Baby Boomer, Gen X, Millennial, Gen Z, Gen Alpha) are broad cultural categories based on birth-year ranges used by researchers. They are generalisations.' },
  { q: 'Can I calculate the age of someone else?', a: 'Yes. Simply enter their date of birth and press Calculate Age. The tool works for any valid date from 1 January 1900 onward.' },
  { q: 'Can I use this calculator on my phone?', a: 'Yes. The site is fully responsive and works on all screen sizes — smartphones, tablets, laptops, and desktops.' },
];

const faqList = document.getElementById('faqList');
faqList.innerHTML = faqData
  .map(
    (item, i) => `
    <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
      <button class="faq-q" aria-expanded="false" data-index="${i}">
        <span class="qt" itemprop="name">${escapeHtml(item.q)}</span>
        <span class="sign" aria-hidden="true">+</span>
      </button>
      <div class="faq-a" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer" hidden>
        <p itemprop="text">${escapeHtml(item.a)}</p>
      </div>
    </div>`
  )
  .join('');

faqList.addEventListener('click', (e) => {
  const btn = e.target.closest('.faq-q');
  if (!btn) return;
  const answer = btn.nextElementSibling;
  const sign = btn.querySelector('.sign');
  const isOpen = !answer.hidden;
  answer.hidden = isOpen;
  btn.setAttribute('aria-expanded', String(!isOpen));
  sign.textContent = isOpen ? '+' : '−';
});

/* ═══════════════════════════════════════════
   FOOTER YEAR
   ═══════════════════════════════════════════ */
document.getElementById('copyright').textContent =
  `© ${new Date().getFullYear()} AgeCalculator.com — All rights reserved.`;
