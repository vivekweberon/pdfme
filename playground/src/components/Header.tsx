import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { PDFME_VERSION } from '@pdfme/common';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

const externalIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 ml-1">
  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
</svg>


function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function HelpModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div>
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <DialogTitle as="h3" className="text-base font-semibold text-gray-900 mb-5">
                  Need Help?
                </DialogTitle>
                <div className="mt-2 space-y-4">
                  <button
                    onClick={() =>
                      window.open(
                        'https://app.pdfme.com/contact?utm_source=playground&utm_content=need-help',
                        '_blank'
                      )
                    }
                    className="flex justify-center items-center w-full rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  >
                    Need technical help or consulting?
                    {externalIcon}
                  </button>
                  <button
                    onClick={() => window.open('https://discord.gg/xWPTJbmgNV', '_blank')}
                    className="flex justify-center items-center w-full rounded-md bg-green-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                  >
                    Need help by community?
                    {externalIcon}
                  </button>
                  <button
                    onClick={() => window.open('https://github.com/pdfme/pdfme/issues', '_blank')}
                    className="flex justify-center items-center w-full rounded-md bg-gray-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
                  >
                    Found bugs? Report them on our GitHub issues page.
                    {externalIcon}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

export default function Navigation() {
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const navLinks = [
    { id: 'templates-nav', to: '/templates', label: 'Templates' },
    { id: 'designer-nav', to: '/designer', label: 'Designer' },
    { id: 'form-viewer-nav', to: '/form-viewer', label: 'Form/Viewer' },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    classNames(
      isActive
        ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
      'whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold transition-all'
    );

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm relative z-10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-10">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875V3.375c0-1.036-.84-1.875-1.875-1.875H5.625Z" />
                <path d="M17.17 9.17a2.25 2.25 0 0 1 3.16 3.16L17.17 9.17Z" />
              </svg>
            </div>
            <span className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
              PDFme <span className="text-indigo-600">Pro</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => (
              <NavLink id={item.id} key={item.to} to={item.to} end className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-5">
          <a
            href="https://github.com/pdfme/pdfme/tree/main/playground"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-600 transition-colors hidden sm:block"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-6"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
          </a>

          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 hover:shadow-md transition-all active:scale-95"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Help Center
          </button>
        </div>
      </div>
      <HelpModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
      <div className="px-4 py-1 text-[10px] text-slate-400 bg-slate-50 border-t border-slate-100 flex justify-between items-center select-none">
        <span>Engine Version: {PDFME_VERSION}</span>
        <span className="hidden sm:inline">Professional Edition for Real Estate</span>
      </div>
    </div>
  );
}
