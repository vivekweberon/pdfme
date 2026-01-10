import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCopy } from 'lucide-react';
import { toast } from 'react-toastify';
import { fromKebabCase } from "../helper";
import ExternalButton from "../components/ExternalButton";

declare global {
  interface Window {
    ethicalads?: {
      load: () => void;
      wait?: Promise<unknown>;
    };
  }
}

type TemplateData = {
  name: string;
  author: string;
};

type UIType = 'designer' | 'form-viewer';

// Constants
const DEVIN_AI_AUTHOR = "Devin AI";
const DEVIN_INVITE_URL = "https://app.devin.ai/invite/KyOTXVPrlFl2TjcT";

const CopyButton = ({ ui, name }: { ui: UIType, name: string }) => {
  const handleCopy = async () => {
    const shareableUrl = `https://pdfme.com/template-design?ui=${ui}&template=${name}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareableUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareableUrl;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        if (!document.execCommand("copy")) {
          throw new Error("Fallback: Copying text command was unsuccessful");
        }
        document.body.removeChild(textArea);
      }
      toast.info(`Copied shareable link to clipboard - "${fromKebabCase(name)}"`);
    } catch (error) {
      toast.error("Failed to copy shareable link");
      console.error("Copy failed:", error);
    }
  };

  return (
    <button
      className="rounded-md border border-transparent bg-gray-100 p-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
      onClick={handleCopy}
      aria-label="Copy shareable link"
    >
      <ClipboardCopy size={20} />
    </button>
  );
};

// Contribution card component
const ContributionCard = () => (
  <div className="flex items-center justify-center">
    <div className="relative border-2 border-green-300 rounded-lg p-6 bg-green-50 shadow-md">
      <div className="relative mt-4">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://pdfme.com/docs/template-contribution-guide"
          className="text-md font-extrabold text-green-700 underline decoration-green-400 hover:text-green-600 hover:decoration-green-500 transition duration-300"
        >
          Contribute Your Template ❤️
        </a>
        <p className="mt-2 text-sm text-green-800 flex items-center gap-2 font-medium">
          Share the templates you've created! Contributing your templates is extremely beneficial for other users.
        </p>
      </div>
      <div className="mt-6">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://pdfme.com/docs/template-contribution-guide"
          className="w-full relative flex items-center justify-center rounded-md bg-gradient-to-r from-green-400 to-green-600 px-8 py-3 text-sm font-semibold text-white hover:opacity-90 transition duration-300"
        >
          See Contribution Guide
        </a>
      </div>
    </div>
  </div>
);


// Author link component to avoid duplication
const AuthorLink = ({ author }: { author: string }) => {
  if (author === DEVIN_AI_AUTHOR) {
    return (
      <a
        href={DEVIN_INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline text-md font-bold hover:text-blue-400 transition duration-300"
      >
        {author}
      </a>
    );
  }

  return (
    <a
      href={`https://github.com/${author}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline text-md font-bold hover:text-blue-400 transition duration-300"
    >
      {author}
    </a>
  );
};

function TemplatesApp({ isEmbedded }: { isEmbedded: boolean }) {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<TemplateData[]>([]);
  const [avatarUrlMap, setAvatarUrlMap] = useState<{ [key: string]: string }>({});

  // Fetch templates and author avatars
  useEffect(() => {
    fetch('/template-assets/index.json')
      .then((response) => response.json())
      .then((data: TemplateData[]) => {
        setTemplates(data);

        const authors = new Set(data.map(({ author }) => author));
        const avatarUrlMap: { [key: string]: string } = {};

        Promise.all(
          Array.from(authors).map((author) => {
            if (author === DEVIN_AI_AUTHOR) {
              avatarUrlMap[author] = "/imgs/devin.svg";
              return Promise.resolve();
            } else {
              return fetch(`https://api.github.com/users/${author}`)
                .then((res) => res.json())
                .then((ghData) => {
                  avatarUrlMap[author] = ghData.avatar_url;
                });
            }
          })
        ).then(() => {
          setAvatarUrlMap(avatarUrlMap);
        });
      });
  }, []);

  // Load ethical ads
  useEffect(() => {
    if (window.ethicalads && typeof window.ethicalads.load === "function") {
      window.ethicalads.load();
    } else {
      console.warn("EthicalAds script is not loaded yet.");
    }
  }, [templates]);

  // Unified navigation function
  const navigateTo = (name: string, ui: UIType) => {
    if (isEmbedded) {
      window.parent.postMessage({ type: 'navigate', payload: { name, ui } }, '*');
    } else {
      const path = ui === 'designer' ? '/designer' : '/generator';
      navigate(`${path}?template=${name}`);
    }
  };

  return (
    <div className="flex-1 bg-slate-50/50 overflow-y-auto no-scrollbar">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="flex items-end justify-between border-b border-slate-200 pb-8 mb-12">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 font-heading tracking-tight">The Template Gallery</h1>
            <p className="text-slate-500 font-medium">Select a premium starting point for your next elite realtor listing.</p>
          </div>
          <button
            onClick={() => window.open("https://github.com/pdfme/pdfme/issues/new", "_blank")}
            className="btn-premium px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 shadow-sm"
          >
            Request Custom Layout
          </button>
        </div>

        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templates.map(({ name, author }, index) => (
            <React.Fragment key={name}>
              <div className="group relative glass rounded-[2.5rem] p-4 border border-white/50 shadow-lg hover:shadow-premium transition-all duration-500 hover:-translate-y-1">
                <div className="relative h-80 w-full overflow-hidden rounded-[2rem] bg-slate-100 border border-slate-200/50 mb-6">
                  <img
                    id={`template-img-${name}`}
                    onClick={() => navigateTo(name, 'designer')}
                    alt={fromKebabCase(name)}
                    src={`/template-assets/${name}/thumbnail.png`}
                    className="size-full object-contain cursor-pointer transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>

                <div className="px-2 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-800 leading-tight">
                        {fromKebabCase(name)}
                      </h3>
                      <div className="flex items-center gap-2">
                        {avatarUrlMap[author] && (
                          <img
                            src={avatarUrlMap[author]}
                            alt={author}
                            className="w-5 h-5 rounded-full border border-slate-200 shadow-sm"
                          />
                        )}
                        <span className="text-[11px] font-bold text-slate-400"><AuthorLink author={author} /></span>
                      </div>
                    </div>
                    <CopyButton ui="designer" name={name} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigateTo(name, 'designer')}
                      className="btn-premium py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all"
                    >
                      Designer
                    </button>
                    <button
                      onClick={() => navigateTo(name, 'form-viewer')}
                      className="btn-premium py-2.5 bg-traqr-blue text-white rounded-xl text-xs font-bold hover:bg-primary transition-all shadow-md active:scale-95"
                    >
                      Produce
                    </button>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
          <div className="flex items-stretch">
            <ContributionCard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplatesApp;
