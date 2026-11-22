// "Örnek veri" butonunun doldurduğu kurgusal CV
window.CV = window.CV || {};

CV.sampleState = function () {
  const s = CV.emptyState();
  s.personal = {
    fullName: 'Deniz Aydın',
    title: 'Full Stack Geliştirici',
    email: 'deniz.aydin@ornek.com',
    phone: '+90 555 123 45 67',
    location: 'İzmir, Türkiye',
    website: 'denizaydin.dev',
    linkedin: 'linkedin.com/in/denizaydin',
    github: 'github.com/denizaydin',
    photo: 'assets/ornek-foto.svg',
  };
  s.summary = 'Web ve mobil uygulamalarda 6 yıllık deneyime sahip full stack geliştirici. '
    + 'Kullanıcı odaklı arayüzler, ölçeklenebilir API’ler ve ekip içi mentorluk konularında güçlüyüm. '
    + 'Ürün ekipleriyle yakın çalışarak fikirleri hızla canlıya taşımayı seviyorum.';
  s.experience = [
    { id: 'e1', position: 'Kıdemli Yazılım Geliştirici', company: 'Örnek Teknoloji A.Ş.', location: 'İzmir',
      start: '2022-03', end: '', current: true,
      description: '- React ve Node.js ile müşteri paneli yeniden yazıldı, sayfa açılışı %45 hızlandı\n- 4 kişilik ekibe teknik liderlik ve kod inceleme süreçleri\n- CI/CD hattı kurularak dağıtım süresi 30 dakikadan 5 dakikaya indi' },
    { id: 'e2', position: 'Yazılım Geliştirici', company: 'Dijital Ajans Ltd.', location: 'İstanbul',
      start: '2019-07', end: '2022-02', current: false,
      description: '- 20’den fazla kurumsal web projesinin geliştirilmesi\n- REST API ve yönetim paneli tasarımı' },
  ];
  s.education = [
    { id: 'ed1', school: 'Ege Üniversitesi', degree: 'Bilgisayar Mühendisliği, Lisans',
      start: '2015-09', end: '2019-06', current: false, grade: '3.42 / 4.00', description: '' },
  ];
  s.projects = [
    { id: 'p1', name: 'Açık kaynak CV oluşturucu', link: 'github.com/denizaydin/cv',
      description: 'Tarayıcıda çalışan, fotoğraflı ve çok şablonlu CV hazırlama aracı.' },
  ];
  s.certificates = [
    { id: 'c1', name: 'AWS Certified Developer – Associate', issuer: 'Amazon Web Services', date: '2023-05' },
  ];
  s.skills = [
    { id: 's1', name: 'JavaScript / TypeScript', level: 5 },
    { id: 's2', name: 'React', level: 5 },
    { id: 's3', name: 'Node.js', level: 4 },
    { id: 's4', name: 'PostgreSQL', level: 4 },
    { id: 's5', name: 'Docker', level: 3 },
  ];
  s.languages = [
    { id: 'l1', name: 'Türkçe', level: 'Ana dil' },
    { id: 'l2', name: 'İngilizce', level: 'C1' },
    { id: 'l3', name: 'Almanca', level: 'A2' },
  ];
  s.interests = 'Fotoğrafçılık, Doğa yürüyüşü, Satranç';
  return s;
};
