import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Filter,
  Package,
  DollarSign,
  BoxIcon,
  BarChart3,
  Info,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { itemsApi } from './api';

/* ═══════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════ */

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const CATEGORY_OPTIONS = [
  { value: 'finished_goods', label: 'Finished Goods' },
  { value: 'semifinished_goods', label: 'Semifinished Goods' },
  { value: 'raw_materials', label: 'Raw Materials' },
];

const EMPTY_FORM = {
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
};

/* ═══════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════ */

function formatLabel(value: string): string {
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function parseNumberOrUndefined(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

function extractErrorMessage(e: any): string {
  return (
    e?.response?.data?.message ||
    e?.response?.data?.data?.message ||
    e?.message ||
    'An unexpected error occurred.'
  );
}

/* ═══════════════════════════════════════════════════════════
   Reusable UI pieces
   ═══════════════════════════════════════════════════════════ */

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

function FullWidthField({ children }: { children: React.ReactNode }) {
  return <div className="md:col-span-2">{children}</div>;
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

function AccentStrip({ color = 'indigo' }: { color?: 'indigo' | 'red' }) {
  const gradient =
    color === 'red' ? 'from-red-500 to-orange-500' : 'from-indigo-500 to-purple-500';
  return <div className={`h-1 w-full rounded-full bg-gradient-to-r ${gradient}`} />;
}

function Spinner({ text = 'Loading…' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <span className="text-sm text-gray-500">{text}</span>
      </div>
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
        {CATEGORY_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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

/* ═══════════════════════════════════════════════════════════
   Form sections (shared between Create & Edit)
   ═══════════════════════════════════════════════════════════ */

type FieldBinder = (field: string) => {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function BasicInfoSection({
  bind,
  categoryValue,
  onCategoryChange,
  disableCode = false,
}: {
  bind: FieldBinder;
  categoryValue: string;
  onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disableCode?: boolean;
}) {
  return (
    <section className="space-y-4">
      <SectionHeader icon={Package} title="Basic Information" />
      <FieldGroup>
        <Input
          label={disableCode ? 'Item Code' : 'Item Code *'}
          {...bind('itemCode')}
          disabled={disableCode}
          placeholder="e.g. ITM-0001"
        />
        <Input
          label={disableCode ? 'Item Name' : 'Item Name *'}
          {...bind('itemName')}
          placeholder="e.g. Sample Item"
        />
        <CategorySelect value={categoryValue} onChange={onCategoryChange} />
        <Input label="Upper Item" {...bind('upperItem')} placeholder="Parent item code" />
        <Input label="Unit" {...bind('unit')} placeholder="e.g. EA, KG" />
        <Input label="Color" {...bind('color')} placeholder="e.g. Red" />
        <Input label="Current Step" {...bind('currentStep')} />
      </FieldGroup>
    </section>
  );
}

function DetailsSection({ bind }: { bind: FieldBinder }) {
  return (
    <section className="space-y-4">
      <SectionHeader icon={Info} title="Details" />
      <FieldGroup>
        <FullWidthField>
          <Input label="Description" {...bind('description')} placeholder="Item description" />
        </FullWidthField>
        <FullWidthField>
          <Input
            label="Additional Detail"
            {...bind('additionalDetail')}
            placeholder="Any extra notes"
          />
        </FullWidthField>
        <Input
          label="Search Keyword"
          {...bind('searchKeyword')}
          placeholder="Keywords for search"
        />
        <Input label="Photo URL" {...bind('photo')} placeholder="https://..." />
      </FieldGroup>
    </section>
  );
}

function InventorySection({ bind }: { bind: FieldBinder }) {
  return (
    <section className="space-y-4">
      <SectionHeader icon={BarChart3} title="Inventory & Operations" />
      <FieldGroup>
        <Input label="Inventory Management" {...bind('inventoryManagement')} />
        <Input label="Job Hour" {...bind('jobHour')} />
      </FieldGroup>
    </section>
  );
}

function PricingSection({ bind }: { bind: FieldBinder }) {
  return (
    <section className="space-y-4">
      <SectionHeader icon={DollarSign} title="Pricing & Tax" />
      <FieldGroup>
        <Input label="Sales Basis Price" {...bind('salesBasisPrice')} placeholder="0" />
        <Input label="Purchase Basis Price" {...bind('purchaseBasisPrice')} placeholder="0" />
        <Input label="Foreign Sales Price" {...bind('foreignSalesPrice')} placeholder="0" />
        <Input label="Foreign Purchase Price" {...bind('foreignPurchasePrice')} placeholder="0" />
        <Input label="Included VAT" {...bind('includedVat')} />
        <Input label="Tax Free" {...bind('taxfree')} />
      </FieldGroup>
    </section>
  );
}

function PackagingSection({ bind }: { bind: FieldBinder }) {
  return (
    <section className="space-y-4">
      <SectionHeader icon={BoxIcon} title="Packaging & Barcode" />
      <FieldGroup>
        <Input label="Box Usage" {...bind('boxUsage')} />
        <Input label="Quantity In A Box" {...bind('quantityInABox')} placeholder="0" />
        <Input label="Barcode" {...bind('barcode')} />
        <Input label="Barcode Type" {...bind('barcodeType')} />
      </FieldGroup>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   Pagination
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
  const pageNumbers = useMemo(() => {
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
  }, [totalPages, currentPage]);

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50/50">
      {/* Left: info text + page size selector */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-500">
          Showing{' '}
          <span className="font-medium text-gray-700">{from}</span> to{' '}
          <span className="font-medium text-gray-700">{to}</span> of{' '}
          <span className="font-medium text-gray-700">{totalItems}</span> items
        </p>

        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-sm text-gray-500 whitespace-nowrap">
            Per page:
          </label>
          <select
            id="page-size"
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

      {/* Right: page controls */}
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

export function ItemPage() {
  /* ── modal visibility ── */
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  /* ── search, filter & pagination ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);

  /* ── create ── */
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  /* ── edit ── */
  const [editingItemCode, setEditingItemCode] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  /* ── delete ── */
  const [deletingItem, setDeletingItem] = useState<{
    itemCode: string;
    itemName: string;
  } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ── data query ── */
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['master-data', 'items'],
    queryFn: async () => {
      const res = await itemsApi.getAll();
      return res.data;
    },
  });

  /* ── filtered data (active only) ── */
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data
      .filter((item) => item.isActive !== false)
      .filter((item) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          item.itemCode.toLowerCase().includes(q) ||
          item.itemName.toLowerCase().includes(q);
        const matchesCategory =
          categoryFilter === 'all' || item.category === categoryFilter;
        return matchesSearch && matchesCategory;
      });
  }, [data, searchQuery, categoryFilter]);

  /* ── pagination derived ── */
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // reset to page 1 when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, pageSize]);

  // clamp page when data shrinks
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  /* ── error text ── */
  const loadErrorText = useMemo(() => {
    if (!error) return null;
    const err: any = error;
    const status = err?.response?.status;
    const msg = extractErrorMessage(err);
    if (status && msg) return `${status}: ${msg}`;
    return msg || 'Failed to load items.';
  }, [error]);

  /* ── field binders ── */
  const cf = (field: string) => ({
    value: (form as any)[field] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value })),
  });

  const ef = (field: string) => ({
    value: (editForm as any)[field] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setEditForm((prev) => ({ ...prev, [field]: e.target.value })),
  });

  /* ── build payload ── */
  const buildPayload = (f: typeof EMPTY_FORM, includeActive?: boolean) => ({
    itemCode: f.itemCode.trim(),
    itemName: f.itemName.trim(),
    category: f.category || undefined,
    ...(includeActive ? { isActive: true } : {}),
    upperItem: f.upperItem.trim() || undefined,
    unit: f.unit.trim() || undefined,
    description: f.description.trim() || undefined,
    color: f.color.trim() || undefined,
    additionalDetail: f.additionalDetail.trim() || undefined,
    searchKeyword: f.searchKeyword.trim() || undefined,
    inventoryManagement: f.inventoryManagement.trim() || undefined,
    jobHour: f.jobHour.trim() || undefined,
    currentStep: f.currentStep.trim() || undefined,
    includedVat: f.includedVat.trim() || undefined,
    taxfree: f.taxfree.trim() || undefined,
    salesBasisPrice: parseNumberOrUndefined(f.salesBasisPrice),
    purchaseBasisPrice: parseNumberOrUndefined(f.purchaseBasisPrice),
    foreignSalesPrice: parseNumberOrUndefined(f.foreignSalesPrice),
    foreignPurchasePrice: parseNumberOrUndefined(f.foreignPurchasePrice),
    boxUsage: f.boxUsage.trim() || undefined,
    quantityInABox: parseNumberOrUndefined(f.quantityInABox),
    barcode: f.barcode.trim() || undefined,
    barcodeType: f.barcodeType.trim() || undefined,
    photo: f.photo.trim() || undefined,
  });

  /* ────────── CREATE ────────── */

  const onCreate = async () => {
    setCreateError(null);
    setIsCreating(true);
    try {
      const res = await itemsApi.create(buildPayload(form, true));
      if (!res.success) throw new Error(res.error?.message || 'Create failed');
      setIsCreateOpen(false);
      setForm({ ...EMPTY_FORM });
      await refetch();
    } catch (e: any) {
      setCreateError(extractErrorMessage(e));
    } finally {
      setIsCreating(false);
    }
  };

  /* ────────── EDIT LOAD ────────── */

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
      setEditError(extractErrorMessage(e));
    } finally {
      setIsEditLoading(false);
    }
  };

  /* ────────── EDIT SAVE ────────── */

  const onSaveEdit = async () => {
    if (!editingItemCode) return;
    setEditError(null);
    setIsSavingEdit(true);
    try {
      const res = await itemsApi.update(editingItemCode, buildPayload(editForm));
      if (!res.success) throw new Error(res.error?.message || 'Update failed');
      setIsEditOpen(false);
      setEditingItemCode(null);
      await refetch();
    } catch (e: any) {
      setEditError(extractErrorMessage(e));
    } finally {
      setIsSavingEdit(false);
    }
  };

  /* ────────── DELETE (soft) ────────── */

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
      const itemRes = await itemsApi.getOne(deletingItem.itemCode);
      const full = itemRes.data;
      const res = await itemsApi.update(deletingItem.itemCode, {
        itemCode: full.itemCode,
        itemName: full.itemName,
        category: full.category,
        upperItem: full.upperItem,
        unit: full.unit,
        description: full.description,
        color: full.color,
        additionalDetail: full.additionalDetail,
        searchKeyword: full.searchKeyword,
        inventoryManagement: full.inventoryManagement,
        jobHour: full.jobHour,
        currentStep: full.currentStep,
        includedVat: full.includedVat,
        taxfree: full.taxfree,
        salesBasisPrice: full.salesBasisPrice,
        purchaseBasisPrice: full.purchaseBasisPrice,
        foreignSalesPrice: full.foreignSalesPrice,
        foreignPurchasePrice: full.foreignPurchasePrice,
        boxUsage: full.boxUsage,
        quantityInABox: full.quantityInABox,
        barcode: full.barcode,
        barcodeType: full.barcodeType,
        photo: full.photo,
        isActive: false,
      });
      if (!res.success) throw new Error(res.error?.message || 'Delete failed');
      setIsDeleteOpen(false);
      setDeletingItem(null);
      await refetch();
    } catch (e: any) {
      setDeleteError(extractErrorMessage(e));
    } finally {
      setIsDeleting(false);
    }
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Item</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Item
        </Button>
      </div>

      {/* ── Search & filter bar ── */}
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
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
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

      {/* ── Table ── */}
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

              {paginatedData.map((item) => (
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(item.itemCode)}
                      >
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

        {/* Pagination */}
        {filteredData.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredData.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
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
          <AccentStrip />

          <p className="text-sm text-gray-500">
            Fill in the information below to register a new item. Fields marked with{' '}
            <span className="text-red-500">*</span> are required.
          </p>

          <ErrorBanner message={createError} />

          <div className="space-y-6 max-h-[60vh] overflow-y-auto px-2 -mx-2 py-1">
            <BasicInfoSection
              bind={cf}
              categoryValue={form.category}
              onCategoryChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value }))
              }
            />
            <DetailsSection bind={cf} />
            <InventorySection bind={cf} />
            <PricingSection bind={cf} />
            <PackagingSection bind={cf} />
          </div>

          <ModalFooter
            onCancel={() => {
              setIsCreateOpen(false);
              setForm({ ...EMPTY_FORM });
            }}
            onConfirm={onCreate}
            confirmLabel="Create Item"
            isLoading={isCreating}
            disabled={!form.itemCode.trim() || !form.itemName.trim()}
          />
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
          <AccentStrip />

          {isEditLoading && <Spinner text="Loading item data…" />}

          <ErrorBanner message={editError} />

          {!isEditLoading && (
            <>
              <div className="space-y-6 max-h-[60vh] overflow-y-auto px-2 -mx-2 py-1">
                <BasicInfoSection
                  bind={ef}
                  categoryValue={editForm.category}
                  onCategoryChange={(e) =>
                    setEditForm((prev) => ({ ...prev, category: e.target.value }))
                  }
                  disableCode
                />
                <DetailsSection bind={ef} />
                <InventorySection bind={ef} />
                <PricingSection bind={ef} />
                <PackagingSection bind={ef} />
              </div>

              <ModalFooter
                onCancel={() => {
                  setIsEditOpen(false);
                  setEditingItemCode(null);
                }}
                onConfirm={onSaveEdit}
                confirmLabel="Save Changes"
                isLoading={isSavingEdit}
                disabled={!editForm.itemName.trim() || !editForm.itemCode.trim()}
              />
            </>
          )}
        </div>
      </Modal>

      {/* ═══════════════ DELETE MODAL ═══════════════ */}
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
          <AccentStrip color="red" />

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
                This item will be deactivated and hidden from the list. This action can be
                reversed by an administrator.
              </p>
            </div>
          </div>

          <ErrorBanner message={deleteError} />

          <ModalFooter
            onCancel={() => {
              setIsDeleteOpen(false);
              setDeletingItem(null);
              setDeleteError(null);
            }}
            onConfirm={onConfirmDelete}
            confirmLabel="Delete Item"
            isLoading={isDeleting}
            variant="danger"
            confirmIcon={<Trash2 className="w-4 h-4 mr-2" />}
          />
        </div>
      </Modal>
    </div>
  );
}