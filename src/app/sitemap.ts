import type { MetadataRoute } from 'next';
import { getStations, getKtxRoutes, getSrtRoutes, getItxRoutes, getMugunghwaRoutes, getMetadata } from '@/lib/data';
import { createStationSlug, createRouteSlug } from '@/lib/slugs';

// output: 'export' 호환을 위한 설정
export const dynamic = 'force-static';

const BASE_URL = 'https://train.mustarddata.com';

// 인기 노선 slug (높은 우선순위 부여)
const popularRouteSlugs = [
  '서울역-부산역',
  '서울역-동대구역',
  '서울역-대전역',
  '서울역-강릉역',
  '서울역-광주송정역',
];

// 주요 역 이름
const majorStationNames = [
  '서울', '용산', '부산', '동대구', '대전', '광주송정', '강릉', '울산',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const stations = getStations();
  const ktxRoutes = getKtxRoutes();
  const srtRoutes = getSrtRoutes();
  const itxRoutes = getItxRoutes();
  const mugunghwaRoutes = getMugunghwaRoutes();
  const metadata = getMetadata();

  // 데이터 마지막 업데이트 날짜 (데이터 기반 페이지용)
  const dataLastModified = metadata?.lastUpdated
    ? new Date(metadata.lastUpdated)
    : new Date();

  // 빌드 날짜 (정적 페이지용 — 구조 변경 시에만 갱신)
  const buildDate = new Date();

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: dataLastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/KTX/schedule/`,
      lastModified: buildDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/SRT/schedule/`,
      lastModified: buildDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/ITX/schedule/`,
      lastModified: buildDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/mugunghwa/schedule/`,
      lastModified: buildDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/stations/`,
      lastModified: buildDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
  ];

  // 기차역 정보 페이지 (/stations/[station]) - 중복 제거
  const stationSlugs = new Set<string>();
  const stationPages: MetadataRoute.Sitemap = stations
    .filter(s => {
      const slug = createStationSlug(s.stationName);
      if (stationSlugs.has(slug)) return false;
      stationSlugs.add(slug);
      return true;
    })
    .map(s => {
      const slug = createStationSlug(s.stationName);
      const isMajor = majorStationNames.some(name => s.stationName.includes(name));
      return {
        url: `${BASE_URL}/stations/${slug}/`,
        lastModified: dataLastModified,
        changeFrequency: 'weekly' as const,
        priority: isMajor ? 0.85 : 0.7,
      };
    });

  // 역별 스케줄 페이지 (/[trainType]/schedule/[station]) - sitemap에 추가
  function buildStationSchedulePages(
    routes: typeof ktxRoutes,
    trainTypePath: string,
    majorPriority: number,
    normalPriority: number,
  ): MetadataRoute.Sitemap {
    const slugs = new Set<string>();
    const depStationIds = new Set(routes.map(r => r.depStationId));
    return stations
      .filter(s => depStationIds.has(s.stationId))
      .filter(s => {
        const slug = createStationSlug(s.stationName);
        if (slugs.has(slug)) return false;
        slugs.add(slug);
        return true;
      })
      .map(s => {
        const slug = createStationSlug(s.stationName);
        const isMajor = majorStationNames.some(name => s.stationName.includes(name));
        return {
          url: `${BASE_URL}/${trainTypePath}/schedule/${slug}/`,
          lastModified: dataLastModified,
          changeFrequency: 'weekly' as const,
          priority: isMajor ? majorPriority : normalPriority,
        };
      });
  }

  const ktxStationPages = buildStationSchedulePages(ktxRoutes, 'KTX', 0.85, 0.7);
  const srtStationPages = buildStationSchedulePages(srtRoutes, 'SRT', 0.85, 0.7);
  const itxStationPages = buildStationSchedulePages(itxRoutes, 'ITX', 0.8, 0.65);
  const mugunghwaStationPages = buildStationSchedulePages(mugunghwaRoutes, 'mugunghwa', 0.8, 0.65);

  // 노선 페이지 생성 헬퍼
  function buildRoutePages(
    routes: typeof ktxRoutes,
    trainTypePath: string,
    popularPriority: number,
    normalPriority: number,
  ): MetadataRoute.Sitemap {
    const slugs = new Set<string>();
    return routes
      .filter(route => {
        const slug = createRouteSlug(route.depStationName, route.arrStationName);
        if (slugs.has(slug)) return false;
        slugs.add(slug);
        return true;
      })
      .map(route => {
        const slug = createRouteSlug(route.depStationName, route.arrStationName);
        const isPopular = popularRouteSlugs.includes(slug);
        return {
          url: `${BASE_URL}/${trainTypePath}/schedule/route/${slug}/`,
          lastModified: dataLastModified,
          changeFrequency: 'weekly' as const,
          priority: isPopular ? popularPriority : normalPriority,
        };
      });
  }

  const ktxRoutePages = buildRoutePages(ktxRoutes, 'KTX', 0.85, 0.7);
  const srtRoutePages = buildRoutePages(srtRoutes, 'SRT', 0.85, 0.7);
  const itxRoutePages = buildRoutePages(itxRoutes, 'ITX', 0.8, 0.65);
  const mugunghwaRoutePages = buildRoutePages(mugunghwaRoutes, 'mugunghwa', 0.8, 0.65);

  return [
    ...staticPages,
    ...stationPages,
    ...ktxStationPages,
    ...srtStationPages,
    ...itxStationPages,
    ...mugunghwaStationPages,
    ...ktxRoutePages,
    ...srtRoutePages,
    ...itxRoutePages,
    ...mugunghwaRoutePages,
  ];
}
