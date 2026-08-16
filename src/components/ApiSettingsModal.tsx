import React, { useState } from 'react';
import { 
  KeyRound, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Zap, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  speed: 'Ultra Fast' | 'Fast' | 'Deep Reasoning';
  contextWindow: string;
  isDefault?: boolean;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    badge: 'Recommended',
    description: 'Next-gen multimodal model with hybrid reasoning, sub-second latency & video perception.',
    speed: 'Ultra Fast',
    contextWindow: '1M tokens',
    isDefault: true,
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    badge: 'High Throughput',
    description: 'Optimized high-throughput multimodal intelligence for batch creative processing.',
    speed: 'Ultra Fast',
    contextWindow: '1M tokens',
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    badge: 'Balanced',
    description: 'Solid workhorse model with high accuracy and fast token delivery.',
    speed: 'Fast',
    contextWindow: '1M tokens',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.5 Flash Lite',
    badge: 'Ultra Lightweight',
    description: 'Lowest latency & compute footprint for rapid hook extraction & text generation.',
    speed: 'Ultra Fast',
    contextWindow: '1M tokens',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    badge: 'Deep Reasoning',
    description: 'Maximum cognitive power for deep narrative critique, SEO keyword mapping & complex reasoning.',
    speed: 'Deep Reasoning',
    contextWindow: '2M tokens',
  },
];

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  selectedModel,
  onSelectModel,
}) => {
  const [tempKey, setTempKey] = useState<string>(apiKey);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  if (!isOpen) return null;

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationResult({ status: 'idle', message: '' });

    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: tempKey.trim(),
          model: selectedModel,
        }),
      });

      const data = await response.json();
      const modelDisplayName = AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || data.displayName || data.model || selectedModel;
      if (data.success) {
        setValidationResult({
          status: 'success',
          message: data.message || `Successfully authenticated and connected with ${modelDisplayName}!`,
        });
        onSaveApiKey(tempKey.trim());
      } else {
        setValidationResult({
          status: 'error',
          message: data.error || `Authentication failed for ${modelDisplayName}. Please check your API key.`,
        });
      }
    } catch (err: any) {
      setValidationResult({
        status: 'error',
        message: err?.message || 'Network error while contacting validation endpoint.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveAndClose = () => {
    onSaveApiKey(tempKey.trim());
    onClose();
  };

  const handleClearKey = () => {
    setTempKey('');
    onSaveApiKey('');
    setValidationResult({
      status: 'idle',
      message: 'Custom key cleared. Default environment key / sandbox mode active.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="api-settings-modal"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>AI Parameters &amp; API Key</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                  Gemini Models
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure your Gemini API key and select cognitive reasoning models.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-6">
          
          {/* Section 1: API Key Input */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="gemini-api-key-input" className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Google Gemini API Key</span>
              </label>
              {tempKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="text-[11px] text-slate-400 hover:text-rose-500 font-medium cursor-pointer transition-colors"
                >
                  Clear Key
                </button>
              )}
            </div>

            <div className="relative">
              <input
                id="gemini-api-key-input"
                type={showKey ? 'text' : 'password'}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="AIzaSy... (leave blank to use server environment key)"
                className="w-full pl-3.5 pr-20 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 font-mono focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Key is sent securely to server-side endpoints for execution.
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1"
              >
                <span>Get API Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Section 2: Model Selection Dropdown & Cards */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <label htmlFor="gemini-model-select" className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Primary Agent Model Selection</span>
              </label>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono font-bold">
                {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || 'Gemini 3.7 Flash'}
              </span>
            </div>

            {/* Native Select for standard quick switching */}
            <select
              id="gemini-model-select"
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer transition-all"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} — {model.badge} ({model.speed})
                </option>
              ))}
            </select>

            {/* Visual Model Cards Grid */}
            <div className="grid grid-cols-1 gap-2 mt-1">
              {AVAILABLE_MODELS.map((model) => {
                const isSelected = selectedModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => onSelectModel(model.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-900/30 border-blue-600 dark:border-blue-500 shadow-2xs ring-1 ring-blue-600'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{model.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {model.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          {model.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1 text-[10px] font-mono text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{model.speed}</span>
                      <span>{model.contextWindow}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation Feedback Banner */}
          {validationResult.status !== 'idle' && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              validationResult.status === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}>
              {validationResult.status === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-bold block">
                  {validationResult.status === 'success' ? 'Validation Successful' : 'Validation Notice'}
                </span>
                <span className="text-[11px] leading-relaxed block mt-0.5">
                  {validationResult.message}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={handleValidate}
            disabled={isValidating}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs transition-all cursor-pointer"
          >
            {isValidating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                <span>Testing Connection...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Test Key &amp; Model</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save &amp; Apply</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
