// diekopfsache — Slot-Logik & Interaktionen

const WEEKS = {
  wien: {
    label: "Wien",
    range: "12.–16. Jän",
    note: "Wien · 12.–16. Jänner — noch 2 frei. Slots werden in Reihenfolge der Anfragen vergeben.",
    topbar: "Nächster Stopp: WIEN · 12.–16. Jän · noch 2 von 5 Slots frei",
    days: [
      { dow: "Montag", date: "12. Jän", firm: "Belegt", status: "belegt" },
      { dow: "Dienstag", date: "13. Jän", firm: "Belegt", status: "belegt" },
      { dow: "Mittwoch", date: "14. Jän", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Donnerstag", date: "15. Jän", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Freitag", date: "16. Jän", firm: "Belegt", status: "belegt" },
    ],
  },
  graz: {
    label: "Graz",
    range: "19.–23. Jän",
    note: "Graz · 19.–23. Jänner — noch 3 frei.",
    topbar: "GRAZ · 19.–23. Jän · noch 3 von 5 Slots frei",
    days: [
      { dow: "Montag", date: "19. Jän", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Dienstag", date: "20. Jän", firm: "Belegt", status: "belegt" },
      { dow: "Mittwoch", date: "21. Jän", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Donnerstag", date: "22. Jän", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Freitag", date: "23. Jän", firm: "Belegt", status: "belegt" },
    ],
  },
  linz: {
    label: "Linz",
    range: "26.–30. Jän",
    note: "Linz · 26.–30. Jänner — frisch geöffnet, noch 4 frei.",
    topbar: "LINZ · 26.–30. Jän · frisch geöffnet · 4 von 5 frei",
    days: [
      { dow: "Montag", date: "26. Jän", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Dienstag", date: "27. Jän", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Mittwoch", date: "28. Jän", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Donnerstag", date: "29. Jän", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Freitag", date: "30. Jän", firm: "Belegt", status: "belegt" },
    ],
  },
  salzburg: {
    label: "Salzburg",
    range: "02.–06. Feb",
    note: "Salzburg · 02.–06. Februar — noch 2 frei.",
    topbar: "SALZBURG · 02.–06. Feb · noch 2 von 5 Slots frei",
    days: [
      { dow: "Montag", date: "02. Feb", firm: "Belegt", status: "belegt" },
      { dow: "Dienstag", date: "03. Feb", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Mittwoch", date: "04. Feb", firm: "Belegt", status: "belegt" },
      { dow: "Donnerstag", date: "05. Feb", firm: "Dein Unternehmen? · bis 20 Köpfe", status: "frei" },
      { dow: "Freitag", date: "06. Feb", firm: "Belegt", status: "belegt" },
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
