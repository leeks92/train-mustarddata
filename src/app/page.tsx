import Link from 'next/link';
import { getStations, getRoutes, getKtxRoutes, getSrtRoutes, getItxRoutes, getMugunghwaRoutes, getMetadata } from '@/lib/data';
import { WebSiteJsonLd, OrganizationJsonLd, FAQJsonLd, ItemListJsonLd, HowToJsonLd, ServiceJsonLd } from '@/components/JsonLd';
import SearchForm from '@/components/SearchForm';
import { createRouteSlug, createStationSlug } from '@/lib/slugs';

// 인기 노선 (열차 유형별)
const popularRoutesByCategory = [
  {
    category: 'KTX',
    label: 'KTX',
    color: 'emerald',
    routes: [
      { dep: '서울', arr: '부산', depShort: '서울', arrShort: '부산' },
      { dep: '서울', arr: '동대구', depShort: '서울', arrShort: '대구' },
      { dep: '서울', arr: '대전', depShort: '서울', arrShort: '대전' },
      { dep: '용산', arr: '광주송정', depShort: '용산', arrShort: '광주송정' },
    ],
  },
  {
    category: 'SRT',
    label: 'SRT',
    color: 'purple',
    routes: [
      { dep: '수서', arr: '부산', depShort: '수서', arrShort: '부산' },
      { dep: '수서', arr: '동대구', depShort: '수서', arrShort: '대구' },
      { dep: '수서', arr: '대전', depShort: '수서', arrShort: '대전' },
    ],
  },
  {
    category: 'ITX',
    label: 'ITX',
    color: 'sky',
    routes: [
      { dep: '청량리', arr: '춘천', depShort: '청량리', arrShort: '춘천' },
      { dep: '서울', arr: '대전', depShort: '서울', arrShort: '대전' },
    ],
  },
  {
    category: '무궁화호',
    label: '무궁화호',
    color: 'orange',
    routes: [
      { dep: '서울', arr: '대전', depShort: '서울', arrShort: '대전' },
      { dep: '서울', arr: '경주', depShort: '서울', arrShort: '경주' },
      { dep: '서울', arr: '부산', depShort: '서울', arrShort: '부산' },
    ],
  },
];

// 주요 기차역 목록 (SEO용)
const majorStations = [
  '서울',
  '용산',
  '부산',
  '동대구',
  '대전',
  '광주송정',
  '강릉',
  '울산',
];

const BASE_URL = 'https://train.mustarddata.com';

const faqItems = [
  {
    question: 'KTX와 SRT의 차이점은 무엇인가요?',
    answer: 'KTX는 한국철도공사(코레일)가 운영하는 고속열차이며, SRT는 SR(주)이 운영하는 고속열차입니다. KTX는 서울역·용산역에서 출발하고, SRT는 수서역에서 출발합니다. 두 열차 모두 최고 속도 300km/h로 운행하지만, SRT는 수서~부산 구간에서 약간 더 저렴한 요금으로 이용할 수 있습니다.',
  },
  {
    question: 'SRT는 어떻게 예매하나요?',
    answer: 'SRT는 SR(주)에서 운영하며, SRT 전용 앱 또는 홈페이지(etk.srail.kr)에서 예매할 수 있습니다. 코레일 앱에서는 SRT를 예매할 수 없으므로 반드시 SRT 앱을 이용해야 합니다. 회원 가입 후 출발역(수서)과 도착역을 선택하여 예매하면 됩니다.',
  },
  {
    question: 'ITX-새마을과 ITX-청춘의 차이점은 무엇인가요?',
    answer: 'ITX-새마을은 서울~부산 등 주요 간선 노선을 운행하는 준고속열차입니다. ITX-청춘은 용산(청량리)~춘천 구간을 운행하는 열차로, 경춘선 전용 열차입니다. 두 열차 모두 코레일에서 운영하며 코레일톡 앱에서 예매할 수 있습니다.',
  },
  {
    question: '무궁화호 자유석은 어떻게 이용하나요?',
    answer: '무궁화호에는 좌석 지정 없이 이용할 수 있는 자유석이 있습니다. 자유석 승차권은 역 창구나 자동발매기에서 구입할 수 있으며, 빈 좌석에 자유롭게 앉을 수 있습니다. 자유석 요금은 지정석보다 약간 저렴합니다.',
  },
  {
    question: '기차표는 어디서 예매할 수 있나요?',
    answer: 'KTX, ITX, 무궁화호 등 코레일 열차는 코레일톡 앱 또는 코레일 홈페이지(www.letskorail.com)에서 예매할 수 있습니다. SRT는 SRT 앱 또는 홈페이지(etk.srail.kr)에서 예매 가능합니다.',
  },
  {
    question: '열차 시간표는 얼마나 자주 업데이트되나요?',
    answer: '본 서비스의 시간표는 정기적으로 업데이트됩니다. 명절이나 공휴일에는 임시 열차가 운행될 수 있으므로 공식 예매 사이트에서 최종 확인하는 것이 좋습니다.',
  },
  {
    question: 'KTX 요금은 어떻게 되나요?',
    answer: 'KTX 요금은 노선과 좌석 등급에 따라 다릅니다. 예를 들어 서울-부산 구간은 일반실 약 59,800원, 특실 약 83,700원입니다. 조기 예매 할인, 청소년 할인 등 다양한 할인 제도가 있습니다.',
  },
  {
    question: '열차 예매 취소는 어떻게 하나요?',
    answer: '예매한 사이트(코레일, SRT)에서 취소할 수 있습니다. 출발 전 취소 시점에 따라 수수료가 다르며, 출발 3시간 전까지 무료 취소가 가능합니다.',
  },
  {
    question: '어린이/청소년 할인은 어떻게 받나요?',
    answer: '만 6세~12세 어린이는 약 50% 할인, 만 13세~24세 청소년은 약 30% 할인이 적용됩니다(KTX 기준). 코레일톡에서 나이를 입력하면 자동으로 할인 요금이 적용됩니다.',
  },
];

// HowTo 스텝 (기차 이용 방법)
const howToSteps = [
  {
    name: '시간표 검색',
    text: '출발역과 도착역을 선택하여 열차 시간표를 검색합니다. 원하는 날짜의 운행 시간과 요금을 확인할 수 있습니다.',
  },
  {
    name: '열차 예매',
    text: 'KTX·일반열차는 코레일톡 앱 또는 코레일 홈페이지(www.letskorail.com)에서 예매합니다. SRT는 SRT 앱(etk.srail.kr)에서 예매합니다.',
  },
  {
    name: '역 도착',
    text: '출발 20분 전까지 역에 도착하여 자동발권기에서 승차권을 수령하거나 모바일 승차권을 준비합니다.',
  },
  {
    name: '열차 탑승',
    text: '해당 승강장에서 열차에 탑승합니다. 좌석 번호를 확인하고 착석 후 편안한 여행을 즐기세요.',
  },
];

export default function HomePage() {
  const stations = getStations();
  const routes = getRoutes();
  const ktxRoutes = getKtxRoutes();
  const srtRoutes = getSrtRoutes();
  const itxRoutes = getItxRoutes();
  const mugunghwaRoutes = getMugunghwaRoutes();
  const metadata = getMetadata();

  // ItemList용 전체 카테고리 데이터
  let position = 0;
  const popularRouteItems = popularRoutesByCategory.flatMap((cat) =>
    cat.routes.map((route) => {
      position++;
      return {
        name: `${route.depShort} → ${route.arrShort} ${cat.label}`,
        url: `${BASE_URL}/${cat.category}/schedule/route/${createRouteSlug(route.dep, route.arr)}`,
        description: `${route.depShort}에서 ${route.arrShort}까지 ${cat.label} 시간표`,
        position,
      };
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* JSON-LD 구조화 데이터 - SEO 최적화 */}
      <WebSiteJsonLd
        name="전국 KTX·열차 시간표 조회"
        url={BASE_URL}
        description="전국 KTX, ITX, 무궁화호 열차 시간표와 요금 정보를 무료로 조회하세요. 서울, 부산, 대구, 대전, 광주송정, 강릉 등 전국 기차역 운행 정보 제공."
      />
      <OrganizationJsonLd />
      <FAQJsonLd items={faqItems} />
      <ItemListJsonLd items={popularRouteItems} name="인기 열차 노선 (KTX·SRT·ITX·무궁화호)" />
      <HowToJsonLd
        name="KTX·열차 이용 방법"
        description="전국 KTX, ITX, 무궁화호 열차를 예매하고 이용하는 방법을 안내합니다."
        steps={howToSteps}
        totalTime="PT20M"
      />
      <ServiceJsonLd
        name="전국 열차 시간표 서비스"
        description="전국 KTX, ITX, 무궁화호 열차 시간표와 요금 정보를 무료로 제공하는 서비스입니다."
        provider="MustardData"
        areaServed={['서울', '부산', '대구', '대전', '광주', '울산', '강릉', '전주', '목포', '포항']}
      />

      {/* 히어로 섹션 (그라데이션 배경) */}
      <section className="relative h-[400px] flex flex-col justify-center items-center text-white overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500">
          {/* 장식 패턴 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-2xl"></div>
          </div>
          {/* 기차 라인 장식 */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <div className="absolute bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>

        <div className="relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            전국 열차 시간표 무료 조회
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            전국 KTX·열차 시간표
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-md max-w-2xl mx-auto">
            출발역과 도착역을 선택하여 가장 빠르고 정확한 열차 시간표와 요금을 확인하세요
          </p>
        </div>
      </section>

      {/* 검색 섹션 (오버랩 효과) */}
      <section className="relative -mt-20 z-20 px-4 mb-16">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-2xl">🔍</span> 시간표 검색
          </h2>
          <SearchForm stations={stations} />

          {/* 통계 */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>기차역 <strong className="text-gray-900 text-lg ml-1">{stations.length}</strong>개</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span>노선 <strong className="text-gray-900 text-lg ml-1">{routes.length.toLocaleString()}</strong>개</span>
            </div>
            {metadata && (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                <span>업데이트 <span className="text-gray-700 ml-1">{new Date(metadata.lastUpdated).toLocaleDateString('ko-KR')}</span></span>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-16">
        {/* 열차 유형별 링크 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* KTX */}
          <Link
            href="/KTX/schedule"
            className="group relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-8">
              <div className="inline-block p-3 rounded-lg bg-emerald-50 text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">KTX 시간표</h3>
              <p className="text-sm text-emerald-600 font-medium mb-3">고속철도 KTX·KTX-이음</p>
              <p className="text-gray-700 mb-4">전국 주요 도시를 고속으로 연결하는 KTX 운행정보를 확인하세요.</p>
              <div className="flex items-center text-emerald-700 font-medium">
                바로가기
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          </Link>

          {/* SRT */}
          <Link
            href="/SRT/schedule"
            className="group relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-50 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-8">
              <div className="inline-block p-3 rounded-lg bg-purple-50 text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">SRT 시간표</h3>
              <p className="text-sm text-purple-600 font-medium mb-3">수서발 고속열차</p>
              <p className="text-gray-700 mb-4">수서역에서 출발하는 SRT 고속열차 운행정보를 확인하세요.</p>
              <div className="flex items-center text-purple-700 font-medium">
                바로가기
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          </Link>

          {/* ITX */}
          <Link
            href="/ITX/schedule"
            className="group relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sky-50 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-8">
              <div className="inline-block p-3 rounded-lg bg-sky-50 text-sky-600 mb-4 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">ITX 시간표</h3>
              <p className="text-sm text-sky-600 font-medium mb-3">ITX-새마을·ITX-청춘</p>
              <p className="text-gray-700 mb-4">주요 도시를 연결하는 ITX 준고속열차 운행정보를 확인하세요.</p>
              <div className="flex items-center text-sky-700 font-medium">
                바로가기
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          </Link>

          {/* 무궁화호·누리로 */}
          <Link
            href="/mugunghwa/schedule"
            className="group relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-50 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
            <div className="p-8">
              <div className="inline-block p-3 rounded-lg bg-orange-50 text-orange-600 mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">무궁화호·누리로 시간표</h3>
              <p className="text-sm text-orange-600 font-medium mb-3">무궁화호·누리로 · <span className="font-bold">저렴한 요금</span></p>
              <p className="text-gray-700 mb-4">전국 방방곡곡을 연결하는 무궁화호·누리로 운행정보를 확인하세요.</p>
              <div className="flex items-center text-orange-700 font-medium">
                바로가기
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          </Link>
        </section>

        {/* 인기 노선 (카테고리별) */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🚄 주요 노선</h2>
          </div>
          <div className="space-y-8">
            {popularRoutesByCategory.map((cat) => {
              const colorMap: Record<string, { badge: string; border: string; arrow: string }> = {
                emerald: { badge: 'text-emerald-600 bg-emerald-50', border: 'hover:border-emerald-300', arrow: 'group-hover:text-emerald-500' },
                purple: { badge: 'text-purple-600 bg-purple-50', border: 'hover:border-purple-300', arrow: 'group-hover:text-purple-500' },
                sky: { badge: 'text-sky-600 bg-sky-50', border: 'hover:border-sky-300', arrow: 'group-hover:text-sky-500' },
                orange: { badge: 'text-orange-600 bg-orange-50', border: 'hover:border-orange-300', arrow: 'group-hover:text-orange-500' },
              };
              const colors = colorMap[cat.color] || colorMap.emerald;
              return (
                <div key={cat.category}>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">{cat.label}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cat.routes.map((route, index) => (
                      <Link
                        key={index}
                        href={`/${cat.category}/schedule/route/${createRouteSlug(route.dep, route.arr)}`}
                        className={`bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg ${colors.border} transition-all group`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-semibold ${colors.badge} px-2 py-1 rounded`}>{cat.label}</span>
                          <span className={`text-gray-400 ${colors.arrow} transition-colors`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-lg font-bold text-gray-800">
                          <span>{route.depShort}</span>
                          <span className="text-gray-300 mx-2">|</span>
                          <span>{route.arrShort}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 역 찾기 */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📍 역 찾기</h2>
          <div className="text-center">
            <Link
              href="/stations"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-md hover:shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              전국 기차역 보기
            </Link>
            <p className="text-gray-500 mt-4 text-sm">전국 기차역 목록과 운행 정보를 확인하세요</p>
          </div>
        </section>

        {/* FAQ 섹션 */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">❓ 자주 묻는 질문</h2>
          <div className="space-y-4">
            {faqItems.slice(0, 6).map((faq, index) => (
              <details key={index} className="bg-white border border-gray-200 rounded-lg group">
                <summary className="p-4 cursor-pointer font-medium text-gray-900 flex items-center justify-between hover:bg-gray-50">
                  <span>{faq.question}</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-700 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* 주요 기차역 링크 (SEO용 내부 링크) */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🏛️ 주요 기차역</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {majorStations.map((station, index) => (
              <Link
                key={index}
                href={`/stations/${createStationSlug(station)}`}
                className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:border-emerald-300 hover:shadow-md transition-all text-sm font-medium text-gray-800"
              >
                {station}역
              </Link>
            ))}
          </div>
        </section>

        {/* SEO 텍스트 */}
        <section className="mt-16 bg-gray-100 rounded-xl p-6 text-gray-700 text-sm leading-relaxed">
          <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            전국 열차 시간표 서비스 안내
          </h2>
          <div className="space-y-3">
            <p>
              본 서비스는 한국철도공사(코레일) 및 SR(주)의 공공데이터를 활용하여 전국 <strong>KTX</strong>, <strong>SRT</strong>, <strong>ITX-새마을</strong>, <strong>ITX-청춘</strong>, <strong>무궁화호</strong>, <strong>누리로</strong> 등 모든 열차의 시간표와 요금 정보를 제공합니다.
              서울역, 수서역, 용산역, 부산역, 동대구역, 대전역, 광주송정역, 강릉역 등 전국 주요 기차역의 최신 정보를 쉽고 빠르게 검색할 수 있습니다.
            </p>
            <p>
              <strong>KTX</strong>는 코레일이 운영하는 최고 시속 300km의 고속열차로, 서울-부산을 약 2시간 30분에 연결합니다.
              <strong>SRT</strong>는 SR(주)이 운영하는 고속열차로, 수서역에서 출발하여 부산·대구·대전 등 주요 도시를 연결합니다.
              <strong>ITX-새마을</strong>과 <strong>ITX-청춘</strong>은 주요 도시를 연결하는 준고속열차이며,
              <strong>무궁화호</strong>와 <strong>누리로</strong>는 저렴한 요금으로 전국 방방곡곡의 역을 연결하는 일반열차입니다.
            </p>
            <p>
              좌석 등급은 <strong>일반실</strong>과 <strong>특실</strong>로 구분되며, 특실은 더 넓은 좌석과 편의시설을 제공합니다.
              KTX-산천, KTX-이음 등 차량에 따라 좌석 배열과 편의시설이 다를 수 있습니다.
            </p>
            <p>
              제공되는 정보는 코레일·SR(주)의 사정에 따라 변경될 수 있으며, 명절이나 공휴일에는 임시 열차가 운행될 수 있습니다.
              KTX·ITX·무궁화호 예매는 <a href="https://www.letskorail.com" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-semibold">코레일 홈페이지</a>,
              SRT 예매는 <a href="https://etk.srail.kr" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-semibold ml-1">SRT 홈페이지</a>를 이용해 주시기 바랍니다.
            </p>
          </div>
        </section>

        {/* 열차 이용 방법 (HowTo) */}
        <section className="mt-12 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">🚄 KTX·열차 이용 방법</h2>
          <ol className="space-y-3">
            {howToSteps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <div>
                  <strong className="text-gray-900">{step.name}</strong>
                  <p className="text-sm text-gray-600 mt-1">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
