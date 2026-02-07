import type { Metadata } from 'next';
import Link from 'next/link';
import { getRoute, getSrtRoutes, getStations, formatCharge, getValidMinCharge, getValidMaxCharge } from '@/lib/data';
import { TrainTripJsonLd, BreadcrumbJsonLd, FAQJsonLd, TableJsonLd } from '@/components/JsonLd';
import {
  getStationIdBySlug,
  createStationSlug,
  createRouteSlug,
  parseRouteSlug,
} from '@/lib/slugs';
import { getStationGuide } from '@/lib/station-guide';

const BASE_URL = 'https://train.mustarddata.com';

interface Props {
  params: Promise<{
    route: string;
  }>;
}

function getTrainTypeBadge(trainType: string) {
  if (trainType.includes('SRT')) return 'bg-purple-100 text-purple-800';
  if (trainType.includes('KTX-이음')) return 'bg-teal-100 text-teal-800';
  if (trainType.includes('KTX')) return 'bg-emerald-100 text-emerald-800';
  if (trainType.includes('ITX')) return 'bg-blue-100 text-blue-800';
  return 'bg-gray-100 text-gray-800';
}

export async function generateStaticParams() {
  const routes = getSrtRoutes();
  const slugSet = new Set<string>();

  return routes
    .map(route => {
      const slug = createRouteSlug(route.depStationName, route.arrStationName);
      if (slugSet.has(slug)) return null;
      slugSet.add(slug);
      return { route: slug };
    })
    .filter((p): p is { route: string } => p !== null);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const routeParam = (await params).route;
  const parsed = parseRouteSlug(routeParam);

  if (!parsed) return { title: '노선을 찾을 수 없습니다' };

  const depStationId = getStationIdBySlug(parsed.depSlug);
  const arrStationId = getStationIdBySlug(parsed.arrSlug);

  if (!depStationId || !arrStationId) return { title: '노선을 찾을 수 없습니다' };

  const route = getRoute(depStationId, arrStationId);
  if (!route) return { title: '노선을 찾을 수 없습니다' };

  const depName = route.depStationName.replace('역', '');
  const arrName = route.arrStationName.replace('역', '');
  const metaMinCharge = getValidMinCharge(route.schedules);
  const routeSlug = createRouteSlug(route.depStationName, route.arrStationName);
  const chargeText = metaMinCharge > 0 ? `, 요금 ${formatCharge(metaMinCharge)}부터` : '';

  return {
    title: `${depName} → ${arrName} SRT 시간표 - 요금, 소요시간`,
    description: `${route.depStationName}에서 ${route.arrStationName} 가는 SRT 시간표. ${route.schedules.length}회 운행${chargeText}.`,
    keywords: [
      `${depName} ${arrName} SRT`,
      `${depName} ${arrName} 기차`,
      `${route.depStationName} SRT 시간표`,
      `${route.arrStationName} SRT 시간표`,
    ],
    alternates: {
      canonical: `${BASE_URL}/SRT/schedule/route/${routeSlug}`,
    },
    openGraph: {
      title: `${depName} → ${arrName} SRT 시간표`,
      description: `${route.depStationName}에서 ${route.arrStationName} 가는 SRT. ${route.schedules.length}회/일 운행${chargeText}.`,
      url: `${BASE_URL}/SRT/schedule/route/${routeSlug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${depName} → ${arrName} SRT 시간표`,
      description: `${route.schedules.length}회/일 운행${chargeText}`,
    },
  };
}

export default async function SRTRoutePage({ params }: Props) {
  const routeParam = (await params).route;
  const parsed = parseRouteSlug(routeParam);

  if (!parsed) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">노선을 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-6">요청하신 노선 정보가 존재하지 않습니다.</p>
        <Link href="/SRT/schedule" className="text-purple-600 hover:underline">
          SRT 역 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const depStationId = getStationIdBySlug(parsed.depSlug);
  const arrStationId = getStationIdBySlug(parsed.arrSlug);

  if (!depStationId || !arrStationId) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">노선을 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-6">요청하신 노선 정보가 존재하지 않습니다.</p>
        <Link href="/SRT/schedule" className="text-purple-600 hover:underline">
          SRT 역 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const route = getRoute(depStationId, arrStationId);

  if (!route) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">노선을 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-6">요청하신 노선 정보가 존재하지 않습니다.</p>
        <Link href="/SRT/schedule" className="text-purple-600 hover:underline">
          SRT 역 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const schedules = route.schedules;
  const minCharge = getValidMinCharge(schedules);
  const maxCharge = getValidMaxCharge(schedules);
  const routeSlug = createRouteSlug(route.depStationName, route.arrStationName);
  const reverseRouteSlug = createRouteSlug(route.arrStationName, route.depStationName);
  const depStationSlug = createStationSlug(route.depStationName);

  // 열차유형별 그룹화
  const typeGroups = schedules.reduce(
    (acc, s) => {
      const type = s.trainType || 'SRT';
      if (!acc[type]) acc[type] = [];
      acc[type].push(s);
      return acc;
    },
    {} as Record<string, typeof schedules>
  );

  const breadcrumbItems = [
    { name: '홈', url: BASE_URL },
    { name: 'SRT 시간표', url: `${BASE_URL}/SRT/schedule` },
    { name: route.depStationName, url: `${BASE_URL}/SRT/schedule/${depStationSlug}` },
    { name: `${route.depStationName} → ${route.arrStationName}`, url: `${BASE_URL}/SRT/schedule/route/${routeSlug}` },
  ];

  // 소요시간 계산
  const firstSchedule = schedules[0];
  const estimatedDuration = (() => {
    if (!firstSchedule?.depTime || !firstSchedule?.arrTime) return null;
    const [depH, depM] = firstSchedule.depTime.split(':').map(Number);
    const [arrH, arrM] = firstSchedule.arrTime.split(':').map(Number);
    let diff = (arrH * 60 + arrM) - (depH * 60 + depM);
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return hours > 0 ? `약 ${hours}시간 ${mins > 0 ? `${mins}분` : ''}` : `약 ${mins}분`;
  })();

  const trainTypeList = [...new Set(schedules.map(s => s.trainType || 'SRT'))].join(', ');

  // 시간대별 분류
  const morningSchedules = schedules.filter(s => { const h = parseInt(s.depTime.split(':')[0]); return h >= 5 && h < 10; });
  const afternoonSchedules = schedules.filter(s => { const h = parseInt(s.depTime.split(':')[0]); return h >= 10 && h < 17; });
  const eveningSchedules = schedules.filter(s => { const h = parseInt(s.depTime.split(':')[0]); return h >= 17 || h < 5; });

  // FAQ 데이터
  const faqItems = [
    {
      question: `${route.depStationName}에서 ${route.arrStationName}까지 SRT 요금은 얼마인가요?`,
      answer: `${route.depStationName}에서 ${route.arrStationName}까지 SRT 요금은 ${formatCharge(minCharge)}${minCharge !== maxCharge ? `부터 ${formatCharge(maxCharge)}` : ''}입니다. 열차 유형(${trainTypeList})에 따라 요금이 다릅니다.`,
    },
    {
      question: `${route.depStationName}에서 ${route.arrStationName}까지 SRT 첫차와 막차 시간은?`,
      answer: `첫차는 ${schedules[0]?.depTime || '-'}에 출발하고, 막차는 ${schedules[schedules.length - 1]?.depTime || '-'}에 출발합니다. 하루 총 ${schedules.length}회 운행됩니다.`,
    },
    {
      question: `${route.depStationName}에서 ${route.arrStationName}까지 SRT 소요시간은 얼마나 걸리나요?`,
      answer: `${route.depStationName}에서 ${route.arrStationName}까지 SRT 소요시간은 ${estimatedDuration || '노선에 따라 상이합니다'}입니다. 정차역에 따라 달라질 수 있습니다.`,
    },
    {
      question: `${route.depStationName} ${route.arrStationName} SRT 하루 몇 회 운행하나요?`,
      answer: `${route.depStationName}에서 ${route.arrStationName}까지 하루 총 ${schedules.length}회 운행됩니다. ${trainTypeList} 열차가 운행됩니다.`,
    },
    {
      question: `${route.depStationName} ${route.arrStationName} SRT 예매는 어디서 하나요?`,
      answer: `SRT 공식 사이트(etk.srail.kr) 또는 SR 앱에서 온라인 예매가 가능합니다. 출발 20분 전까지 무료 취소가 가능합니다.`,
    },
    {
      question: `${route.depStationName} ${route.arrStationName} SRT 어린이·청소년 할인이 되나요?`,
      answer: `만 6세~12세 어린이는 약 50% 할인, 만 13세~18세 청소년은 약 30% 할인이 적용됩니다. 예매 시 생년월일 입력이 필요합니다.`,
    },
  ];

  // 관련 노선
  const allSrtRoutes = getSrtRoutes();
  const sameDepRoutes = allSrtRoutes
    .filter(r => r.depStationName === route.depStationName && r.arrStationName !== route.arrStationName)
    .slice(0, 4);
  const sameArrRoutes = allSrtRoutes
    .filter(r => r.arrStationName === route.arrStationName && r.depStationName !== route.depStationName)
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <TrainTripJsonLd
        departureStation={route.depStationName}
        arrivalStation={route.arrStationName}
        departureTime={schedules[0]?.depTime}
        price={minCharge}
        trainType="SRT"
        url={`${BASE_URL}/SRT/schedule/route/${routeSlug}`}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <FAQJsonLd items={faqItems} />
      <TableJsonLd
        name={`${route.depStationName} → ${route.arrStationName} SRT 시간표`}
        description={`${route.depStationName}에서 ${route.arrStationName}까지 SRT 시간표. ${schedules.length}회 운행, ${formatCharge(minCharge)}부터.`}
        columns={['출발', '도착', '열차유형', '열차번호', '요금']}
        rows={schedules.slice(0, 10).map(s => [s.depTime, s.arrTime, s.trainType, s.trainNo, formatCharge(s.charge)])}
      />

      {/* 브레드크럼 */}
      <nav className="text-sm text-gray-600 mb-6">
        <Link href="/" className="hover:text-purple-600">홈</Link>
        <span className="mx-2">›</span>
        <Link href="/SRT/schedule" className="hover:text-purple-600">SRT 시간표</Link>
        <span className="mx-2">›</span>
        <Link href={`/SRT/schedule/${depStationSlug}`} className="hover:text-purple-600">{route.depStationName}</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-800">{route.arrStationName}</span>
      </nav>

      {/* 노선 정보 헤더 */}
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-white/20 px-2 py-1 rounded text-sm">SRT</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          {route.depStationName}
          <span className="mx-4 opacity-75">→</span>
          {route.arrStationName}
        </h1>
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="opacity-75">운행 횟수</span>
            <p className="text-xl font-bold">{schedules.length}회/일</p>
          </div>
          <div>
            <span className="opacity-75">첫차</span>
            <p className="text-xl font-bold">{schedules[0]?.depTime || '-'}</p>
          </div>
          <div>
            <span className="opacity-75">막차</span>
            <p className="text-xl font-bold">{schedules[schedules.length - 1]?.depTime || '-'}</p>
          </div>
          <div>
            <span className="opacity-75">요금</span>
            <p className="text-xl font-bold">
              {minCharge > 0
                ? (minCharge === maxCharge
                    ? formatCharge(minCharge)
                    : `${formatCharge(minCharge)} ~ ${formatCharge(maxCharge)}`)
                : '요금 미제공'}
            </p>
          </div>
        </div>
      </header>

      {/* 예매 링크 */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-purple-800">
          <strong>예매 안내:</strong> 정확한 좌석 확인과 예매는 공식 사이트를 이용해 주세요.
        </p>
        <div className="flex gap-4 mt-3">
          <a href="https://etk.srail.kr" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:underline text-sm font-medium">
            SRT 예매 →
          </a>
          <a href="https://www.letskorail.com" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:underline text-sm font-medium">
            코레일 예매 →
          </a>
        </div>
      </div>

      {/* 시간표 테이블 */}
      <section className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">{route.depStationName} → {route.arrStationName} 시간표</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="schedule-table">
            <thead>
              <tr>
                <th className="w-24">출발</th>
                <th className="w-24">도착</th>
                <th className="w-28">열차유형</th>
                <th className="w-24">열차번호</th>
                <th className="w-32 text-right">요금 (어른)</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule, index) => (
                <tr key={index}>
                  <td className="font-medium">
                    <time dateTime={`T${schedule.depTime}:00`}>{schedule.depTime}</time>
                  </td>
                  <td>
                    <time dateTime={`T${schedule.arrTime}:00`}>{schedule.arrTime}</time>
                  </td>
                  <td>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTrainTypeBadge(schedule.trainType)}`}>
                      {schedule.trainType}
                    </span>
                  </td>
                  <td className="text-gray-600">{schedule.trainNo}</td>
                  <td className="text-right font-medium">{formatCharge(schedule.charge)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 열차유형별 요약 */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">열차유형별 요금 안내</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(typeGroups).map(([type, items]) => (
            <div key={type} className="bg-white border rounded-lg p-4">
              <h3 className="font-bold mb-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mr-2 ${getTrainTypeBadge(type)}`}>{type}</span>
              </h3>
              <p className="text-2xl font-bold text-purple-600">
                {formatCharge(items[0].charge)}
              </p>
              <p className="text-sm text-gray-600 mt-1">{items.length}회 운행</p>
            </div>
          ))}
        </div>
      </section>

      {/* 시간대별 운행 가이드 */}
      {schedules.length >= 3 && (
        <section className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">시간대별 운행 가이드</h2>
          <p className="text-sm text-gray-600 mb-4">{route.depStationName} → {route.arrStationName} 노선의 시간대별 운행 현황입니다.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <h3 className="font-bold text-orange-800 mb-1">오전 (05:00~10:00)</h3>
              <p className="text-2xl font-bold text-orange-600">{morningSchedules.length}회</p>
              {morningSchedules.length > 0 && (
                <p className="text-xs text-orange-700 mt-2">
                  첫차 <strong>{morningSchedules[0].depTime}</strong>
                  {morningSchedules.length > 1 && <> · 마지막 {morningSchedules[morningSchedules.length - 1].depTime}</>}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">이른 아침 출발에 적합</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="font-bold text-blue-800 mb-1">낮 (10:00~17:00)</h3>
              <p className="text-2xl font-bold text-blue-600">{afternoonSchedules.length}회</p>
              {afternoonSchedules.length > 0 && (
                <p className="text-xs text-blue-700 mt-2">
                  {afternoonSchedules[0].depTime} ~ {afternoonSchedules[afternoonSchedules.length - 1].depTime}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">여유로운 이동에 적합</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <h3 className="font-bold text-purple-800 mb-1">저녁/심야 (17:00~)</h3>
              <p className="text-2xl font-bold text-purple-600">{eveningSchedules.length}회</p>
              {eveningSchedules.length > 0 && (
                <p className="text-xs text-purple-700 mt-2">
                  {eveningSchedules[0].depTime} ~ 막차 {eveningSchedules[eveningSchedules.length - 1].depTime}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">퇴근 후 이동에 적합</p>
            </div>
          </div>
        </section>
      )}

      {/* 출발역 꿀팁 */}
      <StationTipsSection stationName={route.depStationName} label="출발" />

      {/* SRT vs KTX 비교 */}
      <TransportCompareSection depName={route.depStationName} arrName={route.arrStationName} minCharge={minCharge} duration={estimatedDuration} />

      {/* 명절·성수기 안내 */}
      <SeasonalNotice depName={route.depStationName} arrName={route.arrStationName} />

      {/* FAQ 섹션 */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">자주 묻는 질문</h2>
        <div className="space-y-4">
          {faqItems.map((item, idx) => (
            <details key={idx} className="bg-white border border-gray-200 rounded-lg group">
              <summary className="p-4 cursor-pointer font-medium text-gray-900 hover:text-purple-600 transition-colors list-none flex items-center justify-between">
                {item.question}
                <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </summary>
              <div className="px-4 pb-4 text-sm text-gray-700 border-t border-gray-100 pt-3">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* 반대 노선 링크 */}
      <section className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-bold mb-2">돌아오는 노선</h2>
        <Link href={`/SRT/schedule/route/${reverseRouteSlug}`} className="text-purple-600 hover:underline">
          {route.arrStationName} → {route.depStationName} 시간표 보기
        </Link>
      </section>

      {/* 관련 노선 */}
      {(sameDepRoutes.length > 0 || sameArrRoutes.length > 0) && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4">관련 노선</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sameDepRoutes.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">{route.depStationName.replace('역', '')}에서 출발하는 다른 노선</h3>
                <div className="space-y-2">
                  {sameDepRoutes.map((r, idx) => (
                    <Link
                      key={idx}
                      href={`/SRT/schedule/route/${createRouteSlug(r.depStationName, r.arrStationName)}`}
                      className="block bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-sm transition"
                    >
                      <span className="font-medium text-gray-900">→ {r.arrStationName.replace('역', '')}</span>
                      <span className="text-sm text-gray-500 ml-2">{r.schedules.length}회/일</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {sameArrRoutes.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">{route.arrStationName.replace('역', '')}으로 가는 다른 노선</h3>
                <div className="space-y-2">
                  {sameArrRoutes.map((r, idx) => (
                    <Link
                      key={idx}
                      href={`/SRT/schedule/route/${createRouteSlug(r.depStationName, r.arrStationName)}`}
                      className="block bg-white border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-sm transition"
                    >
                      <span className="font-medium text-gray-900">{r.depStationName.replace('역', '')} →</span>
                      <span className="text-sm text-gray-500 ml-2">{r.schedules.length}회/일</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SEO 텍스트 */}
      <section className="mt-12 bg-gray-100 rounded-lg p-6 text-sm text-gray-700 leading-relaxed">
        <h2 className="font-bold text-gray-900 mb-3">{route.depStationName} → {route.arrStationName} SRT 안내</h2>
        <div className="space-y-2">
          <p>
            {route.depStationName}에서 {route.arrStationName}까지 SRT는 하루 총 <strong>{schedules.length}회</strong> 운행됩니다.
            첫차는 <strong>{schedules[0]?.depTime}</strong>에 출발하고, 막차는 <strong>{schedules[schedules.length - 1]?.depTime}</strong>에 출발합니다.
          </p>
          <p>
            요금은 열차 유형에 따라 <strong>{formatCharge(minCharge)}</strong>부터 <strong>{formatCharge(maxCharge)}</strong>까지 다양합니다.
            {trainTypeList} 열차 중 선택하여 예매할 수 있습니다.
          </p>
          <p>
            예매는 <a href="https://etk.srail.kr" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">SRT</a> 또는
            <a href="https://www.letskorail.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline ml-1">코레일</a>에서
            온라인으로 가능하며, 출발 20분 전까지 역에 도착하시기 바랍니다.
          </p>
        </div>
      </section>
    </div>
  );
}

// 출발역 꿀팁 컴포넌트
function StationTipsSection({ stationName, label }: { stationName: string; label: string }) {
  const guide = getStationGuide(stationName);
  if (!guide) return null;

  return (
    <section className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        <span className="mr-2">&#x1F4CD;</span> {stationName} {label} 꿀팁
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 대중교통 연결 */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="w-7 h-7 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-sm">&#x1F687;</span>
            대중교통 연결
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {guide.transport.subway && <li className="flex gap-2"><span className="text-blue-500 font-bold">&#x2022;</span> {guide.transport.subway}</li>}
            {guide.transport.bus && <li className="flex gap-2"><span className="text-green-500 font-bold">&#x2022;</span> {guide.transport.bus}</li>}
            {guide.transport.taxi && <li className="flex gap-2"><span className="text-yellow-600 font-bold">&#x2022;</span> {guide.transport.taxi}</li>}
          </ul>
        </div>

        {/* 주차 및 주변 정보 */}
        <div>
          {guide.parking && (
            <div className="mb-4">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-gray-100 text-gray-600 rounded flex items-center justify-center text-sm">&#x1F17F;</span>
                주차 정보
              </h3>
              <p className="text-sm text-gray-700">{guide.parking.info}</p>
            </div>
          )}
          {guide.nearby && (
            <div>
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="w-7 h-7 bg-green-100 text-green-600 rounded flex items-center justify-center text-sm">&#x1F3EA;</span>
                주변 정보
              </h3>
              <p className="text-sm text-gray-700">{guide.nearby}</p>
            </div>
          )}
        </div>
      </div>

      {/* 이용 팁 */}
      {guide.tips && guide.tips.length > 0 && (
        <div className="mt-4 bg-purple-50 rounded-lg p-4">
          <h3 className="font-bold text-purple-800 mb-2 text-sm">이용 팁</h3>
          <ul className="space-y-1">
            {guide.tips.map((tip, idx) => (
              <li key={idx} className="text-sm text-purple-700 flex gap-2">
                <span className="flex-shrink-0">&#x1F4A1;</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// SRT vs KTX 비교 컴포넌트
function TransportCompareSection({ depName, arrName, minCharge, duration }: { depName: string; arrName: string; minCharge: number; duration: string | null }) {
  // 주요 노선에 대한 SRT vs KTX 비교 데이터
  const ktxRoutes: Record<string, { ktxPrice: string; ktxTime: string; ktxStation: string }> = {
    '수서역-부산역': { ktxPrice: '59,800원', ktxTime: '약 2시간 30분', ktxStation: '서울역 출발' },
    '수서역-동대구역': { ktxPrice: '43,500원', ktxTime: '약 1시간 40분', ktxStation: '서울역 출발' },
    '수서역-대전역': { ktxPrice: '23,700원', ktxTime: '약 50분', ktxStation: '서울역 출발' },
  };

  const srtPrices: Record<string, { srtPrice: string; srtTime: string }> = {
    '수서역-부산역': { srtPrice: '52,600원', srtTime: '약 2시간 20분' },
    '수서역-동대구역': { srtPrice: '39,900원', srtTime: '약 1시간 30분' },
    '수서역-대전역': { srtPrice: '20,900원', srtTime: '약 45분' },
  };

  // 출발역-도착역으로 키 생성
  const routeKey = `${depName}-${arrName}`;
  const ktxData = ktxRoutes[routeKey];
  const srtData = srtPrices[routeKey];

  if (!ktxData || !srtData) return null;

  const depClean = depName.replace('역', '');
  const arrClean = arrName.replace('역', '');

  return (
    <section className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        <span className="mr-2">&#x1F504;</span> SRT vs KTX 비교
      </h2>
      <p className="text-sm text-gray-600 mb-4">{depClean} → {arrClean} 구간의 SRT와 KTX 비교입니다.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="py-3 px-4 text-left font-bold text-gray-900">구분</th>
              <th className="py-3 px-4 text-center font-bold text-purple-700 bg-purple-50 rounded-t-lg">SRT</th>
              <th className="py-3 px-4 text-center font-bold text-emerald-700">KTX</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-medium text-gray-700">요금</td>
              <td className="py-3 px-4 text-center bg-purple-50 font-bold text-purple-700">{srtData.srtPrice}</td>
              <td className="py-3 px-4 text-center text-gray-700">{ktxData.ktxPrice}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-medium text-gray-700">소요시간</td>
              <td className="py-3 px-4 text-center bg-purple-50 font-bold text-purple-700">{srtData.srtTime}</td>
              <td className="py-3 px-4 text-center text-gray-700">{ktxData.ktxTime}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-3 px-4 font-medium text-gray-700">출발역</td>
              <td className="py-3 px-4 text-center bg-purple-50 text-gray-700">수서역</td>
              <td className="py-3 px-4 text-center text-gray-700">{ktxData.ktxStation}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 font-medium text-gray-700">장점</td>
              <td className="py-3 px-4 text-center bg-purple-50 text-gray-700 text-xs">저렴한 요금, 빠른 소요시간</td>
              <td className="py-3 px-4 text-center text-gray-700 text-xs">서울 도심(서울역) 출발, 넓은 노선망</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-3">* 요금은 일반석 정상 요금 기준이며, 할인 및 변동이 있을 수 있습니다. KTX는 서울역 출발 기준입니다.</p>
    </section>
  );
}

// 명절·성수기 안내 컴포넌트
function SeasonalNotice({ depName, arrName }: { depName: string; arrName: string }) {
  return (
    <section className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
      <h2 className="text-lg font-bold mb-3 text-amber-900 flex items-center gap-2">
        <span>&#x1F4C5;</span> 명절·성수기 이용 안내
      </h2>
      <div className="space-y-3 text-sm text-amber-800">
        <div className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
          <p><strong>설날·추석 연휴:</strong> {depName} → {arrName} 노선은 명절 약 2주 전부터 예매가 시작됩니다. SRT 공식 사이트(etk.srail.kr) 또는 SR 앱에서 사전 예매를 하지 않으면 좌석 확보가 어려울 수 있습니다.</p>
        </div>
        <div className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
          <p><strong>임시 열차:</strong> 명절 연휴, 여름 휴가철(7~8월), 겨울 스키시즌에는 임시 열차가 추가 배차됩니다. 정확한 시간표는 출발일 기준 SRT 예매 사이트에서 확인하세요.</p>
        </div>
        <div className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
          <p><strong>혼잡 시간대:</strong> 금요일 오후~저녁, 일요일 오후가 가장 혼잡합니다. 가능하면 평일 또는 오전 시간대를 이용하면 여유롭게 탑승할 수 있습니다.</p>
        </div>
      </div>
    </section>
  );
}
