import type { Metadata } from 'next';
import Link from 'next/link';
import {
  getStation,
  getRoutesFromStation,
  getKtxRoutes,
  getSrtRoutes,
  getItxRoutes,
  getMugunghwaRoutes,
  formatCharge,
  getValidMinCharge,
} from '@/lib/data';
import { getStationInfo } from '@/lib/station-info';
import { getStationGuide } from '@/lib/station-guide';
import { TrainStationJsonLd, BreadcrumbJsonLd, FAQJsonLd, LocalBusinessJsonLd } from '@/components/JsonLd';
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

  const routes = stationId ? getRoutesFromStation(stationId) : [];

  return {
    title: `${station.stationName} 기차 시간표 - KTX·일반열차 노선 안내`,
    description: `${station.stationName}에서 출발하는 기차 시간표와 요금 정보. ${routes.length}개 노선 운행.`,
    alternates: {
      canonical: `${BASE_URL}/stations/${decodedSlug}`,
    },
    openGraph: {
      title: `${station.stationName} 기차 시간표`,
      description: `${station.stationName} 기차 시간표와 요금 정보를 확인하세요.`,
      url: `${BASE_URL}/stations/${decodedSlug}`,
      type: 'website',
    },
  };
}

export default async function StationDetailPage({ params }: Props) {
  const { station: stationSlug } = await params;
  const decodedSlug = decodeURIComponent(stationSlug);
  const stationId = getStationIdBySlug(decodedSlug);
  const station = stationId ? getStation(stationId) : null;
  const routes = stationId ? getRoutesFromStation(stationId) : [];
  const stationInfo = station ? getStationInfo(station.stationName) : null;
  const stationGuide = station ? getStationGuide(station.stationName) : null;

  const ktxAllRoutes = getKtxRoutes();
  const srtAllRoutes = getSrtRoutes();
  const itxAllRoutes = getItxRoutes();
  const mugunghwaAllRoutes = getMugunghwaRoutes();

  if (!station || !stationId) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">역을 찾을 수 없습니다</h1>
        <Link href="/stations" className="text-emerald-600 hover:underline">
          기차역 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const ktxRoutes = routes.filter(r =>
    ktxAllRoutes.some(kr => kr.depStationId === r.depStationId && kr.arrStationId === r.arrStationId)
  );
  const srtRoutes = routes.filter(r =>
    srtAllRoutes.some(sr => sr.depStationId === r.depStationId && sr.arrStationId === r.arrStationId)
  );
  const itxRoutes = routes.filter(r =>
    itxAllRoutes.some(ir => ir.depStationId === r.depStationId && ir.arrStationId === r.arrStationId)
  );
  const mugunghwaRoutes = routes.filter(r =>
    mugunghwaAllRoutes.some(mr => mr.depStationId === r.depStationId && mr.arrStationId === r.arrStationId)
  );

  const breadcrumbItems = [
    { name: '홈', url: BASE_URL },
    { name: '기차역', url: `${BASE_URL}/stations` },
    { name: station.stationName, url: `${BASE_URL}/stations/${decodedSlug}` },
  ];

  const faqItems = [
    {
      question: `${station.stationName}에서 출발하는 열차 노선은 몇 개인가요?`,
      answer: `${station.stationName}에서는 ${[ktxRoutes.length > 0 ? `KTX ${ktxRoutes.length}개 노선` : '', srtRoutes.length > 0 ? `SRT ${srtRoutes.length}개 노선` : '', itxRoutes.length > 0 ? `ITX ${itxRoutes.length}개 노선` : '', mugunghwaRoutes.length > 0 ? `무궁화호 ${mugunghwaRoutes.length}개 노선` : ''].filter(Boolean).join(', ')}이 운행됩니다.`,
    },
    {
      question: `${station.stationName} 주소와 연락처는?`,
      answer: `${stationInfo?.address ? `주소: ${stationInfo.address}` : '주소 정보는 현장에서 확인 가능합니다.'}${stationInfo?.phone ? `, 전화번호: ${stationInfo.phone}` : ''}`,
    },
    {
      question: `${station.stationName} 편의시설은 어떤 것이 있나요?`,
      answer: stationInfo?.facilities && stationInfo.facilities.length > 0
        ? `${station.stationName}에는 ${stationInfo.facilities.join(', ')} 등의 편의시설이 있습니다.`
        : `${station.stationName}에는 매표소, 대합실 등 기본 편의시설이 갖추어져 있습니다.`,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <TrainStationJsonLd
        name={station.stationName}
        address={stationInfo?.address}
        telephone={stationInfo?.phone}
        url={`${BASE_URL}/stations/${decodedSlug}`}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <FAQJsonLd items={faqItems} />
      {stationInfo?.address && (
        <LocalBusinessJsonLd
          name={station.stationName}
          address={stationInfo.address}
          telephone={stationInfo.phone}
          url={`${BASE_URL}/stations/${decodedSlug}`}
        />
      )}

      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600">홈</Link>
        <span className="mx-2">›</span>
        <Link href="/stations" className="hover:text-emerald-600">기차역</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{station.stationName}</span>
      </nav>

      <header className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl p-6 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{station.stationName}</h1>
        <p className="opacity-90">{station.cityName || '기차역'}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ktxRoutes.length > 0 && (
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">KTX {ktxRoutes.length}개 노선</span>
          )}
          {srtRoutes.length > 0 && (
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">SRT {srtRoutes.length}개 노선</span>
          )}
          {itxRoutes.length > 0 && (
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">ITX {itxRoutes.length}개 노선</span>
          )}
          {mugunghwaRoutes.length > 0 && (
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">무궁화호 {mugunghwaRoutes.length}개 노선</span>
          )}
        </div>
      </header>

      {stationInfo && (
        <section className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900">역 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {stationInfo.address && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
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
                    <a href={`tel:${stationInfo.phone}`} className="text-emerald-600 hover:underline font-medium">{stationInfo.phone}</a>
                  </div>
                </div>
              )}
            </div>
            {stationInfo.facilities && stationInfo.facilities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">편의시설</p>
                <div className="flex flex-wrap gap-2">
                  {stationInfo.facilities.map((facility, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{facility}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* KTX 노선 */}
      {ktxRoutes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm font-bold">K</span>
            KTX 노선
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ktxRoutes.sort((a, b) => a.arrStationName.localeCompare(b.arrStationName)).map(route => {
              const minCharge = getValidMinCharge(route.schedules);
              const routeSlug = createRouteSlug(route.depStationName, route.arrStationName);

              return (
                <Link
                  key={route.arrStationId}
                  href={`/KTX/schedule/route/${routeSlug}`}
                  className="bg-white border rounded-lg p-4 hover:shadow-md hover:border-emerald-200 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{route.arrStationName}</h3>
                    <span className="text-emerald-500">→</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{route.schedules.length}회/일</span>
                    <span className="font-medium text-emerald-600">
                      {minCharge > 0 ? `${formatCharge(minCharge)}~` : '요금 미제공'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* SRT 노선 */}
      {srtRoutes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center text-sm font-bold">S</span>
            SRT 노선
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {srtRoutes.sort((a, b) => a.arrStationName.localeCompare(b.arrStationName)).map(route => {
              const minCharge = getValidMinCharge(route.schedules);
              const routeSlug = createRouteSlug(route.depStationName, route.arrStationName);

              return (
                <Link
                  key={route.arrStationId}
                  href={`/SRT/schedule/route/${routeSlug}`}
                  className="bg-white border rounded-lg p-4 hover:shadow-md hover:border-purple-200 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{route.arrStationName}</h3>
                    <span className="text-purple-500">→</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{route.schedules.length}회/일</span>
                    <span className="font-medium text-purple-600">
                      {minCharge > 0 ? `${formatCharge(minCharge)}~` : '요금 미제공'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ITX 노선 */}
      {itxRoutes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center text-sm font-bold">I</span>
            ITX 노선
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itxRoutes.sort((a, b) => a.arrStationName.localeCompare(b.arrStationName)).map(route => {
              const minCharge = getValidMinCharge(route.schedules);
              const routeSlug = createRouteSlug(route.depStationName, route.arrStationName);

              return (
                <Link
                  key={route.arrStationId}
                  href={`/ITX/schedule/route/${routeSlug}`}
                  className="bg-white border rounded-lg p-4 hover:shadow-md hover:border-sky-200 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{route.arrStationName}</h3>
                    <span className="text-sky-500">→</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{route.schedules.length}회/일</span>
                    <span className="font-medium text-sky-600">
                      {minCharge > 0 ? `${formatCharge(minCharge)}~` : '요금 미제공'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 무궁화호 노선 */}
      {mugunghwaRoutes.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-sm font-bold">M</span>
            무궁화호 노선
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mugunghwaRoutes.sort((a, b) => a.arrStationName.localeCompare(b.arrStationName)).map(route => {
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
        </section>
      )}

      {ktxRoutes.length === 0 && srtRoutes.length === 0 && itxRoutes.length === 0 && mugunghwaRoutes.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">현재 수집된 노선 정보가 없습니다.</p>
          <p className="text-sm text-gray-400">정확한 시간과 요금은 코레일 예매 사이트에서 확인하세요.</p>
        </div>
      )}

      {stationGuide && (
        <section className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">{station.stationName} 이용 가이드</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 교통 연결 */}
            <div>
              <h3 className="font-medium mb-3 text-gray-800 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-50 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </span>
                교통 연결
              </h3>
              <ul className="text-sm text-gray-700 space-y-2">
                {stationGuide.transport.subway && (
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">🚇</span>
                    <span>{stationGuide.transport.subway}</span>
                  </li>
                )}
                {stationGuide.transport.bus && (
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">🚌</span>
                    <span>{stationGuide.transport.bus}</span>
                  </li>
                )}
                {stationGuide.transport.taxi && (
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">🚕</span>
                    <span>{stationGuide.transport.taxi}</span>
                  </li>
                )}
              </ul>
            </div>
            {/* 주차 & 주변 */}
            <div>
              {stationGuide.parking && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2 text-gray-800">주차 정보</h3>
                  <p className="text-sm text-gray-700">{stationGuide.parking.info}</p>
                </div>
              )}
              {stationGuide.nearby && (
                <div>
                  <h3 className="font-medium mb-2 text-gray-800">주변 시설</h3>
                  <p className="text-sm text-gray-700">{stationGuide.nearby}</p>
                </div>
              )}
            </div>
          </div>
          {stationGuide.tips && stationGuide.tips.length > 0 && (
            <div className="mt-4 bg-emerald-50 rounded-lg p-4">
              <h3 className="font-medium mb-2 text-emerald-800">이용 팁</h3>
              <ul className="text-sm text-emerald-700 space-y-1">
                {stationGuide.tips.map((tip, i) => (
                  <li key={i}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="mt-8 bg-gray-100 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">예매 안내</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2 text-gray-800">온라인 예매</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                <a href="https://www.letskorail.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                  코레일 (Let&apos;s Korail) →
                </a>
              </li>
              <li>
                <a href="https://etk.srail.kr" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                  SRT 예매 →
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2 text-gray-800">이용 안내</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 출발 20분 전 도착 권장</li>
              <li>• 승차권 QR 또는 모바일 티켓 지참</li>
              <li>• 명절 사전 예매 필수</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
