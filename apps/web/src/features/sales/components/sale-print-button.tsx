"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Sale } from "../types/sales.types";
import { formatMiles, formatSaleDate, formatSaleDateTime } from "../utils/sales-formatters";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildReceiptHtml(sale: Sale) {
  const ticket = sale.id.slice(0, 12).toUpperCase();
  const shift = sale.shift
    ? `${sale.shift.configuration.code} · ${formatSaleDate(sale.shift.date)} · ${sale.shift.configuration.time.slice(0, 5)}`
    : "Operación administrativa";
  const rows = sale.details
    .map((detail) => `<tr><td>${escapeHtml(detail.number)}</td><td>${escapeHtml(formatMiles(detail.prizeMiles))} mil</td></tr>`)
    .join("");

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Ticket ${ticket}</title>
  <style>
    @page { size: 72mm auto; margin: 5mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; font-size: 12px; }
    .ticket { width: 100%; }
    .center { text-align: center; }
    .brand { font-size: 18px; font-weight: 800; letter-spacing: .04em; }
    .muted { color: #555; }
    .line { border-top: 1px dashed #111; margin: 10px 0; }
    .row { display: flex; justify-content: space-between; gap: 10px; margin: 4px 0; }
    .label { color: #555; }
    .value { text-align: right; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { color: #555; font-weight: 600; text-align: left; border-bottom: 1px solid #111; padding: 4px 0; }
    th:last-child, td:last-child { text-align: right; }
    td { padding: 5px 0; border-bottom: 1px dotted #bbb; font-size: 15px; font-weight: 700; }
    .total { font-size: 18px; font-weight: 900; }
    .footer { margin-top: 12px; text-align: center; font-size: 10px; color: #555; }
    @media screen {
      body { background: #f4f4f1; padding: 18px; }
      .ticket { max-width: 320px; margin: 0 auto; background: white; padding: 18px; box-shadow: 0 20px 60px rgba(0,0,0,.12); }
    }
  </style>
</head>
<body>
  <main class="ticket">
    <div class="center">
      <div class="brand">MULTILOT 360</div>
      <div class="muted">Ticket oficial de venta</div>
    </div>
    <div class="line"></div>
    <div class="row"><span class="label">Ticket</span><span class="value">#${ticket}</span></div>
    <div class="row"><span class="label">Fecha</span><span class="value">${escapeHtml(formatSaleDateTime(sale.createdAt))}</span></div>
    <div class="row"><span class="label">Vendedor</span><span class="value">${escapeHtml(sale.seller.name)}</span></div>
    <div class="row"><span class="label">Turno</span><span class="value">${escapeHtml(shift)}</span></div>
    <div class="row"><span class="label">Estado</span><span class="value">${escapeHtml(sale.status)}</span></div>
    <div class="line"></div>
    <table>
      <thead><tr><th>Número</th><th>Monto</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="line"></div>
    <div class="row total"><span>Total</span><span>${escapeHtml(formatMiles(sale.totalMiles))} mil</span></div>
    <div class="footer">
      Conserve este comprobante. El pago queda sujeto al resultado oficial y a las reglas vigentes del operador.
    </div>
  </main>
  <script>window.addEventListener("load",function(){window.focus();window.print();});</script>
</body>
</html>`;
}

export function SalePrintButton({ sale, className }: { sale: Sale; className?: string }) {
  const print = () => {
    const target = window.open("", "multilot-ticket", "width=420,height=720");
    if (!target) {
      window.print();
      return;
    }
    target.document.open();
    target.document.write(buildReceiptHtml(sale));
    target.document.close();
  };

  return (
    <Button variant="secondary" className={className} onClick={print}>
      <Printer className="h-4 w-4" />
      Imprimir ticket
    </Button>
  );
}
