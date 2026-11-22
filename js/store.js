// Durum yönetimi: tarayıcıya otomatik kayıt, JSON içe/dışa aktarma
window.CV = window.CV || {};

CV.store = (function () {
  const KEY = 'cvyazma:data';
  let state = CV.emptyState();
  const listeners = [];
  let saveTimer = null;

  // Eksik alanları varsayılanlarla tamamlar (eski/yarım JSON dosyaları için)
  function normalize(data) {
    const base = CV.emptyState();
    if (!data || typeof data !== 'object') return base;
    const out = Object.assign(base, data);
    out.settings = Object.assign(CV.emptyState().settings, data.settings);
    out.personal = Object.assign(CV.emptyState().personal, data.personal);
    CV.LIST_SECTIONS.forEach((sec) => {
      out[sec.key] = Array.isArray(data[sec.key])
        ? data[sec.key].map((it) => Object.assign(CV.newItem(sec), it))
        : [];
    });
    out.version = CV.SCHEMA_VERSION;
    return out;
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) state = normalize(JSON.parse(raw));
    } catch (e) {
      console.warn('Kayıtlı veri okunamadı:', e);
    }
    return state;
  }

  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
        emit('saved');
      } catch (e) {
        console.warn('Kaydedilemedi:', e);
        emit('save-error');
      }
    }, 300);
  }

  function emit(type) {
    listeners.forEach((fn) => fn(type, state));
  }

  return {
    load,
    get: () => state,
    // Değişiklikten sonra çağrılır: önizlemeyi yeniler ve kaydeder
    changed() {
      emit('change');
      persist();
    },
    replace(data) {
      state = normalize(data);
      emit('replace');
      persist();
    },
    subscribe: (fn) => listeners.push(fn),
    exportJSON() {
      return JSON.stringify(state, null, 2);
    },
    importJSON(text) {
      this.replace(JSON.parse(text));
    },
  };
})();

// "personal.fullName" gibi yolları okuyup yazmak için yardımcılar
CV.getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
CV.setPath = (obj, path, value) => {
  const keys = path.split('.');
  const last = keys.pop();
  keys.reduce((o, k) => o[k], obj)[last] = value;
};
