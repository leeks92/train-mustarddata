import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getStation,
  getMugunghwaRoutes,
  formatCharge,
  getValidMinCharge,
} from '@/lib/data';
import { getStationInfo } from '@/lib/station-info';
import { BreadcrumbJsonLd, TrainStationJsonLd } from '@/components/JsonLd';
import {
  getStationIdBySlug,
  createRouteSlug,
  getAllStationSlugs,
} from '@/lib/slugs';

const BASE_URL = 'https://train.mustarddata.com';

interface Props {
  params: Promise<{
    station: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllStationSlugs();
  return slugs.map(slug => ({ station: encodeURIComponent(slug) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { station: stationSlug } = await params;
  const decodedSlug = decodeURIComponent(stationSlug);
  const stationId = getStationIdBySlug(decodedSlug);
  const station = stationId ? getStation(stationId) : null;

  if (!station) {
    return { title: '역을 찾을 수 없습니다' };
  }

  const mugunghwaRoutes = getMugunghwaRoutes();
  const stationMugunghwaRoutes = mugunghwaRoutes.filter(r => r.depStationId === stationId);

  return {
    title: `${station.stationName} 무궁화호 시간표 - 요금, 노선 안내`,
    description: `${station.stationName}에서 출발하는 무궁화호·누리로 시간표와 요금 정보. ${stationMugunghwaRoutes.length}개 노선 운행.`,
    keywords: [
      `${station.stationName} 무궁화호`,
      `${station.stationName} 누리로`,
      `${station.stationName} 시간표`,
      `${station.stationName} 기차 요금`,
    ],
    alternates: {
      canonical: `${BASE_URL}/mugunghwa/schedule/${decodedSlug}`,
    },
    openGraph: {
      title: `${station.stationName} 무궁화호 시간표`,
      description: `${station.stationName} 무궁화호·누리로 시간표와 요금 정보를 확인하세요. ${stationMugunghwaRoutes.length}개 노선 운행.`,
      url: `${BASE_URL}/mugunghwa/schedule/${decodedSlug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${station.stationName} 무궁화호 시간표`,
      description: `${station.stationName} 무궁화호·누리로 시간표와 요금 정보를 확인하세요.`,
    },
  };
}

export default async function MugunghwaStationPage({ params }: Props) {
  const { station: stationSlug } = await params;
  const decodedSlug = decodeURIComponent(stationSlug);
  const stationId = getStationIdBySlug(decodedSlug);
  const station = stationId ? getStation(stationId) : null;
  const mugunghwaAllRoutes = getMugunghwaRoutes();
  const stationInfo = station ? getStationInfo(station.stationName) : null;

  if (!station || !stationId) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">역을 찾을 수 없습니다</h1>
        <Link href="/mugunghwa/schedule" className="text-orange-600 hover:underline">
          무궁화호 역 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // 무궁화호 전용 데이터에서 해당 역 출발 노선만 필터
  const mugunghwaRoutes = mugunghwaAllRoutes.filter(r => r.depStationId === stationId);

  const sortedRoutes = mugunghwaRoutes.sort((a, b) =>
    a.arrStationName.localeCompare(b.arrStationName)
  );

  const breadcrumbItems = [
    { name: '홈', url: BASE_URL },
    { name: '무궁화호 시간표', url: `${BASE_URL}/mugunghwa/schedule` },
    { name: station.stationName, url: `${BASE_URL}/mugunghwa/schedule/${decodedSlug}` },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <TrainStationJsonLd
        name={station.stationName}
        address={stationInfo?.address}
        telephone={stationInfo?.phone}
        url={`${BASE_URL}/mugunghwa/schedule/${decodedSlug}`}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-600">홈</Link>
        <span className="mx-2">›</span>
        <Link href="/mugunghwa/schedule" className="hover:text-orange-600">무궁화호 시간표</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{station.stationName}</span>
      </nav>

      <header className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-white/20 px-2 py-1 rounded text-sm">무궁화호</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {station.stationName} 무궁화호 시간표
        </h1>
        <p className="opacity-90">{station.cityName || '기차역'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
            {sortedRoutes.length}개 노선 운행
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
            자유석(입석) 이용 가능
          </span>
        </div>
      </header>

      {stationInfo && (
        <section className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">역 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {stationInfo.address && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">주소</p>
                    <p className="text-gray-900">{stationInfo.address}</p>
                  </div>
                </div>
              )}
              {stationInfo.phone && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">전화번호</p>
                    <a href={`tel:${stationInfo.phone}`} className="text-orange-600 hover:underline font-medium">
                      {stationInfo.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
            {stationInfo.facilities && stationInfo.facilities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">편의시설</p>
                <div className="flex flex-wrap gap-2">
                  {stationInfo.facilities.map((facility, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold mb-4">{station.stationName}에서 출발하는 무궁화호</h2>
        {sortedRoutes.length === 0 ? (
          <p className="text-gray-500">운행 노선 정보가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedRoutes.map(route => {
              const minCharge = getValidMinCharge(route.schedules);
              const routeSlug = createRouteSlug(route.depStationName, route.arrStationName);

              return (
                <Link
                  key={route.arrStationId}
                  href={`/mugunghwa/schedule/route/${routeSlug}`}
                  className="bg-white border rounded-lg p-4 hover:shadow-md hover:border-orange-200 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{route.arrStationName}</h3>
                    <span className="text-orange-500">→</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{route.schedules.length}회/일</span>
                    <span className="font-medium text-orange-600">
                      {minCharge > 0 ? `${formatCharge(minCharge)}~` : '요금 미제공'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-12 bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">예매 안내</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2 text-gray-800">온라인 예매</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                <a href="https://www.letskorail.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                  코레일 (Let&apos;s Korail) →
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-gray-800">이용 안내</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 무궁화호는 자유석(입석) 이용 가능</li>
              <li>• 출발 10분 전 도착 권장</li>
              <li>• 승차권 QR 또는 모바일 티켓 지참</li>
              <li>• 명절 사전 예매 권장</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-8 text-sm text-gray-600">
        <p>
          {station.stationName}에서 출발하는 무궁화호 시간표입니다.
          총 {sortedRoutes.length}개 노선이 운행되며, 전국 주요 도시로 연결됩니다.
          무궁화호는 자유석(입석) 이용이 가능하며, 정확한 시간과 요금은 코레일 예매 사이트에서 확인하세요.
        </p>
      </section>
    </div>
  );
}
