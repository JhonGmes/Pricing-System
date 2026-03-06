import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IndirectCost } from '../types';
import { generateId, formatCurrency, cn } from '../utils';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardContent } from '../components/Card';
import { Trash2, Edit2, Zap, Plus } from 'lucide-react';
import { Modal } from '../components/Modal';

export default function IndirectCosts() {
  const { indirectCosts, addIndirectCost, updateIndirectCost, deleteIndirectCost } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialFormState: Partial<IndirectCost> = {
    name: '',
    type: 'batch',
    amount: 0,
  };
  const [formData, setFormData] = useState<Partial<IndirectCost>>(initialFormState);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && formData.id) {
      updateIndirectCost(formData as IndirectCost);
    } else {
      addIndirectCost({
        id: generateId(),
        ...formData as Omit<IndirectCost, 'id'>,
      } as IndirectCost);
    }
    
    closeModal();
  };

  const openNewModal = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openEditModal = (cost: IndirectCost) => {
    setFormData(cost);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este custo?')) {
      deleteIndirectCost(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Custos Indiretos</h2>
          <p className="text-gray-500">Energia, embalagens, depreciação e outros custos operacionais.</p>
        </div>
        <Button onClick={openNewModal} className="bg-gray-900 hover:bg-gray-800 text-white">
          <Plus size={20} className="mr-2" /> Adicionar Custo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {indirectCosts.length > 0 ? (
          indirectCosts.map((cost) => (
            <Card key={cost.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
                    <Zap size={24} />
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => openEditModal(cost)}
                      className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cost.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-gray-900 mb-1">{cost.name}</h3>
                <p className="text-2xl font-bold text-gray-900 mb-3">{formatCurrency(cost.amount)}</p>
                
                <span className={cn(
                  "inline-block px-3 py-1 rounded-md text-xs font-medium",
                  cost.type === 'batch' ? "bg-gray-100 text-gray-600" : "bg-gray-100 text-gray-600"
                )}>
                  {cost.type === 'batch' ? 'Por Lote (Produção)' : 'Por Unidade'}
                </span>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 border-dashed">
            Nenhum custo indireto cadastrado.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditing ? 'Editar Custo' : 'Novo Custo Indireto'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nome do Custo"
            placeholder="Ex: Energia Elétrica, Etiqueta..."
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
          />
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Tipo de Alocação</label>
            <select
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value as any})}
            >
              <option value="batch">Por Lote (Valor total gasto na receita)</option>
              <option value="unit">Por Unidade (Valor por item)</option>
            </select>
          </div>

          <Input
            label="Valor Padrão (R$)"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount || ''}
            onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
            required
          />

          <div className="p-3 bg-gray-50 rounded text-xs text-gray-500">
            Exemplo: Cada vela usa 1 pavio que custa R$ 0,50.
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white">
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
