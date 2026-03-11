import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Clock, User, FileText, ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { client } from '../../api/client';

interface ActivityLog {
  id: number;
  entityType: string;
  entityId: number;
  entityCode: string;
  action: string;
  description: string;
  module: string;
  userName: string;
  createdAt: string;
  changedFields: string;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

/* ═══════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════ */

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

const ACTION_OPTIONS = [
  { value: 'CREATE', label: '생성' },
  { value: 'UPDATE', label: '수정' },
  { value: 'DELETE', label: '삭제' },
  { value: 'STATUS_CHANGE', label: '상태변경' },
  { value: 'LOGIN', label: '로그인' },
  { value: 'LOGOUT', label: '로그아웃' },
  { value: 'LOGIN_FAILED', label: '로그인 실패' },
];

function toDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

const DATE_PRESETS = [
  {
    label: '오늘',
    getValue: () => {
      const s = toDateString(new Date());
      return { start: s, end: s };
    },
  },
  {
    label: '최근 7일',
    getValue: () => {
      const e = new Date();
      const s = new Date();
      s.setDate(s.getDate() - 7);
      return { start: toDateString(s), end: toDateString(e) };
    },
  },
  {
    label: '최근 30일',
    getValue: () => {
      const e = new Date();
      const s = new Date();
      s.setDate(s.getDate() - 30);
      return { start: toDateString(s), end: toDateString(e) };
    },
  },
  {
    label: '최근 90일',
    getValue: () => {
      const e = new Date();
      const s = new Date();
      s.setDate(s.getDate() - 90);
      return { start: toDateString(s), end: toDateString(e) };
    },
  },
];

/* ═══════════════════════════════════════════════════════════
   Pagination component
   ═══════════════════════════════════════════════════════════ */

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const pageNumbers = (() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  })();

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
      <div className="flex items-center gap-4">
        <p className="text-sm text-slate-500">
          <span className="font-medium text-slate-700">{from}</span> ~{' '}
          <span className="font-medium text-slate-700">{to}</span> /{' '}
          <span className="font-medium text-slate-700">{totalItems}</span>건
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="log-page-size" className="text-sm text-slate-500 whitespace-nowrap">
            표시:
          </label>
          <select
            id="log-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}건
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((pg, idx) =>
          pg === '...' ? (
            <span
              key={`dots-${idx}`}
              className="inline-flex items-center justify-center w-9 h-9 text-sm text-slate-400"
            >
              …
            </span>
          ) : (
            <button
              key={pg}
              onClick={() => onPageChange(pg)}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                currentPage === pg
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {pg}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Main page
   ═══════════════════════════════════════════════════════════ */

export default function ActivityLogPage() {
  /* ── filter state ── */
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('');
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  /* ── pagination state ── */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);

  /* ── fetch ALL logs (no server-side params) ── */
  const { data, isLoading } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const res = await client.get<PageResponse<ActivityLog>>(
        `/api/v1/activity-logs?page=0&size=9999`,
      );
      return res.data.content;
    },
  });

  /* ── derive unique entity types & modules from fetched data ── */
  const entityTypes = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((l) => l.entityType).filter(Boolean))].sort();
  }, [data]);

  const modules = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.map((l) => l.module).filter(Boolean))].sort();
  }, [data]);

  /* ── client-side filtering ── */
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((log) => {
      // search
      if (search) {
        const q = search.toLowerCase().trim();
        const matchesSearch =
          log.description?.toLowerCase().includes(q) ||
          log.userName?.toLowerCase().includes(q) ||
          log.entityType?.toLowerCase().includes(q) ||
          log.entityCode?.toLowerCase().includes(q) ||
          log.module?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      // entity type
      if (entityType && log.entityType !== entityType) return false;

      // module
      if (module && log.module !== module) return false;

      // action
      if (action && log.action !== action) return false;

      // date range
      if (startDate || endDate) {
        const logDate = log.createdAt.split('T')[0]; // "YYYY-MM-DD"
        if (startDate && logDate < startDate) return false;
        if (endDate && logDate > endDate) return false;
      }

      return true;
    });
  }, [data, search, entityType, module, action, startDate, endDate]);

  /* ── client-side pagination ── */
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // reset page when filters or page size change
  useMemo(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, entityType, module, action, startDate, endDate, pageSize]);

  /* ── derived ── */
  const hasActiveFilters = entityType || module || action || startDate || endDate;
  const activeFilterCount = [entityType, module, action, startDate, endDate].filter(Boolean).length;

  const clearAllFilters = () => {
    setEntityType('');
    setModule('');
    setAction('');
    setStartDate('');
    setEndDate('');
  };

  const applyDatePreset = (preset: (typeof DATE_PRESETS)[number]) => {
    const { start, end } = preset.getValue();
    setStartDate(start);
    setEndDate(end);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const getActionBadgeClass = (act: string) => {
    switch (act) {
      case 'CREATE': return 'bg-green-100 text-green-800';
      case 'UPDATE': return 'bg-blue-100 text-blue-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'STATUS_CHANGE': return 'bg-yellow-100 text-yellow-800';
      case 'LOGIN': return 'bg-indigo-100 text-indigo-800';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800';
      case 'LOGIN_FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (act: string) => {
    return ACTION_OPTIONS.find((o) => o.value === act)?.label || act;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">활동 로그</h1>
          <p className="text-slate-500 mt-1">시스템 활동 기록을 확인합니다</p>
        </div>
      </div>

      {/* ── Search & Filters ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="활동 로그 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
              showFilters
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-5 w-5" />
            필터
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-medium">
                {activeFilterCount}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap transition-colors"
            >
              필터 초기화
            </button>
          )}
        </div>

        {/* ── Expanded filters ── */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            {/* Row 1: Entity type, Module, Action */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  엔티티 타입
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">전체</option>
                  {entityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">모듈</label>
                <select
                  value={module}
                  onChange={(e) => setModule(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">전체</option>
                  {modules.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">액션</label>
                <select
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">전체</option>
                  {ACTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Date filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-slate-700">기간 필터</span>
              </div>

              {/* Date presets */}
              <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map((preset) => {
                  const { start, end } = preset.getValue();
                  const isActive = startDate === start && endDate === end;
                  return (
                    <button
                      key={preset.label}
                      onClick={() => applyDatePreset(preset)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Custom date range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">시작일</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={endDate || undefined}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    {startDate && (
                      <button
                        onClick={() => setStartDate('')}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">종료일</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || undefined}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    {endDate && (
                      <button
                        onClick={() => setEndDate('')}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Active date range pill */}
              {(startDate || endDate) && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">선택된 기간:</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    {startDate || '시작일 없음'} ~ {endDate || '종료일 없음'}
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="ml-1 text-indigo-400 hover:text-indigo-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Activity Log List ── */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
              <span className="text-sm text-slate-500">로딩 중…</span>
            </div>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {hasActiveFilters || search
                ? '필터 조건에 맞는 활동 로그가 없습니다.'
                : '활동 로그가 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedData.map((log: ActivityLog) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeClass(log.action)}`}
                      >
                        {getActionLabel(log.action)}
                      </span>
                      {log.module && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
                          {log.module}
                        </span>
                      )}
                      <span className="text-sm text-slate-500">{log.entityType}</span>
                    </div>
                    <p className="text-sm text-slate-900">{log.description}</p>
                    {log.changedFields && (
                      <p className="text-xs text-slate-500 mt-1">
                        변경된 필드: {log.changedFields}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <User className="h-4 w-4" />
                      {log.userName || 'System'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredData.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
}