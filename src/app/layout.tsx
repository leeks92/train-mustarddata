import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BASE_URL = 'https://train.mustarddata.com';
const GA_ID = 'G-PLACEHOLDER'; // Google Analytics 측정 ID

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#059669',
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: '전국 KTX·열차 시간표 조회 - 요금, 소요시간, 첫차 막차',
    template: '%s | 기차 시간표',
  },
  description:
    '전국 KTX, SRT, ITX, 무궁화호 열차 시간표와 요금 정보를 무료로 조회하세요. 서울, 부산, 대구, 대전, 광주송정, 강릉 등 전국 기차역 운행 정보, 첫차·막차 시간, 열차 요금 비교. 코레일(KORAIL) 예매 안내.',
  keywords: [
    'KTX 시간표',
    '기차 시간표',
    '열차 요금',
    '기차역',
    '서울 부산 KTX',
    '서울 강릉 KTX',
    '서울 대전 KTX',
    '서울 광주 KTX',
    'KTX 예매',
    '열차 예매',
    '기차 첫차',
    '기차 막차',
    'KTX 요금',
    'SRT 시간표',
    'SRT 요금',
    'SRT 예매',
    '수서 SRT',
    '수서 부산 SRT',
    'ITX 시간표',
    'ITX-새마을',
    'ITX-청춘',
    'ITX 요금',
    '무궁화호 시간표',
    '무궁화호 요금',
    '누리로 시간표',
    '코레일',
    'KORAIL',
    '열차 시간표',
    '기차표 예매',
  ],
  alternates: {
    canonical: BASE_URL,
    types: {
      'application/rss+xml': `${BASE_URL}/feed.xml`,
    },
  },
  openGraph: {
    title: '전국 KTX·열차 시간표 - 요금, 첫차, 막차 조회',
    description: '전국 열차 시간표와 요금 정보를 무료로 조회하세요. 서울, 부산, 대구, 대전, 광주송정, 강릉 등 전국 기차역 운행 정보 제공.',
    type: 'website',
    locale: 'ko_KR',
    url: BASE_URL,
    siteName: '전국 기차 시간표',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '전국 KTX 열차 시간표 조회',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '전국 KTX·열차 시간표',
    description: '전국 열차 시간표와 요금 정보를 무료로 조회하세요.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: '교통',
  creator: 'MustardData',
  publisher: 'MustardData',
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: false,
  },
  other: {
    'naver-site-verification': '',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="google-adsense-account" content="ca-pub-9325661912203986" />
        {/* 네이버 SEO 최적화 메타태그 (naver-site-verification은 metadata.other에서 설정) */}
        <meta name="NaverBot" content="All" />
        <meta name="NaverBot" content="index,follow" />
        <meta name="Yeti" content="All" />
        <meta name="Yeti" content="index,follow" />
        {/* 다음 SEO */}
        <meta name="daumsa" content="index,follow" />
        {/* 모바일 최적화 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="기차 시간표" />
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.letskorail.com" />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `}
        </Script>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
