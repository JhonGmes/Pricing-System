import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product, ProductMaterial, ProductCost } from '../types';
import { generateId, formatCurrency, formatUnitCost, parseNumber, cn } from '../utils';
import { storageService } from '../services/storageService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { DecimalInput } from '../components/DecimalInput';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Image as ImageIcon, 
  Calculator, 
  AlertTriangle, 
  Save, 
  X,
  ArrowLeft,
  Filter,
  Tag,
  DollarSign
} from 'lucide-react';

export default function Products() {
  const { products, materials, indirectCosts, addProduct, updateProduct, updateMaterials, deleteProduct, settings, categories: appCategories } = useApp();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Form State
  const initialFormState: Partial<Product> = {
    name: '',
    category: '',
    description: '',
    materials: [],
    indirectCosts: [],
    batchSize: 1,
    images: [],
    desiredMarginPercent: settings.defaultMarginPercent,
    fixedProfitAddon: settings.defaultFixedCost,
    finalPrice: 0,
  };
  const [formData, setFormData] = useState<Partial<Product>>(initialFormState);
  const [deductStock, setDeductStock] = useState(true);
  const [simulatorMode, setSimulatorMode] = useState(false);
  const [simulationFactors, setSimulationFactors] = useState({ materialCostMultiplier: 1, marginAddon: 0 });

  // Calculations
  const calculations = useMemo(() => {
    // 1. Calculate Material Cost
    const materialCost = (formData.materials || []).reduce((acc, pm) => {
      const material = materials.find(m => m.id === pm.materialId);
      if (!material) return acc;
      // Apply simulation multiplier if enabled
      const cost = material.unitCost * pm.quantityUsed;
      return acc + (simulatorMode ? cost * simulationFactors.materialCostMultiplier : cost);
    }, 0);

    // 2. Calculate Indirect Cost
    const indirectCostTotal = (formData.indirectCosts || []).reduce((acc, pic) => {
      const cost = indirectCosts.find(c => c.id === pic.costId);
      if (!cost) return acc;
      
      if (cost.type === 'batch') {
        return acc + cost.amount;
      } else {
        // Per unit cost * batch size
        return acc + (cost.amount * (formData.batchSize || 1));
      }
    }, 0);

    const totalBatchCost = materialCost + indirectCostTotal;
    const unitCost = totalBatchCost / (formData.batchSize || 1);

    // 3. Pricing
    const marginPercent = (formData.desiredMarginPercent || 0) + (simulatorMode ? simulationFactors.marginAddon : 0);
    const fixedProfit = formData.fixedProfitAddon || 0;
    
    // Selling Price = Cost / ((100 - Margin%) / 100)
    let suggestedPrice = 0;
    if (marginPercent < 100) {
      suggestedPrice = (unitCost / ((100 - marginPercent) / 100)) + fixedProfit;
    }

    return {
      materialCost,
      indirectCostTotal,
      totalBatchCost,
      unitCost,
      suggestedPrice,
      marginPercent
    };
  }, [formData, materials, indirectCosts, simulatorMode, simulationFactors]);

  // Real margin based on Final Price
  const realMargin = useMemo(() => {
    const price = formData.finalPrice || 0;
    const cost = calculations.unitCost;
    if (price === 0) return 0;
    return ((price - cost) / price) * 100;
  }, [formData.finalPrice, calculations.unitCost]);

  const handleSave = async () => {
    if (!formData.name || !formData.batchSize) return;

    const productData: Product = {
      id: formData.id || generateId(),
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...formData as any,
      totalBatchCost: calculations.totalBatchCost,
      unitCost: calculations.unitCost,
    };

    if (formData.id) {
      updateProduct(productData);
    } else {
      addProduct(productData);

      // Handle stock deduction for new products
      if (deductStock && formData.materials && formData.materials.length > 0) {
        const materialsToUpdate: any[] = [];
        
        formData.materials.forEach(pm => {
          const material = materials.find(m => m.id === pm.materialId);
          if (material) {
            // Deduct the quantity used for the batch
            const newStock = (material.stockQuantity || 0) - pm.quantityUsed;
            materialsToUpdate.push({
              ...material,
              stockQuantity: newStock
            });
          }
        });
        
        if (materialsToUpdate.length > 0) {
          await updateMaterials(materialsToUpdate);
        }
      }
    }
    setView('list');
    setFormData(initialFormState);
    setDeductStock(true);
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setDeductStock(false); // Default to false for edits to avoid double deduction
    setView('form');
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduct(id);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const imageUrl = await storageService.uploadImage(file, 'products');
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), imageUrl]
        }));
      } catch (err) {
        console.error("Error uploading image", err);
      }
    }
  };

  const addMaterialToRecipe = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...(prev.materials || []), { materialId: materials[0]?.id || '', quantityUsed: 0 }]
    }));
  };

  const removeMaterialFromRecipe = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials?.filter((_, i) => i !== index)
    }));
  };

  const updateRecipeMaterial = (index: number, field: keyof ProductMaterial, value: any) => {
    const newMaterials = [...(formData.materials || [])];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    setFormData({ ...formData, materials: newMaterials });
  };

  const addCostToRecipe = () => {
    setFormData(prev => ({
      ...prev,
      indirectCosts: [...(prev.indirectCosts || []), { costId: indirectCosts[0]?.id || '' }]
    }));
  };

  const removeCostFromRecipe = (index: number) => {
    setFormData(prev => ({
      ...prev,
      indirectCosts: prev.indirectCosts?.filter((_, i) => i !== index)
    }));
  };

  const updateRecipeCost = (index: number, costId: string) => {
    const newCosts = [...(formData.indirectCosts || [])];
    newCosts[index] = { costId };
    setFormData({ ...formData, indirectCosts: newCosts });
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set([
      ...products.map(p => p.category).filter(Boolean),
      ...appCategories.map(c => c.name)
    ]);
    return ['all', ...Array.from(cats)];
  }, [products, appCategories]);

  if (view === 'form') {
    return (
      <div className="space-y-6 pb-20 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between sticky top-0 bg-gray-50/80 backdrop-blur-md z-10 py-4 border-b border-gray-200 -mx-6 px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setView('list')} className="hover:bg-gray-200">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {formData.id ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <p className="text-sm text-gray-500">Preencha os detalhes da sua criação</p>
            </div>
          </div>
          <div className="flex gap-2">
             <Button 
              variant="secondary" 
              onClick={() => setSimulatorMode(!simulatorMode)}
              className={cn(simulatorMode && "ring-2 ring-offset-2 ring-emerald-500 bg-emerald-100 text-emerald-800")}
            >
              <Calculator size={18} className="mr-2" />
              {simulatorMode ? 'Fechar Simulador' : 'Simular'}
            </Button>
            
            {!formData.id && (
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                <input
                  type="checkbox"
                  id="deductStock"
                  checked={deductStock}
                  onChange={e => setDeductStock(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="deductStock" className="text-sm font-medium text-gray-700 cursor-pointer select-none whitespace-nowrap">
                  Baixar Estoque
                </label>
              </div>
            )}

            <Button onClick={handleSave} className="shadow-lg shadow-indigo-500/20">
              <Save size={18} className="mr-2" />
              Salvar
            </Button>
          </div>
        </div>

        {simulatorMode && (
          <Card className="bg-emerald-50 border-emerald-200 shadow-inner">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 flex items-center gap-2 text-lg">
                <Calculator size={20} />
                Simulador de Cenários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-emerald-900">Custo de Materiais</label>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 rounded">
                      {Math.round((simulationFactors.materialCostMultiplier - 1) * 100)}%
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2" 
                    step="0.1" 
                    value={simulationFactors.materialCostMultiplier}
                    onChange={e => setSimulationFactors({...simulationFactors, materialCostMultiplier: parseFloat(e.target.value)})}
                    className="w-full accent-emerald-600 h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-emerald-600 mt-2">Simule aumentos ou descontos nos fornecedores.</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-emerald-900">Ajuste na Margem</label>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 rounded">
                      {simulationFactors.marginAddon > 0 ? '+' : ''}{simulationFactors.marginAddon}%
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="-20" 
                    max="20" 
                    step="1" 
                    value={simulationFactors.marginAddon}
                    onChange={e => setSimulationFactors({...simulationFactors, marginAddon: parseFloat(e.target.value)})}
                    className="w-full accent-emerald-600 h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-emerald-600 mt-2">Veja o impacto no preço final.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Nome do Produto"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Vela Aromática Lavanda"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Categoria</label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      {appCategories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                      {formData.category && !appCategories.find(c => c.name === formData.category) && (
                        <option value={formData.category}>{formData.category} (Legado)</option>
                      )}
                    </select>
                  </div>
                  <DecimalInput
                    label="Rendimento (Lote)"
                    min={1}
                    value={formData.batchSize || 1}
                    onChange={val => setFormData({...formData, batchSize: val})}
                    placeholder="Qtd de unidades"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Descreva o aroma, benefícios, etc."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Imagens</label>
                  <div className="flex items-center gap-4 flex-wrap">
                    {formData.images?.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group shadow-sm">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setFormData(prev => ({...prev, images: prev.images?.filter((_, i) => i !== idx)}))}
                          className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
                      <ImageIcon size={24} />
                      <span className="text-xs mt-1 font-medium">Adicionar</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recipe Builder */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-4">
                <CardTitle>Receita (Matérias-Primas)</CardTitle>
                <Button size="sm" variant="outline" onClick={addMaterialToRecipe}>
                  <Plus size={16} className="mr-1" /> Adicionar Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {formData.materials?.map((pm, index) => {
                  const material = materials.find(m => m.id === pm.materialId);
                  return (
                    <div key={index} className="flex items-end gap-3 p-3 bg-gray-50/50 hover:bg-gray-50 transition-colors rounded-lg border border-gray-100">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Material</label>
                        <select
                          className="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                          value={pm.materialId}
                          onChange={e => updateRecipeMaterial(index, 'materialId', e.target.value)}
                        >
                          <option value="">Selecione...</option>
                          {materials.map(m => (
                            <option key={m.id} value={m.id}>{m.name} ({formatUnitCost(m.unitCost)}/{m.unit})</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Qtd Usada</label>
                        <DecimalInput
                          min={0}
                          value={pm.quantityUsed}
                          onChange={val => updateRecipeMaterial(index, 'quantityUsed', val)}
                          className="h-9"
                        />
                      </div>
                      <div className="w-24 pb-2 text-right font-mono text-sm text-gray-600">
                        {material ? formatUnitCost(material.unitCost * pm.quantityUsed) : '-'}
                      </div>
                      <button 
                        onClick={() => removeMaterialFromRecipe(index)}
                        className="pb-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
                {(!formData.materials || formData.materials.length === 0) && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500 text-sm">Nenhum material adicionado à receita.</p>
                    <Button variant="ghost" size="sm" onClick={addMaterialToRecipe} className="mt-2 text-indigo-600">
                      Começar a adicionar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Indirect Costs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-4">
                <CardTitle>Custos Indiretos</CardTitle>
                <Button size="sm" variant="outline" onClick={addCostToRecipe}>
                  <Plus size={16} className="mr-1" /> Adicionar Custo
                </Button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {formData.indirectCosts?.map((pic, index) => {
                  const cost = indirectCosts.find(c => c.id === pic.costId);
                  return (
                    <div key={index} className="flex items-end gap-3 p-3 bg-gray-50/50 hover:bg-gray-50 transition-colors rounded-lg border border-gray-100">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Custo</label>
                        <select
                          className="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                          value={pic.costId}
                          onChange={e => updateRecipeCost(index, e.target.value)}
                        >
                          <option value="">Selecione...</option>
                          {indirectCosts.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({formatCurrency(c.amount)} {c.type === 'batch' ? '/ Lote' : '/ Un'})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24 pb-2 text-right font-mono text-sm text-gray-600">
                        {cost 
                          ? formatCurrency(cost.type === 'batch' ? cost.amount : cost.amount * (formData.batchSize || 1)) 
                          : '-'}
                      </div>
                      <button 
                        onClick={() => removeCostFromRecipe(index)}
                        className="pb-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
                {(!formData.indirectCosts || formData.indirectCosts.length === 0) && (
                   <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500 text-sm">Nenhum custo indireto vinculado.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Pricing & Summary Sidebar */}
          <div className="space-y-6">
            <Card className="bg-slate-900 text-white border-slate-800 sticky top-24 shadow-xl">
              <CardHeader className="border-b border-slate-800 pb-4">
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <DollarSign size={20} className="text-emerald-400" />
                  Resumo de Custos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Materiais (Total)</span>
                  <span>{formatCurrency(calculations.materialCost)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Custos Indiretos (Total)</span>
                  <span>{formatCurrency(calculations.indirectCostTotal)}</span>
                </div>
                <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                  <span className="font-medium text-slate-300">Custo do Lote</span>
                  <span className="text-xl font-bold">{formatCurrency(calculations.totalBatchCost)}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 bg-emerald-400/10 p-3 rounded-lg border border-emerald-400/20">
                  <span className="font-medium">Custo Unitário</span>
                  <span className="text-xl font-bold">{formatCurrency(calculations.unitCost)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="border-b border-gray-50 pb-4">
                <CardTitle>Precificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <DecimalInput
                  label="Margem Desejada (%)"
                  value={formData.desiredMarginPercent || 0}
                  onChange={val => setFormData({...formData, desiredMarginPercent: val})}
                />
                <DecimalInput
                  label="Lucro Fixo Adicional (R$)"
                  value={formData.fixedProfitAddon || 0}
                  onChange={val => setFormData({...formData, fixedProfitAddon: val})}
                />
                
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Preço Sugerido:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(calculations.suggestedPrice)}</span>
                  </div>
                  
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
                    <label className="block text-sm font-bold text-indigo-900 mb-1">Preço Final de Venda</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 font-bold">R$</span>
                      <DecimalInput
                        className="w-full pl-10 pr-4 py-2 rounded-lg border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 font-bold text-xl text-indigo-900 bg-white"
                        value={formData.finalPrice || 0}
                        onChange={val => setFormData({...formData, finalPrice: val})}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2">
                    <span className="text-gray-500">Margem Real:</span>
                    <span className={cn(
                      "font-bold px-2 py-0.5 rounded text-sm",
                      realMargin < settings.defaultMarginPercent ? "text-red-700 bg-red-50" : "text-emerald-700 bg-emerald-50"
                    )}>
                      {realMargin.toFixed(1)}%
                    </span>
                  </div>
                  
                  {realMargin < settings.defaultMarginPercent && (
                    <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                      <p>Atenção: Sua margem está abaixo do mínimo desejado de {settings.defaultMarginPercent}%.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Produtos</h2>
          <p className="text-sm text-gray-500 mt-1">Gerencie seu catálogo, receitas e preços.</p>
        </div>
        <Button onClick={() => {
          setFormData(initialFormState);
          setView('form');
        }} className="shadow-lg shadow-indigo-500/20">
          <Plus size={18} className="mr-2" /> Novo Produto
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            className="pl-9 border-gray-200" 
            placeholder="Buscar por nome..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Filter size={18} className="text-gray-400 shrink-0" />
          <div className="flex gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                  categoryFilter === cat 
                    ? "bg-indigo-100 text-indigo-700" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat === 'all' ? 'Todos' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products
          .filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
            return matchesSearch && matchesCategory;
          })
          .map(product => {
            const margin = ((product.finalPrice - product.unitCost) / product.finalPrice) * 100;
            const isLowMargin = margin < settings.defaultMarginPercent;

            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border-gray-200">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  {product.images?.[0] ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                      <ImageIcon size={40} className="mb-2 opacity-50" />
                      <span className="text-xs font-medium">Sem imagem</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button 
                      onClick={() => handleEdit(product)}
                      className="p-1.5 bg-white text-gray-700 rounded-full shadow-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="p-1.5 bg-white text-red-600 rounded-full shadow-lg hover:bg-red-50 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {product.category && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10">
                      {product.category}
                    </span>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-bold text-base text-gray-900 mb-1 line-clamp-1" title={product.name}>{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2 h-8">{product.description || 'Sem descrição.'}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded-lg">
                      <span className="text-[10px] text-gray-500">Custo Unit.</span>
                      <span className="text-xs font-medium text-gray-700">{formatCurrency(product.unitCost)}</span>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] text-gray-400 block mb-0.5">Preço Venda</span>
                        <span className="font-bold text-lg text-indigo-900">{formatCurrency(product.finalPrice)}</span>
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                        isLowMargin ? "text-amber-700 bg-amber-100" : "text-emerald-700 bg-emerald-100"
                      )}>
                        {isLowMargin && <AlertTriangle size={10} />}
                        {margin.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {products.length === 0 && (
            <div className="col-span-full text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-300 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus size={24} />
              </div>
              <h3 className="text-base font-medium text-gray-900">Seu catálogo está vazio</h3>
              <p className="text-sm text-gray-500 mt-1 mb-4">Comece adicionando seu primeiro produto artesanal.</p>
              <Button onClick={() => {
                setFormData(initialFormState);
                setView('form');
              }}>
                Criar Produto
              </Button>
            </div>
          )}
      </div>
    </div>
  );
}
