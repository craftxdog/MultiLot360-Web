const cards = [
  {
    label: "Ventas hoy",
    value: "C$ 0.00",
    description: "Esperando actividad de vendedores.",
  },
  {
    label: "Turnos abiertos",
    value: "0",
    description: "No hay sorteos activos cargados.",
  },
  {
    label: "Premios pendientes",
    value: "0",
    description: "Sin premios por pagar actualmente.",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="border-b border-border pb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          Dashboard
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tighter text-foreground">
          Resumen operativo
        </h1>

        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
          Esta será la vista central para monitorear ventas, sorteos, límites,
          resultados y pagos. Por ahora dejamos la base visual lista para
          conectar módulos reales.
        </p>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>

            <p className="mt-5 text-3xl font-semibold tracking-tighter text-card-foreground">
              {card.value}
            </p>

            <p className="mt-4 text-sm text-muted-foreground">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-medium tracking-[-0.02em] text-card-foreground">
          Siguiente integración
        </h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          El próximo paso será conectar endpoints reales del módulo de sorteos,
          ventas y usuario actual para convertir estos placeholders en datos
          vivos.
        </p>
      </div>
    </div>
  );
}
