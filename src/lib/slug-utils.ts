/**
 * 역 이름 → 슬러그 변환 유틸리티 (클라이언트/서버 공용)
 * fs 모듈을 사용하지 않음
 */

// 역 이름 정규화 (슬러그용)
export function normalizeStationName(name: string): string {
  return name
    .replace(/\(.*?\)/g, '') // 괄호 내용 제거
    .replace(/\s+/g, '') // 공백 제거
    .replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318Fa-zA-Z0-9]/g, '') // 특수문자 제거
    .trim();
}

// 역 이름에서 "역" 접미사 추가 (없는 경우)
function addStationSuffix(name: string): string {
  const normalized = normalizeStationName(name);
  if (normalized.endsWith('역')) {
    return normalized;
  }
  return normalized + '역';
}

// 슬러그 생성 (역용)
export function createStationSlug(stationName: string): string {
  return addStationSuffix(stationName);
}

// 노선 슬러그 생성 (출발-도착)
export function createRouteSlug(depName: string, arrName: string): string {
  const dep = normalizeStationName(depName);
  const arr = normalizeStationName(arrName);
  return `${dep}-${arr}`;
}
