import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Clock, User, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
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

export default function ActivityLogPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('');
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['activity-logs', page, search, entityType, module, action],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', '20');
      if (search) params.append('search', search);
      if (entityType) params.append('entityType', entityType);
      if (module) params.append('module', module);
      if (action) params.append('action', action);
      const res = await client.get<PageResponse<ActivityLog>>(`/api/v1/activity-logs?${params.toString()}`);
      return res.data;
    },
  });

  const { data: entityTypes } = useQuery({
    queryKey: ['activity-log-entity-types'],
    queryFn: async () => {
      const res = await client.get<string[]>('/api/v1/activity-logs/entity-types');
      return res.data;
    },
  });

  const { data: modules } = useQuery({
    queryKey: ['activity-log-modules'],
    queryFn: async () => {
      const res = await client.get<string[]>('/api/v1/activity-logs/modules');
      return res.data;
    },
  });

  const logs = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const getActionBadgeClass = (action: string) => {
    switch (action) {
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

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE': return '생성';
      case 'UPDATE': return '수정';
      case 'DELETE': return '삭제';
      case 'STATUS_CHANGE': return '상태변경';
      case 'LOGIN': return '로그인';
      case 'LOGOUT': return '로그아웃';
      case 'LOGIN_FAILED': return '로그인 실패';
      default: return action;
    }
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">활동 로그</h1>
          <p className="text-slate-500 mt-1">시스템 활동 기록을 확인합니다</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="활동 로그 검색..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
              showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="h-5 w-5" />
            필터
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">엔티티 타입</label>
              <select
                value={entityType}
                onChange={(e) => { setEntityType(e.target.value); setPage(0); }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">전체</option>
                {entityTypes?.map((type: string) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">모듈</label>
              <select
                value={module}
                onChange={(e) => { setModule(e.target.value); setPage(0); }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">전체</option>
                {modules?.map((m: string) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">액션</label>
              <select
                value={action}
                onChange={(e) => { setAction(e.target.value); setPage(0); }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">전체</option>
                <option value="CREATE">생성</option>
                <option value="UPDATE">수정</option>
                <option value="DELETE">삭제</option>
                <option value="STATUS_CHANGE">상태변경</option>
                <option value="LOGIN">로그인</option>
                <option value="LOGOUT">로그아웃</option>
                <option value="LOGIN_FAILED">로그인 실패</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Activity Log List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">로딩 중...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-slate-500">활동 로그가 없습니다</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log: ActivityLog) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-slate-500" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeClass(log.action)}`}>
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
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 border-t border-slate-200 bg-slate-50">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </button>
            <span className="px-3 py-1.5 text-sm text-slate-600">
              {page + 1} / {totalPages} 페이지
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors"
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
