import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Input } from '../components/Input';
import { Save, Upload, Settings as SettingsIcon, Palette, DollarSign, Database, Download, AlertCircle } from 'lucide-react';
import { fileToBase64 } from '../utils';

export default function Settings() {
  const { settings, updateSettings, materials, indirectCosts, products, importData, isLoading, isSupabaseEnabled } = useApp();
  const [formData, setFormData] = useState(settings);

  // Update formData when settings change (e.g. after initial load)
  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
      // Could add a toast here
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      alert("Erro ao salvar configurações. Tente novamente.");
    }
  };

  const handleExport = () => {
    const data = {
      materials,
      indirectCosts,
      products,
      settings: formData,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `centelha-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('ATENÇÃO: Importar um backup substituirá todos os dados atuais. Deseja continuar?')) {
      e.target.value = ''; // Reset input
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Basic validation
      if (!data.materials && !data.products) {
        throw new Error('Arquivo de backup inválido');
      }

      importData(data);
      setFormData(data.settings || settings);
      alert('Dados restaurados com sucesso!');
    } catch (err) {
      console.error('Erro ao importar:', err);
      alert('Erro ao ler o arquivo de backup. Verifique se é um arquivo válido.');
    }
    
    e.target.value = ''; // Reset input
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setFormData(prev => ({ ...prev, logo: base64 }));
      } catch (err) {
        console.error("Error uploading logo", err);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-100 rounded-xl text-gray-600">
          <SettingsIcon size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Configurações</h2>
          <p className="text-gray-500 mt-1">Personalize sua marca e padrões do sistema.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Connection Status Banner */}
          {isSupabaseEnabled ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm font-medium">Conectado ao Supabase (Nuvem)</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3 text-gray-600">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <p className="text-sm font-medium">Modo Offline (Dados salvos apenas neste dispositivo)</p>
            </div>
          )}

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette size={20} className="text-indigo-500" />
                Identidade da Marca
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="shrink-0">
                  <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group transition-all hover:border-indigo-400 hover:bg-indigo-50">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-gray-400 text-xs block mb-1">Sem Logo</span>
                        <Upload size={24} className="text-gray-300 mx-auto" />
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white backdrop-blur-sm">
                      <Upload size={24} className="mb-1" />
                      <span className="text-xs font-medium">Alterar</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                  </div>
                </div>
                <div className="space-y-4 flex-1 w-full">
                  <Input
                    label="Nome da Marca"
                    value={formData.brandName}
                    onChange={e => setFormData({...formData, brandName: e.target.value})}
                    placeholder="Ex: Aromas da Terra"
                    className="text-lg font-medium"
                  />
                  <Input
                    label="Slogan / Subtítulo"
                    value={formData.subtitle}
                    onChange={e => setFormData({...formData, subtitle: e.target.value})}
                    placeholder="Ex: Saboaria Artesanal & Velas"
                  />
                  <p className="text-xs text-gray-500">
                    Estas informações aparecerão no cabeçalho do seu catálogo digital e em impressos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign size={20} className="text-emerald-500" />
                Padrões de Precificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Input
                    label="Margem de Lucro Padrão (%)"
                    type="number"
                    value={formData.defaultMarginPercent}
                    onChange={e => setFormData({...formData, defaultMarginPercent: parseFloat(e.target.value)})}
                    className="font-mono text-emerald-700 font-bold"
                  />
                  <p className="text-xs text-gray-500">
                    Meta de lucro sobre o preço de venda.
                  </p>
                </div>
                <div className="space-y-2">
                  <Input
                    label="Custo Fixo Adicional Padrão (R$)"
                    type="number"
                    value={formData.defaultFixedCost}
                    onChange={e => setFormData({...formData, defaultFixedCost: parseFloat(e.target.value)})}
                    className="font-mono text-emerald-700 font-bold"
                  />
                  <p className="text-xs text-gray-500">
                    Valor fixo somado ao preço final (ex: embalagem extra).
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                <p>Estes valores serão usados como ponto de partida ao criar novos produtos, mas você poderá ajustá-los individualmente.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-200">
            <CardHeader className="border-b border-gray-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database size={20} className="text-indigo-500" />
                Gerenciamento de Dados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Backup de Segurança</h4>
                  <p className="text-sm text-gray-500">
                    Baixe uma cópia de todos os seus dados (produtos, materiais, configurações) para o seu computador.
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleExport}
                    className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
                  >
                    <Download size={16} className="mr-2" />
                    Exportar Dados
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Restaurar Dados</h4>
                  <p className="text-sm text-gray-500">
                    Recupere seus dados a partir de um arquivo de backup anterior. Cuidado: isso substituirá os dados atuais.
                  </p>
                  <div className="relative">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 pointer-events-none"
                    >
                      <Upload size={16} className="mr-2" />
                      Importar Backup
                    </Button>
                    <input 
                      type="file" 
                      accept=".json"
                      onChange={handleImport}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-800 flex gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <p>
                  <strong>Atenção:</strong> Seus dados são salvos automaticamente neste navegador. 
                  Faça backups regulares para evitar perda de dados caso limpe o histórico ou troque de dispositivo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-900 text-white border-gray-800 sticky top-6">
            <CardHeader>
              <CardTitle className="text-gray-100">Prévia do Catálogo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg p-4 text-center space-y-3 text-gray-900">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-gray-100 shadow-md" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto flex items-center justify-center text-gray-400">
                    <span className="text-xs">Logo</span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg leading-tight">{formData.brandName || 'Sua Marca'}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{formData.subtitle || 'Seu Slogan'}</p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                    Catálogo Digital
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button type="submit" size="lg" className="w-full shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all">
                  <Save size={20} className="mr-2" />
                  Salvar Tudo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
