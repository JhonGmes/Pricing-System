import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Input } from './Input';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { LayoutTemplate, Palette, Type, Image as ImageIcon, Eye } from 'lucide-react';
import { CatalogSettings } from '../types';

export function CatalogEditor() {
  const { settings, updateSettings } = useApp();
  const [localSettings, setLocalSettings] = useState<CatalogSettings>(settings.catalog!);
  const [activeTab, setActiveTab] = useState<'cover' | 'pages' | 'style'>('cover');

  useEffect(() => {
    if (settings.catalog) {
      setLocalSettings(settings.catalog);
    }
  }, [settings.catalog]);

  const handleChange = (field: keyof CatalogSettings, value: any) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
  };

  const handleSave = async () => {
    await updateSettings({
      ...settings,
      catalog: localSettings
    });
    alert('Configurações do catálogo salvas!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <LayoutTemplate size={20} />
              Editor do Catálogo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setActiveTab('cover')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'cover' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Capa
              </button>
              <button
                onClick={() => setActiveTab('pages')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'pages' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Páginas
              </button>
              <button
                onClick={() => setActiveTab('style')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'style' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Estilo
              </button>
            </div>

            {activeTab === 'cover' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                <Input
                  label="Título da Capa"
                  value={localSettings.coverTitle}
                  onChange={(e) => handleChange('coverTitle', e.target.value)}
                  placeholder="Ex: Nome da Marca"
                />
                <Input
                  label="Subtítulo"
                  value={localSettings.coverSubtitle}
                  onChange={(e) => handleChange('coverSubtitle', e.target.value)}
                  placeholder="Ex: Catálogo 2024"
                />
                <Input
                  label="Rodapé da Capa"
                  value={localSettings.coverFooter}
                  onChange={(e) => handleChange('coverFooter', e.target.value)}
                  placeholder="Ex: www.site.com.br"
                />
              </div>
            )}

            {activeTab === 'pages' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                <Input
                  label="Texto do Cabeçalho"
                  value={localSettings.headerText}
                  onChange={(e) => handleChange('headerText', e.target.value)}
                  placeholder="Ex: Nome da Marca"
                />
                <Input
                  label="Texto do Rodapé"
                  value={localSettings.footerText}
                  onChange={(e) => handleChange('footerText', e.target.value)}
                  placeholder="Ex: Feito à mão"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Produtos por Página</label>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    step="1"
                    value={localSettings.productsPerPage}
                    onChange={(e) => handleChange('productsPerPage', parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="text-right text-xs text-gray-500">{localSettings.productsPerPage} produtos</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showPrice"
                    checked={localSettings.showPrice}
                    onChange={(e) => handleChange('showPrice', e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="showPrice" className="text-sm text-gray-700">Mostrar Preço</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showCode"
                    checked={localSettings.showCode}
                    onChange={(e) => handleChange('showCode', e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="showCode" className="text-sm text-gray-700">Mostrar Código</label>
                </div>
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor Primária (Texto/Detalhes)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localSettings.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={localSettings.primaryColor}
                      onChange={(e) => handleChange('primaryColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor de Fundo</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={localSettings.secondaryColor}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      className="h-10 w-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={localSettings.secondaryColor}
                      onChange={(e) => handleChange('secondaryColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            )}

            <Button onClick={handleSave} className="w-full mt-4">
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview */}
      <div className="lg:col-span-2">
        <div className="bg-gray-100 p-8 rounded-xl h-full overflow-auto min-h-[600px] flex items-center justify-center">
          <div 
            className="bg-white shadow-2xl transition-all duration-300 origin-top transform scale-90 md:scale-100"
            style={{ 
              width: '210mm', 
              height: '297mm',
              backgroundColor: localSettings.secondaryColor,
              color: localSettings.primaryColor
            }}
          >
            {activeTab === 'cover' ? (
              // Cover Preview
              <div className="h-full flex flex-col items-center justify-center p-12 relative">
                <div className="absolute top-12 right-12">
                   {/* Optional Icon/Logo placeholder */}
                   <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center" style={{ borderColor: localSettings.primaryColor }}>
                      <ImageIcon size={24} />
                   </div>
                </div>
                
                <div className="text-center space-y-6">
                  <h1 className="text-6xl font-serif font-bold tracking-tight" style={{ color: localSettings.primaryColor }}>
                    {localSettings.coverTitle || 'Título da Marca'}
                  </h1>
                  <p className="text-xl font-light tracking-wide opacity-80">
                    {localSettings.coverSubtitle || 'Subtítulo do Catálogo'}
                  </p>
                </div>

                <div className="absolute bottom-12 w-full text-center border-t pt-6 mx-12" style={{ borderColor: `${localSettings.primaryColor}30`, maxWidth: 'calc(100% - 6rem)' }}>
                  <p className="text-sm font-medium tracking-widest uppercase">
                    {localSettings.coverFooter || 'www.seusite.com.br'}
                  </p>
                </div>
              </div>
            ) : (
              // Page Preview
              <div className="h-full flex flex-col p-12 relative">
                {/* Header */}
                <div className="flex justify-between items-end border-b pb-4 mb-8" style={{ borderColor: `${localSettings.primaryColor}30` }}>
                  <div>
                    <h2 className="text-3xl font-serif font-bold" style={{ color: localSettings.primaryColor }}>
                      {localSettings.headerText || 'Título da Página'}
                    </h2>
                    <p className="text-sm opacity-70">Categoria Exemplo</p>
                  </div>
                  <div className="w-10 h-10 rounded-full border flex items-center justify-center" style={{ borderColor: localSettings.primaryColor }}>
                    <span className="font-serif font-bold">L</span>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid gap-6 flex-1 content-start" style={{ 
                  gridTemplateColumns: localSettings.productsPerPage > 6 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                  alignContent: 'start'
                }}>
                  {[...Array(localSettings.productsPerPage)].map((_, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl shadow-sm flex flex-col h-full">
                      <div className="aspect-square bg-gray-50 w-full rounded-lg flex items-center justify-center mb-3 relative">
                        <ImageIcon className="opacity-20 text-gray-400" size={32} />
                        {localSettings.showCode && (
                           <span className="absolute top-1 left-1 bg-white/90 px-1.5 py-0.5 text-[8px] font-mono rounded-sm shadow-sm text-gray-800">
                             #COD
                           </span>
                        )}
                      </div>
                      <div className="text-center mt-auto">
                        <h3 className="font-serif font-bold text-sm leading-tight text-gray-900">Produto {i+1}</h3>
                        {localSettings.showDescription && (
                          <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 px-1">Descrição curta do produto...</p>
                        )}
                        {localSettings.showPrice && (
                          <p className="font-bold text-sm mt-2 text-indigo-900">R$ 49,90</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t text-center text-xs opacity-60" style={{ borderColor: `${localSettings.primaryColor}30` }}>
                  {localSettings.footerText || 'Rodapé da Página'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
