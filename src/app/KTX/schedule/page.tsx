import type { Metadata } from 'next';
import { getStations, getKtxRoutes } from '@/lib/data';
import TrainListClient from '@/components/TrainListClient';

export const metadata: Metadata = {
  title: 'KTX 시간표 - 전국 KTX 역 운행정보',
  description:
    '전국 KTX 역 시간표와 요금 정보. 서울, 부산, 대구, 대전, 광주 등 주요 도시 KTX 운행 시간표를 확인하세요.',
  alternates: {
    canonical: 'https://train.mustarddata.com/KTX/schedule/',
  },
  openGraph: {
    title: 'KTX 시간표 - 전국 KTX 역 운행정보',
    description: '전국 KTX 역 시간표와 요금 정보. 서울, 부산, 대구, 대전, 광주 등 주요 도시 KTX 운행 시간표.',
    url: 'https://train.mustarddata.com/KTX/schedule/',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'KTX 시간표 - 전국 KTX 역 운행정보',
    description: '전국 KTX 역 시간표와 요금 정보. 주요 도시 KTX 운행 시간표를 확인하세요.',
  },
};

export default function KTXListPage() {
  const stations = getStations();
  const routes = getKtxRoutes();

  return (
    <TrainListClient
      stations={stations}
      routes={routes}
      config={{
        title: 'KTX 시간표',
        pathPrefix: '/KTX/schedule',
        searchPlaceholder: '역 이름 검색 (예: 서울, 부산)',
        color: 'emerald',
      }}
    />
  );
}
