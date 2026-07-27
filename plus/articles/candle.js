// ---------- elements ----------
    const skyEl = document.getElementById('sky');
    const starsField = document.getElementById('stars');
    const horizonEl = document.getElementById('horizonGlow');
    const sunEl = document.getElementById('sunEl');
    const moonEl = document.getElementById('moonEl');
    const moonShadowEl = document.getElementById('moonShadow');
    const hourLabelEl = document.getElementById('hourLabel');
    const hourGlossEl = document.getElementById('hourGloss');

    // ---------- generate stars ----------
    const starCount = 70;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 60 + '%';
      star.style.animationDelay = (Math.random() * 3) + 's';
      star.style.animationDuration = (2 + Math.random() * 2) + 's';
      const size = Math.random() < 0.15 ? 3 : (Math.random() < 0.4 ? 2 : 1);
      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.background = Math.random() < 0.3 ? '#f5e6c8' : '#ffffff';
      starsField.appendChild(star);
    }

    // ---------- moon phase (waxing/waning shadow) ----------
    function moonPhaseFraction(date) {
      const synodicMonth = 29.530588853;
      const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14, 0);
      const diffDays = (date.getTime() - knownNewMoon) / 86400000;
      let phase = (diffDays % synodicMonth) / synodicMonth;
      if (phase < 0) phase += 1;
      return phase;
    }
    function updateMoonPhase() {
      const phase = moonPhaseFraction(new Date());
      const theta = phase * 2 * Math.PI;
      const rect = moonEl.getBoundingClientRect();
      const r = (rect.width || 40) / 2;
      const k = 1 - Math.cos(theta);
      const magnitude = r * k;
      const sign = theta <= Math.PI ? -1 : 1;
      moonShadowEl.style.transform = `translateX(${sign * magnitude}px)`;
    }

    // ---------- sky color keyframes (minute-of-day -> RGB) ----------
    const KEYFRAMES = [
      { t: 0,    top:[6,9,26],    mid:[10,14,36],  bot:[4,6,15]   },
      { t: 270,  top:[6,9,26],    mid:[16,20,45],  bot:[30,22,40] },
      { t: 330,  top:[40,35,85],  mid:[130,85,120],bot:[235,145,120] },
      { t: 390,  top:[95,130,190],mid:[235,155,110],bot:[255,195,130] },
      { t: 480,  top:[75,155,218],mid:[150,205,235],bot:[205,232,246] },
      { t: 720,  top:[60,150,222],mid:[150,207,236],bot:[210,236,249] },
      { t: 1050, top:[80,140,195],mid:[205,175,145],bot:[250,205,155] },
      { t: 1140, top:[70,90,150], mid:[230,130,90], bot:[255,150,90] },
      { t: 1185, top:[48,42,92],  mid:[180,82,92],  bot:[255,132,80] },
      { t: 1230, top:[16,16,46],  mid:[42,32,72],   bot:[68,42,72] },
      { t: 1290, top:[6,9,26],    mid:[10,14,36],   bot:[4,6,15] },
      { t: 1440, top:[6,9,26],    mid:[10,14,36],   bot:[4,6,15] }
    ];
    const lerp = (a,b,f) => a + (b-a)*f;
    const lerpColor = (c1,c2,f) => [0,1,2].map(i => Math.round(lerp(c1[i],c2[i],f)));
    function getSkyColors(minutes) {
      for (let i = 0; i < KEYFRAMES.length - 1; i++) {
        const k1 = KEYFRAMES[i], k2 = KEYFRAMES[i+1];
        if (minutes >= k1.t && minutes <= k2.t) {
          const f = (minutes - k1.t) / (k2.t - k1.t);
          return { top: lerpColor(k1.top,k2.top,f), mid: lerpColor(k1.mid,k2.mid,f), bot: lerpColor(k1.bot,k2.bot,f) };
        }
      }
      return { top: KEYFRAMES[0].top, mid: KEYFRAMES[0].mid, bot: KEYFRAMES[0].bot };
    }

    const clamp = x => Math.max(0, Math.min(1, x));

    const SUNRISE_START = 300, SUNRISE_FULL = 420, SUNSET_START = 1140, SUNSET_FULL = 1260;
    function sunOpacity(m) {
      if (m < SUNRISE_START) return 0;
      if (m < SUNRISE_FULL) return clamp((m - SUNRISE_START) / (SUNRISE_FULL - SUNRISE_START));
      if (m < SUNSET_START) return 1;
      if (m < SUNSET_FULL) return clamp(1 - (m - SUNSET_START) / (SUNSET_FULL - SUNSET_START));
      return 0;
    }

    const MOONRISE_START = 1170, MOONRISE_FULL = 1290, MOONSET_START = 240, MOONSET_FULL = 330;
    function moonOpacity(m) {
      if (m >= MOONRISE_START) return m < MOONRISE_FULL ? clamp((m - MOONRISE_START) / (MOONRISE_FULL - MOONRISE_START)) : 1;
      if (m < MOONSET_START) return 1;
      if (m < MOONSET_FULL) return clamp(1 - (m - MOONSET_START) / (MOONSET_FULL - MOONSET_START));
      return 0;
    }

    const STAR_IN_START = 1200, STAR_IN_FULL = 1290, STAR_OUT_START = 270, STAR_OUT_FULL = 360;
    function starOpacity(m) {
      if (m >= STAR_IN_START) return m < STAR_IN_FULL ? clamp((m - STAR_IN_START) / (STAR_IN_FULL - STAR_IN_START)) : 1;
      if (m < STAR_OUT_START) return 1;
      if (m < STAR_OUT_FULL) return clamp(1 - (m - STAR_OUT_START) / (STAR_OUT_FULL - STAR_OUT_START));
      return 0;
    }

    function triangle(m, start, peak, end) {
      if (m <= start || m >= end) return 0;
      if (m <= peak) return (m - start) / (peak - start);
      return (end - m) / (end - peak);
    }
    function horizonGlowAmount(m) {
      return Math.max(triangle(m, 270, 360, 450), triangle(m, 1080, 1185, 1290));
    }

    function arcXY(f) {
      const x = 8 + f * 84;
      const y = 66 - Math.sin(Math.PI * f) * 50;
      return { x, y };
    }
    function fractionFor(m, start, end) { return clamp((m - start) / (end - start)); }

    function canonicalHour(hh) {
      if (hh < 3)  return { name: 'Matins',   gloss: 'The Night Watch' };
      if (hh < 6)  return { name: 'Lauds',    gloss: 'Praise at Daybreak' };
      if (hh < 9)  return { name: 'Prime',    gloss: 'The First Hour' };
      if (hh < 12) return { name: 'Terce',    gloss: 'Mid-Morning Prayer' };
      if (hh < 14) return { name: 'Sext',     gloss: 'Midday Prayer' };
      if (hh < 17) return { name: 'None',     gloss: 'Mid-Afternoon Prayer' };
      if (hh < 20) return { name: 'Vespers',  gloss: 'Evening Prayer' };
      return { name: 'Compline', gloss: 'Night Prayer' };
    }

    function getLondonMinutes() {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      const hh = parseInt(parts.find(p => p.type === 'hour').value, 10);
      const mm = parseInt(parts.find(p => p.type === 'minute').value, 10);
      return { hh, mm, minutes: hh * 60 + mm };
    }

    function updateScene() {
      const { hh, minutes } = getLondonMinutes();

      const sky = getSkyColors(minutes);
      skyEl.style.setProperty('--c-top', `rgb(${sky.top.join(',')})`);
      skyEl.style.setProperty('--c-mid', `rgb(${sky.mid.join(',')})`);
      skyEl.style.setProperty('--c-bot', `rgb(${sky.bot.join(',')})`);

      const sOp = sunOpacity(minutes);
      const mOp = moonOpacity(minutes);
      const starOp = starOpacity(minutes);
      const glow = horizonGlowAmount(minutes);

      sunEl.style.opacity = sOp;
      moonEl.style.opacity = mOp;
      starsField.style.opacity = starOp;
      horizonEl.style.opacity = glow;

      const sf = fractionFor(minutes, 270, 1290);
      const sPos = arcXY(sf);
      sunEl.style.left = sPos.x + '%';
      sunEl.style.top = sPos.y + '%';

      const mm2 = minutes < 600 ? minutes + 1440 : minutes;
      const mf = fractionFor(mm2, 1170, 1770);
      const mPos = arcXY(mf);
      moonEl.style.left = mPos.x + '%';
      moonEl.style.top = mPos.y + '%';

      const hour = canonicalHour(hh);
      hourLabelEl.textContent = hour.name;
      hourGlossEl.textContent = hour.gloss;

      document.body.classList.toggle('is-night', starOp > 0.5);
    }

    updateMoonPhase();
    updateScene();
    setInterval(updateScene, 15000);
    setInterval(updateMoonPhase, 60 * 60 * 1000);