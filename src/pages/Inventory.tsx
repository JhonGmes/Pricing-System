import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Search, AlertTriangle, Save, Package, Edit2, TrendingUp, TrendingDown, DollarSign, Archive, History, Filter, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { DecimalInput } from '../components/DecimalInput';
import { cn, formatCurrency } from '../utils';
import { StockMovement } from '../types';

export default function Inventory() {
  const { materials, updateMaterial, updateMaterials, products, updateProduct, stockMovements, addStockMovement } = useApp();
  const [activeTab, setActiveTab] = useState<'materials' | 'products'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // --- Dashboard Metrics ---
  const metrics = useMemo(() => {
    // Materials
    const materialValue = materials.reduce((acc, m) => acc + ((m.stockQuantity || 0) * m.unitCost), 0);
    const lowStockMaterials = materials.filter(m => m.minStockLevel && (m.stockQuantity || 0) <= m.minStockLevel).length;
    const outOfStockMaterials = materials.filter(m => (m.stockQuantity || 0) <= 0).length;

    // Products
    const productValue = products.reduce((acc, p) => acc + ((p.stockQuantity || 0) * p.finalPrice), 0); // Sales value
    const productCost = products.reduce((acc, p) => acc + ((p.stockQuantity || 0) * p.unitCost), 0); // Cost value
    const lowStockProducts = products.filter(p => p.minStockLevel && (p.stockQuantity || 0) <= p.minStockLevel).length;
    const outOfStockProducts = products.filter(p => (p.stockQuantity || 0) <= 0).length;

    return {
      totalValue: materialValue + productValue,
      totalCost: materialValue + productCost,
      potentialProfit: productValue - productCost,
      lowStock: lowStockMaterials + lowStockProducts,
      outOfStock: outOfStockMaterials + outOfStockProducts,
      inStock: (materials.length - outOfStockMaterials) + (products.length - outOfStockProducts)
    };
  }, [materials, products]);

  // --- Filtering ---
  const filteredMaterials = useMemo(() => materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoryFilter === 'all' || m.category === categoryFilter)
  ), [materials, searchTerm, categoryFilter]);

  const filteredProducts = useMemo(() => products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoryFilter === 'all' || p.category === categoryFilter)
  ), [products, searchTerm, categoryFilter]);

  const filteredHistory = useMemo(() => stockMovements.filter(m => {
    const item = m.itemType === 'material' 
      ? materials.find(mat => mat.id === m.itemId) 
      : products.find(prod => prod.id === m.itemId);
    return item?.name.toLowerCase().includes(searchTerm.toLowerCase());
  }), [stockMovements, materials, products, searchTerm]);

  // --- Handlers ---
  const handleStartEdit = (id: string, currentStock: number) => {
    setEditingId(id);
    setEditValue(currentStock);
  };

  const handleSaveMaterialEdit = async (material: any) => {
    const diff = editValue - (material.stockQuantity || 0);
    if (diff !== 0) {
      await updateMaterial({
        ...material,
        stockQuantity: editValue
      });
      
      // Log movement
      await addStockMovement({
        id: crypto.randomUUID(),
        itemId: material.id,
        itemType: 'material',
        type: diff > 0 ? 'adjustment' : 'adjustment', // Could be entry/exit if we had more context
        quantity: Math.abs(diff),
        reason: 'Ajuste manual de estoque',
        date: new Date().toISOString(),
      });
    }
    setEditingId(null);
  };

  const handleSaveProductEdit = async (product: any) => {
    const oldStock = product.stockQuantity || 0;
    const newStock = editValue;
    const diff = newStock - oldStock;

    if (diff !== 0) {
      // 1. Update Product Stock
      await updateProduct({
        ...product,
        stockQuantity: newStock
      });

      // Log product movement
      await addStockMovement({
        id: crypto.randomUUID(),
        itemId: product.id,
        itemType: 'product',
        type: diff > 0 ? 'entry' : 'exit', // Positive diff means we added stock (entry/production)
        quantity: Math.abs(diff),
        reason: diff > 0 ? 'Produção / Entrada Manual' : 'Venda / Saída Manual',
        date: new Date().toISOString(),
        cost: product.unitCost,
        price: product.finalPrice
      });

      // 2. Deduct Materials (Only if producing/adding stock)
      // The user requested: "when I create a product... deducted from raw material"
      // This implies production logic.
      if (diff > 0 && product.materials && product.materials.length > 0) {
        const materialsToUpdate: any[] = [];
        
        // We need to fetch the latest material states to ensure accuracy, 
        // but for now we use the context 'materials' which should be up to date.
        
        for (const pm of product.materials) {
          const material = materials.find(m => m.id === pm.materialId);
          if (material) {
            const qtyUsed = pm.quantityUsed * diff; // Total needed for this batch
            const newMatStock = (material.stockQuantity || 0) - qtyUsed;
            
            materialsToUpdate.push({
              ...material,
              stockQuantity: newMatStock
            });

            // Log material movement
            await addStockMovement({
              id: crypto.randomUUID(),
              itemId: material.id,
              itemType: 'material',
              type: 'exit', // Used in production
              quantity: qtyUsed,
              reason: `Produção: ${product.name}`,
              date: new Date().toISOString(),
              cost: material.unitCost
            });
          }
        }

        if (materialsToUpdate.length > 0) {
          // We need a way to update multiple materials at once to avoid flicker/race conditions
          // Assuming AppContext has updateMaterials (plural)
          // If not, we loop updateMaterial. 
          // Checking AppContext... yes, it has updateMaterials.
           await updateMaterials(materialsToUpdate);
        }
      }
    }
    setEditingId(null);
  };

  const handleToggleActive = async (product: any) => {
    await updateProduct({
      ...product,
      active: product.active === false ? true : false
    });
  };

  // --- Render Helpers ---
  const renderSummaryCard = (title: string, value: string | number, icon: React.ReactNode, colorClass: string, subtext?: string) => (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div className={cn("p-3 rounded-lg bg-opacity-10", colorClass)}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Gestão de Estoque</h2>
          <p className="text-sm text-gray-500 mt-1">Monitore entradas, saídas e níveis de produtos e materiais.</p>
        </div>
        <div className="flex gap-2">
           {/* Export/Actions could go here */}
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {renderSummaryCard("Valor em Estoque", formatCurrency(metrics.totalValue), <DollarSign className="text-emerald-600" />, "bg-emerald-500", "Preço de Venda Total")}
        {renderSummaryCard("Custo do Estoque", formatCurrency(metrics.totalCost), <TrendingDown className="text-blue-600" />, "bg-blue-500", "Custo de Produção")}
        {renderSummaryCard("Lucro Previsto", formatCurrency(metrics.potentialProfit), <TrendingUp className="text-indigo-600" />, "bg-indigo-500", "Margem Potencial")}
        {renderSummaryCard("Alertas", metrics.lowStock, <AlertTriangle className="text-amber-600" />, "bg-amber-500", `${metrics.outOfStock} sem estoque`)}
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex p-1 bg-gray-100 rounded-lg w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('products')}
            className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all flex-1 md:flex-none", activeTab === 'products' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}
          >
            Produtos Acabados
          </button>
          <button 
            onClick={() => setActiveTab('materials')}
            className={cn("px-4 py-2 text-sm font-medium rounded-md transition-all flex-1 md:flex-none", activeTab === 'materials' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}
          >
            Matérias-Primas
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
              placeholder="Buscar item..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="px-3">
            <Filter size={16} />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700">Produto</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Categoria</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-center">Estoque</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">Preço Venda</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">Custo Unit.</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-center">Catálogo</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs">
                          {product.images?.[0] ? (
                             <img src={product.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                             product.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-400">
                            {product.code ? (
                              <span className="font-mono text-indigo-500">{product.code}</span>
                            ) : (
                              `ID: ${product.id.substring(0, 6)}`
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 text-center">
                      {editingId === product.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <DecimalInput 
                            value={editValue} 
                            onChange={setEditValue}
                            className="w-20 h-8 text-center"
                            autoFocus
                          />
                          <button onClick={() => handleSaveProductEdit(product)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">
                            <Save size={16} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleStartEdit(product.id, product.stockQuantity || 0)}
                        >
                          <span className={cn("font-bold", (product.stockQuantity || 0) <= 0 ? "text-red-500" : "text-gray-900")}>
                            {product.stockQuantity || 0}
                          </span>
                          <Edit2 size={12} className="text-gray-300 opacity-0 group-hover:opacity-100" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{formatCurrency(product.finalPrice)}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{formatCurrency(product.unitCost)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                          product.active !== false
                            ? "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200"
                            : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
                        )}
                      >
                        {product.active !== false ? 'Sim' : 'Não'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(product.stockQuantity || 0) > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Em Estoque
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Sem Estoque
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700">Material</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Categoria</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-center">Estoque</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-center">Unidade</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">Custo Unit.</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMaterials.map(material => (
                  <tr key={material.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900">{material.name}</td>
                    <td className="px-6 py-4 text-gray-500">{material.category}</td>
                    <td className="px-6 py-4 text-center">
                      {editingId === material.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <DecimalInput 
                            value={editValue} 
                            onChange={setEditValue}
                            className="w-20 h-8 text-center"
                            autoFocus
                          />
                          <button onClick={() => handleSaveMaterialEdit(material)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">
                            <Save size={16} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleStartEdit(material.id, material.stockQuantity || 0)}
                        >
                          <span className={cn("font-bold", (material.stockQuantity || 0) <= (material.minStockLevel || 0) ? "text-amber-600" : "text-gray-900")}>
                            {material.stockQuantity || 0}
                          </span>
                          <Edit2 size={12} className="text-gray-300 opacity-0 group-hover:opacity-100" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500">{material.unit}</td>
                    <td className="px-6 py-4 text-right text-gray-500">{formatCurrency(material.unitCost)}</td>
                    <td className="px-6 py-4 text-center">
                      {(material.stockQuantity || 0) <= (material.minStockLevel || 0) ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <AlertTriangle size={10} /> Baixo
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
