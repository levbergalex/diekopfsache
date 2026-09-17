// diekopfsache — Slot-Logik & Interaktionen

const WEEKS = {
  hamburg: {
    label: "Hamburg",
    range: "12.–16. Januar",
    note: "Hamburg · 12.–16. Januar — noch 2 frei. Slots werden in Reihenfolge der Anfragen vergeben.",
    topbar: "Nächster Stopp: HAMBURG · 12.–16. Jan · noch 2 von 5 Slots frei",
    days: [
      { dow: "Montag", date: "12. Jan", firm: "SaaS-Startup · 18 Köpfe", status: "belegt" },
      { dow: "Dienstag", date: "13. Jan", firm: "Kanzlei · 12 Köpfe", status: "belegt" },
      { dow: "Mittwoch", date: "14. Jan", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Donnerstag", date: "15. Jan", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Freitag", date: "16. Jan", firm: "Agentur · 20 Köpfe", status: "belegt" },
    ],
  },
  berlin: {
    label: "Berlin",
    range: "19.–23. Januar",
    note: "Berlin · 19.–23. Januar — noch 3 frei. Letzte Woche war in 6 Tagen ausgebucht.",
    topbar: "BERLIN · 19.–23. Jan · noch 3 von 5 Slots frei",
    days: [
      { dow: "Montag", date: "19. Jan", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Dienstag", date: "20. Jan", firm: "Fintech · 16 Köpfe", status: "belegt" },
      { dow: "Mittwoch", date: "21. Jan", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Donnerstag", date: "22. Jan", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Freitag", date: "23. Jan", firm: "Beratung · 14 Köpfe", status: "belegt" },
    ],
  },
  muenchen: {
    label: "München",
    range: "26.–30. Januar",
    note: "München · 26.–30. Januar — frisch geöffnet, noch 4 frei.",
    topbar: "MÜNCHEN · 26.–30. Jan · frisch geöffnet · 4 von 5 frei",
    days: [
      { dow: "Montag", date: "26. Jan", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Dienstag", date: "27. Jan", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Mittwoch", date: "28. Jan", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Donnerstag", date: "29. Jan", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Freitag", date: "30. Jan", firm: "Versicherung · 19 Köpfe", status: "belegt" },
    ],
  },
  koeln: {
    label: "Köln",
    range: "02.–06. Februar",
    note: "Köln · 02.–06. Februar — Warteliste offen, noch 2 frei.",
    topbar: "KÖLN · 02.–06. Feb · noch 2 von 5 Slots frei",
    days: [
      { dow: "Montag", date: "02. Feb", firm: "Medienhaus · 20 Köpfe", status: "belegt" },
      { dow: "Dienstag", date: "03. Feb", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Mittwoch", date: "04. Feb", firm: "E-Commerce · 17 Köpfe", status: "belegt" },
      { dow: "Donnerstag", date: "05. Feb", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Freitag", date: "06. Feb", firm: "Steuerberatung · 11 Köpfe", status: "belegt" },
    ],
  },
};

let currentCity = "hamburg";
let selected = { city: "hamburg", index: 2 }; // default: Hamburg Mi

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
  const map = { hamburg: "hamburg", berlin: "berlin", münchen: "muenchen", köln: "koeln" };
  const key = map[label] || "hamburg";
  selected.city = key;
  updateSummaryLight();
});
formDay.addEventListener("change", updateSummaryLight);
function updateSummaryLight() {
  const week = WEEKS[selected.city] || WEEKS.hamburg;
  sumSlot.textContent = `${week.label} · ${formDay.value} · ${week.range}`;
}

// Buchungsformular
const form = document.getElementById("bookForm");
const toast = document.getElementById("toast");
const toastSub = document.getElementById("toastSub");
form.addEventListener("submit", e => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const data = Object.fromEntries(new FormData(form).entries());
  const count = parseInt(data.count || "0", 10);
  const btn = document.getElementById("submitBtn");
  btn.textContent = "Wird gesendet …";
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = "Slot anfragen →";
    btn.disabled = false;
    toastSub.textContent = `${data.firma} · ${sumSlot.textContent} · ca. ${data.count} Personen${count > 20 ? " (20+ Angebot)" : ""}`;
    toast.classList.add("show");
    form.reset();
    setTimeout(() => toast.classList.remove("show"), 6000);
  }, 900);
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
