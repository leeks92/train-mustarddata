# 전국 기차 시간표 (train.mustarddata.com)

전국 KTX, ITX-새마을, 무궁화호, 누리로 열차 시간표를 조회할 수 있는 웹사이트입니다.

## 기술 스택

- **프레임워크**: Next.js 16
- **언어**: TypeScript 5
- **스타일링**: Tailwind CSS 4
- **배포**: GitHub Pages
- **데이터**: TAGO TrainInfoService API

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경 변수 설정
# .env.local 파일에 TRAIN_API_KEY 값을 설정
TRAIN_API_KEY=your_api_key_here

# 데이터 수집
npm run fetch-data

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 프로젝트 구조

```
train-mustarddata/
├── data/                    # 수집된 열차 데이터 (JSON)
├── public/                  # 정적 파일
├── scripts/                 # 데이터 수집 스크립트
│   └── fetch-train-data.ts
├── src/
│   ├── app/                 # Next.js App Router 페이지
│   │   ├── KTX/             # KTX 시간표
│   │   ├── 일반열차/         # 일반열차 시간표
│   │   ├── 기차역/           # 기차역 정보
│   │   ├── feed.xml/        # RSS 피드
│   │   └── sitemap.ts       # 사이트맵
│   ├── components/          # 공통 컴포넌트
│   └── lib/                 # 유틸리티 및 데이터 로더
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 배포

GitHub Actions를 통해 자동 배포됩니다. `main` 브랜치에 push하면 빌드 후 GitHub Pages로 배포됩니다.

## 관련 서비스

- [bus.mustarddata.com](https://bus.mustarddata.com) - 전국 버스 시간표
- [calc.mustarddata.com](https://calc.mustarddata.com) - 계산기
- [apt.mustarddata.com](https://apt.mustarddata.com) - 아파트 실거래가
