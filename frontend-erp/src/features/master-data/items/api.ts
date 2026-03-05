import { client } from '../../../api/client';
import type { ApiResponse } from '../../../types';

export interface Item {
  itemCode: string;
  itemName: string;
  category?: string;
  upperItem?: string;
  unit?: string;
  description?: string;
  color?: string;
  additionalDetail?: string;
  searchKeyword?: string;
  inventoryManagement?: string;
  jobHour?: string;
  currentStep?: string;
  includedVat?: string;
  taxfree?: string;
  salesBasisPrice?: number;
  purchaseBasisPrice?: number;
  foreignSalesPrice?: number;
  foreignPurchasePrice?: number;
  boxUsage?: string;
  quantityInABox?: number;
  barcode?: string;
  barcodeType?: string;
  photo?: string;
  isActive?: boolean;
}

export interface ItemCreateRequest {
  itemCode: string;
  itemName: string;
  category?: string;
  isActive?: boolean;
  upperItem?: string;
  unit?: string;
  description?: string;
  color?: string;
  additionalDetail?: string;
  searchKeyword?: string;
  inventoryManagement?: string;
  jobHour?: string;
  currentStep?: string;
  includedVat?: string;
  taxfree?: string;
  salesBasisPrice?: number;
  purchaseBasisPrice?: number;
  foreignSalesPrice?: number;
  foreignPurchasePrice?: number;
  boxUsage?: string;
  quantityInABox?: number;
  barcode?: string;
  barcodeType?: string;
  photo?: string;
}

export interface ItemUpdateRequest {
  itemCode?: string;
  itemName?: string;
  category?: string;
  isActive?: boolean;
  upperItem?: string;
  unit?: string;
  description?: string;
  color?: string;
  additionalDetail?: string;
  searchKeyword?: string;
  inventoryManagement?: string;
  jobHour?: string;
  currentStep?: string;
  includedVat?: string;
  taxfree?: string;
  salesBasisPrice?: number;
  purchaseBasisPrice?: number;
  foreignSalesPrice?: number;
  foreignPurchasePrice?: number;
  boxUsage?: string;
  quantityInABox?: number;
  barcode?: string;
  barcodeType?: string;
  photo?: string;
}

export const itemsApi = {
  getAll: async () => {
    const response = await client.get<ApiResponse<Item[]>>('/api/v1/master-data/items');
    return response.data;
  },

  getOne: async (itemCode: string) => {
    const response = await client.get<ApiResponse<Item>>(`/api/v1/master-data/items/${encodeURIComponent(itemCode)}`);
    return response.data;
  },

  create: async (data: ItemCreateRequest) => {
    const response = await client.post<ApiResponse<Item>>('/api/v1/master-data/items', data);
    return response.data;
  },

  update: async (itemCode: string, data: ItemUpdateRequest) => {
    const response = await client.put<ApiResponse<Item>>(`/api/v1/master-data/items/${encodeURIComponent(itemCode)}`, data);
    return response.data;
  },
};
