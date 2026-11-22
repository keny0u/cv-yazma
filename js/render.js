// CV'yi HTML olarak çizer. Her şablon aynı parça fonksiyonlarını farklı düzende kullanır.
window.CV = window.CV || {};

CV.render = (function () {
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const ICONS = {
    email: '<path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/>',
    phone: '<path d="M6.5 3h3l1.5 5-2 1.5a12 12 0 0 0 5.5 5.5L16 13l5 1.5v3a2 2 0 0 1-2 2A17 17 0 0 1 4.5 5a2 2 0 0 1 2-2z"/>',
    location: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    website: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
    github: '<path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5a3 3 0 0 0-.9-2.4c3-.3 6-1.5 6-6.6a5 5 0 0 0-1.4-3.6 4.7 4.7 0 0 0-.1-3.6s-1.1-.3-3.6 1.4a12.4 12.4 0 0 0-6.5 0C6 1 4.9 1.3 4.9 1.3a4.7 4.7 0 0 0-.1 3.6A5 5 0 0 0 3.4 8.5c0 5.1 3 6.3 6 6.6a3 3 0 0 0-.9 2.4V21"/>',
  };
  const icon = (name) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

  let T = CV.i18n.tr;

  function fmtMonth(v) {
    if (!v) return '';
    const [y, m] = v.split('-');
    return m ? `${T.months[parseInt(m, 10) - 1]} ${y}` : y;
  }

  function dateRange(it) {
    const start = fmtMonth(it.start);
    const end = it.current ? T.present : fmtMonth(it.end);
    if (start && end) return `${start} – ${end}`;
    return start || end;
  }

  // "-" veya "•" ile başlayan satırları madde listesine çevirir
  function richText(text) {
    if (!text || !text.trim()) return '';
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    lines.forEach((line) => {
      const t = line.trim();
      const m = t.match(/^[-•*]\s*(.*)$/);
      if (m) {
        if (!inList) { html += '<ul>'; inList = true; }
        html += `<li>${esc(m[1])}</li>`;
      } else {
        if (inList) { html += '</ul>'; inList = false; }
        if (t) html += `<p>${esc(t)}</p>`;
      }
    });
    if (inList) html += '</ul>';
    return `<div class="rich">${html}</div>`;
  }

  const cleanUrl = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const href = (u) => (/^https?:\/\//.test(u) ? u : `https://${u}`);

  function contactItems(p) {
    const items = [];
    if (p.email) items.push(['email', `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`]);
    if (p.phone) items.push(['phone', `<a href="tel:${esc(p.phone.replace(/\s/g, ''))}">${esc(p.phone)}</a>`]);
    if (p.location) items.push(['location', esc(p.location)]);
    ['website', 'linkedin', 'github'].forEach((k) => {
      if (p[k]) items.push([k, `<a href="${esc(href(p[k]))}">${esc(cleanUrl(p[k]))}</a>`]);
    });
    return items;
  }

  const contactList = (p) => {
    const items = contactItems(p);
    if (!items.length) return '';
    return `<ul class="contact">${items.map(([k, v]) => `<li>${icon(k)}<span>${v}</span></li>`).join('')}</ul>`;
  };

  const photo = (p, s) => (p.photo
    ? `<img class="photo shape-${esc(s.photoShape)}" src="${p.photo}" alt="">`
    : '');

  const section = (key, body, extra = '') => (body
    ? `<section class="cv-sec sec-${key}" ${extra}><h3>${esc(T[key])}</h3><div class="sec-body">${body}</div></section>`
    : '');

  const nonEmpty = (arr, keys) => arr.filter((it) => keys.some((k) => it[k] && String(it[k]).trim()));

  // ---- Bölüm içerikleri ----
  const parts = {
    summary: (d) => (d.summary.trim() ? richText(d.summary) : ''),

    experience: (d) => nonEmpty(d.experience, ['position', 'company', 'description']).map((it) => `
      <div class="entry">
        <div class="entry-head">
          <div><strong>${esc(it.position)}</strong>${it.company ? `<span class="org">${esc(it.company)}</span>` : ''}</div>
          <div class="meta">${esc(dateRange(it))}${it.location ? `<br>${esc(it.location)}` : ''}</div>
        </div>
        ${richText(it.description)}
      </div>`).join(''),

    education: (d) => nonEmpty(d.education, ['school', 'degree']).map((it) => `
      <div class="entry">
        <div class="entry-head">
          <div><strong>${esc(it.degree || it.school)}</strong>${it.degree && it.school ? `<span class="org">${esc(it.school)}</span>` : ''}</div>
          <div class="meta">${esc(dateRange(it))}${it.grade ? `<br>${esc(it.grade)}` : ''}</div>
        </div>
        ${richText(it.description)}
      </div>`).join(''),

    projects: (d) => nonEmpty(d.projects, ['name', 'description']).map((it) => `
      <div class="entry">
        <div class="entry-head">
          <div><strong>${esc(it.name)}</strong></div>
          ${it.link ? `<div class="meta"><a href="${esc(href(it.link))}">${esc(cleanUrl(it.link))}</a></div>` : ''}
        </div>
        ${richText(it.description)}
      </div>`).join(''),

    certificates: (d) => {
      const list = nonEmpty(d.certificates, ['name']);
      if (!list.length) return '';
      return `<ul class="plain">${list.map((it) => `
        <li><strong>${esc(it.name)}</strong>${it.issuer ? ` — ${esc(it.issuer)}` : ''}${it.date ? ` <span class="meta">${esc(fmtMonth(it.date))}</span>` : ''}</li>`).join('')}</ul>`;
    },

    skills: (d) => {
      const list = nonEmpty(d.skills, ['name']);
      if (!list.length) return '';
      return `<ul class="skills">${list.map((it) => {
        const lvl = Math.max(1, Math.min(5, parseInt(it.level, 10) || 0));
        return `<li><span class="sk-name">${esc(it.name)}</span>${meter(lvl)}</li>`;
      }).join('')}</ul>`;
    },

    languages: (d) => {
      const list = nonEmpty(d.languages, ['name']);
      if (!list.length) return '';
      return `<ul class="langs">${list.map((it) => `
        <li><span class="sk-name">${esc(it.name)}</span><span class="meta">${esc(it.level)}</span>${meter(LANG_LEVEL[it.level] || 3)}</li>`).join('')}</ul>`;
    },

    interests: (d) => {
      const tags = d.interests.split(',').map((x) => x.trim()).filter(Boolean);
      return tags.length ? `<ul class="tags">${tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '';
    },

    references: (d) => nonEmpty(d.references, ['name']).map((it) => `
      <div class="ref"><strong>${esc(it.name)}</strong>${it.role ? `<div>${esc(it.role)}</div>` : ''}${it.contact ? `<div class="meta">${esc(it.contact)}</div>` : ''}</div>`).join(''),
  };

  // Seviye göstergesi: şablona göre çubuk ya da nokta olarak görünür (CSS seçer)
  function meter(lvl) {
    const dots = [1, 2, 3, 4, 5].map((n) => `<b${n <= lvl ? ' class="on"' : ''}></b>`).join('');
    return `<span class="bar"><i style="width:${lvl * 20}%"></i></span><span class="dots">${dots}</span>`;
  }
  const LANG_LEVEL = { 'Ana dil': 5, C2: 5, C1: 4, B2: 3, B1: 3, A2: 2, A1: 1 };

  const secs = (d, keys) => keys.map((k) => section(k, parts[k](d))).join('');

  const nameBlock = (p) => `
    <h1>${esc(p.fullName) || '<span class="placeholder">Ad Soyad</span>'}</h1>
    ${p.title ? `<div class="title">${esc(p.title)}</div>` : ''}`;

  // ---- Şablonlar ----
  const templates = {
    modern(d) {
      const p = d.personal;
      return `
        <aside class="side">
          ${photo(p, d.settings)}
          ${section('contact', contactList(p))}
          ${secs(d, ['skills', 'languages', 'interests'])}
        </aside>
        <div class="main">
          <header class="cv-head">${nameBlock(p)}</header>
          ${secs(d, ['summary', 'experience', 'education', 'projects', 'certificates', 'references'])}
        </div>`;
    },

    elegant(d) {
      const p = d.personal;
      return `
        <header class="cv-head">
          <div class="band">
            ${photo(p, d.settings)}
            <div class="head-text">${nameBlock(p)}</div>
          </div>
          ${contactList(p)}
        </header>
        <div class="body">
          <div class="main">${secs(d, ['summary', 'experience', 'education', 'projects'])}</div>
          <aside class="side">${secs(d, ['skills', 'languages', 'certificates', 'interests', 'references'])}</aside>
        </div>`;
    },

    creative(d) {
      const p = d.personal;
      return `
        <header class="cv-head">
          <div class="head-text">${nameBlock(p)}</div>
          ${photo(p, d.settings)}
        </header>
        ${contactList(p)}
        <div class="body">
          <div class="main">${secs(d, ['summary', 'experience', 'education', 'projects'])}</div>
          <aside class="side">${secs(d, ['skills', 'languages', 'certificates', 'interests', 'references'])}</aside>
        </div>`;
    },

    classic(d) {
      const p = d.personal;
      return `
        <header class="cv-head">
          ${photo(p, d.settings)}
          <div class="head-text">
            ${nameBlock(p)}
            ${contactList(p)}
          </div>
        </header>
        ${secs(d, ['summary', 'experience', 'education', 'projects'])}
        <div class="cols">
          <div>${secs(d, ['skills', 'certificates'])}</div>
          <div>${secs(d, ['languages', 'interests', 'references'])}</div>
        </div>`;
    },

    minimal(d) {
      const p = d.personal;
      return `
        <header class="cv-head">
          <div class="head-text">
            ${nameBlock(p)}
            ${contactList(p)}
          </div>
          ${photo(p, d.settings)}
        </header>
        ${secs(d, ['summary', 'experience', 'education', 'projects', 'skills', 'languages', 'certificates', 'interests', 'references'])}`;
    },
  };

  return function render(el, d) {
    T = CV.i18n[d.settings.lang] || CV.i18n.tr;
    const tpl = templates[d.settings.template] ? d.settings.template : 'modern';
    el.className = `cv-page tpl-${tpl}`;
    el.style.setProperty('--accent', d.settings.color);
    el.style.setProperty('--cv-font', `'${d.settings.font}', system-ui, sans-serif`);
    el.lang = d.settings.lang;
    el.innerHTML = templates[tpl](d);
  };
})();
