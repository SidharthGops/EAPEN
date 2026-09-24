import React from "react";
import { Routes, Route } from "react-router-dom";
import { SessionProvider } from "./context/SessionContext.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Chat from "./pages/Chat.jsx";
import History from "./pages/History.jsx";
import Insights from "./pages/Insights.jsx";
import Settings from "./pages/Settings.jsx";
import "./App.css";

export default function App() {
  return (
    <SessionProvider>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Chat />} />
            <Route path="/history" element={<History />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </SessionProvider>
  );
}

function NotFound() {
  return (
    <div style={{ padding: 40 }}>
      <h2>Page not found</h2>
    </div>
  );
}
