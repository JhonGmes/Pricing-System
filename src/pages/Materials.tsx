import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Material } from '../types';
import { generateId, formatCurrency } from '../utils';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Plus, Trash2, Edit2, Search, AlertCircle } from 'lucide-react';
import { Modal } from '../components/Modal';

export default function Materials() {
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const initialFormState: Partial<Material> = {
    name: '',
    category: '',
    supplier: '',
    unit: 'kg',
    quantityBought: 0,
    pricePaid: 0,
  };
  const [formData, setFormData] = useState<Partial<Material>>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const unitCost = (formData.pricePaid || 0) / (formData.quantityBought || 1);
    
    if (isEditing && formData.id) {
      // Update existing
      const existing = materials.find(m => m.id === formData.id);
      if (existing) {
        const history = [...existing.history];
        if (Math.abs(existing.unitCost - unitCost) > 0.01) {
          history.push({ date: new Date().toISOString(), price: existing.unitCost });
        }
        
        updateMaterial({
          ...existing,
          ...formData as Material,
          unitCost,
          history
        });
      }
    } else {
      // Create new
      addMaterial({
        id: generateId(),
        createdAt: new Date().toISOString(),
        history: [],
        ...formData as Omit<Material, 'id' | 'createdAt' | 'history' | 'unitCost'>,
        unitCost,
      } as Material);
    }
    
    closeModal();
  };

  const openNewModal = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (material: Material) => {
    setFormData(material);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta matéria-prima?')) {
      deleteMaterial(id);
    }
  };

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.supplier && m.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculatedUnitCost = (formData.pricePaid || 0) / (formData.quantityBought || 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Matérias-Primas</h2>
          <p className="text-sm text-gray-500">Gerencie seu estoque e custos de aquisição.</p>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            className="pl-9 bg-gray-50 border-gray-200" 
            placeholder="Buscar por nome, categoria ou fornecedor..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={openNewModal} className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white">
          <Plus size={18} className="mr-2" /> Adicionar Material
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Fornecedor</th>
                <th className="px-4 py-3 text-right">Compra</th>
                <th className="px-4 py-3 text-right">Custo Unitário</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{material.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase tracking-wide">
                        {material.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{material.supplier || '-'}</td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      <div className="flex flex-col items-end">
                        <span>{material.quantityBought} {material.unit}</span>
                        <span className="text-xs text-gray-400">{formatCurrency(material.pricePaid)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-[#D97706]">
                      {formatCurrency(material.unitCost)} <span className="text-gray-400 font-normal text-xs">/{material.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => openEditModal(material)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(material.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Nenhum material encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditing ? 'Editar Material' : 'Novo Material'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Material"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Categoria"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              required
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Unidade</label>
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value as any})}
              >
                <option value="kg">Quilograma (kg)</option>
                <option value="g">Grama (g)</option>
                <option value="l">Litro (l)</option>
                <option value="ml">Mililitro (ml)</option>
                <option value="un">Unidade (un)</option>
              </select>
            </div>
          </div>

          <Input
            label="Fornecedor (Opcional)"
            value={formData.supplier}
            onChange={e => setFormData({...formData, supplier: e.target.value})}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quantidade Total Compra"
              type="number"
              step="0.01"
              min="0"
              value={formData.quantityBought || ''}
              onChange={e => setFormData({...formData, quantityBought: parseFloat(e.target.value)})}
              required
            />
            <Input
              label="Preço Total Pago (R$)"
              type="number"
              step="0.01"
              min="0"
              value={formData.pricePaid || ''}
              onChange={e => setFormData({...formData, pricePaid: parseFloat(e.target.value)})}
              required
            />
          </div>

          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
            <AlertCircle className="text-amber-600 shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-amber-900">Cálculo Automático:</p>
              <p className="text-sm text-amber-800 mt-1">
                Custo Unitário = {formatCurrency(formData.pricePaid || 0)} ÷ {formData.quantityBought || 1}
              </p>
              <p className="text-lg font-bold text-amber-700 mt-1">
                = {formatCurrency(calculatedUnitCost)} / {formData.unit}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 justify-end">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
              {isEditing ? 'Salvar Alterações' : 'Salvar Material'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
