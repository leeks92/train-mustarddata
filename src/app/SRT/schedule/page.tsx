import type { Metadata } from 'next';
import { getStations, getSrtRoutes } from '@/lib/data';
import TrainListClient from '@/components/TrainListClient';

export const metadata: Metadata = {
  title: 'SRT 시간표 - 전국 SRT 역 운행정보',
  description:
    '전국 SRT 역 시간표와 요금 정보. 수서, 부산, 대구, 대전, 광주 등 주요 도시 SRT 운행 시간표를 확인하세요.',
  alternates: {
    canonical: 'https://train.mustarddata.com/SRT/schedule/',
  },
  openGraph: {
    title: 'SRT 시간표 - 전국 SRT 역 운행정보',
    description: '전국 SRT 역 시간표와 요금 정보. 수서, 부산, 대구, 대전, 광주 등 주요 도시 SRT 운행 시간표.',
    url: 'https://train.mustarddata.com/SRT/schedule/',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'SRT 시간표 - 전국 SRT 역 운행정보',
    description: '전국 SRT 역 시간표와 요금 정보. 주요 도시 SRT 운행 시간표를 확인하세요.',
  },
};

export default function SRTListPage() {
  const stations = getStations();
  const routes = getSrtRoutes();

  return (
    <TrainListClient
      stations={stations}
      routes={routes}
      config={{
        title: 'SRT 시간표',
        pathPrefix: '/SRT/schedule',
        searchPlaceholder: '역 이름 검색 (예: 수서, 부산)',
        color: 'purple',
      }}
    />
  );
}
