/**
 * 주요 기차역 상세정보 (주소, 전화번호, 편의시설)
 */

interface StationInfo {
  address?: string;
  phone?: string;
  facilities?: string[];
}

const stationInfoMap: Record<string, StationInfo> = {
  '서울역': {
    address: '서울특별시 용산구 한강대로 405',
    phone: '1544-7788',
    facilities: ['편의점', '식당가', '약국', '물품보관함', '주차장', '카페', '서점', '롯데마트'],
  },
  '용산역': {
    address: '서울특별시 용산구 한강로3가 40-999',
    phone: '1544-7788',
    facilities: ['편의점', '식당가', '주차장', '카페'],
  },
  '영등포역': {
    address: '서울특별시 영등포구 경인로 846',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장'],
  },
  '청량리역': {
    address: '서울특별시 동대문구 왕산로 214',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장', '카페'],
  },
  '수원역': {
    address: '경기도 수원시 팔달구 덕영대로 924',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장', 'AK플라자'],
  },
  '부산역': {
    address: '부산광역시 동구 중앙대로 206',
    phone: '1544-7788',
    facilities: ['편의점', '식당가', '약국', '물품보관함', '주차장', '카페', '관광안내소'],
  },
  '동대구역': {
    address: '대구광역시 동구 동대구로 550',
    phone: '1544-7788',
    facilities: ['편의점', '식당가', '약국', '물품보관함', '주차장', '신세계백화점'],
  },
  '대전역': {
    address: '대전광역시 동구 중앙로 215',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '약국', '주차장', '물품보관함'],
  },
  '광주송정역': {
    address: '광주광역시 광산구 상무대로 200',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장', '카페'],
  },
  '울산역': {
    address: '울산광역시 울주군 삼남읍 신화리 685',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장', '카페', '렌터카'],
  },
  '광명역': {
    address: '경기도 광명시 광명역로 21',
    phone: '1544-7788',
    facilities: ['편의점', '식당가', '주차장', '카페', '코스트코 인접'],
  },
  '천안아산역': {
    address: '충청남도 아산시 배방읍 장재리 549',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장', '카페'],
  },
  '오송역': {
    address: '충청북도 청주시 흥덕구 오송읍 오송생명로 123',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장'],
  },
  '강릉역': {
    address: '강원특별자치도 강릉시 용지로 176',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장', '카페', '관광안내소'],
  },
  '원주역': {
    address: '강원특별자치도 원주시 서원대로 282',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장'],
  },
  '전주역': {
    address: '전북특별자치도 전주시 덕진구 동부대로 680',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장'],
  },
  '여수엑스포역': {
    address: '전라남도 여수시 역전동 63-1',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장', '관광안내소'],
  },
  '목포역': {
    address: '전라남도 목포시 영산로 81',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장'],
  },
  '포항역': {
    address: '경상북도 포항시 북구 흥해읍 이인리 267',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장'],
  },
  '경주역': {
    address: '경상북도 경주시 동천동 786',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장', '관광안내소'],
  },
  '김천구미역': {
    address: '경상북도 김천시 남면 운곡리 30',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장'],
  },
  '마산역': {
    address: '경상남도 창원시 마산회원구 마산역길 10',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장'],
  },
  '진주역': {
    address: '경상남도 진주시 진주역로 71',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장'],
  },
  '익산역': {
    address: '전북특별자치도 익산시 익산대로 60',
    phone: '1544-7788',
    facilities: ['편의점', '식당', '주차장'],
  },
  '구포역': {
    address: '부산광역시 북구 구포만세길 97',
    phone: '1544-7788',
    facilities: ['편의점', '주차장'],
  },
  '안동역': {
    address: '경상북도 안동시 경동로 582',
    phone: '1544-7788',
    facilities: ['편의점', '주차장'],
  },
  '영주역': {
    address: '경상북도 영주시 영주로 59',
    phone: '1544-7788',
    facilities: ['편의점', '주차장'],
  },
};

export function getStationInfo(stationName: string): StationInfo | null {
  // 정확한 이름 매칭
  if (stationInfoMap[stationName]) {
    return stationInfoMap[stationName];
  }
  
  // "역" 붙여서 매칭
  if (!stationName.endsWith('역') && stationInfoMap[stationName + '역']) {
    return stationInfoMap[stationName + '역'];
  }
  
  // 부분 매칭
  for (const [key, value] of Object.entries(stationInfoMap)) {
    if (stationName.includes(key.replace('역', '')) || key.includes(stationName.replace('역', ''))) {
      return value;
    }
  }
  
  return null;
}
