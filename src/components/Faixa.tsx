export function Faixa() {
  const items = [
    "Fortaleza",
    "Eusébio",
    "Todo o Ceará",
    "Até 80% de economia",
    "Sem baterias",
    "Instalação por engenheiros",
  ];
  const row = [...items, ...items];
  return (
    <div aria-hidden="true" className="overflow-hidden border-y bg-background py-5">
      <div className="marquee flex w-max gap-10">
        {row.map((t, k) => (
          <span
            key={k}
            className="display flex items-center gap-10 whitespace-nowrap text-2xl text-muted-foreground md:text-3xl"
          >
            {t}
            <span className="h-2 w-2 rounded-full bg-primary" />
          </span>
        ))}
      </div>
    </div>
  );
}
