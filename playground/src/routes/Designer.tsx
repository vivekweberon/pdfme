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
  generatePDF,
  generateBulkPDF,
  downloadJsonFile,
  translations,
} from "../helper";
import { getPlugins } from "../plugins";
import { NavBar, NavItem } from "../components/NavBar";
import ExternalButton from "../components/ExternalButton";



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

  /* =======================
     Handlers
     ======================= */

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

  /* =======================
     NavBar Items
     ======================= */



  const navItems: NavItem[] = [
    {
      label: "Paper Size",
      content: (
        <select
          value={paperSize}
          disabled={editingStaticSchemas}
          className="w-full border rounded px-2 py-1"
          onChange={(e) => {
            setPaperSize(e.target.value);
            onChangePaperSize(e);
          }}
        >
          {Object.entries(getPaperSizes()).map(([key, size]) => (
            <option key={key} value={key}>
              {key} ({size.width}×{size.height})
            </option>
          ))}
        </select>
      ),
    },
    {
      label: "Lang",
      content: (
        <select
          className="w-full border rounded px-2 py-1"
          onChange={(e) =>
            designer.current?.updateOptions({ lang: e.target.value as Lang })
          }
        >
          {translations.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      ),
    },
    {
      label: "Change BasePDF",
      content: (
        <input type="file" accept="application/pdf" onChange={onChangeBasePDF} />
      ),
    },
    {
      label: "Structure",
      content: (
        <button
          onClick={toggleEditingStaticSchemas}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95 ${editingStaticSchemas ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
        >
          {editingStaticSchemas ? "Stop Editing Static" : "Edit Background"}
        </button>
      ),
    },
    {
      label: "Open Template",
      content: (
        <input
          type="file"
          accept="application/json"
          onChange={(e) => handleLoadTemplate(e, designer.current)}
          className="w-full text-sm border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg transition-all"
        />
      ),
    },
    {
      label: "Bulk Create (CSV)",
      content: (
        <input
          type="file"
          accept="text/csv"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              generateBulkPDF(designer.current, e.target.files[0]);
            }
          }}
          className="w-full text-sm border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg transition-all"
        />
      ),
    },
    {
      label: "History",
      content: (
        <div className="flex gap-2">
          <button
            onClick={() => onSaveTemplate()}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            Save
          </button>
          <button
            onClick={onResetTemplate}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            Reset
          </button>
        </div>
      ),
    },
    {
      label: "Actions",
      content: (
        <div className="flex gap-2">
          <button
            onClick={onDownloadTemplate}
            className="px-4 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Template
          </button>
          <button
            onClick={() => generatePDF(designer.current)}
            className="px-4 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Generate PDF
          </button>
        </div>
      ),
    },
    {
      label: "",
      content: (
        <ExternalButton
          href="https://github.com/pdfme/pdfme/issues/new"
          title="Feedback this template"
        />
      ),
    },
  ];

  return (
    <>
      <NavBar items={navItems} />
      <div ref={designerRef} className="flex-1 w-full" />
    </>
  );
}

export default DesignerApp;
