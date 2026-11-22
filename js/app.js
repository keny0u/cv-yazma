// Uygulama girişi: üst menü işlemleri, önizleme yakınlaştırma ve kayıt durumu
(function () {
  const $ = (sel) => document.querySelector(sel);
  const cvEl = $('#cv');
  const stage = $('#preview-stage');
  const scaler = $('#preview-scaler');

  // data-icon="..." olan öğelere ikon ekle; buton metnini daraltılabilir etikete sar
  document.querySelectorAll('[data-icon]').forEach((el) => {
    const text = el.textContent.trim();
    if (el.matches('.btn, .seg') && text && !el.querySelector('.sr')) {
      el.innerHTML = `<span class="label">${text}</span>`;
      if (!el.title) el.title = text;
    }
    el.insertAdjacentHTML('afterbegin', CV.icon(el.dataset.icon));
  });

  const hadData = CV.store.load().personal.fullName !== '';
  CV.editor.init();

  // ---- Önizleme ve yakınlaştırma ----
  let zoom = 'fit';
  const zoomLabel = $('#zoom-value');

  function fitPreview() {
    const pageWidth = cvEl.offsetWidth;
    const fit = Math.min(1.2, (stage.clientWidth - 48) / pageWidth);
    const scale = zoom === 'fit' ? fit : zoom;
    scaler.style.transform = `scale(${scale})`;
    scaler.style.height = `${cvEl.offsetHeight * scale}px`;
    scaler.style.width = `${pageWidth * scale}px`;
    zoomLabel.textContent = zoom === 'fit' ? `Sığdır · ${Math.round(scale * 100)}%` : `${Math.round(scale * 100)}%`;
    return scale;
  }

  document.querySelectorAll('[data-zoom]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = fitPreview();
      const step = btn.dataset.zoom;
      if (step === 'fit') zoom = 'fit';
      else zoom = Math.min(2, Math.max(0.3, Math.round((current + (step === '+' ? 0.1 : -0.1)) * 10) / 10));
      fitPreview();
    });
  });

  function draw() {
    const data = CV.store.get();
    CV.render(cvEl, data);
    // Arayüzün vurgu rengi CV rengini izler
    document.documentElement.style.setProperty('--primary', data.settings.color);
    fitPreview();
  }

  // ---- Kayıt durumu ----
  const status = $('#save-status');
  const idleText = status.textContent;
  let statusTimer;
  CV.store.subscribe((type) => {
    if (type === 'change' || type === 'replace') draw();
    if (type === 'replace') CV.editor.refresh();
    if (type === 'saved') {
      status.textContent = 'Kaydedildi';
      status.classList.add('ok');
      clearTimeout(statusTimer);
      statusTimer = setTimeout(() => { status.textContent = idleText; status.classList.remove('ok'); }, 1800);
    }
    if (type === 'save-error') status.textContent = 'Kaydedilemedi: tarayıcı depolaması dolu olabilir';
  });

  // ---- Dar ekranda Düzenle / Önizle ----
  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.body.classList.toggle('show-preview', btn.dataset.view === 'preview');
      document.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('active', b === btn));
      fitPreview();
    });
  });

  function download(filename, text) {
    const blob = new Blob([text], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  const slug = (s) => (s || 'cv').toLowerCase()
    .replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' }[c]))
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'cv';

  const actions = {
    sample() {
      if (!confirm('Mevcut verilerin yerine örnek CV yüklensin mi?')) return;
      const keepPhoto = CV.store.get().personal.photo;
      const s = CV.sampleState();
      s.settings = CV.store.get().settings;
      if (keepPhoto) s.personal.photo = keepPhoto;
      CV.store.replace(s);
    },
    export() {
      const name = slug(CV.store.get().personal.fullName);
      download(`cv-${name}.json`, CV.store.exportJSON());
    },
    import() {
      $('#import-file').click();
    },
    reset() {
      if (!confirm('Tüm CV verileri silinecek. Emin misiniz?')) return;
      CV.store.replace(CV.emptyState());
    },
    print() {
      // PDF dosya adı sayfa başlığından gelir
      const old = document.title;
      const name = CV.store.get().personal.fullName;
      document.title = name ? `${name} - CV` : 'CV';
      window.print();
      document.title = old;
    },
  };

  document.querySelectorAll('[data-action]').forEach((btn) => {
    const fn = actions[btn.dataset.action];
    if (fn) btn.addEventListener('click', fn);
  });

  $('#import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    file.text().then((text) => {
      try {
        CV.store.importJSON(text);
      } catch (err) {
        alert('Dosya okunamadı: geçerli bir CV yedek dosyası değil.');
      }
    });
  });

  window.addEventListener('resize', fitPreview);
  if (document.fonts) document.fonts.ready.then(fitPreview);
  // Görsel yüklenince yükseklik değişebilir
  cvEl.addEventListener('load', fitPreview, true);

  // Tanıtım bağlantısı: ".../#ornek" boş bir tarayıcıda örnek CV'yi açar, mevcut veriye dokunmaz
  if (location.hash === '#ornek' && !hadData) CV.store.replace(CV.sampleState());
  else draw();
})();
