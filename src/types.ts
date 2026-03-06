export interface Category {
  id: string;
  name: string;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  supplier?: string;
  unit: 'kg' | 'g' | 'ml' | 'l' | 'un' | 'cm' | 'm';
  quantityBought: number;
  pricePaid: number;
  unitCost: number;
  stockQuantity: number; // Current stock level
  minStockLevel?: number; // Alert level
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
  
  // Inventory
  stockQuantity?: number;
  minStockLevel?: number;
  
  // Catalog
  code?: string; // Custom Product Code/ID
  active?: boolean; // Is active in catalog?
}

export interface StockMovement {
  id: string;
  itemId: string; // Material ID or Product ID
  itemType: 'material' | 'product';
  type: 'entry' | 'exit' | 'adjustment';
  quantity: number;
  reason?: string; // e.g., "Purchase", "Production", "Sale", "Correction"
  date: string;
  cost?: number; // For entries (cost price)
  price?: number; // For exits (selling price)
}

export interface CatalogSettings {
  coverTitle: string;
  coverSubtitle: string;
  coverFooter: string;
  headerText: string;
  footerText: string;
  primaryColor: string; // For headers, accents (e.g., #3e1c1c)
  secondaryColor: string; // For backgrounds (e.g., #F5F2ED)
  textColor: string;
  productsPerPage: number;
  showPrice: boolean;
  showDescription: boolean;
  showCode: boolean;
}

export interface AppSettings {
  brandName: string;
  subtitle: string;
  logo: string | null; // Base64
  defaultMarginPercent: number;
  defaultFixedCost: number;
  catalog?: CatalogSettings;
}

export interface User {
  id?: string;
  name: string;
  email: string;
  isAuthenticated: boolean;
}
