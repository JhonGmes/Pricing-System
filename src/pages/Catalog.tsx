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
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
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

  const handleDownloadPDF = async () => {
    if (!catalogRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      const element = catalogRef.current;
      const opt = {
        margin: 0,
        filename: `Catalogo-${settings.brandName.replace(/\s+/g, '-')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Helper to chunk array
  const chunk = (arr: any[], size: number) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Catálogo Digital</h2>
          <p className="text-gray-500">Visualize e exporte seu portfólio.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer size={20} className="mr-2" /> Imprimir
          </Button>
          <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
            <Download size={20} className="mr-2" /> 
            {isGeneratingPDF ? 'Gerando PDF...' : 'Baixar PDF'}
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
              minHeight: '297mm',
              height: '297mm',
              backgroundColor: '#efedec', // New background color
              color: catalogSettings.primaryColor
            }}
          >
            {/* Top Left Corner Decoration */}
            {catalogSettings.coverImageTopLeft && (
              <img 
                src={catalogSettings.coverImageTopLeft} 
                alt="Corner Decoration" 
                className="absolute top-4 left-4 w-48 h-auto opacity-80"
              />
            )}

            {/* Top Right Page Curl */}
            {catalogSettings.coverImageTopRight && (
              <img 
                src={catalogSettings.coverImageTopRight} 
                alt="Page Curl" 
                className="absolute top-0 right-0 w-48 h-auto"
              />
            )}

            {/* Center Content */}
            <div className="flex flex-col items-center justify-center z-10 w-full px-12 mt-12">
               {/* Logo in Center - No Border */}
               <div className="mb-8 relative">
                 {catalogSettings.logo || settings.logo ? (
                   <img 
                     src={catalogSettings.logo || settings.logo!} 
                     alt="Logo" 
                     className="w-64 h-64 object-contain" 
                   />
                 ) : (
                   <div className="w-64 h-64 rounded-full bg-gray-100 flex items-center justify-center text-[#efc26c]">
                      <span className="font-serif font-bold text-6xl">{settings.brandName.charAt(0)}</span>
                   </div>
                 )}
               </div>
            
               <div className="text-center space-y-1">
                 <h1 
                   className="text-8xl font-script font-normal tracking-wide leading-tight drop-shadow-sm" 
                   style={{ color: '#efc26c', fontFamily: '"Great Vibes", cursive' }}
                 >
                   {catalogSettings.coverTitle || settings.brandName}
                 </h1>
                 <p 
                   className="text-2xl font-serif tracking-widest mt-0"
                   style={{ color: '#efc26c', fontFamily: '"Alice", serif' }}
                 >
                   {catalogSettings.coverSubtitle || settings.subtitle}
                 </p>
               </div>
            </div>

            {/* Bottom Decoration */}
            {catalogSettings.coverImageBottom && (
              <div className="absolute bottom-16 w-full flex justify-center">
                <img 
                  src={catalogSettings.coverImageBottom} 
                  alt="Divider Decoration" 
                  className="w-1/2 h-auto opacity-90"
                />
              </div>
            )}

            {/* Footer Text (Optional, kept minimal) */}
            <div className="absolute bottom-6 w-full text-center text-xs opacity-40" style={{ color: '#efc26c' }}>
              <p className="font-serif tracking-widest uppercase">
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
                  backgroundColor: '#efedec', // Same as cover
                  color: catalogSettings.textColor,
                  padding: '15mm',
                  pageBreakAfter: 'always'
                }}
              >
                {/* Top Left Decoration (Reused from Cover) */}
                {catalogSettings.coverImageTopLeft && (
                  <img 
                    src={catalogSettings.coverImageTopLeft} 
                    alt="Corner Decoration" 
                    className="absolute top-4 left-4 w-32 h-auto opacity-80"
                  />
                )}

                {/* Page Header */}
                <div className="flex justify-between items-start mb-4 relative z-10 mt-0">
                  <div className="flex flex-col items-start -ml-2">
                    {/* Brand Name */}
                    <h1 
                      className="text-5xl font-script font-normal tracking-wide leading-tight drop-shadow-sm" 
                      style={{ color: '#efc26c', fontFamily: '"Great Vibes", cursive' }}
                    >
                      {catalogSettings.headerText || settings.brandName}
                    </h1>
                    {/* Slogan */}
                    <p 
                      className="text-base font-serif tracking-widest -mt-1 mb-1 pl-1"
                      style={{ color: '#efc26c', fontFamily: '"Alice", serif' }}
                    >
                      {catalogSettings.headerSubtitle || settings.subtitle}
                    </p>
                    
                    {/* Category Name */}
                    <h2 
                      className="text-lg font-serif font-bold uppercase tracking-wider mt-1 pl-1" 
                      style={{ color: '#efc26c', fontFamily: '"Alice", serif', borderLeft: '3px solid #efc26c', paddingLeft: '10px' }}
                    >
                      {category} {productChunks.length > 1 ? `(${pageIndex + 1}/${productChunks.length})` : ''}
                    </h2>
                  </div>

                  {/* Logo Top Right */}
                  <div className="flex items-center justify-center -mt-4 -mr-2">
                     {(catalogSettings.logo || settings.logo) && (
                       <img 
                         src={catalogSettings.logo || settings.logo!} 
                         alt="Logo" 
                         className="h-24 w-24 object-contain" 
                       />
                     )}
                  </div>
                </div>

                {/* Products Grid */}
                <div 
                  className="grid gap-4 flex-1 content-start" 
                  style={{ 
                    gridTemplateColumns: catalogSettings.productsPerPage > 6 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
                    alignContent: 'start'
                  }}
                >
                  {pageProducts.map((product) => (
                    <div key={product.id} className="break-inside-avoid h-full">
                      <div 
                        className="p-2 shadow-sm h-full flex flex-col"
                        style={{ backgroundColor: '#ffffff', borderRadius: '0' }} // Square corners
                      >
                        <div 
                          className="aspect-square w-full overflow-hidden mb-2 relative"
                          style={{ backgroundColor: '#f9fafb', borderRadius: '0' }}
                        >
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300" style={{ backgroundColor: '#f3f4f6', color: '#d1d5db' }}>
                              <ImageIcon size={24} />
                            </div>
                          )}
                          {catalogSettings.showCode && product.code && (
                             <span 
                               className="absolute top-1 left-1 px-1.5 py-0.5 text-[8px] font-mono shadow-sm"
                               style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#1f2937', borderRadius: '0' }}
                             >
                               #{product.code}
                             </span>
                          )}
                        </div>
                        <div className="text-center space-y-0.5 mt-auto">
                          <h3 className="font-serif font-bold text-sm leading-tight" style={{ color: '#111827' }}>
                            {product.name}
                          </h3>
                          {catalogSettings.showDescription && (
                            <p className="text-[10px] line-clamp-2 px-1 leading-tight" style={{ color: '#6b7280' }}>
                              {product.description}
                            </p>
                          )}
                          {catalogSettings.showPrice && (
                            <p className="font-bold text-base mt-1" style={{ color: '#312e81' }}>
                              {formatCurrency(product.finalPrice)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Page Footer Decoration */}
                {catalogSettings.coverImageBottom && (
                  <div className="mt-auto pt-4 flex justify-center w-full">
                    <img 
                      src={catalogSettings.coverImageBottom} 
                      alt="Footer Decoration" 
                      className="w-1/2 h-auto opacity-90"
                    />
                  </div>
                )}
                
                {/* Simple Footer Text */}
                <div className="text-center text-[10px] opacity-60 mt-2" style={{ color: '#efc26c' }}>
                  <span>{catalogSettings.footerText}</span>
                </div>
              </div>
            ));
          })}
        </div>
      </div>
    </div>
  );
}
