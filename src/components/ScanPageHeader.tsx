export function ScanPageHeader({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <header className="mb-6 flex items-start gap-4">
      <div className="h-12 w-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{desc}</p>
      </div>
    </header>
  );
}