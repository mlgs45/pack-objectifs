import { Header } from "@/components/layout/header";

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </>
  );
}
