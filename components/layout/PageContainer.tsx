interface PageContainerProps {
  children: React.ReactNode;
}

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <main
      className="ml-60 min-h-screen p-6"
      style={{ backgroundColor: "var(--app-background)" }}
    >
      <div
        className="max-w-5xl mx-auto rounded-xl shadow-sm border border-border p-6"
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        {children}
      </div>
    </main>
  );
}
