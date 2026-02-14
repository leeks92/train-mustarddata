'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createRouteSlug } from '@/lib/slug-utils';

interface Station {
  stationId: string;
  stationName: string;
}

interface Props {
  stations: Station[];
}

type TrainType = 'ktx' | 'srt' | 'itx' | 'mugunghwa';

const trainTabs: { type: TrainType; label: string; path: string; activeClass: string; ringClass: string; buttonClass: string; dotClass: string; borderColor: string }[] = [
  { type: 'ktx', label: 'KTX', path: '/KTX/schedule/route', activeClass: 'bg-emerald-600 text-white border-emerald-600', ringClass: 'ring-emerald-500 border-emerald-500', buttonClass: 'bg-emerald-600 hover:bg-emerald-700', dotClass: 'bg-emerald-600', borderColor: 'border-emerald-500' },
  { type: 'srt', label: 'SRT', path: '/SRT/schedule/route', activeClass: 'bg-purple-600 text-white border-purple-600', ringClass: 'ring-purple-500 border-purple-500', buttonClass: 'bg-purple-600 hover:bg-purple-700', dotClass: 'bg-purple-600', borderColor: 'border-purple-500' },
  { type: 'itx', label: 'ITX', path: '/ITX/schedule/route', activeClass: 'bg-sky-600 text-white border-sky-600', ringClass: 'ring-sky-500 border-sky-500', buttonClass: 'bg-sky-600 hover:bg-sky-700', dotClass: 'bg-sky-600', borderColor: 'border-sky-500' },
  { type: 'mugunghwa', label: '무궁화호', path: '/mugunghwa/schedule/route', activeClass: 'bg-orange-600 text-white border-orange-600', ringClass: 'ring-orange-500 border-orange-500', buttonClass: 'bg-orange-600 hover:bg-orange-700', dotClass: 'bg-orange-600', borderColor: 'border-orange-500' },
];

/* ── 검색어 하이라이트 ── */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 rounded px-0.5">{part}</mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

/* ── 검색 가능한 커스텀 Combobox ── */
function StationCombobox({
  label,
  stations,
  value,
  onChange,
  ringClass,
  borderColor,
}: {
  label: string;
  stations: Station[];
  value: string;
  onChange: (id: string) => void;
  ringClass: string;
  borderColor: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedStation = stations.find(s => s.stationId === value);

  // 검색 필터링
  const filtered = query
    ? stations.filter(s =>
        s.stationName.includes(query) ||
        s.stationName.toLowerCase().includes(query.toLowerCase())
      )
    : stations;

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
        setHighlightIdx(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 스크롤 하이라이트 아이템으로
  useEffect(() => {
    if (highlightIdx >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIdx] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIdx]);

  const selectStation = useCallback((station: Station) => {
    onChange(station.stationId);
    setOpen(false);
    setQuery('');
    setHighlightIdx(-1);
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIdx(prev => (prev < filtered.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIdx(prev => (prev > 0 ? prev - 1 : filtered.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIdx >= 0 && highlightIdx < filtered.length) {
          selectStation(filtered[highlightIdx]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setQuery('');
        setHighlightIdx(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-bold text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {/* 검색 + 표시 입력 */}
        <div
          className={`flex items-center w-full border rounded-xl bg-white transition-all cursor-pointer
            ${open ? `ring-2 ${ringClass} ${borderColor}` : 'border-gray-300 hover:border-gray-400'}`}
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          <div className="pl-4 pr-1 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={open ? query : (selectedStation?.stationName ?? '')}
            placeholder="역 검색 또는 선택"
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlightIdx(0);
              if (!open) setOpen(true);
            }}
            onFocus={() => {
              setOpen(true);
              setQuery('');
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 py-3.5 pr-2 text-gray-900 text-base bg-transparent outline-none placeholder:text-gray-400"
            readOnly={false}
            autoComplete="off"
          />
          {/* 선택된 값 지우기 버튼 */}
          {value && !open && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              aria-label="선택 초기화"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
          <div className={`pr-3 transition-transform ${open ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        {/* 드롭다운 목록 */}
        {open && (
          <ul
            ref={listRef}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-64 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1"
            role="listbox"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-500 text-center">
                검색 결과가 없습니다
              </li>
            ) : (
              filtered.map((station, idx) => {
                const isHighlighted = idx === highlightIdx;
                const isSelected = station.stationId === value;
                return (
                  <li
                    key={station.stationId}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    onClick={() => selectStation(station)}
                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors
                      ${isHighlighted ? 'bg-gray-100' : ''}
                      ${isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'}
                      hover:bg-gray-100`}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {query ? (
                        <HighlightMatch text={station.stationName} query={query} />
                      ) : (
                        station.stationName
                      )}
                    </span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ── 메인 검색 폼 ── */
export default function SearchForm({ stations }: Props) {
  const router = useRouter();
  const [trainType, setTrainType] = useState<TrainType>('ktx');
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [error, setError] = useState('');

  const currentTab = trainTabs.find(t => t.type === trainType)!;

  // 이름 기준 중복 제거
  const uniqueStations = stations.reduce<Station[]>((acc, station) => {
    if (!acc.find(s => s.stationName === station.stationName)) {
      acc.push(station);
    }
    return acc;
  }, []);

  const handleTrainTypeChange = (type: TrainType) => {
    setTrainType(type);
    setDeparture('');
    setArrival('');
    setError('');
  };

  const handleSearch = () => {
    if (!departure) {
      setError('출발역을 선택해주세요');
      return;
    }
    if (!arrival) {
      setError('도착역을 선택해주세요');
      return;
    }
    if (departure === arrival) {
      setError('출발역과 도착역이 같습니다');
      return;
    }
    
    setError('');
    
    const depStation = uniqueStations.find(s => s.stationId === departure);
    const arrStation = uniqueStations.find(s => s.stationId === arrival);
    
    if (!depStation || !arrStation) {
      setError('역 정보를 찾을 수 없습니다');
      return;
    }
    
    const routeSlug = createRouteSlug(depStation.stationName, arrStation.stationName);
    router.push(`${currentTab.path}/${routeSlug}`);
  };

  return (
    <div>
      {/* 열차 유형 선택 탭 */}
      <div className="flex mb-6">
        {trainTabs.map((tab, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === trainTabs.length - 1;
          const isSelected = trainType === tab.type;
          const roundedClass = isFirst ? 'rounded-l-xl' : isLast ? 'rounded-r-xl' : '';
          const borderClass = isFirst ? 'border' : 'border-t border-r border-b';

          return (
            <button
              key={tab.type}
              onClick={() => handleTrainTypeChange(tab.type)}
              className={`flex-1 py-2.5 px-2 md:py-3 md:px-4 text-center font-bold text-xs md:text-sm transition-all ${roundedClass} ${borderClass} ${
                isSelected
                  ? tab.activeClass
                  : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
              }`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-1 md:mr-1.5 ${isSelected ? 'bg-white' : tab.dotClass}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-4 md:gap-3 items-end">
        <StationCombobox
          label="출발역"
          stations={uniqueStations}
          value={departure}
          onChange={(id) => { setDeparture(id); setError(''); }}
          ringClass={currentTab.ringClass}
          borderColor={currentTab.borderColor}
        />

        <button
          type="button"
          onClick={() => {
            setDeparture(arrival);
            setArrival(departure);
            setError('');
          }}
          className="hidden md:flex items-center justify-center w-10 h-10 mb-0.5 rounded-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition"
          aria-label="출발역과 도착역 교체"
          title="출발역과 도착역 교체"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
        </button>

        <div className="md:hidden flex justify-center -my-1">
          <button
            type="button"
            onClick={() => {
              setDeparture(arrival);
              setArrival(departure);
              setError('');
            }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
            aria-label="출발역과 도착역 교체"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
            교체
          </button>
        </div>

        <StationCombobox
          label="도착역"
          stations={uniqueStations}
          value={arrival}
          onChange={(id) => { setArrival(id); setError(''); }}
          ringClass={currentTab.ringClass}
          borderColor={currentTab.borderColor}
        />

        <div className="flex items-end md:col-span-4">
          <button
            onClick={handleSearch}
            className={`w-full text-white py-3.5 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 ${currentTab.buttonClass}`}
          >
            시간표 조회하기
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 text-red-600 text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}
    </div>
  );
}
