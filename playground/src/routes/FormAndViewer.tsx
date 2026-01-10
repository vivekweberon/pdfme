import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { Template, checkTemplate, getInputFromTemplate, Lang } from "@pdfme/common";
import { Form, Viewer } from "@pdfme/ui";
import {
  getFontsData,
  getTemplateById,
  getBlankTemplate,
  handleLoadTemplate,
  generatePDF,
  generateBulkPDF,
  isJsonString,
  translations,
} from "../helper";
import { getPlugins } from '../plugins';
import { NavItem, NavBar } from "../components/NavBar";
import ExternalButton from "../components/ExternalButton";

type Mode = "form" | "viewer";


function FormAndViewerApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const uiRef = useRef<HTMLDivElement | null>(null);
  const ui = useRef<Form | Viewer | null>(null);

  const [mode, setMode] = useState<Mode>(
    (localStorage.getItem("mode") as Mode) ?? "form"
  );

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
    } catch {
      localStorage.removeItem("inputs");
      localStorage.removeItem("template");
    }
  }, [searchParams, setSearchParams]);

  const onChangeMode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as Mode;
    setMode(value);
    localStorage.setItem("mode", value);
    buildUi(value);
  };

  const onGetInputs = () => {
    if (ui.current) {
      const inputs = ui.current.getInputs();
      toast.info("Dumped as console.log");
      console.log(inputs);
    }
  };

  const onSetInputs = () => {
    if (ui.current) {
      const prompt = window.prompt("Enter Inputs JSONString") || "";
      try {
        const json = isJsonString(prompt) ? JSON.parse(prompt) : [{}];
        ui.current.setInputs(json);
      } catch (e) {
        alert(e);
      }
    }
  };

  const onSaveInputs = () => {
    if (ui.current) {
      const inputs = ui.current.getInputs();
      localStorage.setItem("inputs", JSON.stringify(inputs));
      toast.success("Saved on local storage");
    }
  };

  const onResetInputs = () => {
    localStorage.removeItem("inputs");
    if (ui.current) {
      const template = ui.current.getTemplate();
      ui.current.setInputs(getInputFromTemplate(template));
    }
  };

  useEffect(() => {
    buildUi(mode);
    return () => {
      if (ui.current) {
        ui.current.destroy();
      }
    };
  }, [mode, uiRef, buildUi]);

  const navItems: NavItem[] = [
    {
      label: "Lang",
      content: (
        <select
          className="w-full border rounded px-2 py-1"
          onChange={(e) => {
            ui.current?.updateOptions({ lang: e.target.value as Lang });
          }}
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
      label: "Controls",
      content: (
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <label className={`flex items-center px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${mode === 'form' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <input
              type="radio"
              onChange={onChangeMode}
              value="form"
              checked={mode === "form"}
              className="hidden"
            />
            Form
          </label>
          <label className={`flex items-center px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${mode === 'viewer' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <input
              type="radio"
              onChange={onChangeMode}
              value="viewer"
              checked={mode === "viewer"}
              className="hidden"
            />
            Viewer
          </label>
        </div>
      ),
    },
    {
      label: "Open Template",
      content: (
        <input
          type="file"
          accept="application/json"
          onChange={(e) => handleLoadTemplate(e, ui.current)}
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
              generateBulkPDF(ui.current, e.target.files[0]);
            }
          }}
          className="w-full text-sm border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg transition-all"
        />
      ),
    },
    {
      label: "Input Data",
      content: (
        <div className="flex gap-2">
          <button
            onClick={onGetInputs}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            Get Inputs
          </button>
          <button
            onClick={onSetInputs}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            Set Inputs
          </button>
        </div>
      ),
    },
    {
      label: "Save/Reset",
      content: (
        <div className="flex gap-2">
          <button
            onClick={onSaveInputs}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            Save
          </button>
          <button
            onClick={onResetInputs}
            className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            Reset
          </button>
        </div>
      ),
    },
    {
      label: "Action",
      content: (
        <button
          onClick={async () => {
            const startTimer = performance.now();
            await generatePDF(ui.current);
            const endTimer = performance.now();
            toast.info(`Generated PDF in ${Math.round(endTimer - startTimer)}ms ⚡️`);
          }}
          className="px-6 py-1.5 text-xs font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 active:scale-95 flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white/90">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          Generate PDF
        </button>
      ),
    },
    {
      label: "Feedback",
      content: React.createElement(ExternalButton, {
        href: "https://github.com/pdfme/pdfme/issues/new?template=template_feedback.yml&title=TEMPLATE_NAME",
        title: "Feedback"
      })
    }
  ];

  return (
    <>
      <NavBar items={navItems} />
      <div ref={uiRef} className="flex-1 w-full" />
    </>
  );
}

export default FormAndViewerApp;
