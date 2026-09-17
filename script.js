// diekopfsache — Slot-Logik & Interaktionen
//
// BUCHUNGSAUFBAU:
// Stufe 1 (jetzt): Das Formular schickt echte Anfragen per E-Mail über
//   Formspree. Setup (5 Min, gratis):
//   1. Auf https://formspree.io registrieren → "New Form" anlegen
//   2. Den Endpoint-Code unten bei FORM_ENDPOINT eintragen
//   3. Einmal Test-Anfrage schicken und die Bestätigungs-Mail von
//      Formspree bestätigen — fertig.
// Verfügbarkeit (frei/belegt) wird manuell hier in WEEKS gepflegt und
//   gepusht. Anfragen sind bewusst "unverbindlich", die feste Zusage
//   kommt per E-Mail in 24h.
// Stufe 2 (später, bei Volumen): Direktbuchung via Cal.com + Anzahlung
//   via Stripe Payment Link.

// TODO: echten Formspree-Endpoint eintragen, z.B. "https://formspree.io/f/xabc1234"
const FORM_ENDPOINT = "https://formspree.io/f/DEIN-CODE";

const WEEKS = {
  wien: {
    label: "Wien",
    range: "12.–16. Okt",
    note: "Wien · 12.–16. Oktober — noch 2 frei. Slots werden in Reihenfolge der Anfragen vergeben.",
    topbar: "Nächster Stopp: WIEN · 12.–16. Okt · noch 2 von 5 Slots frei",
    days: [
      { dow: "Montag", date: "12. Okt", firm: "Belegt", status: "belegt" },
      { dow: "Dienstag", date: "13. Okt", firm: "Belegt", status: "belegt" },
      { dow: "Mittwoch", date: "14. Okt", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Donnerstag", date: "15. Okt", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Freitag", date: "16. Okt", firm: "Belegt", status: "belegt" },
    ],
  },
  graz: {
    label: "Graz",
    range: "19.–23. Okt",
    note: "Graz · 19.–23. Oktober — noch 3 frei.",
    topbar: "GRAZ · 19.–23. Okt · noch 3 von 5 Slots frei",
    days: [
      { dow: "Montag", date: "19. Okt", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Dienstag", date: "20. Okt", firm: "Belegt", status: "belegt" },
      { dow: "Mittwoch", date: "21. Okt", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Donnerstag", date: "22. Okt", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Freitag", date: "23. Okt", firm: "Belegt", status: "belegt" },
    ],
  },
  linz: {
    label: "Linz",
    range: "02.–06. Nov",
    note: "Linz · 02.–06. November — frisch geöffnet, noch 4 frei.",
    topbar: "LINZ · 02.–06. Nov · frisch geöffnet · 4 von 5 frei",
    days: [
      { dow: "Montag", date: "02. Nov", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Dienstag", date: "03. Nov", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Mittwoch", date: "04. Nov", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Donnerstag", date: "05. Nov", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Freitag", date: "06. Nov", firm: "Belegt", status: "belegt" },
    ],
  },
  salzburg: {
    label: "Salzburg",
    range: "09.–13. Nov",
    note: "Salzburg · 09.–13. November — noch 2 frei.",
    topbar: "SALZBURG · 09.–13. Nov · noch 2 von 5 Slots frei",
    days: [
      { dow: "Montag", date: "09. Nov", firm: "Belegt", status: "belegt" },
      { dow: "Dienstag", date: "10. Nov", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Mittwoch", date: "11. Nov", firm: "Belegt", status: "belegt" },
      { dow: "Donnerstag", date: "12. Nov", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Freitag", date: "13. Nov", firm: "Belegt", status: "belegt" },
    ],
  },
};

let currentCity = "wien";
let selected = { city: "wien", index: 2 }; // default: Wien Mi

const grid = document.getElementById("slotsGrid");
const note = document.getElementById("slotsNote");
const topbar = document.getElementById("topbar-text");
const sumSlot = document.getElementById("sumSlot");
const formCity = document.getElementById("formCity");
const formDay = document.getElementById("formDay");

function renderSlots() {
  const week = WEEKS[currentCity];
  grid.innerHTML = "";
  week.days.forEach((d, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    const isSel = selected.city === currentCity && selected.index === i && d.status === "frei";
    btn.className = `slot ${d.status}${isSel ? " selected" : ""}`;
    btn.disabled = d.status === "belegt";
    btn.innerHTML = `
      <div class="dow">${d.dow.slice(0,2).toUpperCase()}</div>
      <div class="date">${d.dow}, ${d.date}</div>
      <div class="firm">${d.firm}</div>
      <span class="status">${d.status === "frei" ? (isSel ? "✓ AUSGEWÄHLT" : "FREI — WÄHLEN") : "BELEGT"}</span>
    `;
    if (d.status === "frei") {
      btn.addEventListener("click", () => {
        selected = { city: currentCity, index: i };
        renderSlots();
        updateSummary();
        document.getElementById("buchen").scrollIntoView({ behavior: "smooth" });
      });
    }
    grid.appendChild(btn);
  });
  note.textContent = week.note;
}

function updateSummary() {
  const week = WEEKS[selected.city];
  const day = week.days[selected.index];
  const label = `${week.label} · ${day.dow}, ${day.date}`;
  sumSlot.textContent = label;
  topbar.textContent = WEEKS[currentCity].topbar;

  // Formular synchronisieren
  const cityOption = [...formCity.options].find(o => o.text.startsWith(week.label));
  if (cityOption) formCity.value = cityOption.text;
  const dayOption = [...formDay.options].find(o => o.text === day.dow);
  if (dayOption) formDay.value = dayOption.text;
}

// City-Picker
document.querySelectorAll(".city").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".city").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCity = btn.dataset.city;
    // ersten freien Slot der Stadt vorauswählen
    const idx = WEEKS[currentCity].days.findIndex(d => d.status === "frei");
    if (idx >= 0) selected = { city: currentCity, index: idx };
    renderSlots();
    updateSummary();
  });
});

// Formular-Änderungen → Summary
formCity.addEventListener("change", () => {
  const label = formCity.value.split(" ·")[0].toLowerCase();
  const map = { wien: "wien", graz: "graz", linz: "linz", salzburg: "salzburg" };
  const key = map[label] || "wien";
  selected.city = key;
  updateSummaryLight();
});
formDay.addEventListener("change", updateSummaryLight);
function updateSummaryLight() {
  const week = WEEKS[selected.city] || WEEKS.wien;
  sumSlot.textContent = `${week.label} · ${formDay.value} · ${week.range}`;
}

// Buchungsformular — echte Anfrage per Formspree
const form = document.getElementById("bookForm");
const toast = document.getElementById("toast");
const toastSub = document.getElementById("toastSub");

let toastTimer = null;
function showToast(main, sub, isError) {
  toast.childNodes[0].textContent = main + " ";
  toastSub.textContent = sub || "";
  toast.classList.toggle("error", !!isError);
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 6000);
}

form.addEventListener("submit", async e => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  // Honeypot: Bots füllen das versteckte Feld aus → still "erfolgreich" tun
  if (form.querySelector('input[name="_gotcha"]').value) {
    showToast("✓ Anfrage gesendet! Wir melden uns in 24h.", "");
    return;
  }
  const data = new FormData(form);
  const count = parseInt(data.get("count") || "0", 10);
  data.append("Slot-Auswahl", sumSlot.textContent);
  data.append("_subject", `Neue Slot-Anfrage: ${data.get("firma")} — ${sumSlot.textContent}`);

  const btn = document.getElementById("submitBtn");
  btn.textContent = "Wird gesendet …";
  btn.disabled = true;

  if (FORM_ENDPOINT.includes("DEIN-CODE")) {
    btn.textContent = "Slot anfragen →";
    btn.disabled = false;
    showToast("✗ Noch nicht verbunden.", "Bitte direkt an hi@diekopfsache.at schreiben — das Formular wird gerade eingerichtet.", true);
    return;
  }

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error("send failed");
    showToast(
      "✓ Anfrage gesendet! Wir melden uns in 24h.",
      `${data.get("firma")} · ${sumSlot.textContent} · ca. ${data.get("count")} Personen${count > 20 ? " (größeres Team)" : ""}`
    );
    form.reset();
  } catch {
    showToast("✗ Senden fehlgeschlagen.", "Bitte direkt an hi@diekopfsache.at schreiben — wir melden uns in 24h.", true);
  } finally {
    btn.textContent = "Slot anfragen →";
    btn.disabled = false;
  }
});

// Mobile Menü
const burger = document.getElementById("burger");
const menu = document.getElementById("mobileMenu");
burger.addEventListener("click", () => menu.classList.toggle("open"));
menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => menu.classList.remove("open")));

// Scroll-Reveal
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) en.target.classList.add("in"); });
}, { threshold: 0.12 });
document.querySelectorAll(".card, .step, .price-card, .review, .gallery figure, .section-head").forEach(el => {
  el.classList.add("reveal");
  io.observe(el);
});

// Nav-Schatten beim Scrollen
const nav = document.getElementById("nav");
addEventListener("scroll", () => {
  nav.style.boxShadow = scrollY > 10 ? "0 10px 30px rgba(0,0,0,.08)" : "none";
});

// Init
renderSlots();
updateSummary();
