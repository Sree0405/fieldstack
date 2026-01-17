import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const AppLayout = () => {
  return (
    <div className="flex h-screen dark bg-background]">
      <Sidebar />
      <div className="flex flex-1 flex-col bg-background overflow-hidden">
        <Header />
        <main className="flex-1 bg-background overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
