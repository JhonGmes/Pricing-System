import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { formatCurrency } from '../utils';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export default function Dashboard() {
  const { products, materials, settings } = useApp();

  // Metrics
  const totalMaterials = materials.length;
  const activeProducts = products.length;
  
  const avgMargin = products.length > 0
    ? products.reduce((acc, p) => {
        const cost = p.unitCost || 0;
        const price = p.finalPrice || 0;
        if (price === 0) return acc;
        const margin = ((price - cost) / price) * 100;
        return acc + margin;
      }, 0) / products.length
    : 0;

  const potentialRevenue = products.reduce((acc, p) => {
    // Assuming 1 batch of each product in stock for calculation potential
    return acc + (p.finalPrice * p.batchSize);
  }, 0);

  // Top 5 Profitable Products (by absolute profit per unit)
  const topProducts = [...products]
    .map(p => ({
      name: p.name,
      profit: p.finalPrice - p.unitCost
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  // Low Margin Alerts
  const lowMarginProducts = products.filter(p => {
    const margin = ((p.finalPrice - p.unitCost) / p.finalPrice) * 100;
    return margin < settings.defaultMarginPercent; // Using default margin as threshold
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Visão Geral</h2>
          <p className="text-sm text-gray-500 mt-1">Bem-vindo de volta ao seu ateliê, {settings.brandName || 'Artesão'}.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/products">
            <Button className="shadow-lg shadow-indigo-500/20">
              <Plus size={16} className="mr-2" /> Novo Produto
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Matérias-Primas</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalMaterials}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Package size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-indigo-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Produtos Ativos</p>
              <h3 className="text-2xl font-bold text-gray-900">{activeProducts}</h3>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-emerald-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Margem Média</p>
              <h3 className="text-2xl font-bold text-gray-900">{avgMargin.toFixed(1)}%</h3>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Potencial (1 lote)</p>
              <h3 className="text-xl font-bold text-gray-900">{formatCurrency(potentialRevenue)}</h3>
            </div>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Sparkles size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="border-b border-gray-50 pb-3">
            <CardTitle className="text-base font-semibold text-gray-800">Top 5 Produtos Mais Lucrativos (R$/un)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[300px] w-full">
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120} 
                      tick={{fontSize: 12, fill: '#6b7280'}} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{fill: '#f9fafb'}}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                      formatter={(value: number) => [formatCurrency(value), 'Lucro']} 
                    />
                    <Bar dataKey="profit" radius={[0, 4, 4, 0]} barSize={32}>
                      {topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'][index % 5]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Package size={48} className="mb-4 opacity-20" />
                  <p>Nenhum produto cadastrado ainda.</p>
                  <Link to="/products" className="mt-4 text-indigo-600 hover:underline text-sm">
                    Cadastrar primeiro produto
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Actions */}
        <div className="space-y-6">
          <Card className="shadow-sm h-full">
            <CardHeader className="border-b border-gray-50 pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
                <AlertTriangle className="text-amber-500" size={18} />
                Alertas de Margem
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {lowMarginProducts.length > 0 ? (
                <div className="space-y-3">
                  {lowMarginProducts.slice(0, 4).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 bg-amber-50/50 hover:bg-amber-50 transition-colors rounded-lg border border-amber-100 group cursor-pointer">
                      <span className="font-medium text-amber-900 truncate max-w-[140px] text-sm">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                          {(((p.finalPrice - p.unitCost) / p.finalPrice) * 100).toFixed(1)}%
                        </span>
                        <ArrowRight size={14} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                  {lowMarginProducts.length > 4 && (
                    <p className="text-xs text-center text-gray-500 mt-4">e mais {lowMarginProducts.length - 4} produtos...</p>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Estes produtos estão abaixo da sua margem ideal de <span className="font-bold text-gray-700">{settings.defaultMarginPercent}%</span>. Considere reajustar os preços ou reduzir custos.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-6">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                    <Sparkles size={20} />
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm">Tudo certo!</h4>
                  <p className="text-xs text-gray-500 mt-1">Seus produtos estão com boa margem de lucro.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
