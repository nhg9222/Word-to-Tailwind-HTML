/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import mammoth from 'mammoth';
import { 
  Code, 
  Eye, 
  Copy, 
  Check, 
  Layout, 
  Trash2,
  ChevronRight,
  ArrowUp,
  Palette,
  ChevronDown,
  Settings2,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  Upload,
  FileCode,
  Download,
  FileUp
} from 'lucide-react';
import { cn } from './lib/utils';
import { templates, Template } from './templates';

type ViewMode = 'preview' | 'code';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';
type ConversionMode = 'structured' | 'plain';

export default function App() {
  const [output, setOutput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [conversionMode, setConversionMode] = useState<ConversionMode>('structured');
  const [selectedStyleId, setSelectedStyleId] = useState<string>('minimal');
  const [applyTemplate, setApplyTemplate] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(true);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);
  
  const previewRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File, mode: ConversionMode = conversionMode) => {
    if (!file.name.endsWith('.docx')) {
      setError('Vui lòng chọn tệp Word (.docx)');
      return;
    }

    setIsParsing(true);
    setError(null);
    setFileName(file.name);
    setLastFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      if (mode === 'structured') {
        const options = {
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='List Bullet'] => ul > li:fresh",
            "p[style-name='List Number'] => ol > li:fresh"
          ]
        };

        const result = await mammoth.convertToHtml({ arrayBuffer }, options);
        let processedHtml = result.value;
        processedHtml = processedHtml.replace(/<\/ul>\s*<ul>/g, "");
        processedHtml = processedHtml.replace(/<\/ol>\s*<ol>/g, "");
        
        // Thêm xuống dòng giữa các thẻ để mã HTML dễ đọc hơn (không bị nén 1 dòng)
        processedHtml = processedHtml.replace(/>\s*</g, '>\n<');
        
        setOutput(processedHtml);
      } else {
        // Plain Paragraphs mode
        const result = await mammoth.extractRawText({ arrayBuffer });
        const lines = result.value.split('\n').filter(line => line.trim() !== '');
        const plainHtml = lines.map(line => `<p>${line.trim()}</p>`).join('\n');
        setOutput(plainHtml);
      }
      
      setViewMode('preview');
    } catch (err) {
      console.error(err);
      setError('Không thể chuyển đổi tệp Word. Vui lòng thử lại.');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleModeChange = (newMode: ConversionMode) => {
    setConversionMode(newMode);
    if (lastFile) {
      processFile(lastFile, newMode);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const getScrollTopHtml = (themeColor: string = '#4f46e5') => {
    if (!showScrollTop) return '';
    return `
      <button id="scrollTopBtn" title="Cuộn lên đầu trang" style="display: none; position: fixed; bottom: 30px; right: 30px; z-index: 99; border: none; outline: none; background-color: ${themeColor}; color: white; cursor: pointer; width: 48px; height: 48px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
      </button>
      <script>
        const btn = document.getElementById("scrollTopBtn");
        window.onscroll = function() {
          if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            btn.style.display = "flex";
            btn.style.opacity = "1";
          } else {
            btn.style.opacity = "0";
            setTimeout(() => { if(btn.style.opacity === "0") btn.style.display = "none"; }, 300);
          }
        };
        btn.onclick = function() {
          window.scrollTo({top: 0, behavior: 'smooth'});
        };
      </script>
    `;
  };

  const getTailwindCss = () => {
    if (!previewRef.current) return '';
    try {
      const doc = previewRef.current.contentDocument;
      if (!doc) return '';
      let css = '';
      // Tailwind Play CDN usually puts its styles in a <style> tag it creates
      // We'll collect all rules from all stylesheets to be safe
      for (let i = 0; i < doc.styleSheets.length; i++) {
        const sheet = doc.styleSheets[i];
        try {
          const rules = sheet.cssRules || sheet.rules;
          for (let j = 0; j < rules.length; j++) {
            css += rules[j].cssText + '\n';
          }
        } catch (e) {
          // Skip cross-origin stylesheets if any
          console.warn('Could not read stylesheet:', e);
        }
      }
      return css;
    } catch (e) {
      console.error('Error extracting CSS:', e);
      return '';
    }
  };

  const handleCopy = () => {
    const currentTemplate = templates.find(t => t.id === selectedStyleId) || templates[0];
    const extractedCss = getTailwindCss();
    
    const contentHtml = applyTemplate ? `
<style>
${extractedCss}
</style>
<div class="${currentTemplate.containerClass}">
  ${currentTemplate.header(fileName?.replace('.docx', '') || '')}
  <div class="prose prose-indigo max-w-none">
    ${output}
  </div>
  ${currentTemplate.footer()}
  ${getScrollTopHtml(currentTemplate.themeColor)}
</div>` : `
<style>
${extractedCss}
</style>
<div class="prose prose-indigo max-w-none p-8">
  ${output}
  ${getScrollTopHtml()}
</div>`;
    navigator.clipboard.writeText(contentHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const currentTemplate = templates.find(t => t.id === selectedStyleId) || templates[0];
    const extractedCss = getTailwindCss();

    const bodyContent = applyTemplate ? `
    <div class="${currentTemplate.containerClass}">
        ${currentTemplate.header(fileName?.replace('.docx', '') || '')}
        <div class="prose prose-indigo max-w-none">
            ${output}
        </div>
        ${currentTemplate.footer()}
        ${getScrollTopHtml(currentTemplate.themeColor)}
    </div>` : `
    <div class="prose prose-indigo max-w-none p-8 sm:p-12 md:p-16 mx-auto">
        ${output}
        ${getScrollTopHtml()}
    </div>`;

    const fullHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName?.replace('.docx', '') || 'Converted Document'}</title>
    <style>
        ${extractedCss}
        body { margin: 0; padding: 0; background-color: ${applyTemplate ? '#f3f4f6' : '#fff'}; }
        #scrollTopBtn:hover { transform: translateY(-3px); background-color: ${applyTemplate ? currentTemplate.themeColor : '#4f46e5'} !important; opacity: 0.9; }
        
        /* Table Border Optimization */
        .prose table { border-collapse: collapse !important; border: 1px solid #d1d5db !important; margin: 2rem 0 !important; width: 100% !important; }
        .prose th, .prose td { border: 1px solid #d1d5db !important; padding: 12px 15px !important; text-align: left !important; }
        .prose thead { background-color: #f9fafb !important; }
        .prose th { font-weight: 600 !important; color: #111827 !important; }
        
        /* Ensure template font applies to prose */
        .prose { font-family: inherit !important; }
    </style>
</head>
<body>
    ${bodyContent}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName?.replace('.docx', '.html') || 'document.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setOutput('');
    setFileName(null);
    setError(null);
  };

  // Update iframe content when output, style or settings change
  useEffect(() => {
    if (previewRef.current && output) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        const currentTemplate = templates.find(t => t.id === selectedStyleId) || templates[0];
        const bodyContent = applyTemplate ? `
          <div class="${currentTemplate.containerClass}">
            ${currentTemplate.header(fileName?.replace('.docx', '') || '')}
            <div id="content" class="prose prose-indigo max-w-none">
              ${output}
            </div>
            ${currentTemplate.footer()}
            ${getScrollTopHtml(currentTemplate.themeColor)}
          </div>` : `
          <div class="bg-white p-8 sm:p-12 md:p-16">
            <div id="content" class="prose prose-indigo max-w-none mx-auto">
              ${output}
            </div>
            ${getScrollTopHtml()}
          </div>`;

        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
              <style>
                body { margin: 0; padding: 0; background-color: ${applyTemplate ? '#f3f4f6' : '#fff'}; }
                body::-webkit-scrollbar { display: none; }
                body { -ms-overflow-style: none; scrollbar-width: none; }
                #scrollTopBtn:hover { transform: translateY(-3px); background-color: ${applyTemplate ? currentTemplate.themeColor : '#4f46e5'} !important; opacity: 0.9; }
                
                /* Table Border Optimization */
                .prose table { border-collapse: collapse !important; border: 1px solid #d1d5db !important; margin: 2rem 0 !important; width: 100% !important; }
                .prose th, .prose td { border: 1px solid #d1d5db !important; padding: 12px 15px !important; text-align: left !important; }
                .prose thead { background-color: #f9fafb !important; }
                .prose th { font-weight: 600 !important; color: #111827 !important; }

                /* Ensure template font applies to prose */
                .prose { font-family: inherit !important; }
              </style>
            </head>
            <body>
              ${bodyContent}
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [output, viewMode, selectedStyleId, fileName, showScrollTop, applyTemplate]);

  return (
    <div 
      className="flex flex-col h-screen bg-[#F9FAFB] text-[#111827]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-indigo-600/10 backdrop-blur-sm border-4 border-dashed border-indigo-600 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <FileUp className="w-8 h-8 text-indigo-600" />
            </div>
            <p className="text-xl font-bold text-indigo-600">Thả tệp Word vào đây</p>
          </div>
        </div>
      )}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 bg-white border-b border-[#E5E7EB] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <FileCode className="text-white w-5 h-5" />
          </div>
          <h1 className="text-sm sm:text-lg font-bold tracking-tight truncate max-w-[100px] xs:max-w-[150px] sm:max-w-none">
            Word to HTML
          </h1>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-3">
          {output && (
            <button 
              onClick={handleReset}
              className="p-2 text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors"
              title="Xóa tất cả"
            >
              <Trash2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isParsing}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-all",
              "hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            )}
          >
            {isParsing ? (
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
            <span className="hidden xs:inline">{isParsing ? 'Đang xử lý...' : 'Tải lên Word'}</span>
            <span className="xs:hidden">{isParsing ? '...' : 'Tải lên'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Output Area */}
        <div className="flex-1 flex flex-col bg-[#F3F4F6] overflow-hidden">
          {/* Output Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between px-3 sm:px-4 py-2 bg-white border-b border-[#E5E7EB] gap-2 sm:gap-3 shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              {/* View Mode */}
              <div className="flex bg-[#F3F4F6] p-1 rounded-lg shrink-0">
                <button
                  onClick={() => setViewMode('preview')}
                  className={cn(
                    "flex items-center gap-1.5 px-2 sm:px-3 py-1 text-[11px] sm:text-sm font-medium rounded-md transition-all",
                    viewMode === 'preview' 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-[#6B7280] hover:text-[#374151]"
                  )}
                >
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Xem</span>
                </button>
                <button
                  onClick={() => setViewMode('code')}
                  className={cn(
                    "flex items-center gap-1.5 px-2 sm:px-3 py-1 text-[11px] sm:text-sm font-medium rounded-md transition-all",
                    viewMode === 'code' 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-[#6B7280] hover:text-[#374151]"
                  )}
                >
                  <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Mã</span>
                </button>
              </div>

              <div className="hidden xs:block h-6 w-px bg-[#E5E7EB]" />

              {/* Conversion Mode */}
              <div className="flex bg-[#F3F4F6] p-1 rounded-lg shrink-0">
                <button
                  onClick={() => handleModeChange('structured')}
                  className={cn(
                    "px-2 sm:px-3 py-1 text-[11px] sm:text-sm font-medium rounded-md transition-all",
                    conversionMode === 'structured' 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-[#6B7280] hover:text-[#374151]"
                  )}
                  title="Giữ nguyên cấu trúc"
                >
                  Cấu trúc
                </button>
                <button
                  onClick={() => handleModeChange('plain')}
                  className={cn(
                    "px-2 sm:px-3 py-1 text-[11px] sm:text-sm font-medium rounded-md transition-all",
                    conversionMode === 'plain' 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-[#6B7280] hover:text-[#374151]"
                  )}
                  title="Chỉ thẻ P"
                >
                  Thẻ P
                </button>
              </div>

              <div className="hidden xs:block h-6 w-px bg-[#E5E7EB]" />

              {/* Style Dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 sm:px-3 py-1 text-[11px] sm:text-sm font-medium rounded-lg transition-all border shadow-sm",
                    applyTemplate 
                      ? "bg-white text-indigo-600 border-indigo-200" 
                      : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                  )}
                >
                  <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Giao diện</span>
                  <ChevronDown className={cn("w-3 h-3 transition-transform", isStyleMenuOpen && "rotate-180")} />
                </button>

                {isStyleMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsStyleMenuOpen(false)} 
                    />
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#E5E7EB] z-20 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2 border-b border-[#F3F4F6] flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Cấu hình</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={applyTemplate}
                            onChange={() => setApplyTemplate(!applyTemplate)}
                          />
                          <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                      
                      <div className="px-2 py-2">
                        <span className="px-2 py-1 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Chọn mẫu</span>
                        <div className="mt-1 space-y-1">
                          {templates.map((template) => (
                            <button
                              key={template.id}
                              disabled={!applyTemplate}
                              onClick={() => {
                                setSelectedStyleId(template.id);
                                setIsStyleMenuOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex flex-col gap-0.5",
                                !applyTemplate && "opacity-50 cursor-not-allowed",
                                selectedStyleId === template.id 
                                  ? "bg-indigo-50 text-indigo-700" 
                                  : "text-[#4B5563] hover:bg-[#F3F4F6]"
                              )}
                            >
                              <span className="font-semibold">{template.name}</span>
                              <span className="text-[10px] opacity-70 leading-tight">{template.description}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Scroll Top Toggle */}
              <button
                onClick={() => setShowScrollTop(!showScrollTop)}
                className={cn(
                  "flex items-center gap-1.5 px-2 sm:px-3 py-1 text-[11px] sm:text-sm font-medium rounded-lg transition-all border shadow-sm shrink-0",
                  showScrollTop 
                    ? "bg-indigo-50 text-indigo-600 border-indigo-200" 
                    : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                )}
                title="Cuộn lên đầu trang"
              >
                <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Lên đầu</span>
              </button>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 w-full md:w-auto border-t md:border-none pt-2 md:pt-0">
              {/* Device Preview (Hidden on mobile) */}
              {viewMode === 'preview' && output && (
                <div className="hidden sm:flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-lg shrink-0">
                  <button
                    onClick={() => setDeviceMode('desktop')}
                    className={cn(
                      "p-1 rounded-md transition-all",
                      deviceMode === 'desktop' ? "bg-white text-indigo-600 shadow-sm" : "text-[#6B7280]"
                    )}
                  >
                    <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => setDeviceMode('tablet')}
                    className={cn(
                      "p-1 rounded-md transition-all",
                      deviceMode === 'tablet' ? "bg-white text-indigo-600 shadow-sm" : "text-[#6B7280]"
                    )}
                  >
                    <Tablet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => setDeviceMode('mobile')}
                    className={cn(
                      "p-1 rounded-md transition-all",
                      deviceMode === 'mobile' ? "bg-white text-indigo-600 shadow-sm" : "text-[#6B7280]"
                    )}
                  >
                    <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              {output && (
                <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] sm:text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] rounded-lg transition-colors border border-[#E5E7EB] bg-white"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Tải về</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] sm:text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] rounded-lg transition-colors border border-[#E5E7EB] bg-white"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    <span>{copied ? 'Xong' : 'Chép'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-hidden p-3 sm:p-6 md:p-8 flex justify-center relative">
            {output ? (
              viewMode === 'preview' ? (
                <div 
                  className={cn(
                    "bg-white shadow-2xl rounded-xl overflow-hidden transition-all duration-300 border border-[#E5E7EB]",
                    deviceMode === 'desktop' && "w-full h-full",
                    deviceMode === 'tablet' && "w-full max-w-[768px] h-full",
                    deviceMode === 'mobile' && "w-full max-w-[375px] h-full"
                  )}
                >
                  <iframe
                    ref={previewRef}
                    className="w-full h-full border-none"
                    title="Preview"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-[#1E293B] rounded-xl overflow-hidden shadow-2xl border border-[#334155] flex flex-col">
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] border-b border-[#334155] shrink-0">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-mono text-[#94A3B8] ml-2 truncate max-w-[150px] sm:max-w-none">
                      {fileName || 'output.html'}
                    </span>
                  </div>
                  <pre className="p-3 sm:p-6 overflow-auto flex-1 text-[10px] sm:text-sm font-mono text-[#E2E8F0] leading-relaxed">
                    <code>{output}</code>
                  </pre>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center text-center max-w-md px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-sm mb-6 sm:mb-8 border border-[#E5E7EB]">
                  <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#111827] mb-3">Chuyển đổi Word sang HTML</h3>
                <p className="text-sm sm:text-base text-[#6B7280] mb-6 sm:mb-8">
                  Kéo và thả tệp Word (.docx) vào đây hoặc nhấn nút bên dưới để chuyển đổi trực tiếp sang mã HTML sạch.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white border border-[#E5E7EB] text-[#374151] rounded-xl font-semibold shadow-sm hover:bg-[#F9FAFB] transition-all flex items-center gap-2 text-sm sm:text-base"
                >
                  <Upload className="w-5 h-5" />
                  Chọn tệp từ máy tính
                </button>
                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-2 bg-white border-t border-[#E5E7EB] flex items-center justify-between shrink-0">
        <p className="text-[10px] text-[#9CA3AF]">© 2026 Word to HTML</p>
      </footer>
    </div>
  );
}
