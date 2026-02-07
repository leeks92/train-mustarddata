import type { Metadata } from 'next';
import { getStations, getMugunghwaRoutes } from '@/lib/data';
import MugunghwaListClient from './MugunghwaListClient';

export const metadata: Metadata = {
  title: '무궁화호·누리로 시간표 - 전국 운행정보',
  description: '전국 무궁화호, 누리로 열차 시간표와 요금 정보. 저렴한 요금으로 전국 주요 도시를 연결하는 무궁화호 운행 시간표.',
  alternates: { canonical: 'https://train.mustarddata.com/mugunghwa/schedule' },
};

export default function MugunghwaListPage() {
  const stations = getStations();
  const routes = getMugunghwaRoutes();
  return <MugunghwaListClient stations={stations} routes={routes} />;
}
