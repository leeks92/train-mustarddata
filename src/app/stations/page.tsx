import type { Metadata } from 'next';
import { getStations, getKtxRoutes, getGeneralRoutes } from '@/lib/data';
import { ItemListJsonLd } from '@/components/JsonLd';
import { createStationSlug } from '@/lib/slug-utils';
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

const BASE_URL = 'https://train.mustarddata.com';

const majorStationNames = ['서울', '용산', '부산', '동대구', '대전', '광주송정', '강릉', '울산'];

export default function StationListPage() {
  const stations = getStations();
  const ktxRoutes = getKtxRoutes();
  const generalRoutes = getGeneralRoutes();

  const allRouteDepIds = new Set([
    ...ktxRoutes.map(r => r.depStationId),
    ...generalRoutes.map(r => r.depStationId),
  ]);

  const uniqueStations = stations
    .filter(s => allRouteDepIds.has(s.stationId))
    .reduce<typeof stations>((acc, s) => {
      if (!acc.find(a => a.stationName === s.stationName)) acc.push(s);
      return acc;
    }, []);

  const majorStations = uniqueStations.filter(s =>
    majorStationNames.some(name => s.stationName.includes(name))
  );

  const itemListItems = majorStations.map((s, idx) => ({
    name: s.stationName,
    url: `${BASE_URL}/stations/${createStationSlug(s.stationName)}/`,
    position: idx + 1,
  }));

  return (
    <>
      <ItemListJsonLd items={itemListItems} name="전국 주요 기차역" />
      <StationListClient
        stations={stations}
        ktxRoutes={ktxRoutes}
        generalRoutes={generalRoutes}
      />
    </>
  );
}
