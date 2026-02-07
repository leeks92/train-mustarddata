import { getRoutes, getKtxRoutes, getSrtRoutes, getItxRoutes, getMugunghwaRoutes, getMetadata } from '@/lib/data';
import { createRouteSlug } from '@/lib/slugs';

// output: 'export' 호환을 위한 설정
export const dynamic = 'force-static';

const BASE_URL = 'https://train.mustarddata.com';

export async function GET() {
  const now = new Date();
  const ktxRoutes = getKtxRoutes();
  const srtRoutes = getSrtRoutes();
  const itxRoutes = getItxRoutes();
  const mugunghwaRoutes = getMugunghwaRoutes();
  const metadata = getMetadata();
  const lastUpdated = metadata?.lastUpdated ? new Date(metadata.lastUpdated).toUTCString() : now.toUTCString();

  const items: string[] = [];

  // 메인 페이지
  items.push(`
    <item>
      <title><![CDATA[기차 시간표 - KTX, ITX, 무궁화호 시간표 조회]]></title>
      <link>${BASE_URL}</link>
      <guid>${BASE_URL}</guid>
      <description><![CDATA[전국 KTX, ITX, 무궁화호 열차 시간표를 조회하세요. 출발역과 도착역을 선택하면 운행 시간, 요금, 소요 시간을 확인할 수 있습니다.]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);

  // KTX 시간표 페이지
  items.push(`
    <item>
      <title><![CDATA[KTX 시간표 - 전국 KTX 역 및 노선 조회]]></title>
      <link>${BASE_URL}/KTX/schedule</link>
      <guid>${BASE_URL}/KTX/schedule</guid>
      <description><![CDATA[전국 KTX 노선 목록과 시간표 정보를 제공합니다. 역을 선택하여 배차 시간표를 확인하세요.]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);

  // SRT 시간표 페이지
  items.push(`
    <item>
      <title><![CDATA[SRT 시간표 - 전국 SRT 노선 조회]]></title>
      <link>${BASE_URL}/SRT/schedule</link>
      <guid>${BASE_URL}/SRT/schedule</guid>
      <description><![CDATA[전국 SRT 노선 목록과 시간표 정보를 제공합니다. 수서발 SRT 시간표와 요금을 확인하세요.]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);

  // ITX 시간표 페이지
  items.push(`
    <item>
      <title><![CDATA[ITX 시간표 - ITX-새마을, ITX-청춘 노선 조회]]></title>
      <link>${BASE_URL}/ITX/schedule</link>
      <guid>${BASE_URL}/ITX/schedule</guid>
      <description><![CDATA[전국 ITX-새마을, ITX-청춘 노선 목록과 시간표 정보를 제공합니다.]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);

  // 무궁화호 시간표 페이지
  items.push(`
    <item>
      <title><![CDATA[무궁화호 시간표 - 무궁화호, 누리로 노선 조회]]></title>
      <link>${BASE_URL}/mugunghwa/schedule</link>
      <guid>${BASE_URL}/mugunghwa/schedule</guid>
      <description><![CDATA[전국 무궁화호, 누리로 노선 목록과 시간표 정보를 제공합니다.]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);

  // 기차역 목록 페이지
  items.push(`
    <item>
      <title><![CDATA[기차역 목록 - 전국 기차역 정보]]></title>
      <link>${BASE_URL}/stations</link>
      <guid>${BASE_URL}/stations</guid>
      <description><![CDATA[전국 기차역 목록입니다. 역별 노선 정보와 시간표를 확인하세요.]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);

  // 인기 KTX 노선 (최대 20개)
  const popularKtxRoutes = ktxRoutes.slice(0, 20);
  popularKtxRoutes.forEach(route => {
    const routeSlug = createRouteSlug(route.depStationName, route.arrStationName);
    const url = `${BASE_URL}/KTX/schedule/route/${routeSlug}`;

    items.push(`
    <item>
      <title><![CDATA[${route.depStationName} → ${route.arrStationName} KTX 시간표]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description><![CDATA[${route.depStationName}에서 ${route.arrStationName}까지 KTX 시간표입니다. 운행 시간, 요금, 소요 시간을 확인하세요.]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);
  });

  // 인기 SRT 노선 (최대 10개)
  const popularSrtRoutes = srtRoutes.slice(0, 10);
  popularSrtRoutes.forEach(route => {
    const routeSlug = createRouteSlug(route.depStationName, route.arrStationName);
    const url = `${BASE_URL}/SRT/schedule/route/${routeSlug}`;

    items.push(`
    <item>
      <title><![CDATA[${route.depStationName} → ${route.arrStationName} SRT 시간표]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description><![CDATA[${route.depStationName}에서 ${route.arrStationName}까지 SRT 시간표입니다. 운행 시간, 요금, 소요 시간을 확인하세요.]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);
  });

  // 인기 ITX 노선 (최대 10개)
  const popularItxRoutes = itxRoutes.slice(0, 10);
  popularItxRoutes.forEach(route => {
    const routeSlug = createRouteSlug(route.depStationName, route.arrStationName);
    const url = `${BASE_URL}/ITX/schedule/route/${routeSlug}`;

    items.push(`
    <item>
      <title><![CDATA[${route.depStationName} → ${route.arrStationName} ITX 시간표]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description><![CDATA[${route.depStationName}에서 ${route.arrStationName}까지 ITX 시간표입니다. 운행 시간, 요금, 소요 시간을 확인하세요.]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);
  });

  // 인기 무궁화호 노선 (최대 10개)
  const popularMugunghwaRoutes = mugunghwaRoutes.slice(0, 10);
  popularMugunghwaRoutes.forEach(route => {
    const routeSlug = createRouteSlug(route.depStationName, route.arrStationName);
    const url = `${BASE_URL}/mugunghwa/schedule/route/${routeSlug}`;

    items.push(`
    <item>
      <title><![CDATA[${route.depStationName} → ${route.arrStationName} 무궁화호 시간표]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description><![CDATA[${route.depStationName}에서 ${route.arrStationName}까지 무궁화호·누리로 시간표입니다. 운행 시간, 요금, 소요 시간을 확인하세요.]]></description>
      <pubDate>${lastUpdated}</pubDate>
    </item>`);
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>기차 시간표 - KTX, ITX, 무궁화호</title>
    <link>${BASE_URL}</link>
    <description>전국 KTX, ITX, 무궁화호 열차 시간표를 조회하세요. 출발역과 도착역을 선택하면 운행 시간, 요금, 소요 시간을 확인할 수 있습니다.</description>
    <language>ko</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items.join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=604800, s-maxage=604800', // 7일 캐시
    },
  });
}
