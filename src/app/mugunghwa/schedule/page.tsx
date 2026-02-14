import type { Metadata } from 'next';
import { getStations, getMugunghwaRoutes } from '@/lib/data';
import TrainListClient from '@/components/TrainListClient';

export const metadata: Metadata = {
  title: '무궁화호·누리로 시간표 - 전국 운행정보',
  description: '전국 무궁화호, 누리로 열차 시간표와 요금 정보. 저렴한 요금으로 전국 주요 도시를 연결하는 무궁화호 운행 시간표.',
  alternates: { canonical: 'https://train.mustarddata.com/mugunghwa/schedule' },
};

export default function MugunghwaListPage() {
  const stations = getStations();
  const routes = getMugunghwaRoutes();

  return (
    <TrainListClient
      stations={stations}
      routes={routes}
      config={{
        title: '무궁화호·누리로 시간표',
        description: '저렴한 요금, 전국 구석구석 연결',
        pathPrefix: '/mugunghwa/schedule',
        searchPlaceholder: '역 이름 검색 (예: 서울, 대전, 경주)',
        color: 'orange',
      }}
    />
  );
}
