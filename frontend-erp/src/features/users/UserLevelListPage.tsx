import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Shield, ArrowLeft } from 'lucide-react';
import { userLevelsApi } from './api';
import type { UserLevel } from './api';

export function UserLevelListPage() {
  const [page, setPage] = useState(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['user-levels', page],
    queryFn: () => userLevelsApi.getAll(page, 15),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => userLevelsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-levels'] });
      setDeleteId(null);
    },
  });

  const handleDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId);
  };

  const levels = data?.content || [];

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Link to="/users" className="flex items-center text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">User Levels</h1>
          <p className="text-gray-500 mt-1">Manage user access levels and their permissions</p>
        </div>
        <Link
          to="/users/levels/new"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Level
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Description</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Hierarchy</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : levels.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  No user levels found
                </td>
              </tr>
            ) : (
              levels.map((level: UserLevel) => (
                <tr key={level.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {level.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{level.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                    {level.description || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center">
                    {level.hierarchy}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        level.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {level.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <Link
                        to={`/users/levels/${level.id}/permissions`}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Permissions"
                      >
                        <Shield className="h-5 w-5" />
                      </Link>
                      <Link
                        to={`/users/levels/${level.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Edit"
                      >
                        <Pencil className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(level.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-700">
            Page {page + 1} of {data.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= data.totalPages - 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete User Level</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this user level? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
