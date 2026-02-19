import Sidebar from "../components/protected/Sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 md:ml-64 pb-20 md:pb-0 bg-slate-950">
        {children}
      </main>
    </div>
  );
}
