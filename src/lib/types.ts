// 기차역 정보
export interface Station {
  stationId: string;
  stationName: string;
  cityName?: string;
  cityCode?: number;
}

// 열차 종류
export type TrainType = 'KTX' | 'KTX-이음' | 'KTX-산천' | 'ITX-새마을' | 'ITX-청춘' | 'ITX-마음' | '무궁화호' | '누리로' | 'SRT' | '기타';

// 열차 시간표
export interface TrainSchedule {
  trainNo: string;         // 열차번호
  trainType: string;       // 열차유형 (KTX, ITX-새마을, 무궁화호 등)
  depTime: string;         // 출발시간 HH:MM
  arrTime: string;         // 도착시간 HH:MM
  charge: number;          // 운임 (원)
}

// 노선별 시간표 그룹
export interface RouteSchedule {
  depStationId: string;
  depStationName: string;
  arrStationId: string;
  arrStationName: string;
  schedules: TrainSchedule[];
}

// 메타데이터
export interface TrainMetadata {
  lastUpdated: string;
  stationCount: number;
  routeCount: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}
