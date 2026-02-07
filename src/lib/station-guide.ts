/**
 * 역 가이드 데이터 - 주변 교통, 주차, 편의시설 상세 정보
 * 키: 실제 데이터의 역 이름과 정확히 일치 ("역" 접미사 없이)
 * 경쟁 사이트에 없는 차별화된 콘텐츠
 */

export interface StationGuide {
  /** 대중교통 연결 정보 */
  transport: {
    subway?: string;
    bus?: string;
    taxi?: string;
    train?: string;
  };
  /** 주차 정보 */
  parking?: {
    available: boolean;
    info: string;
  };
  /** 주변 관광지/편의시설 */
  nearby?: string;
  /** 이용 팁 */
  tips?: string[];
}

// 주요 기차역 가이드 데이터 (역 이름 기준 - "역" 접미사 없이)
export const stationGuideMap: Record<string, StationGuide> = {
  // ===== 수도권 =====
  '서울': {
    transport: {
      subway: '1·4호선 서울역 직결',
      bus: '서울역 앞 시내버스',
      taxi: '1층 택시승강장',
    },
    parking: {
      available: true,
      info: '서울역 주차장 (10분 500원)',
    },
    nearby: '남대문시장, 명동, N서울타워',
    tips: [
      'KTX/SRT는 탑승구가 다르므로 확인',
      '수서역 SRT와 혼동 주의',
      '공항철도 직통열차로 인천공항 43분',
    ],
  },
  '용산': {
    transport: {
      subway: '1호선·경의중앙선 용산역',
    },
    nearby: '아이파크몰, 전쟁기념관, 이태원',
  },
  '영등포': {
    transport: {
      subway: '1호선 영등포역',
    },
  },
  '청량리': {
    transport: {
      subway: '1호선·경의중앙선·수인분당선',
    },
    nearby: '경동시장, 청량리588시장',
  },
  '수원': {
    transport: {
      subway: '1호선·수인분당선 수원역',
    },
    nearby: 'AK플라자, 수원화성 행궁',
  },
  '광명': {
    transport: {
      subway: 'KTX 광명역',
    },
    nearby: '코스트코, IKEA, 광명동굴',
    tips: [
      '서울 남부 거주자는 서울역 대신 광명역이 편리',
    ],
  },

  // ===== 충청 =====
  '천안아산': {
    transport: {
      train: 'KTX/SRT 천안아산역',
    },
    nearby: '배방 신도시, 아산 온양온천',
  },
  '오송': {
    transport: {
      train: 'KTX 오송역',
    },
    nearby: '오송생명과학단지',
    tips: [
      '경부선-호남선 분기역',
    ],
  },
  '대전': {
    transport: {
      subway: '대전 지하철 1호선 대전역 도보 5분',
    },
    nearby: '성심당 본점 도보 5분, 중앙시장 도보 10분',
  },

  // ===== 대구·경북 =====
  '동대구': {
    transport: {
      subway: '대구 1호선 동대구역 직결',
    },
    nearby: '신세계백화점, 동대구 먹거리골목',
    tips: [
      '고속버스터미널 인접',
      '동성로까지 버스 15분',
    ],
  },
  '포항': {
    transport: {
      bus: '포항역 앞 시내버스 정류장 이용',
      taxi: '역 앞 택시 승강장',
    },
    nearby: '죽도시장 택시 10분, 호미곶 택시 40분',
  },
  '경주': {
    transport: {
      bus: '경주역 앞 시내버스에서 불국사, 보문단지 방면 이동 가능',
      taxi: '역 앞 택시 승강장',
    },
    nearby: '첨성대·대릉원 택시 10분, 불국사 택시 25분',
    tips: [
      '신경주역(KTX)과 경주역(무궁화)은 다른 위치',
    ],
  },
  '안동': {
    transport: {
      bus: '안동역 앞 시내버스 정류장 이용',
      taxi: '역 앞 택시 승강장',
    },
    nearby: '하회마을 택시 30분, 안동 찜닭골목 도보 10분',
  },
  '영주': {
    transport: {
      bus: '영주역 앞 시내버스 정류장 이용',
      taxi: '역 앞 택시 승강장',
    },
    nearby: '부석사 택시 30분, 소수서원 택시 15분',
  },
  '김천구미': {
    transport: {
      bus: '김천구미역 앞 시내버스 정류장 이용',
      taxi: '역 앞 택시 승강장',
    },
    nearby: '김천·구미 산업단지, 직지사 택시 20분',
  },

  // ===== 울산 =====
  '울산(통도사)': {
    transport: {
      bus: '울산역 앞 시내버스',
    },
    nearby: '통도사 택시 15분, 울산 시내 택시 30분',
    tips: [
      '울산 시내와 거리가 있으므로 시간 여유 필요',
    ],
  },

  // ===== 부산 =====
  '부산': {
    transport: {
      subway: '1호선 부산역 직결',
    },
    nearby: '차이나타운, 부산타워, 자갈치시장 택시 10분',
    tips: [
      '해운대까지 지하철 1시간',
      '김해공항까지 경전철+지하철 약 1시간',
    ],
  },
  '구포': {
    transport: {
      subway: '부산 3호선 구포역',
    },
    nearby: '구포시장 도보 5분',
  },

  // ===== 광주·전남 =====
  '광주송정': {
    transport: {
      subway: '광주 1호선 송정리역 도보 10분',
    },
    nearby: '송정시장 떡갈비, 광주 시내 택시 20분',
  },
  '목포': {
    transport: {
      bus: '목포역 앞 시내버스 정류장 이용',
      taxi: '역 앞 택시 승강장',
    },
    nearby: '유달산 도보 15분, 목포해상케이블카 택시 5분',
  },

  // ===== 전북 =====
  '전주': {
    transport: {
      bus: '전주역 앞 시내버스',
    },
    nearby: '전주 한옥마을 택시 15분',
    tips: [
      'KTX 전주역은 시내와 떨어져 있음',
    ],
  },
  '익산': {
    transport: {
      bus: '익산역 앞 시내버스 정류장 이용',
      taxi: '역 앞 택시 승강장',
    },
    nearby: '미륵사지 택시 20분',
    tips: [
      '호남선·전라선 분기역',
    ],
  },

  // ===== 강원 =====
  '강릉': {
    transport: {
      bus: '강릉역 앞 시내버스 정류장에서 경포대·안목해변 방면 이동 가능',
      taxi: '역 앞 택시 승강장 (경포대까지 약 15분)',
    },
    nearby: '경포대 택시 15분, 안목해변 도보 10분, 정동진 열차 30분',
    tips: [
      '여름 성수기 좌석 빠르게 매진',
    ],
  },

  // ===== 경남 =====
  '마산': {
    transport: {
      bus: '마산역 앞 시내버스 정류장 이용',
      taxi: '역 앞 택시 승강장',
    },
    nearby: '마산어시장 도보 15분',
  },
  '진주': {
    transport: {
      bus: '진주역 앞 시내버스 정류장 이용',
      taxi: '역 앞 택시 승강장',
    },
    nearby: '진주성 택시 10분',
  },
};

/**
 * 역 이름으로 가이드 정보 조회
 * 1) 정확히 일치하는 키 검색
 * 2) "역" 접미사를 붙이거나 제거하여 재검색
 * 3) 키에 부분 문자열이 포함되는지 검색 (partial match)
 */
export function getStationGuide(stationName: string): StationGuide | null {
  // 1. 정확히 일치
  if (stationGuideMap[stationName]) {
    return stationGuideMap[stationName];
  }

  // 2. "역" 접미사 처리
  const withoutSuffix = stationName.endsWith('역')
    ? stationName.slice(0, -1)
    : stationName;
  const withSuffix = stationName.endsWith('역')
    ? stationName
    : stationName + '역';

  if (stationGuideMap[withoutSuffix]) {
    return stationGuideMap[withoutSuffix];
  }
  if (stationGuideMap[withSuffix]) {
    return stationGuideMap[withSuffix];
  }

  // 3. 부분 일치 (키에 검색어가 포함되거나, 검색어에 키가 포함되는 경우)
  for (const key of Object.keys(stationGuideMap)) {
    if (key.includes(withoutSuffix) || withoutSuffix.includes(key)) {
      return stationGuideMap[key];
    }
  }

  return null;
}

/**
 * 주요 역 꿀팁 (노선 페이지에서 출발/도착역 이름으로 간단 팁 제공)
 */
export function getStationTip(stationName: string): string | null {
  const guide = getStationGuide(stationName);
  if (!guide) return null;

  const parts: string[] = [];
  if (guide.transport.subway) parts.push(guide.transport.subway);
  else if (guide.transport.bus) parts.push(guide.transport.bus);
  if (guide.parking?.info) parts.push(`주차: ${guide.parking.info.split('.')[0]}`);

  return parts.length > 0 ? parts.join('. ') : null;
}
