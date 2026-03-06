import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Material, IndirectCost, Product, AppSettings, User, Category } from '../types';
import { storage } from '../services/storage';
import { dataService } from '../services/dataService';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { generateId } from '../utils';

interface AppContextType {
  user: User;
  login: (email: string, password?: string, name?: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  
  materials: Material[];
  addMaterial: (material: Material) => void;
  updateMaterial: (material: Material) => void;
  updateMaterials: (materials: Material[]) => Promise<void>;
  deleteMaterial: (id: string) => void;
  
  indirectCosts: IndirectCost[];
  addIndirectCost: (cost: IndirectCost) => void;
  updateIndirectCost: (cost: IndirectCost) => void;
  deleteIndirectCost: (id: string) => void;
  
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
  
  stockMovements: StockMovement[];
  addStockMovement: (movement: StockMovement) => void;

  importData: (data: { 
    materials?: Material[], 
    indirectCosts?: IndirectCost[], 
    products?: Product[], 
    settings?: AppSettings,
    categories?: Category[]
  }) => void;

  isLoading: boolean;
  isSupabaseEnabled: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({
    id: 'local-user',
    name: 'Admin',
    email: 'admin@local.com',
    isAuthenticated: true
  });
  const [materials, setMaterials] = useState<Material[]>([]);
  const [indirectCosts, setIndirectCosts] = useState<IndirectCost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    brandName: '',
    subtitle: '',
    logo: '',
    defaultMarginPercent: 50,
    defaultFixedCost: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const isSupabaseEnabled = isSupabaseConfigured();

  // Initialize Supabase Auth Listener
  useEffect(() => {
    if (isSupabaseEnabled) {
      // Check active session
      supabase!.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata.name || '',
            isAuthenticated: true
          });
        }
        // If no session, we keep the default local user
      });

      // Listen for changes
      const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata.name || '',
            isAuthenticated: true
          });
        } else {
          // Fallback to local user instead of logging out
          setUser({
            id: 'local-user',
            name: 'Admin',
            email: 'admin@local.com',
            isAuthenticated: true
          });
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [isSupabaseEnabled]);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      // Always load data, regardless of auth state (since we default to auth)
      setIsLoading(true);
      try {
        const [loadedMaterials, loadedCosts, loadedProducts, loadedSettings, loadedCategories, loadedMovements] = await Promise.all([
          dataService.getMaterials(),
          dataService.getIndirectCosts(),
          dataService.getProducts(),
          dataService.getSettings(),
          dataService.getCategories(),
          dataService.getStockMovements()
        ]);

        setMaterials(loadedMaterials);
        setIndirectCosts(loadedCosts);
        setProducts(loadedProducts);
        setSettings(loadedSettings);
        setStockMovements(loadedMovements);

        // Initialize categories from products if empty
        if (loadedCategories.length === 0 && loadedProducts.length > 0) {
          const uniqueCategories = Array.from(new Set(loadedProducts.map(p => p.category).filter(Boolean)));
          const newCategories = uniqueCategories.map(name => ({ id: generateId(), name }));
          setCategories(newCategories);
          if (newCategories.length > 0) {
             await dataService.saveCategories(newCategories);
          }
        } else {
          setCategories(loadedCategories);
        }

      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [isSupabaseEnabled]); // Removed user.isAuthenticated dependency as it's always true now

  // Persist changes
  // We remove the useEffects that auto-save to localStorage because we want to control saving via dataService
  // However, for user auth, we keep it simple with localStorage for now as per previous implementation
  // If Supabase is enabled, we don't need to save user to local storage as Supabase handles session.
  useEffect(() => {
    if (!isSupabaseEnabled) {
      storage.saveUser(user);
    }
  }, [user, isSupabaseEnabled]);

  const login = async (email: string, password?: string, name?: string) => {
    if (isSupabaseEnabled) {
      if (!password) throw new Error("Senha é obrigatória");
      const { error } = await supabase!.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
    } else {
      // Mock login
      setUser({ name: name || 'Usuário', email, isAuthenticated: true });
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    if (isSupabaseEnabled) {
      const { error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });
      if (error) throw error;
    } else {
      // Mock signup (same as login)
      setUser({ name, email, isAuthenticated: true });
    }
  };

  const logout = async () => {
    if (isSupabaseEnabled) {
      await supabase!.auth.signOut();
    }
    setUser({ name: '', email: '', isAuthenticated: false });
  };

  const addMaterial = async (material: Material) => {
    const newMaterials = [...materials, material];
    setMaterials(newMaterials);
    await dataService.addMaterial(material, newMaterials);
  };

  const updateMaterial = async (material: Material) => {
    const newMaterials = materials.map(m => m.id === material.id ? material : m);
    setMaterials(newMaterials);
    await dataService.updateMaterial(material, newMaterials);
  };

  const updateMaterials = async (updatedMaterials: Material[]) => {
    const updates = new Map(updatedMaterials.map(m => [m.id, m]));
    const newMaterials = materials.map(m => updates.get(m.id) || m);
    setMaterials(newMaterials);
    await dataService.saveMaterials(newMaterials);
  };

  const deleteMaterial = async (id: string) => {
    const newMaterials = materials.filter(m => m.id !== id);
    setMaterials(newMaterials);
    await dataService.deleteMaterial(id, newMaterials);
  };

  const addIndirectCost = async (cost: IndirectCost) => {
    const newCosts = [...indirectCosts, cost];
    setIndirectCosts(newCosts);
    await dataService.addIndirectCost(cost, newCosts);
  };

  const updateIndirectCost = async (cost: IndirectCost) => {
    const newCosts = indirectCosts.map(c => c.id === cost.id ? cost : c);
    setIndirectCosts(newCosts);
    await dataService.updateIndirectCost(cost, newCosts);
  };

  const deleteIndirectCost = async (id: string) => {
    const newCosts = indirectCosts.filter(c => c.id !== id);
    setIndirectCosts(newCosts);
    await dataService.deleteIndirectCost(id, newCosts);
  };

  const addProduct = async (product: Product) => {
    const newProducts = [...products, product];
    setProducts(newProducts);
    await dataService.addProduct(product, newProducts);
  };

  const updateProduct = async (product: Product) => {
    const newProducts = products.map(p => p.id === product.id ? product : p);
    setProducts(newProducts);
    await dataService.updateProduct(product, newProducts);
  };

  const deleteProduct = async (id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    setProducts(newProducts);
    await dataService.deleteProduct(id, newProducts);
  };

  const addCategory = async (category: Category) => {
    const newCategories = [...categories, category];
    setCategories(newCategories);
    await dataService.addCategory(category, newCategories);
  };

  const updateCategory = async (category: Category) => {
    const newCategories = categories.map(c => c.id === category.id ? category : c);
    setCategories(newCategories);
    await dataService.updateCategory(category, newCategories);
  };

  const deleteCategory = async (id: string) => {
    const newCategories = categories.filter(c => c.id !== id);
    setCategories(newCategories);
    await dataService.deleteCategory(id, newCategories);
  };

  const addStockMovement = async (movement: StockMovement) => {
    const newMovements = [movement, ...stockMovements];
    setStockMovements(newMovements);
    await dataService.addStockMovement(movement);
  };

  const updateSettingsState = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await dataService.saveSettings(newSettings);
  };

  const importData = async (data: { 
    materials?: Material[], 
    indirectCosts?: IndirectCost[], 
    products?: Product[], 
    settings?: AppSettings,
    categories?: Category[]
  }) => {
    if (data.materials) {
      setMaterials(data.materials);
      await dataService.saveMaterials(data.materials);
    }
    if (data.indirectCosts) {
      setIndirectCosts(data.indirectCosts);
      await dataService.saveIndirectCosts(data.indirectCosts);
    }
    if (data.products) {
      setProducts(data.products);
      await dataService.saveProducts(data.products);
    }
    if (data.settings) {
      setSettings(data.settings);
      await dataService.saveSettings(data.settings);
    }
    if (data.categories) {
      setCategories(data.categories);
      await dataService.saveCategories(data.categories);
    }
  };

  return (
    <AppContext.Provider value={{
      user, login, signup, logout,
      materials, addMaterial, updateMaterial, updateMaterials, deleteMaterial,
      indirectCosts, addIndirectCost, updateIndirectCost, deleteIndirectCost,
      products, addProduct, updateProduct, deleteProduct,
      categories, addCategory, updateCategory, deleteCategory,
      settings, updateSettings: updateSettingsState,
      stockMovements, addStockMovement,
      importData,
      isLoading,
      isSupabaseEnabled
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
