import { supabase, isSupabaseConfigured } from './supabase';
import { Material, IndirectCost, Product, AppSettings, User, Category, StockMovement } from '../types';
import { storage } from './storage';

// Helper to check if we should use Supabase (Configured AND Authenticated)
const shouldUseSupabase = async () => {
  if (!isSupabaseConfigured()) return false;
  const { data } = await supabase!.auth.getSession();
  return !!data.session;
};

export const dataService = {
  // ... existing methods ...

  async getProducts(): Promise<Product[]> {
    if (await shouldUseSupabase()) {
      const { data, error } = await supabase!.from('products').select('*');
      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        materials: item.materials || [],
        indirectCosts: item.indirect_costs || [],
        batchSize: Number(item.batch_size),
        images: item.images || [],
        totalBatchCost: Number(item.total_batch_cost),
        unitCost: Number(item.unit_cost),
        desiredMarginPercent: Number(item.desired_margin_percent),
        fixedProfitAddon: Number(item.fixed_profit_addon),
        finalPrice: Number(item.final_price),
        stockQuantity: Number(item.stock_quantity || 0),
        minStockLevel: item.min_stock_level ? Number(item.min_stock_level) : undefined,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    }
    const products = await storage.getProducts();
    return products.map(p => ({
      ...p,
      stockQuantity: p.stockQuantity || 0
    }));
  },

  async addProduct(product: Product, allProducts: Product[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('products').insert([{
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        materials: product.materials,
        indirect_costs: product.indirectCosts,
        batch_size: product.batchSize,
        images: product.images,
        total_batch_cost: product.totalBatchCost,
        unit_cost: product.unitCost,
        desired_margin_percent: product.desiredMarginPercent,
        fixed_profit_addon: product.fixedProfitAddon,
        final_price: product.finalPrice,
        stock_quantity: product.stockQuantity,
        min_stock_level: product.minStockLevel,
        created_at: product.createdAt,
        updated_at: product.updatedAt
      }]);
      if (error) console.error('Error adding product:', error);
    } else {
      storage.saveProducts(allProducts);
    }
  },

  async updateProduct(product: Product, allProducts: Product[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('products').update({
        name: product.name,
        category: product.category,
        description: product.description,
        materials: product.materials,
        indirect_costs: product.indirectCosts,
        batch_size: product.batchSize,
        images: product.images,
        total_batch_cost: product.totalBatchCost,
        unit_cost: product.unitCost,
        desired_margin_percent: product.desiredMarginPercent,
        fixed_profit_addon: product.fixedProfitAddon,
        final_price: product.finalPrice,
        stock_quantity: product.stockQuantity,
        min_stock_level: product.minStockLevel,
        updated_at: product.updatedAt
      }).eq('id', product.id);
      if (error) console.error('Error updating product:', error);
    } else {
      storage.saveProducts(allProducts);
    }
  },

  async saveProducts(products: Product[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('products').upsert(
        products.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
          materials: p.materials,
          indirect_costs: p.indirectCosts,
          batch_size: p.batchSize,
          images: p.images,
          total_batch_cost: p.totalBatchCost,
          unit_cost: p.unitCost,
          desired_margin_percent: p.desiredMarginPercent,
          fixed_profit_addon: p.fixedProfitAddon,
          final_price: p.finalPrice,
          stock_quantity: p.stockQuantity,
          min_stock_level: p.minStockLevel,
          created_at: p.createdAt,
          updated_at: p.updatedAt
        }))
      );
      if (error) console.error('Error saving products:', error);
    } else {
      storage.saveProducts(products);
    }
  },

  // Stock Movements
  async getStockMovements(): Promise<StockMovement[]> {
    if (await shouldUseSupabase()) {
      const { data, error } = await supabase!.from('stock_movements').select('*').order('date', { ascending: false });
      if (error) {
        console.error('Error fetching stock movements:', error);
        return [];
      }
      return data.map((item: any) => ({
        id: item.id,
        itemId: item.item_id,
        itemType: item.item_type,
        type: item.type,
        quantity: Number(item.quantity),
        reason: item.reason,
        date: item.date,
        cost: item.cost ? Number(item.cost) : undefined,
        price: item.price ? Number(item.price) : undefined,
      }));
    }
    // Local storage fallback for movements (simplified, might not be fully implemented in storage.ts yet)
    const movements = localStorage.getItem('stock_movements');
    return movements ? JSON.parse(movements) : [];
  },

  async addStockMovement(movement: StockMovement) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('stock_movements').insert([{
        id: movement.id,
        item_id: movement.itemId,
        item_type: movement.itemType,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        date: movement.date,
        cost: movement.cost,
        price: movement.price
      }]);
      if (error) console.error('Error adding stock movement:', error);
    } else {
      const movements = await this.getStockMovements();
      movements.unshift(movement);
      localStorage.setItem('stock_movements', JSON.stringify(movements));
    }
  },

  async getCategories(): Promise<Category[]> {
    if (await shouldUseSupabase()) {
      const { data, error } = await supabase!.from('categories').select('*');
      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
      return data.map((item: any) => ({
        id: item.id,
        name: item.name
      }));
    }
    return storage.getCategories();
  },

  async addCategory(category: Category, allCategories: Category[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('categories').insert([{
        id: category.id,
        name: category.name
      }]);
      if (error) console.error('Error adding category:', error);
    } else {
      storage.saveCategories(allCategories);
    }
  },

  async updateCategory(category: Category, allCategories: Category[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('categories').update({
        name: category.name
      }).eq('id', category.id);
      if (error) console.error('Error updating category:', error);
    } else {
      storage.saveCategories(allCategories);
    }
  },

  async deleteCategory(id: string, allCategories: Category[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('categories').delete().eq('id', id);
      if (error) console.error('Error deleting category:', error);
    } else {
      storage.saveCategories(allCategories);
    }
  },

  async saveCategories(categories: Category[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('categories').upsert(
        categories.map(c => ({
          id: c.id,
          name: c.name
        }))
      );
      if (error) console.error('Error saving categories:', error);
    } else {
      storage.saveCategories(categories);
    }
  },

  async getMaterials(): Promise<Material[]> {
    if (await shouldUseSupabase()) {
      const { data, error } = await supabase!.from('materials').select('*');
      if (error) {
        console.error('Error fetching materials:', error);
        return [];
      }
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        supplier: item.supplier,
        unit: item.unit,
        quantityBought: Number(item.quantity_bought),
        pricePaid: Number(item.price_paid),
        unitCost: Number(item.unit_cost),
        stockQuantity: Number(item.stock_quantity || 0),
        minStockLevel: item.min_stock_level ? Number(item.min_stock_level) : undefined,
        history: item.history || [],
        createdAt: item.created_at
      }));
    }
    const materials = await storage.getMaterials();
    return materials.map(m => ({
      ...m,
      stockQuantity: m.stockQuantity || 0
    }));
  },

  async addMaterial(material: Material, allMaterials: Material[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('materials').insert([{
        id: material.id,
        name: material.name,
        category: material.category,
        supplier: material.supplier,
        unit: material.unit,
        quantity_bought: material.quantityBought,
        price_paid: material.pricePaid,
        unit_cost: material.unitCost,
        stock_quantity: material.stockQuantity,
        min_stock_level: material.minStockLevel,
        history: material.history,
        created_at: material.createdAt
      }]);
      if (error) console.error('Error adding material:', error);
    } else {
      storage.saveMaterials(allMaterials);
    }
  },

  async updateMaterial(material: Material, allMaterials: Material[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('materials').update({
        name: material.name,
        category: material.category,
        supplier: material.supplier,
        unit: material.unit,
        quantity_bought: material.quantityBought,
        price_paid: material.pricePaid,
        unit_cost: material.unitCost,
        stock_quantity: material.stockQuantity,
        min_stock_level: material.minStockLevel,
        history: material.history,
        // created_at is not updated
      }).eq('id', material.id);
      if (error) console.error('Error updating material:', error);
    } else {
      storage.saveMaterials(allMaterials);
    }
  },

  async saveMaterials(materials: Material[]) {
    // Deprecated: use addMaterial or updateMaterial instead for granular updates
    // Keeping for bulk operations if needed
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('materials').upsert(
        materials.map(m => ({
          id: m.id,
          name: m.name,
          category: m.category,
          supplier: m.supplier,
          unit: m.unit,
          quantity_bought: m.quantityBought,
          price_paid: m.pricePaid,
          unit_cost: m.unitCost,
          stock_quantity: m.stockQuantity,
          min_stock_level: m.minStockLevel,
          history: m.history,
          created_at: m.createdAt
        }))
      );
      if (error) console.error('Error saving materials:', error);
    } else {
      storage.saveMaterials(materials);
    }
  },

  async deleteMaterial(id: string, allMaterials: Material[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('materials').delete().eq('id', id);
      if (error) console.error('Error deleting material:', error);
    } else {
      storage.saveMaterials(allMaterials);
    }
  },

  async getIndirectCosts(): Promise<IndirectCost[]> {
    if (await shouldUseSupabase()) {
      const { data, error } = await supabase!.from('indirect_costs').select('*');
      if (error) {
        console.error('Error fetching indirect costs:', error);
        return [];
      }
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type as 'batch' | 'unit',
        amount: Number(item.amount)
      }));
    }
    return storage.getIndirectCosts();
  },

  async addIndirectCost(cost: IndirectCost, allCosts: IndirectCost[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('indirect_costs').insert([{
        id: cost.id,
        name: cost.name,
        type: cost.type,
        amount: cost.amount
      }]);
      if (error) console.error('Error adding indirect cost:', error);
    } else {
      storage.saveIndirectCosts(allCosts);
    }
  },

  async updateIndirectCost(cost: IndirectCost, allCosts: IndirectCost[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('indirect_costs').update({
        name: cost.name,
        type: cost.type,
        amount: cost.amount
      }).eq('id', cost.id);
      if (error) console.error('Error updating indirect cost:', error);
    } else {
      storage.saveIndirectCosts(allCosts);
    }
  },

  async saveIndirectCosts(costs: IndirectCost[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('indirect_costs').upsert(
        costs.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          amount: c.amount
        }))
      );
      if (error) console.error('Error saving indirect costs:', error);
    } else {
      storage.saveIndirectCosts(costs);
    }
  },

  async deleteIndirectCost(id: string, allCosts: IndirectCost[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('indirect_costs').delete().eq('id', id);
      if (error) console.error('Error deleting indirect cost:', error);
    } else {
      storage.saveIndirectCosts(allCosts);
    }
  },

  async getProducts(): Promise<Product[]> {
    if (await shouldUseSupabase()) {
      const { data, error } = await supabase!.from('products').select('*');
      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        description: item.description,
        materials: item.materials || [],
        indirectCosts: item.indirect_costs || [],
        batchSize: Number(item.batch_size),
        images: item.images || [],
        totalBatchCost: Number(item.total_batch_cost),
        unitCost: Number(item.unit_cost),
        desiredMarginPercent: Number(item.desired_margin_percent),
        fixedProfitAddon: Number(item.fixed_profit_addon),
        finalPrice: Number(item.final_price),
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    }
    return storage.getProducts();
  },

  async addProduct(product: Product, allProducts: Product[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('products').insert([{
        id: product.id,
        name: product.name,
        category: product.category,
        description: product.description,
        materials: product.materials,
        indirect_costs: product.indirectCosts,
        batch_size: product.batchSize,
        images: product.images,
        total_batch_cost: product.totalBatchCost,
        unit_cost: product.unitCost,
        desired_margin_percent: product.desiredMarginPercent,
        fixed_profit_addon: product.fixedProfitAddon,
        final_price: product.finalPrice,
        created_at: product.createdAt,
        updated_at: product.updatedAt
      }]);
      if (error) console.error('Error adding product:', error);
    } else {
      storage.saveProducts(allProducts);
    }
  },

  async updateProduct(product: Product, allProducts: Product[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('products').update({
        name: product.name,
        category: product.category,
        description: product.description,
        materials: product.materials,
        indirect_costs: product.indirectCosts,
        batch_size: product.batchSize,
        images: product.images,
        total_batch_cost: product.totalBatchCost,
        unit_cost: product.unitCost,
        desired_margin_percent: product.desiredMarginPercent,
        fixed_profit_addon: product.fixedProfitAddon,
        final_price: product.finalPrice,
        updated_at: product.updatedAt
      }).eq('id', product.id);
      if (error) console.error('Error updating product:', error);
    } else {
      storage.saveProducts(allProducts);
    }
  },

  async saveProducts(products: Product[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('products').upsert(
        products.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          description: p.description,
          materials: p.materials,
          indirect_costs: p.indirectCosts,
          batch_size: p.batchSize,
          images: p.images,
          total_batch_cost: p.totalBatchCost,
          unit_cost: p.unitCost,
          desired_margin_percent: p.desiredMarginPercent,
          fixed_profit_addon: p.fixedProfitAddon,
          final_price: p.finalPrice,
          created_at: p.createdAt,
          updated_at: p.updatedAt
        }))
      );
      if (error) console.error('Error saving products:', error);
    } else {
      storage.saveProducts(products);
    }
  },

  async deleteProduct(id: string, allProducts: Product[]) {
    if (await shouldUseSupabase()) {
      const { error } = await supabase!.from('products').delete().eq('id', id);
      if (error) console.error('Error deleting product:', error);
    } else {
      storage.saveProducts(allProducts);
    }
  },

  async getSettings(): Promise<AppSettings> {
    if (await shouldUseSupabase()) {
      const { data, error } = await supabase!.from('settings').select('*').single();
      if (error && error.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
        console.error('Error fetching settings:', error);
      }
      if (data) {
        return {
          brandName: data.brand_name || '',
          subtitle: data.subtitle || '',
          logo: data.logo || '',
          defaultMarginPercent: Number(data.default_margin_percent) || 50,
          defaultFixedCost: Number(data.default_fixed_cost) || 0
        };
      }
    }
    return storage.getSettings();
  },

  async saveSettings(settings: AppSettings) {
    if (await shouldUseSupabase()) {
      // We need to handle the ID. Since settings is a single row per user, 
      // we might need to fetch the ID first or use a fixed ID if we only support single user per table for now.
      // A better approach for single-row settings table is to ensure only one row exists or use upsert with a known ID/User ID.
      // For now, let's try to fetch first to get ID, or just insert.
      
      const { data: existing } = await supabase!.from('settings').select('id').single();
      
      const payload = {
        brand_name: settings.brandName,
        subtitle: settings.subtitle,
        logo: settings.logo,
        default_margin_percent: settings.defaultMarginPercent,
        default_fixed_cost: settings.defaultFixedCost
      };

      if (existing) {
        await supabase!.from('settings').update(payload).eq('id', existing.id);
      } else {
        await supabase!.from('settings').insert([payload]);
      }
    } else {
      storage.saveSettings(settings);
    }
  }
};
