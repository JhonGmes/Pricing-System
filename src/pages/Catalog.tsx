import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { formatCurrency } from '../utils';
import { Printer, Download, Image as ImageIcon } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Product } from '../types';

export default function Catalog() {
  const { products, settings } = useApp();
  const catalogRef = useRef<HTMLDivElement>(null);
  const catalogSettings = settings.catalog || {
    coverTitle: settings.brandName,
    coverSubtitle: settings.subtitle,
    coverFooter: 'www.seusite.com.br',
    headerText: settings.brandName,
    footerText: 'Feito à mão com amor',
    primaryColor: '#3e1c1c',
    secondaryColor: '#F5F2ED',
    textColor: '#3e1c1c',
    productsPerPage: 4,
    showPrice: true,
    showDescription: true,
    showCode: false
  };

  // Group products by category
  const groupedProducts = products
    .filter(product => product.active !== false)
    .reduce((acc, product) => {
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
      margin: 0,
      filename: `Catalogo-${settings.brandName.replace(/\s+/g, '-')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
  };

  // Helper to chunk array
  const chunk = (arr: any[], size: number) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );

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
        <div ref={catalogRef} className="print:w-full">
          
          {/* COVER PAGE */}
          <div 
            className="mx-auto shadow-lg print:shadow-none mb-8 print:mb-0 relative overflow-hidden flex flex-col items-center justify-center break-after-page"
            style={{ 
              width: '210mm', 
              minHeight: '297mm', // Ensure full height
              height: '297mm',
              backgroundColor: catalogSettings.secondaryColor,
              color: catalogSettings.primaryColor
            }}
          >
            <div className="absolute top-12 right-12">
               {/* Logo on Cover */}
               {settings.logo ? (
                 <img src={settings.logo} alt="Logo" className="w-24 h-24 object-contain" />
               ) : (
                 <div className="w-24 h-24 rounded-full border-2 flex items-center justify-center" style={{ borderColor: catalogSettings.primaryColor }}>
                    <span className="font-serif font-bold text-2xl">{settings.brandName.charAt(0)}</span>
                 </div>
               )}
            </div>
            
            <div className="text-center space-y-6 z-10 p-12">
              <h1 className="text-7xl font-serif font-bold tracking-tight leading-tight" style={{ color: catalogSettings.primaryColor }}>
                {catalogSettings.coverTitle || settings.brandName}
              </h1>
              <p className="text-2xl font-light tracking-wide opacity-80">
                {catalogSettings.coverSubtitle || settings.subtitle}
              </p>
            </div>

            <div className="absolute bottom-12 w-full text-center border-t pt-6 mx-12" style={{ borderColor: `${catalogSettings.primaryColor}30`, maxWidth: 'calc(100% - 6rem)' }}>
              <p className="text-sm font-medium tracking-widest uppercase">
                {catalogSettings.coverFooter || 'www.seusite.com.br'}
              </p>
            </div>
          </div>

          {/* CATEGORY PAGES */}
          {Object.entries(groupedProducts).map(([category, categoryProducts]) => {
            // Chunk products for this category
            const productChunks = chunk(categoryProducts as Product[], catalogSettings.productsPerPage);
            
            return productChunks.map((pageProducts, pageIndex) => (
              <div 
                key={`${category}-${pageIndex}`}
                className="mx-auto shadow-lg print:shadow-none mb-8 print:mb-0 relative overflow-hidden flex flex-col"
                style={{ 
                  width: '210mm', 
                  minHeight: '297mm',
                  height: '297mm',
                  backgroundColor: catalogSettings.secondaryColor,
                  color: catalogSettings.textColor,
                  padding: '15mm',
                  pageBreakAfter: 'always'
                }}
              >
                {/* Page Header */}
                <div className="flex justify-between items-end border-b pb-4 mb-8" style={{ borderColor: `${catalogSettings.primaryColor}30` }}>
                  <div>
                    <h2 className="text-3xl font-serif font-bold" style={{ color: catalogSettings.primaryColor }}>
                      {catalogSettings.headerText || settings.brandName}
                    </h2>
                    <p className="text-sm opacity-70 uppercase tracking-wider font-medium mt-1">
                      {category} {productChunks.length > 1 ? `(${pageIndex + 1}/${productChunks.length})` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                     {/* Small Logo in Header */}
                     {settings.logo && (
                       <img src={settings.logo} alt="Logo" className="h-10 w-auto object-contain" />
                     )}
                  </div>
                </div>

                {/* Products Grid */}
                <div 
                  className="grid gap-x-8 gap-y-10 flex-1 content-start" 
                  style={{ 
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    // Adjust rows based on items per page roughly, but let grid handle flow
                  }}
                >
                  {pageProducts.map((product) => (
                    <div key={product.id} className="flex flex-col gap-3 break-inside-avoid">
                      <div className="aspect-square w-full bg-white rounded-sm overflow-hidden shadow-sm relative">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-black/5 text-gray-400">
                            <ImageIcon size={32} />
                          </div>
                        )}
                        {catalogSettings.showCode && product.code && (
                           <span className="absolute top-2 left-2 bg-white/90 px-2 py-1 text-[10px] font-mono rounded-sm shadow-sm">
                             #{product.code}
                           </span>
                        )}
                      </div>
                      <div className="text-center space-y-1">
                        <h3 className="font-serif font-bold text-xl leading-tight" style={{ color: catalogSettings.primaryColor }}>
                          {product.name}
                        </h3>
                        {catalogSettings.showDescription && (
                          <p className="text-xs opacity-70 line-clamp-2 px-2">
                            {product.description}
                          </p>
                        )}
                        {catalogSettings.showPrice && (
                          <p className="font-bold text-lg mt-1">
                            {formatCurrency(product.finalPrice)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Page Footer */}
                <div className="mt-auto pt-4 border-t text-center text-xs opacity-60 flex justify-between items-center" style={{ borderColor: `${catalogSettings.primaryColor}30` }}>
                  <span>{catalogSettings.footerText}</span>
                  <span>{category}</span>
                </div>
              </div>
            ));
          })}
        </div>
      </div>
    </div>
  );
}
