import type { MetadataRoute } from 'next';
import { getStations, getRoutes, getKtxRoutes, getSrtRoutes, getItxRoutes, getMugunghwaRoutes, getMetadata } from '@/lib/data';
import { createStationSlug, createRouteSlug } from '@/lib/slugs';

// output: 'export' 호환을 위한 설정
export const dynamic = 'force-static';

const BASE_URL = 'https://train.mustarddata.com';

// 인기 노선 slug (높은 우선순위 부여)
const popularRouteSlugs = [
  '서울-부산',
  '서울-동대구',
  '서울-대전',
  '서울-강릉',
  '서울-광주송정',
];

// 주요 역 이름
const majorStationNames = [
  '서울',
  '용산',
  '부산',
  '동대구',
  '대전',
  '광주송정',
  '강릉',
  '울산',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const stations = getStations();
  const routes = getRoutes();
  const ktxRoutes = getKtxRoutes();
  const srtRoutes = getSrtRoutes();
  const itxRoutes = getItxRoutes();
  const mugunghwaRoutes = getMugunghwaRoutes();
  const metadata = getMetadata();

  // 데이터 마지막 업데이트 날짜 (없으면 현재 날짜)
  const dataLastModified = metadata?.lastUpdated
    ? new Date(metadata.lastUpdated)
    : new Date();

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: dataLastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/KTX/schedule`,
      lastModified: dataLastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/SRT/schedule`,
      lastModified: dataLastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/ITX/schedule`,
      lastModified: dataLastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/mugunghwa/schedule`,
      lastModified: dataLastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/stations`,
      lastModified: dataLastModified,
      changeFrequency: 'daily',
      priority: 0.95,
    },
  ];

  // 기차역 페이지 (중복 제거)
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
        url: `${BASE_URL}/stations/${slug}`,
        lastModified: dataLastModified,
        changeFrequency: 'weekly' as const,
        priority: isMajor ? 0.85 : 0.7,
      };
    });

  // KTX 노선 페이지 (중복 제거, 인기 노선 우선순위 높임)
  const ktxRouteSlugs = new Set<string>();
  const ktxRoutePages: MetadataRoute.Sitemap = ktxRoutes
    .filter(route => {
      const slug = createRouteSlug(route.depStationName, route.arrStationName);
      if (ktxRouteSlugs.has(slug)) return false;
      ktxRouteSlugs.add(slug);
      return true;
    })
    .map(route => {
      const slug = createRouteSlug(route.depStationName, route.arrStationName);
      const isPopular = popularRouteSlugs.includes(slug);
      return {
        url: `${BASE_URL}/KTX/schedule/route/${slug}`,
        lastModified: dataLastModified,
        changeFrequency: 'daily' as const,
        priority: isPopular ? 0.85 : 0.7,
      };
    });

  // SRT 노선 페이지 (중복 제거)
  const srtRouteSlugs = new Set<string>();
  const srtRoutePages: MetadataRoute.Sitemap = srtRoutes
    .filter(route => {
      const slug = createRouteSlug(route.depStationName, route.arrStationName);
      if (srtRouteSlugs.has(slug)) return false;
      srtRouteSlugs.add(slug);
      return true;
    })
    .map(route => {
      const slug = createRouteSlug(route.depStationName, route.arrStationName);
      const isPopular = popularRouteSlugs.includes(slug);
      return {
        url: `${BASE_URL}/SRT/schedule/route/${slug}`,
        lastModified: dataLastModified,
        changeFrequency: 'daily' as const,
        priority: isPopular ? 0.85 : 0.7,
      };
    });

  // ITX 노선 페이지 (중복 제거)
  const itxRouteSlugs = new Set<string>();
  const itxRoutePages: MetadataRoute.Sitemap = itxRoutes
    .filter(route => {
      const slug = createRouteSlug(route.depStationName, route.arrStationName);
      if (itxRouteSlugs.has(slug)) return false;
      itxRouteSlugs.add(slug);
      return true;
    })
    .map(route => {
      const slug = createRouteSlug(route.depStationName, route.arrStationName);
      const isPopular = popularRouteSlugs.includes(slug);
      return {
        url: `${BASE_URL}/ITX/schedule/route/${slug}`,
        lastModified: dataLastModified,
        changeFrequency: 'daily' as const,
        priority: isPopular ? 0.8 : 0.65,
      };
    });

  // 무궁화호 노선 페이지 (중복 제거)
  const mugunghwaRouteSlugs = new Set<string>();
  const mugunghwaRoutePages: MetadataRoute.Sitemap = mugunghwaRoutes
    .filter(route => {
      const slug = createRouteSlug(route.depStationName, route.arrStationName);
      if (mugunghwaRouteSlugs.has(slug)) return false;
      mugunghwaRouteSlugs.add(slug);
      return true;
    })
    .map(route => {
      const slug = createRouteSlug(route.depStationName, route.arrStationName);
      const isPopular = popularRouteSlugs.includes(slug);
      return {
        url: `${BASE_URL}/mugunghwa/schedule/route/${slug}`,
        lastModified: dataLastModified,
        changeFrequency: 'daily' as const,
        priority: isPopular ? 0.8 : 0.65,
      };
    });

  return [
    ...staticPages,
    ...stationPages,
    ...ktxRoutePages,
    ...srtRoutePages,
    ...itxRoutePages,
    ...mugunghwaRoutePages,
  ];
}
