/**
 * ================================================
 *  Death Note: Shadow Chronicle — Main Script
 *  Fixed: sections hoisting error, lightbox
 *         visibility (hidden attr vs CSS display)
 * ================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* =============================================
     1. CUSTOM CURSOR
  ============================================== */
  const cursor      = document.getElementById('cursor');
  const cursorTrail = document.getElementById('cursorTrail');

  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
    trailX = e.clientX;
    trailY = e.clientY;
  });

  // Interpolated trail loop
  (function animateTrail() {
    const currentX = parseFloat(cursorTrail.style.left) || 0;
    const currentY = parseFloat(cursorTrail.style.top)  || 0;
    cursorTrail.style.left = (currentX + (trailX - currentX) * 0.14) + 'px';
    cursorTrail.style.top  = (currentY + (trailY - currentY) * 0.14) + 'px';
    requestAnimationFrame(animateTrail);
  })();

  // Grow cursor on interactive elements
  document.querySelectorAll('a, button, label, input, [role="button"], .gallery-tile')
    .forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorTrail.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorTrail.style.opacity = '0.5';
  });


  /* =============================================
     2. ALL SECTION QUERY — declared FIRST so
        updateActiveNavLink() can safely use it
  ============================================== */
  // FIX: was declared after handleNavScroll caused a ReferenceError
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');


  /* =============================================
     3. ACTIVE NAV LINK
  ============================================== */
  function updateActiveNavLink() {
    let currentId = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) {
        currentId = sec.id;
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === currentId);
    });
  }


  /* =============================================
     4. NAVBAR scroll background
  ============================================== */
  const navbar = document.getElementById('navbar');

  function handleNavScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    updateActiveNavLink(); // sections is now defined above — no error
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run once on load


  /* =============================================
     5. HAMBURGER — mobile menu toggle
  ============================================== */
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mob-link');

  function toggleMobileMenu() {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleMobileMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      mobileMenu.setAttribute('aria-hidden', true);
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', (e) => {
    if (
      mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !hamburger.contains(e.target)
    ) toggleMobileMenu();
  });


  /* =============================================
     6. SCROLL REVEAL
  ============================================== */
  const revealElements = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach(el => revealObserver.observe(el));


  /* =============================================
     7. HERO STAT COUNTERS
  ============================================== */
  const statNumbers = document.querySelectorAll('.stat-num[data-count]');

  function animateCounter(el) {
    const target    = parseInt(el.dataset.count, 10);
    const duration  = 1600;
    const startTime = performance.now();

    function update(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statNumbers.forEach(el => counterObserver.observe(el));


  /* =============================================
     8. FALLING RAIN EFFECT
  ============================================== */
  const rainContainer = document.getElementById('rainContainer');

  const rainChars = [
    '死','命','名','神','闇','光','悪','正','義','裁',
    'K','I','R','A','L','N','0','1','×','†'
  ];

  function spawnRainChar() {
    const el           = document.createElement('span');
    el.className       = 'rain-char';
    el.textContent     = rainChars[Math.floor(Math.random() * rainChars.length)];
    el.style.left      = Math.random() * 100 + 'vw';
    const dur          = 5 + Math.random() * 9;
    el.style.animationDuration = dur + 's';
    el.style.animationDelay   = (Math.random() * 12) + 's';
    el.style.opacity   = String(0.4 + Math.random() * 0.6);
    rainContainer.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, (dur + 13) * 1000);
  }

  for (let i = 0; i < 30; i++) spawnRainChar();
  setInterval(spawnRainChar, 600);


  /* =============================================
     9. SINGLE-IMAGE UPLOAD (character / story slots)
  ============================================== */
  function setupSingleImageUpload(inputId, slotId) {
    const input = document.getElementById(inputId);
    const slot  = document.getElementById(slotId);
    if (!input || !slot) return;

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file || !file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (re) => {
        let img = slot.querySelector('img.uploaded-img');
        if (!img) {
          img = document.createElement('img');
          img.className = 'uploaded-img';
          img.alt = 'Uploaded image';
          slot.insertBefore(img, slot.firstChild);
        }
        img.src = re.target.result;
        img.style.opacity    = '0';
        img.style.transition = 'opacity 0.4s ease';
        requestAnimationFrame(() => { img.style.opacity = '1'; });
      };
      reader.readAsDataURL(file);
    });
  }

  setupSingleImageUpload('storyImageInput', 'storyImgSlot');
  setupSingleImageUpload('lightImageInput', 'lightImgSlot');
  setupSingleImageUpload('ryukImageInput',  'ryukImgSlot');
  setupSingleImageUpload('detImageInput',   'detImgSlot');


  /* =============================================
     10. GALLERY — multi-image upload & management
  ============================================== */
  const galleryInput = document.getElementById('galleryInput');
  const galleryGrid  = document.getElementById('galleryGrid');
  const clearBtn     = document.getElementById('clearGallery');

  // Track uploaded images: { src, name } or null if deleted
  let galleryImages = [];

  function addGalleryTile(src, name, idx) {
    // Remove placeholders on first real upload
    if (galleryImages.filter(Boolean).length === 1) {
      galleryGrid.querySelectorAll('.placeholder-tile').forEach(p => p.remove());
    }

    const tile = document.createElement('div');
    tile.className = 'gallery-tile';
    tile.setAttribute('role', 'listitem');
    tile.dataset.idx = idx;

    const img       = document.createElement('img');
    img.src         = src;
    img.alt         = name;
    img.loading     = 'lazy';
    tile.appendChild(img);

    const cap       = document.createElement('span');
    cap.className   = 'tile-caption';
    cap.textContent = name;
    tile.appendChild(cap);

    const del       = document.createElement('button');
    del.className   = 'tile-delete';
    del.textContent = '✕';
    del.setAttribute('aria-label', `Remove ${name}`);
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      removeTile(tile, idx);
    });
    tile.appendChild(del);

    tile.addEventListener('click', () => openLightbox(idx));

    // Fade in
    tile.style.opacity   = '0';
    tile.style.transform = 'scale(0.92)';
    galleryGrid.appendChild(tile);
    requestAnimationFrame(() => {
      tile.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      tile.style.opacity    = '1';
      tile.style.transform  = 'scale(1)';
    });
  }

  function removeTile(tile, idx) {
    tile.style.transition = 'opacity 0.3s, transform 0.3s';
    tile.style.opacity    = '0';
    tile.style.transform  = 'scale(0.88)';
    setTimeout(() => {
      tile.remove();
      galleryImages[idx] = null;
      if (!galleryImages.filter(Boolean).length) restorePlaceholders();
    }, 300);
  }

  function restorePlaceholders() {
    galleryGrid.innerHTML = `
      <div class="gallery-tile placeholder-tile" aria-label="Gallery slot 1">
        <div class="tile-inner"><span class="tile-label">Scene 1</span><p class="tile-hint">Upload an image</p></div>
      </div>
      <div class="gallery-tile placeholder-tile tall" aria-label="Gallery slot 2">
        <div class="tile-inner"><span class="tile-label">Scene 2</span><p class="tile-hint">Upload an image</p></div>
      </div>
      <div class="gallery-tile placeholder-tile" aria-label="Gallery slot 3">
        <div class="tile-inner"><span class="tile-label">Scene 3</span><p class="tile-hint">Upload an image</p></div>
      </div>
      <div class="gallery-tile placeholder-tile wide" aria-label="Gallery slot 4">
        <div class="tile-inner"><span class="tile-label">Scene 4</span><p class="tile-hint">Upload an image</p></div>
      </div>
      <div class="gallery-tile placeholder-tile" aria-label="Gallery slot 5">
        <div class="tile-inner"><span class="tile-label">Scene 5</span><p class="tile-hint">Upload an image</p></div>
      </div>`;
    galleryImages = [];
  }

  galleryInput.addEventListener('change', (e) => {
    Array.from(e.target.files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        const idx = galleryImages.length;
        galleryImages.push({ src: re.target.result, name: file.name });
        addGalleryTile(re.target.result, file.name, idx);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  });

  clearBtn.addEventListener('click', restorePlaceholders);


  /* =============================================
     11. LIGHTBOX
     FIX: the old code used element.hidden = true/false
     but the CSS rule "display: flex" on .lightbox
     overrides the browser's hidden attribute style,
     making the lightbox visible on page load.
     Solution: use a CSS class .lightbox--open instead.
  ============================================== */
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lbPrev');
  const lbNext    = document.getElementById('lbNext');

  let lightboxIndex = 0;

  // Make sure lightbox starts hidden regardless of HTML attribute
  lightbox.style.display = 'none';

  function openLightbox(idx) {
    const valid = galleryImages
      .map((img, i) => ({ img, i }))
      .filter(({ img }) => img !== null);

    if (!valid.length) return;

    const entry   = valid.find(({ i }) => i === idx) || valid[0];
    lightboxIndex = entry.i;

    lbImg.src             = entry.img.src;
    lbImg.alt             = entry.img.name;
    lbCaption.textContent = entry.img.name;

    // Use display instead of hidden attribute to avoid CSS override
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    lbPrev.style.display = valid.length > 1 ? 'flex' : 'none';
    lbNext.style.display = valid.length > 1 ? 'flex' : 'none';
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function navigateLightbox(dir) {
    const valid = galleryImages
      .map((img, i) => ({ img, i }))
      .filter(({ img }) => img !== null);

    if (valid.length < 2) return;

    const pos   = valid.findIndex(({ i }) => i === lightboxIndex);
    const entry = valid[(pos + dir + valid.length) % valid.length];
    lightboxIndex = entry.i;

    lbImg.style.opacity    = '0';
    lbImg.style.transform  = dir > 0 ? 'translateX(30px)' : 'translateX(-30px)';
    lbImg.style.transition = 'opacity 0.2s, transform 0.2s';

    setTimeout(() => {
      lbImg.src             = entry.img.src;
      lbImg.alt             = entry.img.name;
      lbCaption.textContent = entry.img.name;
      lbImg.style.transform = dir > 0 ? 'translateX(-30px)' : 'translateX(30px)';
      requestAnimationFrame(() => {
        lbImg.style.opacity   = '1';
        lbImg.style.transform = 'translateX(0)';
      });
    }, 200);
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click',  () => navigateLightbox(-1));
  lbNext.addEventListener('click',  () => navigateLightbox(+1));

  // Close on backdrop click (outside image wrapper)
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'none') return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') navigateLightbox(+1);
    if (e.key === 'ArrowLeft')  navigateLightbox(-1);
  });


  /* =============================================
     12. RYUK APPLE EASTER EGG
  ============================================== */
  const appleMeter = document.querySelector('.apple-meter');
  const ryukLines  = [
    '🍎 "Give me an apple. NOW."',
    '💀 "You humans and your games…"',
    '🍎 "I dropped the Note for THIS?"',
    '😈 "Ha ha ha ha ha ha…"',
    '🍎 "Three apples. That is the price."',
    '💀 "Interesting… very interesting."',
    '🍎 "I am bored. Where are the apples?"',
  ];
  let ryukLineIdx = 0;

  if (appleMeter) {
    appleMeter.style.cursor = 'pointer';
    appleMeter.title = 'Click to hear from Ryuk';
    appleMeter.addEventListener('click', () => {
      showToast(ryukLines[ryukLineIdx++ % ryukLines.length], 2800);
    });
  }


  /* =============================================
     13. PLAY BUTTON — fake launch animation
  ============================================== */
  const playBtn = document.getElementById('playBtn');

  // Inject the spin keyframe once
  const spinStyle = document.createElement('style');
  spinStyle.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(spinStyle);

  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.preventDefault();
      playBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             style="animation:spin 0.8s linear infinite;width:16px;height:16px">
          <circle cx="12" cy="12" r="10" stroke-dasharray="30 10"/>
        </svg> Loading…`;
      playBtn.style.pointerEvents = 'none';

      setTimeout(() => {
        playBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg> Play in Browser`;
        playBtn.style.pointerEvents = '';
        showToast('🎮 Game coming soon. Stay hidden, Kira.', 3500);
      }, 2200);
    });
  }


  /* =============================================
     14. TOAST NOTIFICATION
  ============================================== */
  let toastTimeout = null;

  function showToast(message, durationMs = 2500) {
    const existing = document.getElementById('siteToast');
    if (existing) existing.remove();
    if (toastTimeout) clearTimeout(toastTimeout);

    const toast = document.createElement('div');
    toast.id    = 'siteToast';
    Object.assign(toast.style, {
      position:      'fixed',
      bottom:        '2rem',
      left:          '50%',
      transform:     'translateX(-50%) translateY(20px)',
      background:    '#181818',
      border:        '1px solid #c0392b',
      borderRadius:  '2px',
      color:         '#f0ece4',
      fontFamily:    '"EB Garamond", Georgia, serif',
      fontSize:      '0.95rem',
      padding:       '12px 28px',
      zIndex:        '9999',
      whiteSpace:    'nowrap',
      boxShadow:     '0 8px 32px rgba(0,0,0,0.7)',
      opacity:       '0',
      transition:    'opacity 0.3s ease, transform 0.3s ease',
      pointerEvents: 'none',
    });
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    toastTimeout = setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(() => toast.remove(), 350);
    }, durationMs);
  }


  /* =============================================
     15. FOOTER YEAR
  ============================================== */
  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();


  /* =============================================
     16. SMOOTH SCROLL with navbar offset
  ============================================== */
  const NAV_HEIGHT = 72;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id     = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top:      target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT,
        behavior: 'smooth',
      });
    });
  });


  /* =============================================
     17. STAT BAR ANIMATION TRIGGER
  ============================================== */
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          fill.style.animation = 'none';
          void fill.offsetHeight; // force reflow
          fill.style.animation = '';
          barObserver.unobserve(fill);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll('.cs-fill').forEach(b => barObserver.observe(b));


  /* =============================================
     18. DRAG-AND-DROP on gallery section
  ============================================== */
  const gallerySection = document.getElementById('gallery');

  if (gallerySection) {
    gallerySection.addEventListener('dragover', (e) => {
      e.preventDefault();
      gallerySection.style.outline = '2px dashed #c0392b';
    });
    gallerySection.addEventListener('dragleave', () => {
      gallerySection.style.outline = '';
    });
    gallerySection.addEventListener('drop', (e) => {
      e.preventDefault();
      gallerySection.style.outline = '';
      Array.from(e.dataTransfer.files)
        .filter(f => f.type.startsWith('image/'))
        .forEach(file => {
          const reader = new FileReader();
          reader.onload = (re) => {
            const idx = galleryImages.length;
            galleryImages.push({ src: re.target.result, name: file.name });
            addGalleryTile(re.target.result, file.name, idx);
          };
          reader.readAsDataURL(file);
        });
    });
  }


  /* =============================================
     19. NOTEBOOK PARALLAX (desktop only)
  ============================================== */
  const heroNotebook = document.querySelector('.hero-notebook');

  if (heroNotebook && window.matchMedia('(min-width: 900px)').matches) {
    window.addEventListener('scroll', () => {
      heroNotebook.style.transform =
        `translateY(calc(-50% + ${window.scrollY * 0.3}px)) rotate(4deg)`;
    }, { passive: true });
  }


  /* =============================================
     20. NOTEBOOK TYPEWRITER — cycling names
  ============================================== */
  const nbText = document.querySelector('.nb-rule');
  const fakeNames = [
    'John Doe','Mark Evans','Carlos Ruiz',
    'Ivan Petrov','Wei Zhang','Kenji Mori',
    'Pierre Dupont','Omar Khalid'
  ];
  let nameIdx = 0;

  if (nbText) {
    setInterval(() => {
      nbText.style.opacity    = '0';
      nbText.style.transition = 'opacity 0.4s';
      setTimeout(() => {
        nbText.textContent   = fakeNames[nameIdx++ % fakeNames.length];
        nbText.style.opacity = '1';
      }, 450);
    }, 3000);
  }


  /* =============================================
     21. CONSOLE EASTER EGG
  ============================================== */
  console.log(
    '%c死 DEATH NOTE: SHADOW CHRONICLE 死',
    'color:#c0392b;font-size:18px;font-weight:bold;font-family:serif'
  );
  console.log(
    '%cThe human whose name is written in this note shall die.\n\nTip: click Ryuk\'s apple meter 🍎',
    'color:#d0c8b8;font-size:13px;font-family:serif'
  );

}); // end DOMContentLoaded
