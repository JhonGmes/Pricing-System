import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Material, IndirectCost, Product, AppSettings, User } from '../types';
import { storage } from '../services/storage';

interface AppContextType {
  user: User;
  login: (name: string, email: string) => void;
  logout: () => void;
  
  materials: Material[];
  addMaterial: (material: Material) => void;
  updateMaterial: (material: Material) => void;
  deleteMaterial: (id: string) => void;
  
  indirectCosts: IndirectCost[];
  addIndirectCost: (cost: IndirectCost) => void;
  updateIndirectCost: (cost: IndirectCost) => void;
  deleteIndirectCost: (id: string) => void;
  
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  settings: AppSettings;
  updateSettings: (settings: AppSettings) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(storage.getUser());
  const [materials, setMaterials] = useState<Material[]>(storage.getMaterials());
  const [indirectCosts, setIndirectCosts] = useState<IndirectCost[]>(storage.getIndirectCosts());
  const [products, setProducts] = useState<Product[]>(storage.getProducts());
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());

  // Persist changes
  useEffect(() => storage.saveUser(user), [user]);
  useEffect(() => storage.saveMaterials(materials), [materials]);
  useEffect(() => storage.saveIndirectCosts(indirectCosts), [indirectCosts]);
  useEffect(() => storage.saveProducts(products), [products]);
  useEffect(() => storage.saveSettings(settings), [settings]);

  const login = (name: string, email: string) => {
    setUser({ name, email, isAuthenticated: true });
  };

  const logout = () => {
    setUser({ name: '', email: '', isAuthenticated: false });
  };

  const addMaterial = (material: Material) => {
    setMaterials(prev => [...prev, material]);
  };

  const updateMaterial = (material: Material) => {
    setMaterials(prev => prev.map(m => m.id === material.id ? material : m));
  };

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const addIndirectCost = (cost: IndirectCost) => {
    setIndirectCosts(prev => [...prev, cost]);
  };

  const updateIndirectCost = (cost: IndirectCost) => {
    setIndirectCosts(prev => prev.map(c => c.id === cost.id ? cost : c));
  };

  const deleteIndirectCost = (id: string) => {
    setIndirectCosts(prev => prev.filter(c => c.id !== id));
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateSettingsState = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  return (
    <AppContext.Provider value={{
      user, login, logout,
      materials, addMaterial, updateMaterial, deleteMaterial,
      indirectCosts, addIndirectCost, updateIndirectCost, deleteIndirectCost,
      products, addProduct, updateProduct, deleteProduct,
      settings, updateSettings: updateSettingsState
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
