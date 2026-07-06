type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="border-b border-border pb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          MultiLot 360
        </p>
        <h1 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-foreground">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Este módulo ya está conectado a la navegación. El siguiente paso será
          integrar su tabla, filtros, acciones y consumo real de API.
        </p>
      </div>
    </div>
  );
}
