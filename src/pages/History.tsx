import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Filter, ArrowUpRight, ArrowDownRight, History as HistoryIcon, Calendar } from 'lucide-react';
import { cn, formatCurrency } from '../utils';

export default function History() {
  const { stockMovements, materials, products } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'entry' | 'exit' | 'adjustment'>('all');
  const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const filteredHistory = useMemo(() => {
    return stockMovements
      .filter(m => {
        // Search Filter
        const item = m.itemType === 'material' 
          ? materials.find(mat => mat.id === m.itemId) 
          : products.find(prod => prod.id === m.itemId);
        const matchesSearch = item?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;

        // Type Filter
        const matchesType = typeFilter === 'all' || m.type === typeFilter;

        // Date Filter
        let matchesDate = true;
        if (dateFilter.start) {
          matchesDate = matchesDate && new Date(m.date) >= new Date(dateFilter.start);
        }
        if (dateFilter.end) {
          // Set end date to end of day
          const endDate = new Date(dateFilter.end);
          endDate.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && new Date(m.date) <= endDate;
        }

        return matchesSearch && matchesType && matchesDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by newest first
  }, [stockMovements, materials, products, searchTerm, typeFilter, dateFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Histórico de Movimentações</h2>
          <p className="text-sm text-gray-500 mt-1">Registre e consulte todas as entradas e saídas de estoque.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" 
            placeholder="Buscar por item..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={() => setTypeFilter('all')}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border", typeFilter === 'all' ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}
          >
            Todos
          </button>
          <button 
            onClick={() => setTypeFilter('entry')}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border", typeFilter === 'entry' ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}
          >
            Entradas
          </button>
          <button 
            onClick={() => setTypeFilter('exit')}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border", typeFilter === 'exit' ? "bg-red-100 text-red-800 border-red-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}
          >
            Saídas
          </button>
          <button 
            onClick={() => setTypeFilter('adjustment')}
            className={cn("px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border", typeFilter === 'adjustment' ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}
          >
            Ajustes
          </button>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="date" 
              className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={dateFilter.start}
              onChange={e => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="date" 
              className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              value={dateFilter.end}
              onChange={e => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Data / Hora</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Item</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Tipo</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-center">Qtd.</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Valor Unit.</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Total</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredHistory.map(movement => {
                const item = movement.itemType === 'material' 
                  ? materials.find(m => m.id === movement.itemId) 
                  : products.find(p => p.id === movement.itemId);
                
                const unitValue = movement.cost || movement.price || 0;
                const totalValue = unitValue * movement.quantity;

                return (
                  <tr key={movement.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{new Date(movement.date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">{new Date(movement.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item?.name || 'Item desconhecido'}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wide border",
                          movement.itemType === 'material' 
                            ? "bg-amber-50 text-amber-700 border-amber-100" 
                            : "bg-indigo-50 text-indigo-700 border-indigo-100"
                        )}>
                          {movement.itemType === 'material' ? 'Matéria-prima' : 'Produto'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {movement.type === 'entry' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <ArrowDownRight size={12} /> Entrada
                        </span>
                      )}
                      {movement.type === 'exit' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <ArrowUpRight size={12} /> Saída
                        </span>
                      )}
                      {movement.type === 'adjustment' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <HistoryIcon size={12} /> Ajuste
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-medium">
                      <span className={cn(
                        movement.type === 'entry' ? "text-emerald-600" : movement.type === 'exit' ? "text-red-600" : "text-gray-900"
                      )}>
                        {movement.type === 'entry' ? '+' : movement.type === 'exit' ? '-' : ''}{movement.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500 font-mono text-xs">
                      {unitValue > 0 ? formatCurrency(unitValue) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900 font-mono text-xs">
                      {totalValue > 0 ? formatCurrency(totalValue) : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate" title={movement.reason}>
                      {movement.reason || '-'}
                    </td>
                  </tr>
                );
              })}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <HistoryIcon size={32} className="text-gray-300" />
                      <p>Nenhuma movimentação encontrada com os filtros atuais.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
