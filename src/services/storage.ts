import { get, set } from 'idb-keyval';
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
  getCategories: async (): Promise<{ id: string; name: string }[]> => {
    const data = await get(STORAGE_KEYS.CATEGORIES);
    if (data) return data;
    
    const lsData = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (lsData) {
      const parsed = JSON.parse(lsData);
      await set(STORAGE_KEYS.CATEGORIES, parsed);
      return parsed;
    }
    return [];
  },
  saveCategories: async (categories: { id: string; name: string }[]) => {
    await set(STORAGE_KEYS.CATEGORIES, categories);
  },

  getMaterials: async (): Promise<Material[]> => {
    const data = await get(STORAGE_KEYS.MATERIALS);
    if (data) return data;

    const lsData = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    if (lsData) {
      const parsed = JSON.parse(lsData);
      await set(STORAGE_KEYS.MATERIALS, parsed);
      return parsed;
    }
    return [];
  },
  saveMaterials: async (materials: Material[]) => {
    await set(STORAGE_KEYS.MATERIALS, materials);
  },

  getIndirectCosts: async (): Promise<IndirectCost[]> => {
    const data = await get(STORAGE_KEYS.INDIRECT_COSTS);
    if (data) return data;

    const lsData = localStorage.getItem(STORAGE_KEYS.INDIRECT_COSTS);
    if (lsData) {
      const parsed = JSON.parse(lsData);
      await set(STORAGE_KEYS.INDIRECT_COSTS, parsed);
      return parsed;
    }
    return [];
  },
  saveIndirectCosts: async (costs: IndirectCost[]) => {
    await set(STORAGE_KEYS.INDIRECT_COSTS, costs);
  },

  getProducts: async (): Promise<Product[]> => {
    const data = await get(STORAGE_KEYS.PRODUCTS);
    if (data) return data;

    const lsData = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (lsData) {
      const parsed = JSON.parse(lsData);
      await set(STORAGE_KEYS.PRODUCTS, parsed);
      return parsed;
    }
    return [];
  },
  saveProducts: async (products: Product[]) => {
    await set(STORAGE_KEYS.PRODUCTS, products);
  },

  getSettings: async (): Promise<AppSettings> => {
    const data = await get(STORAGE_KEYS.SETTINGS);
    if (data) return data;

    const lsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (lsData) {
      const parsed = JSON.parse(lsData);
      await set(STORAGE_KEYS.SETTINGS, parsed);
      return parsed;
    }
    return {
      brandName: 'Centelha de Amor',
      subtitle: 'Artesanatos com Amor',
      logo: null,
      defaultMarginPercent: 50,
      defaultFixedCost: 0,
    };
  },
  saveSettings: async (settings: AppSettings) => {
    await set(STORAGE_KEYS.SETTINGS, settings);
  },

  getUser: async (): Promise<User> => {
    const data = await get(STORAGE_KEYS.USER);
    if (data) return data;

    const lsData = localStorage.getItem(STORAGE_KEYS.USER);
    if (lsData) {
      const parsed = JSON.parse(lsData);
      await set(STORAGE_KEYS.USER, parsed);
      return parsed;
    }
    return { name: '', email: '', isAuthenticated: false };
  },
  saveUser: async (user: User) => {
    await set(STORAGE_KEYS.USER, user);
  },
};
