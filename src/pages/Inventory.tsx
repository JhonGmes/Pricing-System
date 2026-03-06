import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Search, AlertTriangle, Save, Package, Edit2 } from 'lucide-react';
import { DecimalInput } from '../components/DecimalInput';
import { cn } from '../utils';

export default function Inventory() {
  const { materials, updateMaterial } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartEdit = (id: string, currentStock: number) => {
    setEditingId(id);
    setEditValue(currentStock);
  };

  const handleSaveEdit = (material: any) => {
    updateMaterial({
      ...material,
      stockQuantity: editValue
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Estoque</h2>
          <p className="text-sm text-gray-500 mt-1">Gerencie a quantidade disponível de suas matérias-primas.</p>
        </div>
      </div>

      <div className="flex items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <Search className="text-gray-400 ml-2" size={18} />
        <Input 
          className="border-none shadow-none focus:ring-0" 
          placeholder="Buscar material..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map(material => (
          <Card key={material.id} className="hover:shadow-md transition-shadow group">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{material.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {material.category}
                  </span>
                </div>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Package size={20} />
                </div>
              </div>

              <div className="mt-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Quantidade em Estoque ({material.unit})</label>
                
                {editingId === material.id ? (
                  <div className="flex gap-2">
                    <DecimalInput 
                      value={editValue} 
                      onChange={setEditValue}
                      className="h-9"
                      autoFocus
                    />
                    <Button size="sm" onClick={() => handleSaveEdit(material)}>
                      <Save size={16} />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-indigo-600 flex items-center gap-2"
                    onClick={() => handleStartEdit(material.id, material.stockQuantity || 0)}
                    title="Clique para editar"
                  >
                    {material.stockQuantity || 0} 
                    <span className="text-sm font-normal text-gray-500">{material.unit}</span>
                    <Edit2 size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>

              {material.minStockLevel && (material.stockQuantity || 0) <= material.minStockLevel && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-100 mt-1">
                  <AlertTriangle size={14} />
                  <span>Estoque baixo (Mín: {material.minStockLevel})</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {filteredMaterials.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            Nenhum material encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
