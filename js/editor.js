// Sol paneldeki form: alanları duruma bağlar, liste bölümlerini ve fotoğrafı yönetir
window.CV = window.CV || {};

CV.editor = (function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const state = () => CV.store.get();

  // ---- Basit alanlar: data-bind="personal.fullName" ve data-setting="template" ----
  function bindSimpleFields() {
    const fontSel = $('#set-font');
    CV.FONTS.forEach((f) => fontSel.add(new Option(f, f)));
    $$('[data-bind]').forEach((input) => {
      input.addEventListener('input', () => {
        CV.setPath(state(), input.dataset.bind, input.value);
        CV.store.changed();
      });
    });
    $$('[data-setting]').forEach((input) => {
      input.addEventListener('change', () => {
        state().settings[input.dataset.setting] = input.value;
        CV.store.changed();
      });
    });
  }

  function fillSimpleFields() {
    $$('[data-bind]').forEach((input) => {
      input.value = CV.getPath(state(), input.dataset.bind) || '';
    });
    $$('[data-setting]').forEach((input) => {
      input.value = state().settings[input.dataset.setting];
    });
    renderSwatches();
    renderTemplatePicker();
    renderPhoto();
  }

  // ---- Şablon seçici: her şablon için küçük bir SVG taslak ----
  const L = (x, y, w, fill = '#cbd5e1', h = 2.4) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.2" fill="${fill}"/>`;
  const INK = '#1e293b';
  const lines = (x, y, widths, fill) => widths.map((w, i) => L(x, y + i * 5, w, fill)).join('');
  const THUMBS = {
    modern: `<rect width="20" height="80" fill="currentColor"/><circle cx="10" cy="12" r="5.5" fill="#fff" opacity=".85"/>
      ${lines(4, 24, [12, 10, 12, 8], 'rgba(255,255,255,.55)')}${lines(4, 48, [12, 9, 11], 'rgba(255,255,255,.55)')}
      ${L(25, 8, 26, INK, 4)}${L(25, 15, 16, 'currentColor')}${lines(25, 24, [30, 28, 30, 22])}${lines(25, 48, [30, 26, 30, 20])}`,
    elegant: `<rect width="60" height="22" fill="currentColor"/><rect width="60" height="22" fill="#000" opacity=".35"/>
      <circle cx="12" cy="11" r="6" fill="#fff" opacity=".9"/>${L(22, 7, 24, '#fff', 3.5)}${L(22, 13, 14, 'rgba(255,255,255,.6)')}
      <rect x="40" y="22" width="20" height="58" fill="currentColor" opacity=".09"/>
      ${lines(5, 29, [30, 28, 31, 24, 30, 27, 22])}${lines(44, 29, [12, 10, 12, 8, 11], 'currentColor')}`,
    creative: `<path d="M0 0h60v20L0 30z" fill="currentColor"/><rect x="38" y="13" width="16" height="16" rx="4" fill="#e2e8f0" stroke="#fff" stroke-width="1.5"/>
      ${L(5, 8, 24, '#fff', 4)}${L(5, 15, 14, 'rgba(255,255,255,.7)')}
      ${L(5, 36, 12, 'currentColor', 3)}${lines(5, 43, [32, 30, 32, 26, 30])}${lines(42, 36, [13, 10, 13, 9, 12, 10])}`,
    classic: `<circle cx="12" cy="12" r="6.5" fill="#e2e8f0"/>${L(23, 8, 26, INK, 4)}${L(23, 15, 18, 'currentColor')}
      <rect x="5" y="23" width="50" height="1.2" fill="currentColor"/>${lines(5, 30, [50, 46, 50, 40, 48, 44, 50, 36])}`,
    minimal: `${L(5, 7, 28, INK, 4.5)}${L(5, 15, 18, '#94a3b8')}<rect x="44" y="6" width="11" height="11" rx="2" fill="#e2e8f0"/>
      ${[24, 40, 56].map((y) => `<rect x="5" y="${y - 3}" width="50" height=".7" fill="#e2e8f0"/>${L(5, y, 9, 'currentColor', 2)}${lines(18, y, [37, 33, 35])}`).join('')}`,
  };

  function renderTemplatePicker() {
    const box = $('#tpl-picker');
    const current = state().settings.template;
    box.innerHTML = '';
    CV.TEMPLATES.forEach((t) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tpl' + (t.id === current ? ' active' : '');
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-checked', t.id === current);
      b.innerHTML = `<svg viewBox="0 0 60 80" aria-hidden="true">${THUMBS[t.id]}</svg><span>${t.name}</span>`;
      b.onclick = () => { state().settings.template = t.id; CV.store.changed(); renderTemplatePicker(); };
      box.appendChild(b);
    });
  }

  // ---- Renk seçimi ----
  function renderSwatches() {
    const box = $('#swatches');
    const current = state().settings.color;
    box.innerHTML = '';
    CV.COLORS.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch' + (c === current ? ' active' : '');
      b.style.background = c;
      b.title = c;
      b.setAttribute('aria-label', `Renk ${c}`);
      b.onclick = () => { state().settings.color = c; CV.store.changed(); renderSwatches(); };
      box.appendChild(b);
    });
    // Özel renk
    const custom = document.createElement('input');
    custom.type = 'color';
    custom.className = 'swatch custom' + (CV.COLORS.includes(current) ? '' : ' active');
    custom.value = current;
    custom.title = 'Özel renk';
    custom.oninput = () => { state().settings.color = custom.value; CV.store.changed(); };
    custom.onchange = renderSwatches;
    custom.setAttribute('aria-label', 'Özel renk');
    box.appendChild(custom);
  }

  // ---- Fotoğraf ----
  // Fotoğrafı ortadan kare kırpıp küçültür; localStorage'da az yer kaplasın
  function resizeImage(file, size = 480) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const side = Math.min(img.width, img.height);
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = Math.min(size, side);
          canvas.getContext('2d').drawImage(
            img, (img.width - side) / 2, (img.height - side) / 2, side, side,
            0, 0, canvas.width, canvas.height,
          );
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async function setPhoto(file) {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      state().personal.photo = await resizeImage(file);
      CV.store.changed();
      renderPhoto();
    } catch (e) {
      alert('Fotoğraf okunamadı. Lütfen başka bir dosya deneyin.');
    }
  }

  function renderPhoto() {
    const src = state().personal.photo;
    const img = $('#photo-preview');
    img.hidden = !src;
    $('#photo-placeholder').hidden = !!src;
    if (src) img.src = src; else img.removeAttribute('src');
  }

  function bindPhoto() {
    const input = $('#photo-file');
    const drop = $('#photo-drop');
    const pick = () => input.click();
    $('[data-action="photo-pick"]').onclick = pick;
    drop.onclick = pick;
    drop.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } };
    input.onchange = () => { setPhoto(input.files[0]); input.value = ''; };
    $('[data-action="photo-remove"]').onclick = () => {
      state().personal.photo = '';
      CV.store.changed();
      renderPhoto();
    };
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => {
      e.preventDefault(); drop.classList.add('over');
    }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => {
      e.preventDefault(); drop.classList.remove('over');
    }));
    drop.addEventListener('drop', (e) => setPhoto(e.dataTransfer.files[0]));
  }

  // ---- Liste bölümleri ----
  function fieldControl(field, item, onChange) {
    const wrap = document.createElement('label');
    wrap.className = 'field' + (field.full ? ' full' : '') + (field.type === 'checkbox' ? ' check' : '');
    const span = document.createElement('span');
    span.textContent = field.label;
    let input;

    if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.rows = 4;
    } else if (field.type === 'select') {
      input = document.createElement('select');
      field.options.forEach((o) => input.add(new Option(o, o)));
    } else {
      input = document.createElement('input');
      input.type = field.type || 'text';
      if (field.type === 'range') { input.min = field.min; input.max = field.max; input.step = 1; }
    }
    if (field.placeholder) input.placeholder = field.placeholder;

    if (field.type === 'checkbox') {
      input.checked = !!item[field.key];
      input.addEventListener('change', () => { item[field.key] = input.checked; onChange(); });
      wrap.append(input, span);
    } else {
      input.value = item[field.key] == null ? '' : item[field.key];
      const evt = field.type === 'select' ? 'change' : 'input';
      input.addEventListener(evt, () => {
        item[field.key] = field.type === 'range' ? parseInt(input.value, 10) : input.value;
        onChange();
      });
      wrap.append(span, input);
      if (field.type === 'range') {
        const out = document.createElement('output');
        out.textContent = input.value;
        input.addEventListener('input', () => { out.textContent = input.value; });
        span.append(' ', out);
      }
    }
    input.dataset.key = field.key;
    return wrap;
  }

  function iconButton(name, title, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'icon-btn' + (name === 'x' ? ' del' : '');
    b.innerHTML = CV.icon(name);
    b.title = title;
    b.setAttribute('aria-label', title);
    b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); onClick(); });
    return b;
  }

  const fmt = (v) => (v ? v.split('-').reverse().join('.') : '');
  // Kapalı öğede başlığın altında görünen kısa bilgi (tarih, seviye)
  function subText(it) {
    if ('start' in it) {
      const end = it.current ? 'Halen' : fmt(it.end);
      return [fmt(it.start), end].filter(Boolean).join(' – ');
    }
    if (typeof it.level === 'number') return `Seviye ${it.level} / 5`;
    if (it.level) return it.level;
    return it.issuer || it.role || it.link || '';
  }

  function renderListSection(sec, root, openId) {
    const list = state()[sec.key];
    const itemsEl = $('.items', root);
    itemsEl.innerHTML = '';
    $('.count', root).textContent = list.length;

    list.forEach((item, index) => {
      const det = document.createElement('details');
      det.className = 'item' + (sec.compact ? ' compact' : '');
      det.open = item.id === openId;

      const sum = document.createElement('summary');
      const chev = document.createElement('span');
      chev.className = 'item-chev';
      chev.innerHTML = CV.icon('down').replace('class="i"', 'class="i" style="transform:rotate(-90deg)"');
      const text = document.createElement('span');
      text.className = 'item-text';
      const label = document.createElement('span');
      label.className = 'item-label';
      label.textContent = sec.label(item);
      const sub = document.createElement('span');
      sub.className = 'item-sub';
      sub.textContent = subText(item);
      text.append(label, sub);
      const tools = document.createElement('span');
      tools.className = 'item-tools';
      const rerender = () => renderListSection(sec, root, item.id);
      tools.append(
        iconButton('up', 'Yukarı taşı', () => {
          if (index === 0) return;
          [list[index - 1], list[index]] = [list[index], list[index - 1]];
          CV.store.changed(); rerender();
        }),
        iconButton('down', 'Aşağı taşı', () => {
          if (index === list.length - 1) return;
          [list[index + 1], list[index]] = [list[index], list[index + 1]];
          CV.store.changed(); rerender();
        }),
        iconButton('x', 'Sil', () => {
          if (!confirm(`"${sec.label(item)}" silinsin mi?`)) return;
          list.splice(index, 1);
          CV.store.changed(); renderListSection(sec, root);
        }),
      );
      sum.append(chev, text, tools);

      const grid = document.createElement('div');
      grid.className = 'grid';
      const onChange = () => {
        label.textContent = sec.label(item);
        sub.textContent = subText(item);
        // "Halen" işaretliyse bitiş tarihi devre dışı
        const end = $('[data-key="end"]', grid);
        if (end) end.disabled = !!item.current;
        CV.store.changed();
      };
      sec.fields.forEach((f) => grid.appendChild(fieldControl(f, item, onChange)));
      const end = $('[data-key="end"]', grid);
      if (end) end.disabled = !!item.current;

      det.append(sum, grid);
      itemsEl.appendChild(det);
    });
  }

  const sectionRoots = {};

  function buildListSections() {
    const host = $('#list-sections');
    const tpl = $('#tpl-list-section');
    CV.LIST_SECTIONS.forEach((sec) => {
      const root = tpl.content.firstElementChild.cloneNode(true);
      $('h2', root).innerHTML = `${CV.icon(sec.icon)}<span>${sec.title}</span>`;
      const add = $('[data-role="add"]', root);
      add.innerHTML = `${CV.icon('plus')}<span>${sec.addLabel || 'Ekle'}</span>`;
      add.onclick = () => {
        const item = CV.newItem(sec);
        state()[sec.key].push(item);
        CV.store.changed();
        renderListSection(sec, root, item.id);
        const first = $('details:last-child input, details:last-child textarea', root);
        if (first) first.focus();
      };
      sectionRoots[sec.key] = root;
      host.appendChild(root);
    });
  }

  function renderAllLists() {
    CV.LIST_SECTIONS.forEach((sec) => renderListSection(sec, sectionRoots[sec.key]));
  }

  return {
    init() {
      bindSimpleFields();
      bindPhoto();
      buildListSections();
      this.refresh();
    },
    // Tüm formu durumdan yeniden doldurur (içe aktarma, örnek veri, temizleme sonrası)
    refresh() {
      fillSimpleFields();
      renderAllLists();
    },
  };
})();
