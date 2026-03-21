document.addEventListener("DOMContentLoaded", function () {
  const mainEl = document.querySelector("main");
  if (!mainEl) return;

  const books = [
    "Genesis","Gen","Exodus","Ex","Leviticus","Lev","Numbers","Num","Deuteronomy","Deut","Deu",
    "Joshua","Jos","Judges","Jdg","Ruth","Rut","1 Samuel","1 Sam","2 Samuel","2 Sam",
    "1 Kings","1 Kgs","2 Kings","2 Kgs","1 Chronicles","1 Chr","2 Chronicles","2 Chr",
    "Ezra","Ezr","Nehemiah","Neh","Esther","Est","Job","Psalms","Psalm","Psa","Proverbs","Pro",
    "Ecclesiastes","Ecc","Song of Solomon","Sng","Isaiah","Isa","Jeremiah","Jer",
    "Lamentations","Lam","Ezekiel","Ezk","Daniel","Dan","Hosea","Hos","Joel","Joe",
    "Amos","Amo","Obadiah","Oba","Jonah","Jon","Micah","Mic","Nahum","Nah","Habakkuk","Hab",
    "Zephaniah","Zep","Haggai","Hag","Zechariah","Zec","Malachi","Mal","Matthew","Mat","Mt",
    "Mark","Mrk","Luke","Luk","John","Jhn","Jn","Joh","Acts","Act",
    "Romans","Rom","1 Corinthians","1 Cor","2 Corinthians","2 Cor","Galatians","Gal",
    "Ephesians","Eph","Philippians","Php","Phil","Colossians","Col","1 Thessalonians","1 Ths",
    "2 Thessalonians","2 Ths","1 Timothy","1 Tim","2 Timothy","2 Tim","Titus","Tit",
    "Philemon","Phm","Hebrews","Heb","James","Jas","1 Peter","1 Pe","2 Peter","2 Pe",
    "1 John","1 Jn","2 John","2 Jn","3 John","3 Jn","Jude","Revelation","Rev", "Songs", "Song" 
  ];

  const bookBLBMap = {
    "Genesis":"Gen","Gen":"Gen","Exodus":"Exo","Ex":"Exo","Leviticus":"Lev","Lev":"Lev",
    "Numbers":"Num","Num":"Num","Deuteronomy":"Deu","Deut":"Deu","Deu":"Deu",
    "Joshua":"Jos","Jos":"Jos","Judges":"Jdg","Jdg":"Jdg","Ruth":"Rth","Rut":"Rth",
    "1 Samuel":"1Sa","1 Sam":"1Sa","2 Samuel":"2Sa","2 Sam":"2Sa",
    "1 Kings":"1Ki","1 Kgs":"1Ki","2 Kings":"2Ki","2 Kgs":"2Ki",
    "1 Chronicles":"1Ch","1 Chr":"1Ch","2 Chronicles":"2Ch","2 Chr":"2Ch",
    "Ezra":"Ezr","Ezr":"Ezr","Nehemiah":"Neh","Neh":"Neh","Esther":"Est","Est":"Est",
    "Job":"Job","Psalms":"Psa","Psalm":"Psa","Psa":"Psa","Proverbs":"Pro","Pro":"Pro",
    "Ecclesiastes":"Ecc","Ecc":"Ecc","Song of Solomon":"Sng","Sng":"Sng",
    "Isaiah":"Isa","Isa":"Isa","Jeremiah":"Jer","Jer":"Jer",
    "Lamentations":"Lam","Lam":"Lam","Ezekiel":"Eze","Ezk":"Eze",
    "Daniel":"Dan","Dan":"Dan","Hosea":"Hos","Hos":"Hos","Joel":"Joe","Joe":"Joe",
    "Amos":"Amo","Amo":"Amo","Obadiah":"Oba","Oba":"Oba","Jonah":"Jon","Jon":"Jon",
    "Micah":"Mic","Mic":"Mic","Nahum":"Nam","Nah":"Nam","Habakkuk":"Hab","Hab":"Hab",
    "Zephaniah":"Zep","Zep":"Zep","Haggai":"Hag","Hag":"Hag",
    "Zechariah":"Zec","Zec":"Zec","Malachi":"Mal","Mal":"Mal",
    "Matthew":"Mat","Mat":"Mat","Mt":"Mat","Mark":"Mar","Mrk":"Mar",
    "Luke":"Luk","Luk":"Luk","John":"Jhn","Jhn":"Jhn","Jn":"Jhn","Joh":"Jhn",
    "Acts":"Act","Act":"Act","Romans":"Rom","Rom":"Rom",
    "1 Corinthians":"1Co","1 Cor":"1Co","2 Corinthians":"2Co","2 Cor":"2Co",
    "Galatians":"Gal","Gal":"Gal","Ephesians":"Eph","Eph":"Eph",
    "Philippians":"Phl","Php":"Phl","Phil":"Phl","Colossians":"Col","Col":"Col",
    "1 Thessalonians":"1Th","1 Ths":"1Th","2 Thessalonians":"2Th","2 Ths":"2Th",
    "1 Timothy":"1Ti","1 Tim":"1Ti","2 Timothy":"2Ti","2 Tim":"2Ti",
    "Titus":"Tit","Tit":"Tit","Philemon":"Phm","Phm":"Phm",
    "Hebrews":"Heb","Heb":"Heb","James":"Jas","Jas":"Jas",
    "1 Peter":"1Pe","1 Pe":"1Pe","2 Peter":"2Pe","2 Pe":"2Pe",
    "1 John":"1Jo","1 Jn":"1Jo","2 John":"2Jo","2 Jn":"2Jo","3 John":"3Jo","3 Jn":"3Jo",
    "Jude":"Jud","Revelation":"Rev","Rev":"Rev"
  };

  function wrapBibleReferences(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const pattern = new RegExp(
        "\\b(" + books.join("|") + ")\\s+(\\d+)(?::(\\d+)(?:[\\u002D\\u2013\\u2014](\\d+))?)?(?:\\s*(?:\\([^)]+\\)|[A-Z]{2,4}))?",
        "gi"
      );

      const content = node.textContent;
      if (!pattern.test(content)) return;

      pattern.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let match;

      while ((match = pattern.exec(content)) !== null) {
        frag.appendChild(document.createTextNode(content.slice(lastIndex, match.index)));

        const span = document.createElement("cite");
span.className = "bibleref";
span.style.cssText = "cursor:help; border-bottom:1px dotted #888; text-decoration:none; font-style:normal;";
span.setAttribute("itemscope", "");
span.setAttribute("itemtype", "https://schema.org/CreativeWork");
span.setAttribute("itemid", "https://linguadivina.uk/source/holy-bible");


        span.dataset.book = match[1];
        span.dataset.chapter = match[2];

        if (match[3]) {
          span.dataset.verse = match[4] ? `${match[3]}-${match[4]}` : match[3];
          span.dataset.startVerse = match[3];
        } else {
          span.dataset.verse = "";
          span.dataset.startVerse = "1";
        }

        span.textContent = match[0];
        frag.appendChild(span);
        lastIndex = pattern.lastIndex;
      }

      frag.appendChild(document.createTextNode(content.slice(lastIndex)));
      node.replaceWith(frag);

    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !["SCRIPT","STYLE","CITE","A","PRE","H1","H2","H3","H4","H5","H6","HEADER"].includes(node.tagName) &&
      !node.classList.contains("noTag")
    ) {
      Array.from(node.childNodes).forEach(child => wrapBibleReferences(child));
    }
  }

  wrapBibleReferences(mainEl);

  const tooltip = document.createElement("div");
  Object.assign(tooltip.style, {
    position: "absolute", display: "none", zIndex: "10000",
    padding: "14px", fontSize: "16px", lineHeight: "1.3em",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    borderRadius: "7px", pointerEvents: "auto",
  });

  const themes = {
    light: {
      background: "#fff",
      color: "#000",
      border: "1px solid #ccc",
      linkColor: "#82adff"
    },
    dark: {
      background: "#111",
      color: "#eee",
      border: "1px solid #555",
      linkColor: "#82adff"
    }
  };

  function applyTheme(isDark) {
    Object.assign(tooltip.style, isDark ? themes.dark : themes.light);
  }

  const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  applyTheme(darkModeMediaQuery.matches);
  darkModeMediaQuery.addEventListener("change", (e) => applyTheme(e.matches));

  document.body.appendChild(tooltip);

  mainEl.addEventListener("mouseover", async function (e) {
    const ref = e.target.closest(".bibleref");
    if (!ref) return;

    const rect = ref.getBoundingClientRect();
    tooltip.style.left = (window.scrollX + rect.left) + "px";
    tooltip.style.top = (window.scrollY + rect.bottom + 8) + "px";
    tooltip.style.display = "block";
    tooltip.innerHTML = "Loading...";

    const { book, chapter, verse, startVerse } = ref.dataset;
    const query = verse ? `${book} ${chapter}:${verse}` : `${book} ${chapter}`;
    const apiURL = `https://bible-api.com/${encodeURIComponent(query)}?translation=bbe`;

    try {
      const response = await fetch(apiURL);
      const data = await response.json();

      const blbCode = bookBLBMap[book] || book.replace(/\s+/g, "");
      const blbLink = `https://www.blueletterbible.org/esv/${blbCode}/${chapter}/${startVerse}/`;

      tooltip.innerHTML = data.text
        ? `<span style="font-weight:bold;text-decoration:none;">${data.reference}</span><br>${data.text.replace(/\n/g, "<br>")}<br><div style="border:0;border-top:1px solid #000;margin:8px 0;"></div><a href="${blbLink}" target="_blank" rel="noopener noreferrer" style="color:#82adff !important;text-decoration:none;font-weight:bold;">View on Blue Letter Bible →</a>`
        : "Not found";
    } catch {
      tooltip.innerHTML = "Error loading preview.";
    }
  });

  mainEl.addEventListener("mouseout", (e) => {
    if (e.relatedTarget && (e.relatedTarget === tooltip || tooltip.contains(e.relatedTarget))) return;
    tooltip.style.display = "none";
  });

  tooltip.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
  });
});
