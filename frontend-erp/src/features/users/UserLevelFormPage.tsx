import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { userLevelsApi } from './api';

interface UserLevelFormData {
  name: string;
  code: string;
  description: string;
  hierarchy: number;
  isActive: boolean;
}

export function UserLevelFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<UserLevelFormData>({
    name: '',
    code: '',
    description: '',
    hierarchy: 0,
    isActive: true,
  });

  const [error, setError] = useState<string | null>(null);

  const { data: level } = useQuery({
    queryKey: ['user-level', id],
    queryFn: () => userLevelsApi.getById(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (level) {
      setFormData({
        name: level.name || '',
        code: level.code || '',
        description: level.description || '',
        hierarchy: level.hierarchy || 0,
        isActive: level.isActive ?? true,
      });
    }
  }, [level]);

  const saveMutation = useMutation({
    mutationFn: async (data: UserLevelFormData) => {
      if (isEdit) {
        return userLevelsApi.update(Number(id), data);
      }
      return userLevelsApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-levels'] });
      navigate('/users/levels');
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'Failed to save user level');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    saveMutation.mutate(formData);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <Link to="/users/levels" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to User Levels
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit User Level' : 'Create User Level'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEdit ? 'Update user level information' : 'Add a new user access level'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., Administrator"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., admin"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Brief description of this user level"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hierarchy</label>
            <input
              type="number"
              value={formData.hierarchy}
              onChange={(e) => setFormData({ ...formData, hierarchy: Number(e.target.value) })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-500">Lower number = higher authority</p>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link
            to="/users/levels"
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update Level' : 'Create Level'}
          </button>
        </div>
      </form>
    </div>
  );
}
