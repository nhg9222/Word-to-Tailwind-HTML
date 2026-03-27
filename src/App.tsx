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
  const [showScrollTop, setShowScrollTop] = useState(true);
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

  const getScrollTopHtml = () => {
    if (!showScrollTop) return '';
    return `
      <button id="scrollTopBtn" title="Cuộn lên đầu trang" style="display: none; position: fixed; bottom: 30px; right: 30px; z-index: 99; border: none; outline: none; background-color: #4f46e5; color: white; cursor: pointer; width: 48px; height: 48px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: all 0.3s ease; display: flex; align-items: center; justify-content: center;">
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

  const handleCopy = () => {
    const currentTemplate = templates.find(t => t.id === selectedStyleId) || templates[0];
    const fullHtmlForCopy = `
<div class="${currentTemplate.containerClass}">
  ${currentTemplate.header(fileName?.replace('.docx', '') || '')}
  <div class="prose prose-indigo max-w-none">
    ${output}
  </div>
  ${currentTemplate.footer()}
  ${getScrollTopHtml()}
</div>`;
    navigator.clipboard.writeText(fullHtmlForCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const currentTemplate = templates.find(t => t.id === selectedStyleId) || templates[0];
    const fullHtml = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${fileName?.replace('.docx', '') || 'Converted Document'}</title>
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
        #scrollTopBtn:hover { transform: translateY(-3px); background-color: #4338ca !important; }
    </style>
</head>
<body>
    <div class="${currentTemplate.containerClass}">
        ${currentTemplate.header(fileName?.replace('.docx', '') || '')}
        <div class="prose prose-indigo max-w-none">
            ${output}
        </div>
        ${currentTemplate.footer()}
        ${getScrollTopHtml()}
    </div>
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

  // Update iframe content when output or style changes
  useEffect(() => {
    if (previewRef.current && output) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
        const currentTemplate = templates.find(t => t.id === selectedStyleId) || templates[0];
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
              <style>
                body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
                body::-webkit-scrollbar { display: none; }
                body { -ms-overflow-style: none; scrollbar-width: none; }
                #scrollTopBtn:hover { transform: translateY(-3px); background-color: #4338ca !important; }
              </style>
            </head>
            <body>
              <div class="${currentTemplate.containerClass}">
                ${currentTemplate.header(fileName?.replace('.docx', '') || '')}
                <div id="content" class="prose prose-indigo max-w-none">
                  ${output}
                </div>
                ${currentTemplate.footer()}
                ${getScrollTopHtml()}
              </div>
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [output, viewMode, selectedStyleId, fileName, showScrollTop]);

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

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E5E7EB] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FileCode className="text-white w-5 h-5" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight">Word to Tailwind HTML</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {output && (
            <button 
              onClick={handleReset}
              className="p-2 text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors"
              title="Xóa tất cả"
            >
              <Trash2 className="w-5 h-5" />
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
              "flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium transition-all",
              "hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            )}
          >
            {isParsing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isParsing ? 'Đang xử lý...' : 'Tải lên Word (.docx)'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Output Area */}
        <div className="flex-1 flex flex-col bg-[#F3F4F6]">
          {/* Output Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-[#E5E7EB]">
            <div className="flex items-center gap-4">
              <div className="flex bg-[#F3F4F6] p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('preview')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                    viewMode === 'preview' 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-[#6B7280] hover:text-[#374151]"
                  )}
                >
                  <Eye className="w-4 h-4" />
                  Xem trước
                </button>
                <button
                  onClick={() => setViewMode('code')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                    viewMode === 'code' 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-[#6B7280] hover:text-[#374151]"
                  )}
                >
                  <Code className="w-4 h-4" />
                  Mã nguồn
                </button>
              </div>

              <div className="h-6 w-px bg-[#E5E7EB]" />

              <div className="flex bg-[#F3F4F6] p-1 rounded-lg">
                <button
                  onClick={() => handleModeChange('structured')}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                    conversionMode === 'structured' 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-[#6B7280] hover:text-[#374151]"
                  )}
                  title="Giữ nguyên cấu trúc (Tiêu đề, Danh sách...)"
                >
                  Cấu trúc
                </button>
                <button
                  onClick={() => handleModeChange('plain')}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                    conversionMode === 'plain' 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-[#6B7280] hover:text-[#374151]"
                  )}
                  title="Chỉ lấy các thẻ <p>"
                >
                  Chỉ thẻ P
                </button>
              </div>

              <div className="h-6 w-px bg-[#E5E7EB]" />

              <div className="flex bg-[#F3F4F6] p-1 rounded-lg">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedStyleId(template.id)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                      selectedStyleId === template.id 
                        ? "bg-white text-indigo-600 shadow-sm" 
                        : "text-[#6B7280] hover:text-[#374151]"
                    )}
                    title={template.description}
                  >
                    {template.name}
                  </button>
                ))}
              </div>

              <div className="h-6 w-px bg-[#E5E7EB]" />

              <button
                onClick={() => setShowScrollTop(!showScrollTop)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all border",
                  showScrollTop 
                    ? "bg-indigo-50 text-indigo-600 border-indigo-200" 
                    : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]"
                )}
                title="Bật/Tắt nút cuộn lên đầu trang"
              >
                <ArrowUp className="w-4 h-4" />
                Lên đầu trang
              </button>
            </div>

            {viewMode === 'preview' && output && (
              <div className="flex items-center gap-1 bg-[#F3F4F6] p-1 rounded-lg">
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    deviceMode === 'desktop' ? "bg-white text-indigo-600 shadow-sm" : "text-[#6B7280]"
                  )}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeviceMode('tablet')}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    deviceMode === 'tablet' ? "bg-white text-indigo-600 shadow-sm" : "text-[#6B7280]"
                  )}
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeviceMode('mobile')}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    deviceMode === 'mobile' ? "bg-white text-indigo-600 shadow-sm" : "text-[#6B7280]"
                  )}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            )}

            {output && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] rounded-lg transition-colors border border-[#E5E7EB]"
                >
                  <Download className="w-4 h-4" />
                  Tải về .html
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] rounded-lg transition-colors border border-[#E5E7EB]"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Đã sao chép' : 'Sao chép mã'}
                </button>
              </div>
            )}
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-hidden p-8 flex justify-center relative">
            {output ? (
              viewMode === 'preview' ? (
                <div 
                  className={cn(
                    "bg-white shadow-2xl rounded-xl overflow-hidden transition-all duration-300 border border-[#E5E7EB]",
                    deviceMode === 'desktop' && "w-full h-full",
                    deviceMode === 'tablet' && "w-[768px] h-full",
                    deviceMode === 'mobile' && "w-[375px] h-full"
                  )}
                >
                  <iframe
                    ref={previewRef}
                    className="w-full h-full border-none"
                    title="Preview"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-[#1E293B] rounded-xl overflow-hidden shadow-2xl border border-[#334155]">
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] border-b border-[#334155]">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                      <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                      <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
                    </div>
                    <span className="text-xs font-mono text-[#94A3B8] ml-2">{fileName || 'output.html'}</span>
                  </div>
                  <pre className="p-6 overflow-auto h-[calc(100%-40px)] text-sm font-mono text-[#E2E8F0] leading-relaxed">
                    <code>{output}</code>
                  </pre>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center text-center max-w-md">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-8 border border-[#E5E7EB]">
                  <Upload className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-[#111827] mb-3">Chuyển đổi Word sang HTML</h3>
                <p className="text-[#6B7280] mb-8">
                  Kéo và thả tệp Word (.docx) vào đây hoặc nhấn nút bên dưới để chuyển đổi trực tiếp sang mã HTML sạch.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-white border border-[#E5E7EB] text-[#374151] rounded-xl font-semibold shadow-sm hover:bg-[#F9FAFB] transition-all flex items-center gap-2"
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
      <footer className="px-6 py-3 bg-white border-t border-[#E5E7EB] flex items-center justify-between shrink-0">

      </footer>
    </div>
  );
}
