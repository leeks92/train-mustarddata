import type { Metadata } from 'next';
import { getStations, getItxRoutes } from '@/lib/data';
import TrainListClient from '@/components/TrainListClient';

export const metadata: Metadata = {
  title: 'ITX 시간표 - ITX-새마을·ITX-청춘 운행정보',
  description:
    '전국 ITX-새마을, ITX-청춘, ITX-마음 시간표와 요금 정보. 주요 도시 ITX 운행 시간표를 확인하세요.',
  alternates: {
    canonical: 'https://train.mustarddata.com/ITX/schedule/',
  },
  openGraph: {
    title: 'ITX 시간표 - ITX-새마을·ITX-청춘 운행정보',
    description: '전국 ITX-새마을, ITX-청춘, ITX-마음 시간표와 요금 정보. 주요 도시 ITX 운행 시간표.',
    url: 'https://train.mustarddata.com/ITX/schedule/',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'ITX 시간표 - ITX-새마을·ITX-청춘 운행정보',
    description: '전국 ITX-새마을, ITX-청춘, ITX-마음 시간표와 요금 정보.',
  },
};

export default function ITXListPage() {
  const stations = getStations();
  const routes = getItxRoutes();

  return (
    <TrainListClient
      stations={stations}
      routes={routes}
      config={{
        title: 'ITX 시간표',
        subtitle: 'ITX-새마을·ITX-청춘·ITX-마음',
        pathPrefix: '/ITX/schedule',
        searchPlaceholder: '역 이름 검색 (예: 서울, 춘천, 청량리)',
        color: 'sky',
      }}
    />
  );
}
