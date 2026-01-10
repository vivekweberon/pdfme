import { useRef, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Template, checkTemplate, getInputFromTemplate } from "@pdfme/common";
import { Form, Viewer } from "@pdfme/ui";
import {
  getFontsData,
  getTemplateById,
  getBlankTemplate,
  generateBulkFromFiles,
} from "../helper";
import { getPlugins } from '../plugins';
import {
  Database,
  Zap,
  CheckCircle2,
  PenTool,
  LayoutDashboard,
  FileText,
  Printer
} from "lucide-react";
import ExternalButton from "../components/ExternalButton";

type Mode = "form" | "viewer";

function GeneratorApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const uiRef = useRef<HTMLDivElement | null>(null);
  const ui = useRef<Form | Viewer | null>(null);

  const [mode, setMode] = useState<Mode>(
    (localStorage.getItem("mode") as Mode) ?? "form"
  );

  const [batchTemplate, setBatchTemplate] = useState<File | null>(null);
  const [batchCsv, setBatchCsv] = useState<File | null>(null);
  const [hasActiveTemplate, setHasActiveTemplate] = useState(false);
  const [lastBatchResult, setLastBatchResult] = useState<{ count: number, totalTime: number, msPerRecord: number, records: any[] } | null>(null);

  const buildUi = useCallback(async (mode: Mode) => {
    if (!uiRef.current) return;
    try {
      let template: Template = getBlankTemplate();
      const templateIdFromQuery = searchParams.get("template");
      searchParams.delete("template");
      setSearchParams(searchParams, { replace: true });
      const templateFromLocal = localStorage.getItem("template");

      if (templateIdFromQuery) {
        const templateJson = await getTemplateById(templateIdFromQuery);
        checkTemplate(templateJson);
        template = templateJson;

        if (!templateFromLocal) {
          localStorage.setItem("template", JSON.stringify(templateJson));
        }
      } else if (templateFromLocal) {
        const templateJson = JSON.parse(templateFromLocal) as Template;
        checkTemplate(templateJson);
        template = templateJson;
      }

      let inputs = getInputFromTemplate(template);
      const inputsString = localStorage.getItem("inputs");
      if (inputsString) {
        const inputsJson = JSON.parse(inputsString);
        inputs = inputsJson;
      }

      ui.current = new (mode === "form" ? Form : Viewer)({
        domContainer: uiRef.current,
        template,
        inputs,
        options: {
          font: getFontsData(),
          lang: 'en',
          labels: { 'signature.clear': '🗑️' },
          theme: {
            token: {
              colorPrimary: "#4f46e5",
              borderRadius: 8,
              fontFamily: 'Inter, system-ui, sans-serif',
            },
          },
        },
        plugins: getPlugins(),
      });

      const isActive = template.schemas.some(schema => Object.keys(schema).length > 0);
      setHasActiveTemplate(isActive);
    } catch {
      localStorage.removeItem("inputs");
      localStorage.removeItem("template");
      setHasActiveTemplate(false);
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    buildUi(mode);
    return () => {
      if (ui.current) {
        ui.current.destroy();
      }
    };
  }, [mode, buildUi]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-rose-50 rounded-lg">
            <Printer size={18} className="text-rose-600" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-slate-800 font-heading leading-tight">Document Production Hub</h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Workspace / Generator</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => { setMode('form'); buildUi('form'); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'form' ? 'bg-white text-traqr-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <PenTool size={14} />
              Editor Mode
            </button>
            <button
              onClick={() => { setMode('viewer'); buildUi('viewer'); }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'viewer' ? 'bg-white text-traqr-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Zap size={14} />
              Live Preview
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 h-full bg-white border-r border-slate-200 flex flex-col p-6 overflow-y-auto no-scrollbar gap-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
                <LayoutDashboard size={16} />
              </span>
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Batch Laboratory</h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">1. Choose Template</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => setBatchTemplate(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full py-2 px-3 border border-slate-200 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 ${batchTemplate ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}>
                    {batchTemplate ? <CheckCircle2 size={12} /> : <FileText size={12} />}
                    {batchTemplate ? batchTemplate.name : "Select template.json"}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">2. Choose Data (CSV)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setBatchCsv(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-full py-2 px-3 border border-slate-200 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 ${batchCsv ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 text-slate-500'}`}>
                    {batchCsv ? <CheckCircle2 size={12} /> : <Database size={12} />}
                    {batchCsv ? batchCsv.name : "Select data.csv"}
                  </div>
                </div>
              </div>

              <button
                disabled={!batchTemplate || !batchCsv}
                onClick={async () => {
                  if (batchTemplate && batchCsv) {
                    const result = await generateBulkFromFiles(ui.current, batchTemplate, batchCsv);
                    if (result) {
                      setLastBatchResult({
                        count: result.count || 0,
                        totalTime: result.totalTime || 0,
                        msPerRecord: result.msPerRecord || 0,
                        records: result.records || []
                      });
                    }
                  }
                }}
                className={`w-full py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ${batchTemplate && batchCsv
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
              >
                <Zap size={14} />
                Run Batch Production
              </button>
            </div>
          </section>

          <div className="h-px bg-slate-100" />

          <div className="mt-auto">
            <ExternalButton
              href="https://github.com/pdfme/pdfme/issues/new"
              title="Technical Support"
            />
          </div>
        </aside>

        <main className="flex-1 overflow-hidden p-8 bg-slate-50/50 relative">
          <div className="w-full h-full glass rounded-3xl overflow-hidden shadow-premium border border-white flex flex-col relative">
            <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-white/50 backdrop-blur-md border border-white/50 rounded-lg shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Instance: Live Rendering</span>
            </div>

            <div ref={uiRef} className="flex-1 w-full h-full" />

            {!hasActiveTemplate && (
              <div className="absolute inset-0 z-20 bg-slate-50/95 backdrop-blur-md flex flex-col p-8 overflow-hidden">
                <div className="relative z-30 flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 font-heading">Production Intelligence</h2>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tighter">Real-time Batch Performance & Data Analysis</p>
                    </div>

                    <div className="flex gap-4">
                      <div className="px-5 py-3 bg-white/50 border border-white rounded-2xl shadow-sm min-w-[140px]">
                        <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Assets</div>
                        <div className="text-2xl font-black text-traqr-blue leading-none">{lastBatchResult?.count || 0}</div>
                      </div>
                      <div className="px-5 py-3 bg-white/50 border border-white rounded-2xl shadow-sm min-w-[140px]">
                        <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Execution Velocity</div>
                        <div className="text-2xl font-black text-emerald-600 leading-none">{lastBatchResult?.totalTime ? `${(lastBatchResult.totalTime / 1000).toFixed(2)}s` : '0s'}</div>
                        {lastBatchResult?.msPerRecord && <div className="text-[10px] font-bold text-emerald-500 mt-1">{lastBatchResult.msPerRecord}ms / asset</div>}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 bg-white/40 border border-white/60 rounded-3xl overflow-hidden flex flex-col shadow-inner">
                    <div className="px-6 py-4 border-b border-slate-100 bg-white/30 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Database size={12} className="text-traqr-blue" />
                        Active Data Stream
                      </span>
                      {lastBatchResult && <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold italic">Source: Local CSV</span>}
                    </div>

                    <div className="flex-1 overflow-auto no-scrollbar">
                      {lastBatchResult ? (
                        <table className="w-full text-left border-collapse">
                          <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10">
                            <tr>
                              {Object.keys(lastBatchResult.records[0] || {}).map(header => (
                                <th key={header} className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {lastBatchResult.records.slice(0, 50).map((record, i) => (
                              <tr key={i} className="group hover:bg-white/50 transition-colors">
                                {Object.values(record).map((val: any, j) => (
                                  <td key={j} className="px-6 py-3 text-xs text-slate-600 font-medium border-b border-slate-50/50 max-w-[200px] truncate">{String(val)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 opacity-40">
                          <LayoutDashboard size={48} className="text-slate-300 mb-4" />
                          <p className="text-sm font-bold text-slate-500">Awaiting Batch Execution...</p>
                          <p className="text-[11px] text-slate-400 max-w-xs mt-2">Initialize your production using the Batch Laboratory in the sidebar to stream metrics and validation data.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-emerald-500" /> System: Stable</span>
                      <span className="flex items-center gap-1"><Zap size={10} className="text-amber-500" /> IO: High-Speed</span>
                    </div>
                    <p>TraQR Pro Production Intelligence v1.2</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default GeneratorApp;
