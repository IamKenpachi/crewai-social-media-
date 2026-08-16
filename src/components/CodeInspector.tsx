import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  FileText, 
  Layers, 
  Terminal, 
  ShieldCheck, 
  Sparkles,
  Download
} from 'lucide-react';
import { CREWAI_CODE_SNIPPETS } from '../data/codeSnippets';

export const CodeInspector: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('main.py');
  const [copied, setCopied] = useState<boolean>(false);

  const currentSnippet = CREWAI_CODE_SNIPPETS.find((f) => f.filename === selectedFile) || CREWAI_CODE_SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const element = document.createElement('a');
    const file = new Blob([currentSnippet.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = currentSnippet.filename;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <div id="code-inspector-root" className="w-full flex flex-col gap-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                CrewAI Production Blueprint
              </span>
              <span className="text-xs text-slate-400 font-mono font-medium">Python 3.11+ • Pydantic v2</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Production Python Source Files
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Inspect the exact Python files ready to drop directly into your production CrewAI deployment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
              <span>{copied ? 'Copied to Clipboard' : `Copy ${selectedFile}`}</span>
            </button>

            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Viewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left File Tree Selector */}
        <div className="lg:col-span-3 flex flex-col gap-2">
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2 shadow-xs">
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Project File Tree</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {CREWAI_CODE_SNIPPETS.map((file) => (
              <button
                key={file.filename}
                onClick={() => setSelectedFile(file.filename)}
                className={`flex flex-col p-3 rounded-xl text-left border transition-all cursor-pointer ${
                  selectedFile === file.filename
                    ? 'bg-blue-50/80 dark:bg-blue-900/30 border-blue-600 dark:border-blue-500 text-blue-950 dark:text-blue-300 shadow-xs ring-1 ring-blue-600 font-medium'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-200">{file.filename}</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                    {file.language}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  {file.description}
                </span>
              </button>
            ))}
          </div>

          {/* Pip install quick pill */}
          <div className="mt-2 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
            <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider block mb-1.5">Quick Install:</span>
            <code className="text-emerald-400 font-mono text-[11px] block bg-slate-900 dark:bg-slate-950 p-2.5 rounded-lg break-all border border-slate-800">
              pip install crewai google-genai pydantic pillow moviepy ffmpeg-python
            </code>
          </div>
        </div>

        {/* Right Code Container */}
        <div className="lg:col-span-9 flex flex-col gap-3">
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-mono font-bold text-slate-900 dark:text-white">{currentSnippet.filename}</span>
              <span className="text-slate-500 dark:text-slate-400">— {currentSnippet.description}</span>
            </div>
            <span className="text-slate-400 font-mono text-[11px] font-bold">
              {currentSnippet.code.split('\n').length} lines
            </span>
          </div>

          <div className="relative rounded-2xl bg-slate-900 dark:bg-slate-950 border border-slate-800 overflow-hidden shadow-sm">
            <pre className="p-5 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed max-h-[600px] selection:bg-blue-600 selection:text-white">
              <code>{currentSnippet.code}</code>
            </pre>
          </div>
        </div>

      </div>

    </div>
  );
};
