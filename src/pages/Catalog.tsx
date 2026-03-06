import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { formatCurrency } from '../utils';
import { Printer, Download } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Product } from '../types';

export default function Catalog() {
  const { products, settings } = useApp();
  const catalogRef = useRef<HTMLDivElement>(null);

  // Group products by category
  const groupedProducts = products.reduce((acc, product) => {
    const category = product.category || 'Outros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!catalogRef.current) return;
    
    const element = catalogRef.current;
    const opt = {
      margin: 10,
      filename: `Catalogo-${settings.brandName.replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Catálogo Digital</h2>
          <p className="text-gray-500">Visualize e exporte seu portfólio.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer size={20} className="mr-2" /> Imprimir
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download size={20} className="mr-2" /> Baixar PDF
          </Button>
        </div>
      </div>

      {/* Catalog Preview Area */}
      <div className="bg-gray-200 p-4 md:p-8 rounded-xl overflow-auto print:p-0 print:bg-white print:overflow-visible">
        <div 
          ref={catalogRef}
          className="bg-white max-w-[210mm] mx-auto min-h-[297mm] p-[15mm] shadow-lg print:shadow-none print:w-full print:max-w-none"
        >
          {/* Catalog Header */}
          <div className="text-center border-b-2 border-gray-100 pb-8 mb-8">
            {settings.logo && (
              <img src={settings.logo} alt="Logo" className="h-24 mx-auto mb-4 object-contain" />
            )}
            <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">{settings.brandName}</h1>
            <p className="text-gray-500 italic">{settings.subtitle}</p>
          </div>

          {/* Products Grid */}
          <div className="space-y-10">
            {Object.entries(groupedProducts).map(([category, items]) => (
              <div key={category} className="break-inside-avoid">
                <h3 className="text-xl font-bold text-indigo-900 border-b border-indigo-100 pb-2 mb-6 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-10">
                  {(items as Product[]).map(product => (
                    <div key={product.id} className="flex gap-4 break-inside-avoid">
                      <div className="w-24 h-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                            Sem Foto
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900">{product.name}</h4>
                          <span className="font-bold text-lg text-indigo-700">{formatCurrency(product.finalPrice)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">{product.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
            <p>Catálogo gerado em {new Date().toLocaleDateString()}</p>
            <p>{settings.brandName} - Feito à mão com amor.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
