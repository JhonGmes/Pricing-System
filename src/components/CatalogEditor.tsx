import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Input } from './Input';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { LayoutTemplate, Palette, Type, Image as ImageIcon, Eye, Upload } from 'lucide-react';
import { CatalogSettings } from '../types';
import { fileToBase64 } from '../utils';

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        handleChange('logo', base64);
      } catch (err) {
        console.error("Error uploading logo", err);
      }
    }
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo do Catálogo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group transition-all hover:border-indigo-400 hover:bg-indigo-50">
                      {localSettings.logo ? (
                        <img src={localSettings.logo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-center p-1">
                          <Upload size={20} className="text-gray-300 mx-auto" />
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white backdrop-blur-sm">
                        <Upload size={16} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </label>
                    </div>
                    <div className="text-xs text-gray-500 flex-1">
                      <p>Se não definido, o logo do sistema será usado.</p>
                      {localSettings.logo && (
                        <button 
                          onClick={() => handleChange('logo', null)}
                          className="text-red-500 hover:text-red-700 mt-1 underline"
                        >
                          Remover logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Decoration Uploads */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900">Decorações da Capa</h3>
                  
                  {/* Top Left */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Canto Superior Esquerdo</label>
                    <div className="flex items-center gap-2">
                       <input 
                         type="file" 
                         className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                         accept="image/*"
                         onChange={async (e) => {
                           if (e.target.files?.[0]) {
                             const base64 = await fileToBase64(e.target.files[0]);
                             handleChange('coverImageTopLeft', base64);
                           }
                         }}
                       />
                       {localSettings.coverImageTopLeft && (
                         <button onClick={() => handleChange('coverImageTopLeft', null)} className="text-xs text-red-500">Remover</button>
                       )}
                    </div>
                  </div>

                  {/* Top Right */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Canto Superior Direito</label>
                    <div className="flex items-center gap-2">
                       <input 
                         type="file" 
                         className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                         accept="image/*"
                         onChange={async (e) => {
                           if (e.target.files?.[0]) {
                             const base64 = await fileToBase64(e.target.files[0]);
                             handleChange('coverImageTopRight', base64);
                           }
                         }}
                       />
                       {localSettings.coverImageTopRight && (
                         <button onClick={() => handleChange('coverImageTopRight', null)} className="text-xs text-red-500">Remover</button>
                       )}
                    </div>
                  </div>

                  {/* Bottom */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Decoração Inferior</label>
                    <div className="flex items-center gap-2">
                       <input 
                         type="file" 
                         className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                         accept="image/*"
                         onChange={async (e) => {
                           if (e.target.files?.[0]) {
                             const base64 = await fileToBase64(e.target.files[0]);
                             handleChange('coverImageBottom', base64);
                           }
                         }}
                       />
                       {localSettings.coverImageBottom && (
                         <button onClick={() => handleChange('coverImageBottom', null)} className="text-xs text-red-500">Remover</button>
                       )}
                    </div>
                  </div>
                </div>

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
              <div className="h-full flex flex-col items-center justify-center p-12 relative overflow-hidden">
                {/* Top Left Corner Decoration */}
                {localSettings.coverImageTopLeft && (
                  <img 
                    src={localSettings.coverImageTopLeft} 
                    alt="Corner Decoration" 
                    className="absolute top-4 left-4 w-32 h-auto opacity-80"
                  />
                )}

                {/* Top Right Page Curl */}
                {localSettings.coverImageTopRight && (
                  <img 
                    src={localSettings.coverImageTopRight} 
                    alt="Page Curl" 
                    className="absolute top-0 right-0 w-32 h-auto"
                  />
                )}

                <div className="flex flex-col items-center justify-center z-10 w-full px-6 mt-8">
                   {/* Logo in Center - No Border */}
                   <div className="mb-6 relative">
                     {localSettings.logo || settings.logo ? (
                       <img 
                         src={localSettings.logo || settings.logo!} 
                         alt="Logo" 
                         className="w-48 h-48 object-contain" 
                       />
                     ) : (
                       <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center text-[#efc26c]">
                          <span className="font-serif font-bold text-4xl">{settings.brandName.charAt(0)}</span>
                       </div>
                     )}
                   </div>
                
                   <div className="text-center space-y-1">
                     <h1 
                       className="text-6xl font-script font-normal tracking-wide leading-tight drop-shadow-sm" 
                       style={{ color: '#efc26c', fontFamily: '"Great Vibes", cursive' }}
                     >
                       {localSettings.coverTitle || settings.brandName}
                     </h1>
                     <p 
                       className="text-lg font-serif tracking-widest mt-0"
                       style={{ color: '#efc26c', fontFamily: '"Alice", serif' }}
                     >
                       {localSettings.coverSubtitle || settings.subtitle}
                     </p>
                   </div>
                </div>

                {/* Bottom Decoration */}
                {localSettings.coverImageBottom && (
                  <div className="absolute bottom-12 w-full flex justify-center">
                    <img 
                      src={localSettings.coverImageBottom} 
                      alt="Divider Decoration" 
                      className="w-1/2 h-auto opacity-90"
                    />
                  </div>
                )}

                {/* Footer Text */}
                <div className="absolute bottom-4 w-full text-center text-[10px] opacity-40" style={{ color: '#efc26c' }}>
                  <p className="font-serif tracking-widest uppercase">
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
