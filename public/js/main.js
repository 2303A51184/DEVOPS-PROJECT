// ============================================
//   ShopNow E-Commerce — Main JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
  initSearchSuggestions();
  initFlashAutoDismiss();
});

/* ====== HERO CAROUSEL ====== */
function initCarousel() {
  const track = document.getElementById('carousel');
  if (!track) return;

  const slides = track.querySelectorAll('.carousel-slide');
  const dotsContainer = document.getElementById('dots');
  let current = 0;
  let autoSlide;

  // Create dots
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  document.getElementById('prev')?.addEventListener('click', () => {
    goTo(current - 1);
    resetAuto();
  });
  document.getElementById('next')?.addEventListener('click', () => {
    goTo(current + 1);
    resetAuto();
  });

  function startAuto() { autoSlide = setInterval(() => goTo(current + 1), 4000); }
  function resetAuto() { clearInterval(autoSlide); startAuto(); }

  startAuto();
}

/* ====== SEARCH AUTOCOMPLETE ====== */
function initSearchSuggestions() {
  const input = document.getElementById('searchInput');
  const dropdown = document.getElementById('suggestions');
  if (!input || !dropdown) return;

  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (q.length < 2) { dropdown.classList.remove('active'); dropdown.innerHTML = ''; return; }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/products/search/suggestions?q=${encodeURIComponent(q)}`);
        const items = await res.json();
        if (items.length === 0) { dropdown.classList.remove('active'); return; }
        dropdown.innerHTML = items.map(item =>
          `<div class="suggestion-item" onclick="selectSuggestion('${item.name.replace(/'/g, "\\'")}')">
            <i class="fas fa-search" style="color:#94a3b8;font-size:0.75rem"></i>
            ${item.name}
            <small>${item.category}</small>
          </div>`
        ).join('');
        dropdown.classList.add('active');
      } catch (e) { /* silent fail */ }
    }, 300);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
      dropdown.classList.remove('active');
    }
  });
}

function selectSuggestion(name) {
  const input = document.getElementById('searchInput');
  const dropdown = document.getElementById('suggestions');
  if (input) { input.value = name; input.closest('form').submit(); }
  if (dropdown) dropdown.classList.remove('active');
}

/* ====== FLASH AUTO DISMISS ====== */
function initFlashAutoDismiss() {
  const flashes = document.querySelectorAll('.flash');
  flashes.forEach(flash => {
    setTimeout(() => {
      flash.style.opacity = '0';
      flash.style.transition = 'opacity 0.5s ease';
      setTimeout(() => flash.remove(), 500);
    }, 4000);
  });
}
