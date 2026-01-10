import { Routes, Route, useSearchParams } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import Designer from "./routes/Designer";
import Generator from "./routes/Generator";
import Templates from "./routes/Templates";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [searchParams] = useSearchParams();
  const isEmbedded = searchParams.get("embed") === "true";

  if (isEmbedded) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-white">
        <Routes>
          <Route path={"/"} element={<Designer />} />
          <Route path={"/designer"} element={<Designer />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/form-viewer" element={<Generator />} />
          <Route path="/templates" element={<Templates isEmbedded={true} />} />
        </Routes>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex bg-slate-50 overflow-hidden font-sans antialiased text-slate-900">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
        <Routes>
          <Route path={"/"} element={<Designer />} />
          <Route path={"/designer"} element={<Designer />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/form-viewer" element={<Generator />} />
          <Route path="/templates" element={<Templates isEmbedded={false} />} />
        </Routes>
      </main>
      <ToastContainer
        position="bottom-right"
        toastClassName={() => "bg-white shadow-premium rounded-2xl p-4 border border-slate-100 flex items-center min-h-[64px] mb-4 mr-4"}
      />
    </div>
  );
}
