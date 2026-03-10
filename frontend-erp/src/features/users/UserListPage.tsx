import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  Shield,
  Search,
  Box,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { usersApi } from './api';
import type { User } from './api';
import { UserForm } from './UserForm';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

/* ═══════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════ */

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

/* ═══════════════════════════════════════════════════════════
   Reusable UI pieces (consistent with ItemPage)
   ═══════════════════════════════════════════════════════════ */

function AccentStrip({ color = 'indigo' }: { color?: 'indigo' | 'red' }) {
  const gradient =
    color === 'red' ? 'from-red-500 to-orange-500' : 'from-indigo-500 to-purple-500';
  return <div className={`h-1 w-full rounded-full bg-gradient-to-r ${gradient}`} />;
}

function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-start gap-2">
      <span className="mt-0.5 shrink-0">⚠️</span>
      <span>{message}</span>
    </div>
  );
}

function ModalFooter({
  onCancel,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  isLoading = false,
  disabled = false,
  variant = 'default',
  confirmIcon,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'danger';
  confirmIcon?: React.ReactNode;
}) {
  return (
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
      <Button variant="outline" onClick={onCancel} disabled={isLoading}>
        {cancelLabel}
      </Button>
      <Button
        onClick={onConfirm}
        isLoading={isLoading}
        disabled={disabled}
        className={
          variant === 'danger'
            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white'
            : undefined
        }
      >
        {confirmIcon}
        {confirmLabel}
      </Button>
    </div>
  );
}

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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{from}</span> to{' '}
          <span className="font-medium text-gray-700">{to}</span> of{' '}
          <span className="font-medium text-gray-700">{totalItems}</span> users
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="user-page-size" className="text-sm text-gray-500 whitespace-nowrap">
            Per page:
          </label>
          <select
            id="user-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((page, idx) =>
          page === '...' ? (
            <span
              key={`dots-${idx}`}
              className="inline-flex items-center justify-center w-9 h-9 text-sm text-gray-400"
            >
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

export function UserListPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);

  /* ── delete state ── */
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteUser, setDeleteUser] = useState<{ id: number; name: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /* ── form state ── */
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<number | undefined>(undefined);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', search, page, pageSize],
    queryFn: () => usersApi.getAll(page, pageSize, search || undefined),
  });

  const activateMutation = useMutation({
    mutationFn: (id: number) => usersApi.activate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => usersApi.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteUser(null);
      setDeleteError(null);
    },
    onError: (e: any) => {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.data?.message ||
        e?.message ||
        'Failed to delete user.';
      setDeleteError(msg);
    },
  });

  const handleDelete = () => {
    if (deleteUser) deleteMutation.mutate(deleteUser.id);
  };

  const openCreate = () => {
    setEditId(undefined);
    setFormOpen(true);
  };

  const openEdit = (id: number) => {
    setEditId(id);
    setFormOpen(true);
  };

  const openDelete = (user: User) => {
    setDeleteError(null);
    setDeleteUser({ id: user.id, name: user.name });
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditId(undefined);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  /* ── derived ── */
  const totalPages = data?.totalPages ?? 1;
  const totalItems = data?.totalElements ?? 0;
  // convert 0-indexed page to 1-indexed for display
  const displayPage = page + 1;

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage system users and their access</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/users/modules"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <Box className="h-4 w-4" />
            Modules
          </Link>
          <Link
            to="/users/levels"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            <Shield className="h-4 w-4" />
            User Levels
          </Link>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
          >
            <Users className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* ── Search bar ── */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              )}

              {!isLoading && data?.content?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}

              {data?.content?.map((user: User) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500 md:hidden">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    {user.email || user.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      {user.userLevel?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                          onClick={() => deactivateMutation.mutate(user.id)}
                          title="Deactivate"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                          onClick={() => activateMutation.mutate(user.id)}
                          title="Activate"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(user.id)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        onClick={() => openDelete(user)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && totalItems > 0 && (
          <Pagination
            currentPage={displayPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p - 1)} // convert back to 0-indexed
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      {/* ═══════════════ DELETE MODAL ═══════════════ */}
      <Modal
        isOpen={deleteUser !== null}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteUser(null);
            setDeleteError(null);
          }
        }}
        title="Delete User"
      >
        <div className="space-y-6">
          <AccentStrip color="red" />

          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>

            <div className="space-y-2">
              <p className="text-base font-semibold text-gray-900">
                Are you sure you want to delete this user?
              </p>

              {deleteUser && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-4 py-2">
                  <span className="text-sm font-medium text-gray-700">{deleteUser.name}</span>
                </div>
              )}

              <p className="text-sm text-gray-500">
                This action cannot be undone. The user will be permanently removed from the system.
              </p>
            </div>
          </div>

          <ErrorBanner message={deleteError} />

          <ModalFooter
            onCancel={() => {
              setDeleteUser(null);
              setDeleteError(null);
            }}
            onConfirm={handleDelete}
            confirmLabel="Delete User"
            isLoading={deleteMutation.isPending}
            variant="danger"
            confirmIcon={<Trash2 className="w-4 h-4 mr-2" />}
          />
        </div>
      </Modal>

      {/* ═══════════════ CREATE / EDIT MODAL ═══════════════ */}
      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={editId ? 'Edit User' : 'New User'}
      >
        <div className="space-y-6">
          <AccentStrip />

          <p className="text-sm text-gray-500">
            {editId
              ? 'Update the user information below.'
              : 'Fill in the information below to create a new user.'}
          </p>

          <div className="max-h-[60vh] overflow-y-auto px-2 -mx-2 py-1">
            <UserForm
              id={editId}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ['users'] });
                closeForm();
              }}
              onCancel={closeForm}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}