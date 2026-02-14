'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createStationSlug } from '@/lib/slug-utils';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

interface Station {
  stationId: string;
  stationName: string;
  cityName?: string;
}

interface Route {
  depStationId: string;
  arrStationId: string;
}

interface TrainListConfig {
  title: string;
  subtitle?: string;
  description?: string;
  pathPrefix: string;
  searchPlaceholder: string;
  color: 'emerald' | 'purple' | 'sky' | 'orange';
}

interface Props {
  stations: Station[];
  routes: Route[];
  config: TrainListConfig;
}

const colorMap = {
  emerald: {
    headerBg: 'bg-emerald-700',
    headerText: 'text-emerald-200',
    ring: 'focus:ring-emerald-400',
    regionBg: 'bg-emerald-50',
    regionText: 'text-emerald-600',
    hoverBorder: 'hover:border-emerald-200',
    hoverText: 'group-hover:text-emerald-600',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
  },
  purple: {
    headerBg: 'bg-purple-700',
    headerText: 'text-purple-200',
    ring: 'focus:ring-purple-400',
    regionBg: 'bg-purple-50',
    regionText: 'text-purple-600',
    hoverBorder: 'hover:border-purple-200',
    hoverText: 'group-hover:text-purple-600',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-700',
  },
  sky: {
    headerBg: 'bg-sky-700',
    headerText: 'text-sky-200',
    ring: 'focus:ring-sky-400',
    regionBg: 'bg-sky-50',
    regionText: 'text-sky-600',
    hoverBorder: 'hover:border-sky-200',
    hoverText: 'group-hover:text-sky-600',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-700',
  },
  orange: {
    headerBg: 'bg-orange-700',
    headerText: 'text-orange-200',
    ring: 'focus:ring-orange-400',
    regionBg: 'bg-orange-50',
    regionText: 'text-orange-600',
    hoverBorder: 'hover:border-orange-200',
    hoverText: 'group-hover:text-orange-600',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
  },
};

function groupStationsByRegion(stations: Station[]) {
  const regions: Record<string, Station[]> = {};

  stations.forEach(station => {
    let region = '기타';
    const name = station.stationName;
    const city = station.cityName || '';

    if (name.includes('서울') || city.includes('서울')) region = '서울';
    else if (name.includes('부산') || city.includes('부산')) region = '부산';
    else if (name.includes('대구') || city.includes('대구')) region = '대구';
    else if (name.includes('대전') || city.includes('대전')) region = '대전';
    else if (name.includes('광주') || city.includes('광주')) region = '광주';
    else if (name.includes('울산') || city.includes('울산')) region = '울산';
    else if (name.includes('인천') || city.includes('인천')) region = '인천';
    else if (name.includes('세종') || city.includes('세종')) region = '세종';
    else if (city.includes('경기')) region = '경기';
    else if (city.includes('강원')) region = '강원';
    else if (city.includes('충청북') || city.includes('충북')) region = '충북';
    else if (city.includes('충청남') || city.includes('충남')) region = '충남';
    else if (city.includes('경상북') || city.includes('경북')) region = '경북';
    else if (city.includes('경상남') || city.includes('경남')) region = '경남';
    else if (city.includes('전라북') || city.includes('전북') || city.includes('전북특별자치도')) region = '전북';
    else if (city.includes('전라남') || city.includes('전남')) region = '전남';
    else if (city.includes('제주')) region = '제주';

    if (!regions[region]) regions[region] = [];
    regions[region].push(station);
  });

  return regions;
}

const regionOrder = [
  '서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종',
  '강원', '충북', '충남', '경북', '경남', '전북', '전남', '제주', '기타'
];

export default function TrainListClient({ stations, routes, config }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const colors = colorMap[config.color];

  const depStationIds = new Set(routes.map(r => r.depStationId));

  const activeStations = stations
    .filter(s => depStationIds.has(s.stationId))
    .reduce<Station[]>((acc, station) => {
      if (!acc.find(s => s.stationName === station.stationName)) {
        acc.push(station);
      }
      return acc;
    }, []);

  const displayStations = activeStations.filter(s =>
    s.stationName.includes(searchTerm) || (s.cityName && s.cityName.includes(searchTerm))
  );

  const groupedStations = groupStationsByRegion(displayStations);

  const breadcrumbItems = [
    { name: '홈', url: 'https://train.mustarddata.com' },
    { name: config.title, url: `https://train.mustarddata.com${config.pathPrefix}` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className={`${colors.headerBg} text-white py-12 px-4 shadow-md`}>
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{config.title}</h1>
          {config.subtitle && (
            <p className={`${colors.headerText} text-sm mb-4`}>{config.subtitle}</p>
          )}
          {config.description && (
            <p className={`${colors.headerText} text-base mb-2`}>{config.description}</p>
          )}
          <p className={`${colors.headerText} text-lg mb-8`}>
            전국 <strong className="text-white">{activeStations.length}</strong>개 역, <strong className="text-white">{routes.length}</strong>개 노선의 운행 정보를 확인하세요
          </p>

          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder={config.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full py-4 px-6 rounded-full bg-white text-gray-900 shadow-lg focus:outline-none focus:ring-4 ${colors.ring} text-lg placeholder-gray-400`}
            />
            <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-12">
        {displayStations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">검색 결과가 없습니다.</p>
          </div>
        )}

        <div className="space-y-12">
          {regionOrder.map(region => {
            const regionStations = groupedStations[region];
            if (!regionStations || regionStations.length === 0) return null;

            return (
              <section key={region} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 border-b pb-4">
                  <span className={`flex items-center justify-center w-10 h-10 rounded-full ${colors.regionBg} ${colors.regionText} text-lg`}>
                    {region.substring(0, 1)}
                  </span>
                  {region}
                  <span className="text-sm font-normal text-gray-500 ml-auto bg-gray-50 px-3 py-1 rounded-full">
                    {regionStations.length}개 역
                  </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regionStations
                    .sort((a, b) => a.stationName.localeCompare(b.stationName))
                    .map(station => {
                      const routeCount = routes.filter(r => r.depStationId === station.stationId).length;
                      const stationSlug = createStationSlug(station.stationName);

                      return (
                        <Link
                          key={station.stationId}
                          href={`${config.pathPrefix}/${stationSlug}`}
                          className={`group block rounded-xl p-5 transition-all duration-200 bg-gray-50 hover:bg-white border border-transparent ${colors.hoverBorder} hover:shadow-md`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className={`text-lg font-bold transition-colors text-gray-900 ${colors.hoverText}`}>
                              {station.stationName}
                            </h3>
                            <span className={`text-xs font-semibold ${colors.badgeBg} ${colors.badgeText} px-2 py-1 rounded`}>
                              {routeCount}개 노선
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 mt-2">
                            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7"></path></svg>
                            <span><strong className="text-gray-800">{routeCount}</strong>개 노선 운행</span>
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </section>
            );
          })}
        </div>

      </div>
    </div>
  );
}
