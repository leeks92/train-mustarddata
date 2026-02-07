/**
 * TAGO 공공 API에서 전국 열차 시간표 데이터를 수집하여 JSON 파일로 저장
 * 빌드 전에 실행하여 data/ 폴더에 저장
 * 
 * 사용 API:
 * 1. TrainInfoService - 열차정보 (시간표 조회, 역 목록, 차량종류)
 */

import * as fs from 'fs';
import * as path from 'path';

const SERVICE_KEY = process.env.TRAIN_API_KEY || '';

// API 엔드포인트
const TRAIN_API_URL = 'http://apis.data.go.kr/1613000/TrainInfoService';

interface Station {
  stationId: string;
  stationName: string;
  cityName?: string;
  cityCode?: number;
}

interface ApiStation {
  nodeid: string;
  nodename: string;
}

interface ApiCity {
  citycode: number;
  cityname: string;
}

interface ApiTrainType {
  vehiclekndid: string;
  vehiclekndnm: string;
}

interface ApiSchedule {
  traingradename: string;
  trainno: number;
  depplandtime: number;
  arrplandtime: number;
  depplacename: string;
  arrplacename: string;
  adultcharge?: number;
  depplaceid?: string;
  arrplaceid?: string;
}

interface RouteData {
  depStationId: string;
  depStationName: string;
  arrStationId: string;
  arrStationName: string;
  schedules: {
    trainNo: string;
    trainType: string;
    depTime: string;
    arrTime: string;
    charge: number;
  }[];
}

// API 응답 처리
async function fetchApi<T>(url: string, silent: boolean = false): Promise<T[]> {
  try {
    const response = await fetch(url);
    const text = await response.text();
    
    if (text.includes('OpenAPI_ServiceResponse') || text.includes('SERVICE_ERROR')) {
      if (!silent) console.error('API Service Error');
      return [];
    }
    
    if (text.startsWith('<?xml') || text.startsWith('<')) {
      if (!silent) console.error('Unexpected XML response');
      return [];
    }
    
    if (!text || text.trim() === '') {
      return [];
    }
    
    const data = JSON.parse(text);
    
    if (data.response?.header?.resultCode !== '00') {
      if (!silent) {
        console.error('API Error:', data.response?.header?.resultCode, data.response?.header?.resultMsg);
      }
      return [];
    }
    
    const items = data.response?.body?.items?.item;
    if (!items) return [];
    
    return Array.isArray(items) ? items : [items];
  } catch (error) {
    if (!silent && !(error instanceof SyntaxError)) {
      console.error('Fetch error:', error);
    }
    return [];
  }
}

// 딜레이 함수
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 시간 문자열 변환 (202301011030 -> 10:30)
function formatTime(timeStr: string | number): string {
  const str = String(timeStr);
  if (str.length < 12) return '';
  const hour = str.substring(8, 10);
  const minute = str.substring(10, 12);
  return `${hour}:${minute}`;
}

// 도시 목록 조회
async function getCityList(): Promise<ApiCity[]> {
  console.log('Fetching city list...');
  const url = `${TRAIN_API_URL}/getCtyCodeList?serviceKey=${SERVICE_KEY}&numOfRows=100&pageNo=1&_type=json`;
  return fetchApi<ApiCity>(url);
}

// 시도별 기차역 목록 조회
async function getStationList(cityCode: number): Promise<ApiStation[]> {
  const url = `${TRAIN_API_URL}/getCtyAcctoTrainSttnList?serviceKey=${SERVICE_KEY}&numOfRows=500&pageNo=1&_type=json&cityCode=${cityCode}`;
  return fetchApi<ApiStation>(url, true);
}

// 차량 종류 목록 조회
async function getTrainTypeList(): Promise<ApiTrainType[]> {
  console.log('Fetching train type list...');
  const url = `${TRAIN_API_URL}/getVhcleKndList?serviceKey=${SERVICE_KEY}&numOfRows=50&pageNo=1&_type=json`;
  return fetchApi<ApiTrainType>(url);
}

// 열차 시간표 조회
async function getTrainSchedules(
  depStationId: string,
  arrStationId: string,
  depDate: string,
  trainTypeId?: string
): Promise<ApiSchedule[]> {
  let url = `${TRAIN_API_URL}/getStrtpntAlocFndTrainInfo?serviceKey=${SERVICE_KEY}&depPlaceId=${depStationId}&arrPlaceId=${arrStationId}&depPlandTime=${depDate}&numOfRows=100&pageNo=1&_type=json`;
  if (trainTypeId) {
    url += `&trainGradeCode=${trainTypeId}`;
  }
  return fetchApi<ApiSchedule>(url, true);
}

async function main() {
  if (!SERVICE_KEY) {
    console.error('Error: TRAIN_API_KEY 환경 변수가 설정되지 않았습니다.');
    console.log('사용법: TRAIN_API_KEY=your_api_key npm run fetch-data');
    process.exit(1);
  }

  console.log('=== 기차 데이터 수집 시작 ===\n');
  console.log(`API Key: ${SERVICE_KEY.substring(0, 10)}...`);
  
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 1. 차량 종류 목록 조회
  const trainTypes = await getTrainTypeList();
  console.log(`열차 종류: ${trainTypes.length}개`);
  trainTypes.forEach(t => console.log(`  - ${t.vehiclekndid}: ${t.vehiclekndnm}`));
  
  await delay(300);

  // 2. 도시 목록 조회 및 역 목록 수집
  const cities = await getCityList();
  console.log(`\n도시 목록: ${cities.length}개`);
  
  const allStations: Station[] = [];
  const stationIdSet = new Set<string>();
  
  for (const city of cities) {
    await delay(200);
    const stations = await getStationList(city.citycode);
    
    for (const station of stations) {
      if (!stationIdSet.has(station.nodeid)) {
        stationIdSet.add(station.nodeid);
        allStations.push({
          stationId: station.nodeid,
          stationName: station.nodename,
          cityName: city.cityname,
          cityCode: city.citycode,
        });
      }
    }
    
    if (stations.length > 0) {
      console.log(`  ${city.cityname}: ${stations.length}개 역`);
    }
  }
  
  console.log(`\n전체 기차역: ${allStations.length}개`);
  
  // 역 데이터 저장
  fs.writeFileSync(
    path.join(dataDir, 'stations.json'),
    JSON.stringify(allStations, null, 2)
  );

  // 3. 노선 수집
  console.log('\n=== 열차 노선 수집 ===');
  const routes: RouteData[] = [];
  const routeSet = new Set<string>();
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  console.log(`조회 날짜: ${today}`);
  
  // 주요 역 선별
  const majorStationNames = [
    '서울', '용산', '영등포', '수원', '평택', '천안아산', '오송', '대전',
    '김천(구미)', '동대구', '경주', '울산(통도사)', '부산',
    '광명', '천안', '조치원', '세종', '공주', '익산', '전주', '광주송정', '나주', '목포',
    '여수EXPO', '순천', '구례구', '남원', '곡성',
    '강릉', '동해', '정동진', '만종', '원주', '양평',
    '청량리', '춘천', '가평', '남춘천',
    '포항', '안동', '영주',
    '마산', '진주', '창원',
    '구포', '밀양', '삼랑진',
    '김제', '정읍',
    '동탄',
  ];
  
  const majorStations = allStations.filter(s =>
    majorStationNames.some(name => 
      s.stationName.includes(name) || name.includes(s.stationName.replace('역', ''))
    )
  );
  
  // 중복 제거
  const uniqueMajorStations = [...new Map(majorStations.map(s => [s.stationId, s])).values()];
  
  console.log(`주요 역: ${uniqueMajorStations.length}개`);
  console.log(`상위 10개: ${uniqueMajorStations.slice(0, 10).map(s => s.stationName).join(', ')}`);
  
  const totalCombinations = uniqueMajorStations.length * (uniqueMajorStations.length - 1);
  console.log(`총 조합 수: ${totalCombinations} (예상 소요: ${Math.round(totalCombinations * 80 / 1000 / 60)}분)`);
  
  let stationIndex = 0;
  let apiCalls = 0;
  
  for (const depStation of uniqueMajorStations) {
    stationIndex++;
    
    for (const arrStation of uniqueMajorStations) {
      if (depStation.stationId === arrStation.stationId) continue;
      
      const routeKey = `${depStation.stationId}-${arrStation.stationId}`;
      if (routeSet.has(routeKey)) continue;
      
      await delay(60);
      apiCalls++;
      
      const schedules = await getTrainSchedules(
        depStation.stationId,
        arrStation.stationId,
        today
      );
      
      if (schedules.length > 0) {
        routeSet.add(routeKey);
        routes.push({
          depStationId: depStation.stationId,
          depStationName: depStation.stationName,
          arrStationId: arrStation.stationId,
          arrStationName: arrStation.stationName,
          schedules: schedules.map(s => ({
            trainNo: String(s.trainno),
            trainType: s.traingradename || '기타',
            depTime: formatTime(s.depplandtime),
            arrTime: formatTime(s.arrplandtime),
            charge: s.adultcharge || 0,
          })),
        });
      }
    }
    
    // 진행 상황 (5개 역마다)
    if (stationIndex % 5 === 0) {
      console.log(`진행: ${stationIndex}/${uniqueMajorStations.length} 출발역 완료 - API 호출: ${apiCalls}회 - 수집된 노선: ${routes.length}개`);
      
      // 중간 저장
      fs.writeFileSync(
        path.join(dataDir, 'routes.json'),
        JSON.stringify(routes, null, 2)
      );
    }
  }
  
  console.log(`\n전체 노선: ${routes.length}개 (API 호출: ${apiCalls}회)`);

  // 4. 열차 유형별 분리 저장
  console.log('\n=== 열차 유형별 파일 분리 ===');
  
  function filterRoutesByType(
    allRoutes: RouteData[],
    filterFn: (s: { trainType: string }) => boolean
  ): RouteData[] {
    return allRoutes
      .map(r => ({
        ...r,
        schedules: r.schedules.filter(filterFn),
      }))
      .filter(r => r.schedules.length > 0);
  }

  const ktxRoutes = filterRoutesByType(routes, s => s.trainType.includes('KTX'));
  const srtRoutes = filterRoutesByType(routes, s => s.trainType.includes('SRT'));
  const itxRoutes = filterRoutesByType(routes, s => s.trainType.includes('ITX'));
  const mugunghwaRoutes = filterRoutesByType(routes, s =>
    s.trainType.includes('무궁화') ||
    s.trainType.includes('누리로') ||
    s.trainType.includes('새마을') ||
    s.trainType.includes('통근')
  );

  fs.writeFileSync(path.join(dataDir, 'routes-ktx.json'), JSON.stringify(ktxRoutes, null, 2));
  fs.writeFileSync(path.join(dataDir, 'routes-srt.json'), JSON.stringify(srtRoutes, null, 2));
  fs.writeFileSync(path.join(dataDir, 'routes-itx.json'), JSON.stringify(itxRoutes, null, 2));
  fs.writeFileSync(path.join(dataDir, 'routes-mugunghwa.json'), JSON.stringify(mugunghwaRoutes, null, 2));

  console.log(`  KTX: ${ktxRoutes.length}개 노선 (${ktxRoutes.reduce((a, r) => a + r.schedules.length, 0)} 스케줄)`);
  console.log(`  SRT: ${srtRoutes.length}개 노선 (${srtRoutes.reduce((a, r) => a + r.schedules.length, 0)} 스케줄)`);
  console.log(`  ITX: ${itxRoutes.length}개 노선 (${itxRoutes.reduce((a, r) => a + r.schedules.length, 0)} 스케줄)`);
  console.log(`  무궁화호: ${mugunghwaRoutes.length}개 노선 (${mugunghwaRoutes.reduce((a, r) => a + r.schedules.length, 0)} 스케줄)`);

  // 5. 메타데이터 저장
  const metadata = {
    lastUpdated: new Date().toISOString(),
    stationCount: allStations.length,
    routeCount: routes.length,
    ktxRouteCount: ktxRoutes.length,
    srtRouteCount: srtRoutes.length,
    itxRouteCount: itxRoutes.length,
    mugunghwaRouteCount: mugunghwaRoutes.length,
  };
  
  fs.writeFileSync(
    path.join(dataDir, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  console.log('\n=== 데이터 수집 완료 ===');
  console.log(`저장 위치: ${dataDir}`);
  console.log(`기차역: ${metadata.stationCount}개`);
  console.log(`전체 노선: ${metadata.routeCount}개`);
  console.log(`  KTX: ${metadata.ktxRouteCount}개 | SRT: ${metadata.srtRouteCount}개 | ITX: ${metadata.itxRouteCount}개 | 무궁화호: ${metadata.mugunghwaRouteCount}개`);
  console.log(`최종 업데이트: ${metadata.lastUpdated}`);
}

main().catch(console.error);
