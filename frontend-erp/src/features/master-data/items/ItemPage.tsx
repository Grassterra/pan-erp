import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Package, DollarSign, BoxIcon, BarChart3, Info, Trash2, AlertTriangle } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { itemsApi } from './api';

/* ───────────────────── tiny helpers ───────────────────── */

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1 border-b border-gray-200">
      <Icon className="w-4 h-4 text-indigo-500" />
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
    </div>
  );
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">{children}</div>;
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

function CategorySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="w-full space-y-2">
      <label className="text-sm font-semibold text-gray-700">Category</label>
      <select
        className="flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        value={value}
        onChange={onChange}
      >
        <option value="finished_goods">Finished Goods</option>
        <option value="semifinished_goods">Semifinished Goods</option>
        <option value="raw_materials">Raw Materials</option>
      </select>
    </div>
  );
}

function formatLabel(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/* ───────────────────── main page ───────────────────── */

export function ItemPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItemCode, setEditingItemCode] = useState<string | null>(null);

  /* ── delete state ── */
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ itemCode: string; itemName: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /* ── search & filter state ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [form, setForm] = useState({
    itemCode: '',
    itemName: '',
    category: 'finished_goods',
    upperItem: '',
    unit: '',
    description: '',
    color: '',
    additionalDetail: '',
    searchKeyword: '',
    inventoryManagement: '',
    jobHour: '',
    currentStep: '',
    includedVat: '',
    taxfree: '',
    salesBasisPrice: '',
    purchaseBasisPrice: '',
    foreignSalesPrice: '',
    foreignPurchasePrice: '',
    boxUsage: '',
    quantityInABox: '',
    barcode: '',
    barcodeType: '',
    photo: '',
  });

  const [editForm, setEditForm] = useState({
    itemCode: '',
    itemName: '',
    category: 'finished_goods',
    upperItem: '',
    unit: '',
    description: '',
    color: '',
    additionalDetail: '',
    searchKeyword: '',
    inventoryManagement: '',
    jobHour: '',
    currentStep: '',
    includedVat: '',
    taxfree: '',
    salesBasisPrice: '' as string,
    purchaseBasisPrice: '' as string,
    foreignSalesPrice: '' as string,
    foreignPurchasePrice: '' as string,
    boxUsage: '',
    quantityInABox: '' as string,
    barcode: '',
    barcodeType: '',
    photo: '',
  });

  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [editError, setEditError] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['master-data', 'items'],
    queryFn: async () => {
      const res = await itemsApi.getAll();
      return res.data;
    },
  });

  /* ── filtered data (only active items) ── */
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data
      .filter((item) => item.isActive !== false) // only show active items
      .filter((item) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          item.itemCode.toLowerCase().includes(query) ||
          item.itemName.toLowerCase().includes(query);
        const matchesCategory =
          categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
      });
  }, [data, searchQuery, categoryFilter]);

  const loadErrorText = useMemo(() => {
    if (!error) return null;
    const err: any = error;
    const status = err?.response?.status;
    const msg =
      err?.response?.data?.message || err?.response?.data?.data?.message || err?.message;
    if (status && msg) return `${status}: ${msg}`;
    return msg || 'Failed to load items.';
  }, [error]);

  const parseNumberOrUndefined = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : undefined;
  };

  const resetCreateForm = () =>
    setForm({
      itemCode: '',
      itemName: '',
      category: 'finished_goods',
      upperItem: '',
      unit: '',
      description: '',
      color: '',
      additionalDetail: '',
      searchKeyword: '',
      inventoryManagement: '',
      jobHour: '',
      currentStep: '',
      includedVat: '',
      taxfree: '',
      salesBasisPrice: '',
      purchaseBasisPrice: '',
      foreignSalesPrice: '',
      foreignPurchasePrice: '',
      boxUsage: '',
      quantityInABox: '',
      barcode: '',
      barcodeType: '',
      photo: '',
    });

  /* ── create (auto-sets is_active: true) ── */
  const onCreate = async () => {
    setCreateError(null);
    setIsCreating(true);
    try {
      const payload = {
        itemCode: form.itemCode.trim(),
        itemName: form.itemName.trim(),
        category: form.category || undefined,
        isActive: true,
        upperItem: form.upperItem.trim() || undefined,
        unit: form.unit.trim() || undefined,
        description: form.description.trim() || undefined,
        color: form.color.trim() || undefined,
        additionalDetail: form.additionalDetail.trim() || undefined,
        searchKeyword: form.searchKeyword.trim() || undefined,
        inventoryManagement: form.inventoryManagement.trim() || undefined,
        jobHour: form.jobHour.trim() || undefined,
        currentStep: form.currentStep.trim() || undefined,
        includedVat: form.includedVat.trim() || undefined,
        taxfree: form.taxfree.trim() || undefined,
        salesBasisPrice: parseNumberOrUndefined(form.salesBasisPrice),
        purchaseBasisPrice: parseNumberOrUndefined(form.purchaseBasisPrice),
        foreignSalesPrice: parseNumberOrUndefined(form.foreignSalesPrice),
        foreignPurchasePrice: parseNumberOrUndefined(form.foreignPurchasePrice),
        boxUsage: form.boxUsage.trim() || undefined,
        quantityInABox: parseNumberOrUndefined(form.quantityInABox),
        barcode: form.barcode.trim() || undefined,
        barcodeType: form.barcodeType.trim() || undefined,
        photo: form.photo.trim() || undefined,
      };
      const res = await itemsApi.create(payload);
      if (!res.success) throw new Error(res.error?.message || 'Create failed');
      setIsCreateOpen(false);
      resetCreateForm();
      await refetch();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.response?.data?.data?.message || e?.message;
      setCreateError(msg || 'Failed to create item.');
    } finally {
      setIsCreating(false);
    }
  };

  /* ── edit load ── */
  const openEdit = async (itemCode: string) => {
    setEditError(null);
    setIsEditLoading(true);
    setEditingItemCode(itemCode);
    setIsEditOpen(true);
    try {
      const res = await itemsApi.getOne(itemCode);
      const item = res.data;
      setEditForm({
        itemCode: item.itemCode || '',
        itemName: item.itemName || '',
        category: item.category || 'finished_goods',
        upperItem: item.upperItem || '',
        unit: item.unit || '',
        description: item.description || '',
        color: item.color || '',
        additionalDetail: item.additionalDetail || '',
        searchKeyword: item.searchKeyword || '',
        inventoryManagement: item.inventoryManagement || '',
        jobHour: item.jobHour || '',
        currentStep: item.currentStep || '',
        includedVat: item.includedVat || '',
        taxfree: item.taxfree || '',
        salesBasisPrice:
          item.salesBasisPrice == null ? '' : String(item.salesBasisPrice),
        purchaseBasisPrice:
          item.purchaseBasisPrice == null ? '' : String(item.purchaseBasisPrice),
        foreignSalesPrice:
          item.foreignSalesPrice == null ? '' : String(item.foreignSalesPrice),
        foreignPurchasePrice:
          item.foreignPurchasePrice == null ? '' : String(item.foreignPurchasePrice),
        boxUsage: item.boxUsage || '',
        quantityInABox:
          item.quantityInABox == null ? '' : String(item.quantityInABox),
        barcode: item.barcode || '',
        barcodeType: item.barcodeType || '',
        photo: item.photo || '',
      });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.response?.data?.data?.message || e?.message;
      setEditError(msg || 'Failed to load item.');
    } finally {
      setIsEditLoading(false);
    }
  };

  /* ── edit save ── */
  const onSaveEdit = async () => {
    if (!editingItemCode) return;
    setEditError(null);
    setIsSavingEdit(true);
    try {
      const payload = {
        itemCode: editForm.itemCode.trim(),
        itemName: editForm.itemName.trim(),
        category: editForm.category || undefined,
        upperItem: editForm.upperItem.trim() || undefined,
        unit: editForm.unit.trim() || undefined,
        description: editForm.description.trim() || undefined,
        color: editForm.color.trim() || undefined,
        additionalDetail: editForm.additionalDetail.trim() || undefined,
        searchKeyword: editForm.searchKeyword.trim() || undefined,
        inventoryManagement: editForm.inventoryManagement.trim() || undefined,
        jobHour: editForm.jobHour.trim() || undefined,
        currentStep: editForm.currentStep.trim() || undefined,
        includedVat: editForm.includedVat.trim() || undefined,
        taxfree: editForm.taxfree.trim() || undefined,
        salesBasisPrice: parseNumberOrUndefined(editForm.salesBasisPrice),
        purchaseBasisPrice: parseNumberOrUndefined(editForm.purchaseBasisPrice),
        foreignSalesPrice: parseNumberOrUndefined(editForm.foreignSalesPrice),
        foreignPurchasePrice: parseNumberOrUndefined(editForm.foreignPurchasePrice),
        boxUsage: editForm.boxUsage.trim() || undefined,
        quantityInABox: parseNumberOrUndefined(editForm.quantityInABox),
        barcode: editForm.barcode.trim() || undefined,
        barcodeType: editForm.barcodeType.trim() || undefined,
        photo: editForm.photo.trim() || undefined,
      };
      const res = await itemsApi.update(editingItemCode, payload);
      if (!res.success) throw new Error(res.error?.message || 'Update failed');
      setIsEditOpen(false);
      setEditingItemCode(null);
      await refetch();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.response?.data?.data?.message || e?.message;
      setEditError(msg || 'Failed to update item.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  /* ── delete (soft-delete: set is_active to false) ── */
  const openDelete = (itemCode: string, itemName: string) => {
    setDeleteError(null);
    setDeletingItem({ itemCode, itemName });
    setIsDeleteOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      // fetch full item data first
      const itemRes = await itemsApi.getOne(deletingItem.itemCode);
      const fullItem = itemRes.data;

      // send complete payload with isActive set to false
      const res = await itemsApi.update(deletingItem.itemCode, {
        itemCode: fullItem.itemCode,
        itemName: fullItem.itemName,
        category: fullItem.category,
        upperItem: fullItem.upperItem,
        unit: fullItem.unit,
        description: fullItem.description,
        color: fullItem.color,
        additionalDetail: fullItem.additionalDetail,
        searchKeyword: fullItem.searchKeyword,
        inventoryManagement: fullItem.inventoryManagement,
        jobHour: fullItem.jobHour,
        currentStep: fullItem.currentStep,
        includedVat: fullItem.includedVat,
        taxfree: fullItem.taxfree,
        salesBasisPrice: fullItem.salesBasisPrice,
        purchaseBasisPrice: fullItem.purchaseBasisPrice,
        foreignSalesPrice: fullItem.foreignSalesPrice,
        foreignPurchasePrice: fullItem.foreignPurchasePrice,
        boxUsage: fullItem.boxUsage,
        quantityInABox: fullItem.quantityInABox,
        barcode: fullItem.barcode,
        barcodeType: fullItem.barcodeType,
        photo: fullItem.photo,
        isActive: false, // ← only this changes
      });
      if (!res.success) throw new Error(res.error?.message || 'Delete failed');
      setIsDeleteOpen(false);
      setDeletingItem(null);
      await refetch();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || e?.response?.data?.data?.message || e?.message;
      setDeleteError(msg || 'Failed to delete item.');
    } finally {
      setIsDeleting(false);
    }
  };

  /* ── field shorthands ── */
  const cf = (field: keyof typeof form) => ({
    value: form[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value })),
  });

  const ef = (field: keyof typeof editForm) => ({
    value: editForm[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setEditForm((prev) => ({ ...prev, [field]: e.target.value })),
  });

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <div className="space-y-6">
      {/* ── header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Item</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Item
        </Button>
      </div>

      {/* ── search & filter bar ── */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search item code or name..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="relative w-full sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
          <select
            className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-9 pr-3 py-2 text-sm text-gray-900 appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="finished_goods">Finished Goods</option>
            <option value="semifinished_goods">Semifinished Goods</option>
            <option value="raw_materials">Raw Materials</option>
          </select>
        </div>

        {(searchQuery || categoryFilter !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium whitespace-nowrap transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── table ── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-red-500">
                    {loadErrorText}
                  </td>
                </tr>
              )}
              {!isLoading && !error && filteredData.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    {data && data.length > 0
                      ? 'No items match your filters.'
                      : 'No items.'}
                  </td>
                </tr>
              )}
              {filteredData.map((item) => (
                <tr key={item.itemCode} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.itemCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.itemName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category ? formatLabel(item.category) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(item.itemCode)}>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                        onClick={() => openDelete(item.itemCode, item.itemName)}
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
      </div>

      {/* ═══════════════ CREATE MODAL ═══════════════ */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setCreateError(null);
        }}
        title="New Item"
      >
        <div className="space-y-6">
          <div className="h-1 w-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />

          <p className="text-sm text-gray-500">
            Fill in the information below to register a new item. Fields marked with{' '}
            <span className="text-red-500">*</span> are required.
          </p>

          <ErrorBanner message={createError} />

          <div className="space-y-6 max-h-[60vh] overflow-y-auto px-2 -mx-2 py-1">
            <section className="space-y-4">
              <SectionHeader icon={Package} title="Basic Information" />
              <FieldGroup>
                <Input label="Item Code *" {...cf('itemCode')} placeholder="e.g. ITM-0001" />
                <Input label="Item Name *" {...cf('itemName')} placeholder="e.g. Sample Item" />
                <CategorySelect
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                />
                <Input label="Upper Item" {...cf('upperItem')} placeholder="Parent item code" />
                <Input label="Unit" {...cf('unit')} placeholder="e.g. EA, KG" />
                <Input label="Color" {...cf('color')} placeholder="e.g. Red" />
                <Input label="Current Step" {...cf('currentStep')} />
              </FieldGroup>
            </section>

            <section className="space-y-4">
              <SectionHeader icon={Info} title="Details" />
              <FieldGroup>
                <div className="md:col-span-2">
                  <Input label="Description" {...cf('description')} placeholder="Item description" />
                </div>
                <div className="md:col-span-2">
                  <Input
                    label="Additional Detail"
                    {...cf('additionalDetail')}
                    placeholder="Any extra notes"
                  />
                </div>
                <Input
                  label="Search Keyword"
                  {...cf('searchKeyword')}
                  placeholder="Keywords for search"
                />
                <Input label="Photo URL" {...cf('photo')} placeholder="https://..." />
              </FieldGroup>
            </section>

            <section className="space-y-4">
              <SectionHeader icon={BarChart3} title="Inventory & Operations" />
              <FieldGroup>
                <Input label="Inventory Management" {...cf('inventoryManagement')} />
                <Input label="Job Hour" {...cf('jobHour')} />
              </FieldGroup>
            </section>

            <section className="space-y-4">
              <SectionHeader icon={DollarSign} title="Pricing & Tax" />
              <FieldGroup>
                <Input label="Sales Basis Price" {...cf('salesBasisPrice')} placeholder="0" />
                <Input label="Purchase Basis Price" {...cf('purchaseBasisPrice')} placeholder="0" />
                <Input label="Foreign Sales Price" {...cf('foreignSalesPrice')} placeholder="0" />
                <Input
                  label="Foreign Purchase Price"
                  {...cf('foreignPurchasePrice')}
                  placeholder="0"
                />
                <Input label="Included VAT" {...cf('includedVat')} />
                <Input label="Tax Free" {...cf('taxfree')} />
              </FieldGroup>
            </section>

            <section className="space-y-4">
              <SectionHeader icon={BoxIcon} title="Packaging & Barcode" />
              <FieldGroup>
                <Input label="Box Usage" {...cf('boxUsage')} />
                <Input label="Quantity In A Box" {...cf('quantityInABox')} placeholder="0" />
                <Input label="Barcode" {...cf('barcode')} />
                <Input label="Barcode Type" {...cf('barcodeType')} />
              </FieldGroup>
            </section>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                resetCreateForm();
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={onCreate}
              isLoading={isCreating}
              disabled={!form.itemCode.trim() || !form.itemName.trim()}
            >
              Create Item
            </Button>
          </div>
        </div>
      </Modal>

      {/* ═══════════════ EDIT MODAL ═══════════════ */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingItemCode(null);
          setEditError(null);
        }}
        title="Edit Item"
      >
        <div className="space-y-6">
          <div className="h-1 w-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />

          {isEditLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                <span className="text-sm text-gray-500">Loading item data…</span>
              </div>
            </div>
          )}

          <ErrorBanner message={editError} />

          {!isEditLoading && (
            <div className="space-y-6 max-h-[60vh] overflow-y-auto px-2 -mx-2 py-1">
              <section className="space-y-4">
                <SectionHeader icon={Package} title="Basic Information" />
                <FieldGroup>
                  <Input label="Item Code" value={editForm.itemCode} disabled />
                  <Input label="Item Name" {...ef('itemName')} />
                  <CategorySelect
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                  />
                  <Input label="Upper Item" {...ef('upperItem')} placeholder="Parent item code" />
                  <Input label="Unit" {...ef('unit')} placeholder="e.g. EA, KG" />
                  <Input label="Color" {...ef('color')} placeholder="e.g. Red" />
                  <Input label="Current Step" {...ef('currentStep')} />
                </FieldGroup>
              </section>

              <section className="space-y-4">
                <SectionHeader icon={Info} title="Details" />
                <FieldGroup>
                  <div className="md:col-span-2">
                    <Input
                      label="Description"
                      {...ef('description')}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Additional Detail"
                      {...ef('additionalDetail')}
                      placeholder="Any extra notes"
                    />
                  </div>
                  <Input
                    label="Search Keyword"
                    {...ef('searchKeyword')}
                    placeholder="Keywords for search"
                  />
                  <Input label="Photo URL" {...ef('photo')} placeholder="https://..." />
                </FieldGroup>
              </section>

              <section className="space-y-4">
                <SectionHeader icon={BarChart3} title="Inventory & Operations" />
                <FieldGroup>
                  <Input label="Inventory Management" {...ef('inventoryManagement')} />
                  <Input label="Job Hour" {...ef('jobHour')} />
                </FieldGroup>
              </section>

              <section className="space-y-4">
                <SectionHeader icon={DollarSign} title="Pricing & Tax" />
                <FieldGroup>
                  <Input label="Sales Basis Price" {...ef('salesBasisPrice')} placeholder="0" />
                  <Input
                    label="Purchase Basis Price"
                    {...ef('purchaseBasisPrice')}
                    placeholder="0"
                  />
                  <Input
                    label="Foreign Sales Price"
                    {...ef('foreignSalesPrice')}
                    placeholder="0"
                  />
                  <Input
                    label="Foreign Purchase Price"
                    {...ef('foreignPurchasePrice')}
                    placeholder="0"
                  />
                  <Input label="Included VAT" {...ef('includedVat')} />
                  <Input label="Tax Free" {...ef('taxfree')} />
                </FieldGroup>
              </section>

              <section className="space-y-4">
                <SectionHeader icon={BoxIcon} title="Packaging & Barcode" />
                <FieldGroup>
                  <Input label="Box Usage" {...ef('boxUsage')} />
                  <Input label="Quantity In A Box" {...ef('quantityInABox')} placeholder="0" />
                  <Input label="Barcode" {...ef('barcode')} />
                  <Input label="Barcode Type" {...ef('barcodeType')} />
                </FieldGroup>
              </section>
            </div>
          )}

          {!isEditLoading && (
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingItemCode(null);
                }}
                disabled={isSavingEdit}
              >
                Cancel
              </Button>
              <Button
                onClick={onSaveEdit}
                isLoading={isSavingEdit}
                disabled={!editForm.itemName.trim() || !editForm.itemCode.trim()}
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* ═══════════════ DELETE CONFIRMATION MODAL ═══════════════ */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteOpen(false);
            setDeletingItem(null);
            setDeleteError(null);
          }
        }}
        title="Delete Item"
      >
        <div className="space-y-6">
          {/* red accent strip */}
          <div className="h-1 w-full rounded-full bg-gradient-to-r from-red-500 to-orange-500" />

          {/* warning icon + message */}
          <div className="flex flex-col items-center text-center gap-4 py-2">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <div className="space-y-2">
              <p className="text-base font-semibold text-gray-900">
                Are you sure you want to delete this item?
              </p>
              {deletingItem && (
                <div className="inline-flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-4 py-2">
                  <span className="text-sm font-medium text-gray-700">
                    {deletingItem.itemCode}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-500">{deletingItem.itemName}</span>
                </div>
              )}
              <p className="text-sm text-gray-500">
                This item will be deactivated and hidden from the list. This action can be reversed by an administrator.
              </p>
            </div>
          </div>

          <ErrorBanner message={deleteError} />

          {/* footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false);
                setDeletingItem(null);
                setDeleteError(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirmDelete}
              isLoading={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Item
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}