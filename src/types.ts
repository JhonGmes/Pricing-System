export interface Category {
  id: string;
  name: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  supplier?: string;
  unit: 'kg' | 'g' | 'ml' | 'l' | 'un';
  quantityBought: number;
  pricePaid: number;
  unitCost: number;
  history: { date: string; price: number }[];
  createdAt: string;
}

export interface IndirectCost {
  id: string;
  name: string;
  type: 'batch' | 'unit'; // Alocado por lote ou por unidade
  amount: number;
}

export interface ProductMaterial {
  materialId: string;
  quantityUsed: number;
}

export interface ProductCost {
  costId: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  materials: ProductMaterial[];
  indirectCosts: ProductCost[];
  batchSize: number; // Quantas unidades rende
  images: string[]; // Base64
  
  // Calculated stored values (for history/performance)
  totalBatchCost: number;
  unitCost: number;
  
  // Pricing
  desiredMarginPercent: number;
  fixedProfitAddon: number;
  finalPrice: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  brandName: string;
  subtitle: string;
  logo: string | null; // Base64
  defaultMarginPercent: number;
  defaultFixedCost: number;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
}
