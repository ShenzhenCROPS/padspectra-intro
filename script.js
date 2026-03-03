/* ===== Scroll-reveal animation ===== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ===== Active nav link on scroll ===== */
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const sections = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = "#" + entry.target.id;
      navLinks.forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === id)
      );
    });
  },
  { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
);
sections.forEach((s) => sectionObserver.observe(s));

/* ===== Tabs ===== */
document.querySelectorAll(".tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-tab");
    const container = btn.closest(".card");
    container.querySelectorAll(".tab").forEach((b) => b.classList.remove("active"));
    container.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    const panel = container.querySelector("#" + target);
    if (panel) panel.classList.add("active");
  });
});

/* ===== Image lightbox ===== */
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");

document.querySelectorAll(".lightbox-img img").forEach((img) => {
  img.addEventListener("click", () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.showModal();
  });
});

document.getElementById("closeLightbox").addEventListener("click", () => lightbox.close());

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.close();
});

/* ===== Mask-range validator ===== */
const checkBtn = document.getElementById("checkMask");
const maskInput = document.getElementById("maskInput");
const maskResult = document.getElementById("maskResult");

function validateMask(raw) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { status: "neutral", msg: "Empty input means keep full range (350\u20132500)." };
  }
  const parts = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length > 2) {
    return { status: "bad", msg: "Invalid: more than two ranges." };
  }

  const ranges = [];
  for (const part of parts) {
    const pair = part.split("-").map((s) => s.trim());
    if (pair.length !== 2) return { status: "bad", msg: "Invalid format. Use start-end." };
    const start = Number(pair[0]);
    const end = Number(pair[1]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return { status: "bad", msg: "Endpoints must be numbers." };
    }
    if (start >= end) return { status: "bad", msg: "Start must be less than end." };
    if (start < 350 || end > 2500) {
      return { status: "bad", msg: "Endpoints must be within 350\u20132500." };
    }
    if (start % 50 !== 0 || end % 50 !== 0) {
      return { status: "bad", msg: "Endpoints must be divisible by 50." };
    }
    ranges.push({ start, end });
  }

  ranges.sort((a, b) => a.start - b.start);
  if (ranges.length === 2) {
    const gap = ranges[1].start - ranges[0].end;
    if (gap < 0) return { status: "bad", msg: "Ranges must not overlap." };
    if (gap > 400) return { status: "bad", msg: "Gap between ranges must be \u2264 400 nm." };
  }

  const span = ranges.reduce((sum, r) => sum + (r.end - r.start), 0);
  if (span < 500) {
    return { status: "bad", msg: "Total kept span must be at least 500 nm." };
  }
  return { status: "good", msg: "Valid. Total kept span: " + span + " nm." };
}

checkBtn.addEventListener("click", () => {
  const result = validateMask(maskInput.value);
  maskResult.className = "play-result " + result.status;
  maskResult.textContent = result.msg;
});

maskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkBtn.click();
});
