'use client';

import { useState } from 'react';

function formatCharge(charge: number): string {
  if (!charge || charge <= 0) return '요금 미제공';
  return charge.toLocaleString('ko-KR') + '원';
}

interface Schedule {
  depTime: string;
  arrTime: string;
  trainType: string;
  trainNo: string;
  charge: number;
}

interface Props {
  schedules: Schedule[];
  depStationName: string;
  arrStationName: string;
  trainLabel: string;
}

function getTrainTypeBadge(trainType: string): string {
  if (trainType.includes('KTX-이음')) return 'bg-teal-100 text-teal-800';
  if (trainType.includes('KTX')) return 'bg-emerald-100 text-emerald-800';
  if (trainType.includes('SRT')) return 'bg-purple-100 text-purple-800';
  if (trainType.includes('ITX-청춘')) return 'bg-cyan-100 text-cyan-800';
  if (trainType.includes('ITX')) return 'bg-sky-100 text-sky-800';
  if (trainType.includes('무궁화')) return 'bg-orange-100 text-orange-800';
  if (trainType.includes('누리로')) return 'bg-amber-100 text-amber-800';
  return 'bg-gray-100 text-gray-800';
}

type TimeFilter = 'all' | 'morning' | 'afternoon' | 'evening';

export default function ScheduleTable({ schedules, depStationName, arrStationName, trainLabel }: Props) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const trainTypes = [...new Set(schedules.map(s => s.trainType))];

  const filtered = schedules.filter(s => {
    if (timeFilter !== 'all') {
      const h = parseInt(s.depTime.split(':')[0]);
      if (timeFilter === 'morning' && (h < 5 || h >= 10)) return false;
      if (timeFilter === 'afternoon' && (h < 10 || h >= 17)) return false;
      if (timeFilter === 'evening' && (h < 17 && h >= 5)) return false;
    }
    if (typeFilter !== 'all' && s.trainType !== typeFilter) return false;
    return true;
  });

  return (
    <section className="bg-white rounded-xl shadow overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900">{depStationName} → {arrStationName} {trainLabel} 전체 시간표</h2>
      </div>

      {/* 필터 */}
      <div className="px-4 py-3 border-b bg-gray-50/50 flex flex-wrap gap-2 items-center">
        <span className="text-xs font-medium text-gray-500 mr-1">시간대</span>
        {([
          ['all', '전체'],
          ['morning', '오전'],
          ['afternoon', '낮'],
          ['evening', '저녁'],
        ] as [TimeFilter, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTimeFilter(key)}
            className={`px-3 py-1 text-xs rounded-full border transition ${
              timeFilter === key
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
            }`}
          >
            {label}
          </button>
        ))}

        {trainTypes.length > 1 && (
          <>
            <span className="text-xs font-medium text-gray-500 ml-3 mr-1">유형</span>
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 text-xs rounded-full border transition ${
                typeFilter === 'all'
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
              }`}
            >
              전체
            </button>
            {trainTypes.map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1 text-xs rounded-full border transition ${
                  typeFilter === type
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                }`}
              >
                {type}
              </button>
            ))}
          </>
        )}

        {(timeFilter !== 'all' || typeFilter !== 'all') && (
          <span className="text-xs text-gray-500 ml-auto">
            {filtered.length}개 / {schedules.length}개
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="w-24">출발</th>
              <th className="w-24">도착</th>
              <th className="w-28">열차유형</th>
              <th className="w-24">열차번호</th>
              <th className="w-32 text-right">요금 (어른)</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">
                  해당 조건의 열차가 없습니다
                </td>
              </tr>
            ) : (
              filtered.map((schedule, index) => (
                <tr key={index}>
                  <td className="font-medium">
                    <time dateTime={`T${schedule.depTime}:00`}>{schedule.depTime}</time>
                  </td>
                  <td>
                    <time dateTime={`T${schedule.arrTime}:00`}>{schedule.arrTime}</time>
                  </td>
                  <td>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTrainTypeBadge(schedule.trainType)}`}>
                      {schedule.trainType}
                    </span>
                  </td>
                  <td className="text-gray-600">{schedule.trainNo}</td>
                  <td className="text-right font-medium">{formatCharge(schedule.charge)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
