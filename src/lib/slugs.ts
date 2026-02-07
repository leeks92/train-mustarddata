/**
 * 역 ID ↔ 한글 슬러그 매핑
 * SEO 최적화를 위한 URL 슬러그 생성
 */

import { getStations } from './data';
import { createStationSlug, createRouteSlug, normalizeStationName } from './slug-utils';

export { createStationSlug, createRouteSlug, normalizeStationName };

// 슬러그 → 역 ID 매핑 캐시
let slugToIdMap: Map<string, string> | null = null;
let idToSlugMap: Map<string, string> | null = null;

// 슬러그 매핑 초기화
function initSlugMaps() {
  if (slugToIdMap && idToSlugMap) return;
  
  slugToIdMap = new Map();
  idToSlugMap = new Map();
  
  const stations = getStations();
  const slugCount = new Map<string, number>();
  
  // 먼저 슬러그 중복 체크
  for (const station of stations) {
    const slug = createStationSlug(station.stationName);
    slugCount.set(slug, (slugCount.get(slug) || 0) + 1);
  }
  
  // 매핑 생성 (중복 시 ID 추가)
  const usedSlugs = new Map<string, boolean>();
  for (const station of stations) {
    let slug = createStationSlug(station.stationName);
    
    // 중복 슬러그인 경우 ID 일부 추가
    if ((slugCount.get(slug) || 0) > 1) {
      if (usedSlugs.has(slug)) {
        slug = `${slug}-${station.stationId.slice(-3)}`;
      }
      usedSlugs.set(createStationSlug(station.stationName), true);
    }
    
    slugToIdMap!.set(slug, station.stationId);
    idToSlugMap!.set(station.stationId, slug);
  }
}

// 슬러그 → 역 ID
export function getStationIdBySlug(slug: string): string | null {
  initSlugMaps();
  return slugToIdMap!.get(slug) || null;
}

// 역 ID → 슬러그
export function getSlugByStationId(stationId: string): string | null {
  initSlugMaps();
  return idToSlugMap!.get(stationId) || null;
}

// 모든 역 슬러그 목록
export function getAllStationSlugs(): string[] {
  initSlugMaps();
  return Array.from(idToSlugMap!.values());
}

// 노선 슬러그에서 역 파싱
export function parseRouteSlug(slug: string): { depSlug: string; arrSlug: string } | null {
  const decodedSlug = decodeURIComponent(slug);
  
  // "역-" 패턴으로 분리 시도
  const stationSplitIdx = decodedSlug.indexOf('역-');
  if (stationSplitIdx !== -1) {
    return {
      depSlug: decodedSlug.substring(0, stationSplitIdx + 1),
      arrSlug: decodedSlug.substring(stationSplitIdx + 2),
    };
  }
  
  // 역 목록에서 매칭
  const stations = getStations();
  
  for (let i = 1; i < decodedSlug.length; i++) {
    if (decodedSlug[i] === '-') {
      const depPart = decodedSlug.substring(0, i);
      const arrPart = decodedSlug.substring(i + 1);
      
      const depStation = stations.find(s => {
        const stSlug = createStationSlug(s.stationName);
        return stSlug === depPart + '역' || stSlug === depPart;
      });
      const arrStation = stations.find(s => {
        const stSlug = createStationSlug(s.stationName);
        return stSlug === arrPart + '역' || stSlug === arrPart;
      });
      
      if (depStation && arrStation) {
        return {
          depSlug: createStationSlug(depStation.stationName),
          arrSlug: createStationSlug(arrStation.stationName),
        };
      }
    }
  }
  
  return null;
}
