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
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  Upload,
  FileCode
} from 'lucide-react';
import { cn } from './lib/utils';

type ViewMode = 'preview' | 'code';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export default function App() {
  const [output, setOutput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const previewRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      setError('Vui lòng chọn tệp Word (.docx)');
      return;
    }

    setIsParsing(true);
    setError(null);
    setFileName(file.name);

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Convert to HTML directly using mammoth
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setOutput(result.value);
      setViewMode('preview');
    } catch (err) {
      console.error(err);
      setError('Không thể chuyển đổi tệp Word. Vui lòng thử lại.');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setOutput('');
    setFileName(null);
    setError(null);
  };

  // Update iframe content when output changes
  useEffect(() => {
    if (previewRef.current && output) {
      const doc = previewRef.current.contentDocument;
      if (doc) {
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
                body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
                /* Hide scrollbar for Chrome, Safari and Opera */
                body::-webkit-scrollbar { display: none; }
                /* Hide scrollbar for IE, Edge and Firefox */
                body { -ms-overflow-style: none; scrollbar-width: none; }
              </style>
            </head>
            <body class="bg-white p-8 sm:p-12 md:p-16">
              <div id="content" class="prose prose-indigo max-w-none mx-auto">
                ${output}
              </div>
            </body>
          </html>
        `);
        doc.close();
      }
    }
  }, [output, viewMode]);

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] text-[#111827]">
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
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#374151] hover:bg-[#F3F4F6] rounded-lg transition-colors border border-[#E5E7EB]"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Đã sao chép' : 'Sao chép mã'}
              </button>
            )}
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-hidden p-8 flex justify-center">
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
                  Tải lên tệp Word (.docx) của bạn để chuyển đổi trực tiếp sang mã HTML sạch với phong cách Tailwind CSS hiện đại.
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
        <div className="flex items-center gap-4 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            Direct Code Conversion
          </span>
          <span className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            Tailwind Typography
          </span>
        </div>
        <div className="text-xs text-[#9CA3AF]">
          © 2026 Word to HTML Converter
        </div>
      </footer>
    </div>
  );
}
