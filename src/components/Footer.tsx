import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 border-t mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-3 text-gray-900">기차 시간표</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <Link href="/KTX/schedule" className="hover:text-emerald-600">
                  KTX 시간표
                </Link>
              </li>
              <li>
                <Link href="/SRT/schedule" className="hover:text-purple-600">
                  SRT 시간표
                </Link>
              </li>
              <li>
                <Link href="/ITX/schedule" className="hover:text-sky-600">
                  ITX 시간표
                </Link>
              </li>
              <li>
                <Link href="/mugunghwa/schedule" className="hover:text-orange-600">
                  무궁화호 시간표
                </Link>
              </li>
              <li>
                <Link href="/stations" className="hover:text-emerald-600">
                  전국 기차역
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-3 text-gray-900">인기 노선</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <Link href="/KTX/schedule/route/서울역-부산역" className="hover:text-emerald-600">
                  서울 → 부산
                </Link>
              </li>
              <li>
                <Link href="/KTX/schedule/route/서울역-동대구역" className="hover:text-emerald-600">
                  서울 → 대구
                </Link>
              </li>
              <li>
                <Link href="/KTX/schedule/route/서울역-대전역" className="hover:text-emerald-600">
                  서울 → 대전
                </Link>
              </li>
              <li>
                <Link href="/KTX/schedule/route/서울역-강릉역" className="hover:text-emerald-600">
                  서울 → 강릉
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-3 text-gray-900">예매 사이트</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <a href="https://www.letskorail.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">
                  코레일 (KORAIL)
                </a>
              </li>
              <li>
                <a href="https://etk.srail.kr" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">
                  SRT (수서고속철도)
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-3 text-gray-900">관련 서비스</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>
                <a href="https://bus.mustarddata.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">
                  전국 버스 시간표
                </a>
              </li>
              <li>
                <a href="https://calc.mustarddata.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">
                  금융 계산기
                </a>
              </li>
              <li>
                <a href="https://apt.mustarddata.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">
                  부동산 실거래가
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
          <p>
            © {currentYear} MustardData. 본 사이트의 시간표 정보는 공공데이터를
            기반으로 제공되며, 실제 운행 정보와 다를 수 있습니다.
          </p>
          <p className="mt-2">
            정확한 시간표와 예매는 코레일 또는 SRT 공식 사이트를 이용해 주세요.
          </p>
        </div>
      </div>
    </footer>
  );
}
