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
        className="fixed inset-0 bg-slate-900/40 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-8 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 border border-slate-100"
          >
            <div>
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                  />
                </svg>
              </div>
              <div className="mt-4 text-center">
                <DialogTitle as="h3" className="text-xl font-bold text-slate-900 mb-6 font-heading">
                  TraQR Support Center
                </DialogTitle>
                <div className="mt-2 space-y-3">
                  <button
                    onClick={() =>
                      window.open(
                        'https://app.pdfme.com/contact?utm_source=playground&utm_content=need-help',
                        '_blank'
                      )
                    }
                    className="flex justify-center items-center w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95"
                  >
                    Contact Support Team
                    {externalIcon}
                  </button>
                  <button
                    onClick={() => window.open('https://discord.gg/xWPTJbmgNV', '_blank')}
                    className="flex justify-center items-center w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Join Discord Community
                    {externalIcon}
                  </button>
                  <button
                    onClick={() => window.open('https://github.com/pdfme/pdfme/issues', '_blank')}
                    className="flex justify-center items-center w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Report Technical Issue
                    {externalIcon}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex w-full justify-center rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all"
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
        ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10 shadow-sm shadow-indigo-50'
        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600',
      'whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-all'
    );

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm relative z-50 flex-shrink-0">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-12">
          <NavLink to="/" className="flex items-center group">
            <img
              src="/imgs/traqr_logo.png"
              alt="TraQR Pro"
              className="h-10 w-auto group-hover:scale-105 transition-transform duration-300 pointer-events-none"
            />
          </NavLink>

          <nav className="hidden lg:flex items-center space-x-2">
            {navLinks.map((item) => (
              <NavLink id={item.id} key={item.to} to={item.to} end className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-[10px] font-bold text-slate-500 gap-2 select-none">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            TraQR v{PDFME_VERSION} Pro Edition
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="group inline-flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-5 py-2 text-sm font-bold text-indigo-700 shadow-sm hover:bg-indigo-100 hover:shadow transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:rotate-12 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
            Help Center
          </button>
        </div>
      </div>
      <HelpModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
    </header>
  );
}
