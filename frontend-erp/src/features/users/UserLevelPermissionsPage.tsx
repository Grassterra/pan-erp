import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { userLevelsApi, modulesApi } from './api';
import type { Module, UserLevelPermission } from './api';

export function UserLevelPermissionsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [permissions, setPermissions] = useState<Record<number, UserLevelPermission>>({});
  const [success, setSuccess] = useState(false);

  const { data: level, isLoading: levelLoading } = useQuery({
    queryKey: ['user-level', id],
    queryFn: () => userLevelsApi.getById(Number(id)),
  });

  const { data: modules, isLoading: modulesLoading } = useQuery({
    queryKey: ['modules-active'],
    queryFn: () => modulesApi.getActive(),
  });

  const { data: existingPermissions } = useQuery({
    queryKey: ['user-level-permissions', id],
    queryFn: () => userLevelsApi.getPermissions(Number(id)),
  });

  useEffect(() => {
    if (modules && existingPermissions) {
      const perms: Record<number, UserLevelPermission> = {};
      modules.forEach((mod: Module) => {
        const existing = existingPermissions.find(
          (p: any) => p.module?.id === mod.id || p.moduleId === mod.id
        );
        perms[mod.id] = existing
          ? {
              moduleId: mod.id,
              canView: existing.canView || false,
              canCreate: existing.canCreate || false,
              canEdit: existing.canEdit || false,
              canDelete: existing.canDelete || false,
              canExport: existing.canExport || false,
              canPrint: existing.canPrint || false,
            }
          : {
              moduleId: mod.id,
              canView: false,
              canCreate: false,
              canEdit: false,
              canDelete: false,
              canExport: false,
              canPrint: false,
            };
      });
      setPermissions(perms);
    }
  }, [modules, existingPermissions]);

  const saveMutation = useMutation({
    mutationFn: async (perms: UserLevelPermission[]) => {
      return userLevelsApi.updatePermissions(Number(id), perms);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-level-permissions', id] });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleToggle = (moduleId: number, field: keyof UserLevelPermission) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [field]: !prev[moduleId][field as keyof UserLevelPermission],
      },
    }));
  };

  const handleToggleAll = (moduleId: number, value: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: {
        moduleId,
        canView: value,
        canCreate: value,
        canEdit: value,
        canDelete: value,
        canExport: value,
        canPrint: value,
      },
    }));
  };

  const handleSave = () => {
    const perms = Object.values(permissions);
    saveMutation.mutate(perms);
  };

  if (levelLoading || modulesLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Link to="/users/levels" className="flex items-center text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to User Levels
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Permissions: {level?.name}</h1>
          <p className="text-gray-500 mt-1">Configure module access permissions for this user level</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
        >
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? 'Saving...' : 'Save Permissions'}
        </button>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          Permissions updated successfully
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">View</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Create</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Edit</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Delete</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Export</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Print</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">All</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {modules?.map((mod: Module) => (
                <tr key={mod.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{mod.name}</td>
                  {(['canView', 'canCreate', 'canEdit', 'canDelete', 'canExport', 'canPrint'] as const).map(
                    (field) => (
                      <td key={field} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={permissions[mod.id]?.[field] || false}
                          onChange={() => handleToggle(mod.id, field)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                    )
                  )}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => {
                        const allChecked =
                          permissions[mod.id]?.canView &&
                          permissions[mod.id]?.canCreate &&
                          permissions[mod.id]?.canEdit &&
                          permissions[mod.id]?.canDelete &&
                          permissions[mod.id]?.canExport &&
                          permissions[mod.id]?.canPrint;
                        handleToggleAll(mod.id, !allChecked);
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
