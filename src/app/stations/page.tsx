import type { Metadata } from 'next';
import { getStations, getKtxRoutes, getGeneralRoutes } from '@/lib/data';
import StationListClient from './StationListClient';

export const metadata: Metadata = {
  title: '전국 기차역 - KTX·일반열차 역 안내',
  description:
    '전국 기차역 목록과 운행 정보. 서울, 부산, 대구, 대전, 광주 등 주요 도시 기차역 안내.',
  alternates: {
    canonical: 'https://train.mustarddata.com/stations/',
  },
  openGraph: {
    title: '전국 기차역 - KTX·일반열차 역 안내',
    description: '전국 기차역 목록과 운행 정보. 서울, 부산, 대구, 대전, 광주 등 주요 도시 기차역 안내.',
    url: 'https://train.mustarddata.com/stations/',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '전국 기차역 - KTX·일반열차 역 안내',
    description: '전국 기차역 목록과 운행 정보. 주요 도시 기차역 안내.',
  },
};

export default function StationListPage() {
  const stations = getStations();
  const ktxRoutes = getKtxRoutes();
  const generalRoutes = getGeneralRoutes();

  return (
    <StationListClient
      stations={stations}
      ktxRoutes={ktxRoutes}
      generalRoutes={generalRoutes}
    />
  );
}
