import * as fs from 'fs';
import * as path from 'path';

interface Station {
  stationId: string;
  stationName: string;
  cityName?: string;
  cityCode?: number;
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

interface Metadata {
  lastUpdated: string;
  stationCount: number;
  routeCount: number;
}

const dataDir = path.join(process.cwd(), 'data');

// 모듈 레벨 캐시 (빌드 시 동일 파일 반복 읽기 방지)
const cache = new Map<string, unknown>();

// JSON 파일 로드 헬퍼 (캐시 적용)
function loadJson<T>(filename: string): T | null {
  if (cache.has(filename)) {
    return cache.get(filename) as T;
  }
  try {
    let filePath = path.join(dataDir, filename);
    
    // 데이터 디렉토리가 없으면 현재 파일 위치 기준으로 탐색 시도 (Fallback)
    if (!fs.existsSync(filePath)) {
       // process.cwd()가 .next/server 등으로 잡히는 경우 대비
       const altDataDir = path.join(process.cwd(), '..', 'data');
       if (fs.existsSync(path.join(altDataDir, filename))) {
         filePath = path.join(altDataDir, filename);
       } else {
         return null;
       }
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content) as T;
    cache.set(filename, parsed);
    return parsed;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return null;
  }
}

// 기차역 목록
export function getStations(): Station[] {
  return loadJson<Station[]>('stations.json') || [];
}

// 메타데이터
export function getMetadata(): Metadata | null {
  return loadJson<Metadata>('metadata.json');
}

// ── 열차 유형별 노선 (분리된 파일에서 직접 로드) ──

// KTX 노선
export function getKtxRoutes(): RouteData[] {
  return loadJson<RouteData[]>('routes-ktx.json') || [];
}

// SRT 노선
export function getSrtRoutes(): RouteData[] {
  return loadJson<RouteData[]>('routes-srt.json') || [];
}

// ITX 노선 (ITX-새마을, ITX-청춘, ITX-마음)
export function getItxRoutes(): RouteData[] {
  return loadJson<RouteData[]>('routes-itx.json') || [];
}

// 무궁화호·누리로 노선
export function getMugunghwaRoutes(): RouteData[] {
  return loadJson<RouteData[]>('routes-mugunghwa.json') || [];
}

// 전체 노선 (4개 파일 병합 + 중복 노선 스케줄 합치기)
// 기차역 상세 페이지 등에서 전체 데이터가 필요할 때 사용
export function getRoutes(): RouteData[] {
  const cacheKey = '_merged_routes';
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as RouteData[];
  }

  const ktx = getKtxRoutes();
  const srt = getSrtRoutes();
  const itx = getItxRoutes();
  const mugunghwa = getMugunghwaRoutes();

  // 동일 출발-도착 노선의 스케줄을 합치기
  const routeMap = new Map<string, RouteData>();

  for (const routes of [ktx, srt, itx, mugunghwa]) {
    for (const route of routes) {
      const key = `${route.depStationId}-${route.arrStationId}`;
      if (routeMap.has(key)) {
        const existing = routeMap.get(key)!;
        // 중복 스케줄 방지 (trainNo 기준)
        const existingNos = new Set(existing.schedules.map(s => s.trainNo));
        for (const s of route.schedules) {
          if (!existingNos.has(s.trainNo)) {
            existing.schedules.push(s);
          }
        }
      } else {
        routeMap.set(key, { ...route, schedules: [...route.schedules] });
      }
    }
  }

  const merged = Array.from(routeMap.values());
  cache.set(cacheKey, merged);
  return merged;
}

// 일반열차 노선 필터 (하위 호환용)
export function getGeneralRoutes(): RouteData[] {
  const itx = getItxRoutes();
  const mugunghwa = getMugunghwaRoutes();

  const routeMap = new Map<string, RouteData>();
  for (const routes of [itx, mugunghwa]) {
    for (const route of routes) {
      const key = `${route.depStationId}-${route.arrStationId}`;
      if (routeMap.has(key)) {
        const existing = routeMap.get(key)!;
        const existingNos = new Set(existing.schedules.map(s => s.trainNo));
        for (const s of route.schedules) {
          if (!existingNos.has(s.trainNo)) {
            existing.schedules.push(s);
          }
        }
      } else {
        routeMap.set(key, { ...route, schedules: [...route.schedules] });
      }
    }
  }
  return Array.from(routeMap.values());
}

// 특정 노선 조회 (전체 병합 - 역 상세 등에서 사용)
export function getRoute(
  depStationId: string,
  arrStationId: string
): RouteData | null {
  const routes = getRoutes();
  return (
    routes.find(
      r => r.depStationId === depStationId && r.arrStationId === arrStationId
    ) || null
  );
}

// 열차 유형별 특정 노선 조회 (해당 유형 전용 파일에서만 조회)
export function getKtxRoute(depStationId: string, arrStationId: string): RouteData | null {
  const routes = getKtxRoutes();
  return routes.find(r => r.depStationId === depStationId && r.arrStationId === arrStationId) || null;
}

export function getSrtRoute(depStationId: string, arrStationId: string): RouteData | null {
  const routes = getSrtRoutes();
  return routes.find(r => r.depStationId === depStationId && r.arrStationId === arrStationId) || null;
}

export function getItxRoute(depStationId: string, arrStationId: string): RouteData | null {
  const routes = getItxRoutes();
  return routes.find(r => r.depStationId === depStationId && r.arrStationId === arrStationId) || null;
}

export function getMugunghwaRoute(depStationId: string, arrStationId: string): RouteData | null {
  const routes = getMugunghwaRoutes();
  return routes.find(r => r.depStationId === depStationId && r.arrStationId === arrStationId) || null;
}

// 기차역별 출발 노선 목록
export function getRoutesFromStation(stationId: string): RouteData[] {
  const routes = getRoutes();
  return routes.filter(r => r.depStationId === stationId);
}

// 기차역 정보 조회
export function getStation(stationId: string): Station | null {
  const stations = getStations();
  return stations.find(s => s.stationId === stationId) || null;
}

// 모든 역 ID (정적 페이지 생성용)
export function getAllStationIds(): string[] {
  const stations = getStations();
  return [...new Set(stations.map(s => s.stationId))];
}

// 요금 포맷 (0원이면 '요금 미제공' 표시)
export function formatCharge(charge: number): string {
  if (!charge || charge <= 0) return '요금 미제공';
  return charge.toLocaleString('ko-KR') + '원';
}

// 유효한 최소 요금 (0원 제외)
export function getValidMinCharge(schedules: { charge: number }[]): number {
  const validCharges = schedules.map(s => s.charge).filter(c => c > 0);
  return validCharges.length > 0 ? Math.min(...validCharges) : 0;
}

// 유효한 최대 요금 (0원 제외)
export function getValidMaxCharge(schedules: { charge: number }[]): number {
  const validCharges = schedules.map(s => s.charge).filter(c => c > 0);
  return validCharges.length > 0 ? Math.max(...validCharges) : 0;
}

// 열차 유형별 배지 클래스
export function getTrainTypeBadgeClass(trainType: string): string {
  if (trainType.includes('KTX')) return 'badge-ktx';
  if (trainType.includes('ITX')) return 'badge-itx';
  if (trainType.includes('SRT')) return 'badge-srt';
  return 'badge-normal';
}
