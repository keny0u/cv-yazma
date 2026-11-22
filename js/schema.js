// Veri modeli: boş CV ve düzenleyicideki liste bölümlerinin alan tanımları
window.CV = window.CV || {};

CV.SCHEMA_VERSION = 1;

// Koyu, beyaz yazıyla okunaklı tonlar
CV.COLORS = ['#1d4ed8', '#0f766e', '#4338ca', '#9f1239', '#b45309', '#1e293b', '#0e7490', '#166534', '#86198f'];

CV.TEMPLATES = [
  { id: 'modern', name: 'Modern' },
  { id: 'elegant', name: 'Şık' },
  { id: 'creative', name: 'Yaratıcı' },
  { id: 'classic', name: 'Klasik' },
  { id: 'minimal', name: 'Minimal' },
];

CV.FONTS = ['Plus Jakarta Sans', 'Outfit', 'DM Sans', 'Inter', 'Roboto', 'Poppins', 'Lora', 'Merriweather'];

CV.emptyState = function () {
  return {
    version: CV.SCHEMA_VERSION,
    settings: {
      template: 'modern',
      color: CV.COLORS[0],
      font: 'Plus Jakarta Sans',
      lang: 'tr',
      photoShape: 'circle',
    },
    personal: {
      fullName: '', title: '', email: '', phone: '',
      location: '', website: '', linkedin: '', github: '',
      photo: '',
    },
    summary: '',
    experience: [],
    education: [],
    projects: [],
    certificates: [],
    skills: [],
    languages: [],
    references: [],
    interests: '',
  };
};

// Her liste bölümü için düzenleyici formu buradan üretilir.
// Yeni bir bölüm eklemek için: buraya tanım + emptyState'e dizi + render.js'e çıktı.
CV.LIST_SECTIONS = [
  {
    key: 'experience',
    addLabel: 'Deneyim ekle',
    icon: 'briefcase',
    title: 'İş deneyimi',
    label: (it) => [it.position, it.company].filter(Boolean).join(' · ') || 'Yeni deneyim',
    fields: [
      { key: 'position', label: 'Pozisyon', placeholder: 'Kıdemli Frontend Geliştirici' },
      { key: 'company', label: 'Şirket', placeholder: 'Şirket A.Ş.' },
      { key: 'location', label: 'Konum', placeholder: 'İstanbul' },
      { key: 'start', label: 'Başlangıç', type: 'month' },
      { key: 'end', label: 'Bitiş', type: 'month' },
      { key: 'current', label: 'Halen burada çalışıyorum', type: 'checkbox' },
      { key: 'description', label: 'Açıklama (her satır "-" ile başlarsa madde olur)', type: 'textarea', full: true,
        placeholder: '- Yaptığınız işleri ve başarılarınızı yazın\n- Mümkünse rakamlarla ölçün' },
    ],
  },
  {
    key: 'education',
    addLabel: 'Eğitim ekle',
    icon: 'cap',
    title: 'Eğitim',
    label: (it) => [it.school, it.degree].filter(Boolean).join(' · ') || 'Yeni eğitim',
    fields: [
      { key: 'school', label: 'Okul', placeholder: 'Örnek Üniversitesi' },
      { key: 'degree', label: 'Derece / Bölüm', placeholder: 'Bilgisayar Mühendisliği, Lisans' },
      { key: 'start', label: 'Başlangıç', type: 'month' },
      { key: 'end', label: 'Bitiş', type: 'month' },
      { key: 'current', label: 'Devam ediyor', type: 'checkbox' },
      { key: 'grade', label: 'Not ortalaması', placeholder: '3.45 / 4.00' },
      { key: 'description', label: 'Açıklama', type: 'textarea', full: true },
    ],
  },
  {
    key: 'projects',
    addLabel: 'Proje ekle',
    icon: 'folder',
    title: 'Projeler',
    label: (it) => it.name || 'Yeni proje',
    fields: [
      { key: 'name', label: 'Proje adı', placeholder: 'Kişisel blog' },
      { key: 'link', label: 'Bağlantı', placeholder: 'github.com/kullanici/proje' },
      { key: 'description', label: 'Açıklama', type: 'textarea', full: true },
    ],
  },
  {
    key: 'certificates',
    addLabel: 'Sertifika ekle',
    icon: 'award',
    title: 'Sertifikalar',
    label: (it) => it.name || 'Yeni sertifika',
    fields: [
      { key: 'name', label: 'Sertifika', placeholder: 'AWS Cloud Practitioner' },
      { key: 'issuer', label: 'Veren kurum', placeholder: 'Amazon Web Services' },
      { key: 'date', label: 'Tarih', type: 'month' },
    ],
  },
  {
    key: 'skills',
    addLabel: 'Yetenek ekle',
    icon: 'bolt',
    title: 'Yetenekler',
    compact: true,
    label: (it) => it.name || 'Yeni yetenek',
    fields: [
      { key: 'name', label: 'Yetenek', placeholder: 'JavaScript' },
      { key: 'level', label: 'Seviye (1–5)', type: 'range', min: 1, max: 5, default: 4 },
    ],
  },
  {
    key: 'languages',
    addLabel: 'Dil ekle',
    icon: 'globe',
    title: 'Diller',
    compact: true,
    label: (it) => it.name || 'Yeni dil',
    fields: [
      { key: 'name', label: 'Dil', placeholder: 'İngilizce' },
      { key: 'level', label: 'Seviye', type: 'select', default: 'B2',
        options: ['Ana dil', 'C2', 'C1', 'B2', 'B1', 'A2', 'A1'] },
    ],
  },
  {
    key: 'references',
    addLabel: 'Referans ekle',
    icon: 'users',
    title: 'Referanslar',
    label: (it) => it.name || 'Yeni referans',
    fields: [
      { key: 'name', label: 'Ad Soyad' },
      { key: 'role', label: 'Ünvan / Şirket' },
      { key: 'contact', label: 'İletişim', placeholder: 'e-posta veya telefon' },
    ],
  },
];

CV.newItem = function (section) {
  const item = { id: Math.random().toString(36).slice(2, 10) };
  section.fields.forEach((f) => {
    if (f.type === 'checkbox') item[f.key] = false;
    else item[f.key] = f.default !== undefined ? f.default : '';
  });
  return item;
};
