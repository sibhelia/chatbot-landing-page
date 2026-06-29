/**
 * Uygulama sahneleri (giriş slaytı — her 3 sn'de bir otomatik değişir)
 * color → parçacık shader'ına geçen hedef renk (marka yeşili / beyaz / lacivert)
 */
export const SCENES = [
  {
    id: 0,
    line1: 'KURUMSAL',
    line2: 'ASİSTAN',
    subtitle: 'BELGELERİNİZİ SANİYELER İÇİNDE DOĞRU YANITA DÖNÜŞTÜRÜN',
    color: '#d1fae5',  // nane beyazı
  },
  {
    id: 1,
    line1: 'AGENTIC',
    line2: 'RAG',
    subtitle: 'ANLAMSAL ARAMA + ONAYLI YANIT — KURUMSAL BİLGİ BANKASI',
    color: '#34d399',  // zümrüt
  },
  {
    id: 2,
    line1: 'DOĞRU VE',
    line2: 'GÜVENİLİR',
    subtitle: 'KAYNAĞA DAYALI, DENETLENEN YAPAY ZEKA YANITLARI',
    color: '#10b981',  // marka yeşili ışıltısı
  },
  {
    id: 3,
    line1: '',
    line2: 'QABOT',
    subtitle: 'KURUMSAL BİLGİYE AKILLI ERİŞİM PLATFORMU',
    color: '#60a5fa',  // lacivert/mavi vurgu
  },
]
