import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { modulesApi } from './api';
import type { Module } from './api';

export function ModuleListPage() {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editModule, setEditModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    routePrefix: '',
    icon: '',
    sortOrder: 0,
    isActive: true,
  });
  const queryClient = useQueryClient();

  const { data: modules, isLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: () => modulesApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Module>) => modulesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Module> }) => modulesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => modulesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      setDeleteId(null);
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditModule(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      routePrefix: '',
      icon: '',
      sortOrder: 0,
      isActive: true,
    });
  };

  const handleEdit = (module: Module) => {
    setEditModule(module);
    setFormData({
      code: module.code,
      name: module.name,
      description: module.description || '',
      routePrefix: module.routePrefix || '',
      icon: module.icon || '',
      sortOrder: module.sortOrder,
      isActive: module.isActive,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editModule) {
      updateMutation.mutate({ id: editModule.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Link to="/users" className="flex items-center text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">System Modules</h1>
          <p className="text-gray-500 mt-1">Define modules for permission control</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Module
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editModule ? 'Edit Module' : 'Add Module'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., sales"
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
                placeholder="e.g., Sales Management"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Route Prefix</label>
              <input
                type="text"
                value={formData.routePrefix}
                onChange={(e) => setFormData({ ...formData, routePrefix: e.target.value })}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., /sales"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="moduleActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="moduleActive" className="ml-2 block text-sm text-gray-900">
                Active
              </label>
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editModule ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Route</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">Loading...</td>
              </tr>
            ) : !modules || modules.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  No modules found. Add modules to enable permission control.
                </td>
              </tr>
            ) : (
              modules.map((mod: Module) => (
                <tr key={mod.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{mod.code}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{mod.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{mod.routePrefix || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{mod.sortOrder}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      mod.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {mod.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEdit(mod)} className="text-indigo-600 hover:text-indigo-900 p-1">
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button onClick={() => setDeleteId(mod.id)} className="text-red-600 hover:text-red-900 p-1">
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

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-2">Delete Module</h3>
            <p className="text-gray-600 mb-4">Are you sure? This will also remove all related permissions.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
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
