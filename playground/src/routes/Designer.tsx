import React, { useRef, useEffect, useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { cloneDeep, Template, checkTemplate, Lang, isBlankPdf } from "@pdfme/common";
import { Designer } from "@pdfme/ui";
import {
  getFontsData,
  getTemplateById,
  getBlankTemplate,
  getPaperSizes,
  readFile,
  handleLoadTemplate,
  downloadJsonFile,
  translations,
} from "../helper";
import { getPlugins } from "../plugins";
import { FileText, PenTool, LogOut } from "lucide-react";

function DesignerApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const designerRef = useRef<HTMLDivElement | null>(null);
  const designer = useRef<Designer | null>(null);

  const [editingStaticSchemas, setEditingStaticSchemas] = useState(false);
  const [originalTemplate, setOriginalTemplate] = useState<Template | null>(null);
  const [paperSize, setPaperSize] = useState<string>("A4");

  const buildDesigner = useCallback(async () => {
    if (!designerRef.current) return;

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

      designer.current = new Designer({
        domContainer: designerRef.current,
        template,
        options: {
          font: getFontsData(),
          lang: "en",
          labels: {
            "signature.clear": "🗑️",
          },
          theme: {
            token: {
              colorPrimary: "#4f46e5",
              borderRadius: 8,
              fontFamily: 'Inter, system-ui, sans-serif',
            },
          },
          icons: {
            multiVariableText:
              '<svg fill="#000000" width="24px" height="24px" viewBox="0 0 24 24"><path d="M6.643,13.072,17.414,2.3a1.027,1.027,0,0,1,1.452,0L20.7,4.134a1.027,1.027,0,0,1,0,1.452L9.928,16.357,5,18ZM21,20H3a1,1,0,0,0,0,2H21a1,1,0,0,0,0-2Z"/></svg>',
          },
          maxZoom: 250,
        },
        plugins: getPlugins(),
      });

      designer.current.onSaveTemplate(onSaveTemplate);
    } catch (error) {
      localStorage.removeItem("template");
      console.error(error);
    }
  }, [searchParams, setSearchParams]);

  const onChangeBasePDF = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !designer.current) return;

    readFile(e.target.files[0], "dataURL").then((basePdf) => {
      const newTemplate = cloneDeep(designer.current!.getTemplate());
      newTemplate.basePdf = basePdf;
      designer.current!.updateTemplate(newTemplate);
    });
  };

  const onChangePaperSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!designer.current) return;

    const paperSizes = getPaperSizes();
    const sizeKey = e.target.value;
    const selectedSize = paperSizes[sizeKey as keyof typeof paperSizes];

    if (!selectedSize) return;

    const template = cloneDeep(designer.current.getTemplate());

    if (!isBlankPdf(template.basePdf)) {
      toast.error("Paper size can only be changed for blank PDFs");
      return;
    }

    template.basePdf.width = selectedSize.width;
    template.basePdf.height = selectedSize.height;
    designer.current.updateTemplate(template);
    setPaperSize(sizeKey);
    toast.success(`Paper size changed to ${sizeKey}`);
  };

  const onSaveTemplate = (template?: Template) => {
    if (!designer.current) return;

    localStorage.setItem(
      "template",
      JSON.stringify(template || designer.current.getTemplate())
    );
    toast.success("Saved on local storage");
  };

  const onResetTemplate = () => {
    localStorage.removeItem("template");
    designer.current?.updateTemplate(getBlankTemplate());
  };

  const onDownloadTemplate = () => {
    if (!designer.current) return;

    downloadJsonFile(designer.current.getTemplate(), "template");
    toast.success("Template downloaded");
  };

  const toggleEditingStaticSchemas = () => {
    if (!designer.current) return;

    if (!editingStaticSchemas) {
      const currentTemplate = cloneDeep(designer.current.getTemplate());

      if (!isBlankPdf(currentTemplate.basePdf)) {
        toast.error("Static schema can only be edited on blank PDFs");
        return;
      }

      setOriginalTemplate(currentTemplate);

      const { width, height } = currentTemplate.basePdf;
      const staticSchema = currentTemplate.basePdf.staticSchema || [];

      designer.current.updateTemplate({
        ...currentTemplate,
        schemas: [staticSchema],
        basePdf: { width, height, padding: [0, 0, 0, 0] },
      });

      setEditingStaticSchemas(true);
    } else {
      if (!originalTemplate) return;

      const editedTemplate = designer.current.getTemplate();
      const merged = cloneDeep(originalTemplate);

      if (!isBlankPdf(merged.basePdf)) return;

      merged.basePdf.staticSchema = editedTemplate.schemas[0];
      designer.current.updateTemplate(merged);

      setOriginalTemplate(null);
      setEditingStaticSchemas(false);
    }
  };

  useEffect(() => {
    if (designerRef.current) buildDesigner();
    return () => designer.current?.destroy();
  }, [buildDesigner]);


  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
      <header className="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <PenTool size={18} className="text-indigo-600" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-slate-800 font-heading leading-tight">Elite Realtor Template</h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Workspace / Designer</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-100/50 border border-slate-200 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Dimensions</span>
              <select
                value={paperSize}
                disabled={editingStaticSchemas}
                className="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer"
                onChange={(e) => {
                  setPaperSize(e.target.value);
                  onChangePaperSize(e);
                }}
              >
                {Object.entries(getPaperSizes()).map(([key]) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
            <div className="h-6 w-px bg-slate-200 mx-1" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-1">Language</span>
              <select
                className="bg-transparent text-[11px] font-bold text-slate-600 outline-none cursor-pointer"
                onChange={(e) => designer.current?.updateOptions({ lang: e.target.value as Lang })}
              >
                {translations.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-1" />

          <div className="flex items-center gap-2">
            <div className="relative group">
              <input
                type="file"
                accept="application/pdf"
                onChange={onChangeBasePDF}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-traqr-blue" title="Change Base PDF">
                <FileText size={18} />
              </button>
            </div>
            <button
              onClick={toggleEditingStaticSchemas}
              className={`p-2 rounded-lg transition-colors ${editingStaticSchemas ? 'bg-rose-50 text-rose-600' : 'text-slate-500 hover:text-traqr-blue hover:bg-slate-100'}`}
              title={editingStaticSchemas ? "Exit Layer Mode" : "Edit Static Layer"}
            >
              <PenTool size={18} />
            </button>
          </div>

          <button
            onClick={() => onSaveTemplate()}
            className="btn-premium px-5 py-2 text-xs bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm transition-all"
          >
            Sync to Cache
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-hidden p-6 bg-slate-100/50">
          <div
            ref={designerRef}
            className="w-full h-full rounded-2xl overflow-hidden shadow-premium border border-white"
          />
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-fit glass rounded-2xl shadow-premium border border-white/50 px-8 py-4 flex items-center gap-6 z-40">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <input
                type="file"
                accept="application/json"
                onChange={(e) => handleLoadTemplate(e, designer.current)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <button className="btn-premium px-4 py-2 text-xs font-bold text-slate-600 hover:text-traqr-blue flex items-center gap-2">
                <LogOut size={16} className="rotate-180" />
                Import JSON
              </button>
            </div>
            <button
              onClick={onResetTemplate}
              className="btn-premium px-4 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-2"
            >
              <LogOut size={16} />
              Wipe Canvas
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          <button
            onClick={onDownloadTemplate}
            className="btn-premium btn-primary px-8 py-2.5 text-sm rounded-xl flex items-center gap-2.5"
          >
            <FileText size={18} />
            Finalize & Download JSON
          </button>
        </div>
      </div>
    </div>
  );
}

export default DesignerApp;
