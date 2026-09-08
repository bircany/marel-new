import Image from 'next/image';

export const metadata = {
  title: 'Bakım Çalışması | Marel',
  description: 'Sitemizde bakım çalışması yapılmaktadır.',
  robots: { index: false, follow: false },
};

export default function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: '#f8fafc',
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '500px',
        backgroundColor: '#ffffff',
        padding: '3rem 2rem',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
      }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
          Kısa Bir Bakım Molası!
        </h1>
        <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Size daha iyi hizmet verebilmek için sitemizde teknik altyapı çalışmaları ve güncellemeler yapıyoruz.
        </p>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Kısa süre içerisinde tekrar aktif olacağız. Anlayışınız için teşekkür ederiz.
        </p>
        
        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
            &copy; {new Date().getFullYear()} Marel. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
}
