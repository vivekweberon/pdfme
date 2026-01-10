import { NavLink } from "react-router-dom";
import { LayoutDashboard, PenTool, Printer, HelpCircle, LogOut } from "lucide-react";

export default function Sidebar() {
    const navLinks = [
        { to: "/templates", label: "Templates", icon: <LayoutDashboard size={20} /> },
        { to: "/designer", label: "Designer", icon: <PenTool size={20} /> },
        { to: "/generator", label: "Generator", icon: <Printer size={20} /> },
    ];

    const bottomLinks = [
        { to: "/help", label: "Help Center", icon: <HelpCircle size={20} /> },
    ];

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `sidebar-link ${isActive ? "active" : ""}`;

    return (
        <aside className="w-64 h-full bg-slate-900 flex flex-col border-r border-slate-800 flex-shrink-0 z-50">
            {/* Logo Area */}
            <div className="p-8 flex flex-col items-center">
                <div className="w-full h-20 flex items-center justify-center p-2">
                    <img
                        src="/imgs/traqr_logo.png"
                        alt="TraQR Pro"
                        className="h-full w-auto object-contain"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1">
                <span className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 block">Navigation</span>
                {navLinks.map((link) => (
                    <NavLink key={link.to} to={link.to} className={linkClass}>
                        <span className="text-slate-400 group-hover:text-white transition-colors">{link.icon}</span>
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-800">
                <div className="px-4 mb-4">
                    <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Status</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium">Global CDN Active</p>
                    </div>
                </div>

                {bottomLinks.map((link) => (
                    <NavLink key={link.to} to={link.to} className={linkClass}>
                        <span className="text-slate-400">{link.icon}</span>
                        {link.label}
                    </NavLink>
                ))}

                <button className="sidebar-link w-full text-left mt-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/20">
                    <LogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
