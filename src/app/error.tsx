'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        오류가 발생했습니다
      </h1>
      <p className="text-gray-600 mb-8">
        페이지를 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요.
      </p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
      >
        다시 시도
      </button>
    </div>
  );
}
