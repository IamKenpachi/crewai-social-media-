import React from 'react';
import { X, History, Trash2, ArrowUpRight, Sparkles, Clock, Film, Layers } from 'lucide-react';
import { SavedProject, MediaPackageOutput } from '../types';

interface ProjectHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedProjects: SavedProject[];
  onLoadProject: (project: SavedProject) => void;
  onDeleteProject: (projectId: string) => void;
  onSaveCurrentBundle: () => void;
  hasCurrentBundle: boolean;
}

export const ProjectHistoryModal: React.FC<ProjectHistoryModalProps> = ({
  isOpen,
  onClose,
  savedProjects,
  onLoadProject,
  onDeleteProject,
  onSaveCurrentBundle,
  hasCurrentBundle
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-700/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Project History &amp; Saved Runs</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {savedProjects.length} saved production {savedProjects.length === 1 ? 'manifest' : 'manifests'} in local memory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasCurrentBundle && (
              <button
                onClick={onSaveCurrentBundle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save Active Run</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="flex flex-col gap-3 max-h-[440px] overflow-y-auto pr-1">
          {savedProjects.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
              <Film className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2.5" />
              <span className="font-semibold text-slate-600 dark:text-slate-400">No saved projects yet</span>
              <span className="text-[11px] text-slate-400 mt-1">
                Run the CrewAI pipeline and click "Save Active Run" to snapshot your output deliverables here.
              </span>
            </div>
          ) : (
            savedProjects.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-900 border border-slate-300 dark:border-slate-700 shrink-0">
                    <img
                      src={p.thumbnailUrl || p.bundle.thumbnail_metadata?.thumbnail_url || ''}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-black/80 text-[8px] font-mono font-bold text-amber-300">
                      ★ {p.viralityScore}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {p.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <Clock className="w-3 h-3" />
                        {new Date(p.savedAt).toLocaleDateString()} {new Date(p.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-semibold border border-blue-200 dark:border-blue-800">
                        {p.model}
                      </span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                        {p.bundle.clips?.length || 3} Clips
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onLoadProject(p);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <span>Load</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteProject(p.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer"
                    title="Delete saved run"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
