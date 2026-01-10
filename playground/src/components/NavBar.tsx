import { Disclosure } from "@headlessui/react";
import { Menu, X } from 'lucide-react';

export type NavItem = {
  label: string;
  content: React.ReactNode;
};

type NavBarProps = {
  items: NavItem[];
};

export function NavBar({ items }: NavBarProps) {
  return (
    <Disclosure as="nav" className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
      {({ open }) => (
        <>
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar py-1">
                {items.map(({ label, content }, index) => (
                  <div key={label || String(index)} className="flex flex-col min-w-max border-r border-slate-100 last:border-0 pr-6 mr-0">
                    {label && (
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                        {label}
                      </span>
                    )}
                    <div className="relative group">
                      {content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 border border-slate-200 transition-all">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <X className="block h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Menu className="block h-5 w-5" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden border-t border-slate-100 bg-white shadow-premium">
            <div className="px-4 pt-4 pb-6 space-y-4">
              {items.map(({ label, content }) => (
                <div key={label} className="flex flex-col space-y-2 pb-4 border-b border-slate-50 last:border-0">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
                  <div className="w-full">
                    {content}
                  </div>
                </div>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
