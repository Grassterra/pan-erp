import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { usersApi, userLevelsApi } from './api';
import type { UserLevel } from './api';

interface UserFormData {
  userId: string;
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  userLevelId: number | null;
  phone: string;
  department: string;
  position: string;
  isActive: boolean;
}

export function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState<UserFormData>({
    userId: '',
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    userLevelId: null,
    phone: '',
    department: '',
    position: '',
    isActive: true,
  });

  const [error, setError] = useState<string | null>(null);

  const { data: userLevels } = useQuery({
    queryKey: ['user-levels-active'],
    queryFn: () => userLevelsApi.getActive(),
  });

  const { data: user } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getById(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        userId: user.userId || '',
        name: user.name || '',
        email: user.email || '',
        password: '',
        passwordConfirmation: '',
        userLevelId: user.userLevel?.id || null,
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || '',
        isActive: user.isActive ?? true,
      });
    }
  }, [user]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit) {
        return usersApi.update(Number(id), data);
      }
      return usersApi.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'Failed to save user');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEdit && formData.password !== formData.passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }

    const data: any = {
      userId: formData.userId,
      name: formData.name,
      email: formData.email,
      userLevelId: formData.userLevelId,
      phone: formData.phone,
      department: formData.department,
      position: formData.position,
      isActive: formData.isActive,
    };

    if (formData.password) {
      data.password = formData.password;
    }

    saveMutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/users" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit User' : 'Create User'}</h1>
        <p className="text-gray-500 mt-1">{isEdit ? 'Update user information' : 'Add a new system user'}</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID *</label>
            <input
              type="text"
              required
              disabled={isEdit}
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">User Level *</label>
            <select
              required
              value={formData.userLevelId || ''}
              onChange={(e) => setFormData({ ...formData, userLevelId: Number(e.target.value) || null })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select Level</option>
              {userLevels?.map((level: UserLevel) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password {!isEdit && '*'}
            </label>
            <input
              type="password"
              required={!isEdit}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder={isEdit ? 'Leave blank to keep current' : ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password {!isEdit && '*'}
            </label>
            <input
              type="password"
              required={!isEdit}
              value={formData.passwordConfirmation}
              onChange={(e) => setFormData({ ...formData, passwordConfirmation: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
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
            to="/users"
            className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}
