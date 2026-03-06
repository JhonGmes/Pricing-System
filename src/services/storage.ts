import { Material, IndirectCost, Product, AppSettings, User } from '../types';

const STORAGE_KEYS = {
  MATERIALS: 'centelha_materials',
  INDIRECT_COSTS: 'centelha_costs',
  PRODUCTS: 'centelha_products',
  SETTINGS: 'centelha_settings',
  USER: 'centelha_user',
  CATEGORIES: 'centelha_categories',
};

export const storage = {
  getCategories: (): { id: string; name: string }[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  },
  saveCategories: (categories: { id: string; name: string }[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getMaterials: (): Material[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    return data ? JSON.parse(data) : [];
  },
  saveMaterials: (materials: Material[]) => {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  },

  getIndirectCosts: (): IndirectCost[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INDIRECT_COSTS);
    return data ? JSON.parse(data) : [];
  },
  saveIndirectCosts: (costs: IndirectCost[]) => {
    localStorage.setItem(STORAGE_KEYS.INDIRECT_COSTS, JSON.stringify(costs));
  },

  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },
  saveProducts: (products: Product[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getSettings: (): AppSettings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      brandName: 'Centelha de Amor',
      subtitle: 'Artesanatos com Amor',
      logo: null,
      defaultMarginPercent: 50,
      defaultFixedCost: 0,
    };
  },
  saveSettings: (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getUser: (): User => {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : { name: '', email: '', isAuthenticated: false };
  },
  saveUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
};
