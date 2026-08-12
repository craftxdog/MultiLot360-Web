import type { Sale } from "../types/sales.types";
import { formatSaleDate } from "./sales-formatters";

const RECEIPT_DATE_TIME = new Intl.DateTimeFormat("es-NI", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Managua",
});

const CORDOBAS = new Intl.NumberFormat("es-NI", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCordobas(miles: number) {
  return `C$ ${CORDOBAS.format(miles * 1_000)}`;
}

function countLabel(count: number) {
  return `${count} ${count === 1 ? "jugada" : "jugadas"}`;
}

export function buildSaleReceiptHtml(sale: Sale) {
  const ticket = sale.id.slice(0, 12).toUpperCase();
  const isActive = sale.status === "ACTIVA";
  const status = isActive ? "TICKET VÁLIDO" : "TICKET ANULADO";
  const drawCode = sale.shift?.configuration.code ?? "Operación administrativa";
  const drawDate = sale.shift ? formatSaleDate(sale.shift.date) : "Sin turno asociado";
  const drawTime = sale.shift?.configuration.time.slice(0, 5) ?? "—";
  const itemCount = countLabel(sale.details.length);
  const pageHeight = Math.max(170, 156 + sale.details.length * 10);
  const rows = sale.details
    .map((detail, index) => `
        <tr>
          <td class="item-index">${index + 1}</td>
          <td><strong class="number">${escapeHtml(detail.number)}</strong></td>
          <td class="amount">${escapeHtml(formatCordobas(detail.prizeMiles))}</td>
        </tr>`)
    .join("");
  const footer = isActive
    ? "Conserve este comprobante. Participan únicamente las jugadas de tickets vigentes y quedan sujetas al resultado oficial y a las reglas del operador."
    : "Este comprobante fue anulado y sus jugadas no participan en el sorteo.";

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Comprobante ${ticket}</title>
  <style>
    @page { size: 80mm ${pageHeight}mm; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #111; }
    body { font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 10px; line-height: 1.35; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .ticket { width: 80mm; min-height: ${pageHeight}mm; padding: 7mm 6mm 6mm; }
    .center { text-align: center; }
    .brand { font-size: 18px; font-weight: 900; letter-spacing: .12em; }
    .document-type { margin-top: 2px; color: #444; font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
    .status { margin: 14px 0; border: 1.5px solid #111; padding: 7px 8px; text-align: center; font-size: 11px; font-weight: 900; letter-spacing: .16em; }
    .section { padding: 11px 0; border-top: 1px dashed #777; }
    .section-title { margin: 0 0 8px; color: #555; font-size: 8px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 12px; }
    .meta-item.wide { grid-column: 1 / -1; }
    .label { display: block; color: #666; font-size: 8px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
    .value { display: block; margin-top: 2px; font-size: 10px; font-weight: 750; overflow-wrap: anywhere; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
    .draw { border: 1px solid #bbb; padding: 10px; }
    .draw-name { font-size: 15px; font-weight: 900; letter-spacing: .04em; overflow-wrap: anywhere; }
    .draw-meta { display: flex; justify-content: space-between; gap: 10px; margin-top: 7px; color: #444; }
    .purchase-summary { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
    .purchase-summary strong { font-size: 11px; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th { border-bottom: 1.5px solid #111; padding: 5px 2px; color: #555; font-size: 8px; font-weight: 800; letter-spacing: .06em; text-align: left; text-transform: uppercase; }
    th:first-child { width: 9%; }
    th:nth-child(2) { width: 31%; }
    th:last-child, td.amount { text-align: right; }
    td { border-bottom: 1px dotted #aaa; padding: 7px 2px; vertical-align: middle; }
    .item-index { color: #777; font-size: 8px; }
    .number { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 17px; letter-spacing: .08em; }
    .amount { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; font-weight: 800; }
    .total { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; border-top: 2px solid #111; border-bottom: 2px solid #111; padding: 10px 0; }
    .total-label { font-size: 9px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
    .total-count { display: block; margin-top: 2px; color: #555; font-size: 8px; font-weight: 500; letter-spacing: 0; text-transform: none; }
    .total-value { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 18px; font-weight: 900; white-space: nowrap; }
    .notice { margin-top: 13px; padding: 9px; border: 1px solid #bbb; text-align: center; font-size: 9px; font-weight: 750; }
    .footer { margin-top: 10px; color: #555; text-align: center; font-size: 8px; line-height: 1.5; }
    .reference { margin-top: 8px; color: #777; font-size: 7px; overflow-wrap: anywhere; }
    @media screen {
      body { min-height: 100vh; background: #ececea; padding: 24px; }
      .ticket { margin: 0 auto; background: #fff; box-shadow: 0 18px 55px rgba(0, 0, 0, .16); }
    }
    @media print {
      .ticket { box-shadow: none; }
    }
  </style>
</head>
<body>
  <main class="ticket">
    <header class="center">
      <div class="brand">MULTILOT 360</div>
      <div class="document-type">Comprobante de venta</div>
    </header>

    <div class="status">${status}</div>

    <section class="section" aria-label="Datos del comprobante">
      <h2 class="section-title">Datos del comprobante</h2>
      <div class="meta">
        <div class="meta-item"><span class="label">Ticket</span><span class="value mono">#${ticket}</span></div>
        <div class="meta-item"><span class="label">Jugadas</span><span class="value">${itemCount}</span></div>
        <div class="meta-item wide"><span class="label">Fecha de venta</span><span class="value">${escapeHtml(RECEIPT_DATE_TIME.format(new Date(sale.createdAt)))}</span></div>
        <div class="meta-item wide"><span class="label">Vendedor</span><span class="value">${escapeHtml(sale.seller.name)}</span></div>
      </div>
    </section>

    <section class="section" aria-label="Sorteo seleccionado">
      <h2 class="section-title">Sorteo seleccionado</h2>
      <div class="draw">
        <div class="draw-name">${escapeHtml(drawCode)}</div>
        <div class="draw-meta"><span><span class="label">Fecha</span>${escapeHtml(drawDate)}</span><span><span class="label">Hora</span>${escapeHtml(drawTime)}</span></div>
      </div>
    </section>

    <section class="section" aria-label="Jugadas compradas">
      <div class="purchase-summary"><h2 class="section-title" style="margin:0">Jugadas compradas</h2><strong>${itemCount}</strong></div>
      <table aria-label="Detalle de jugadas">
        <thead><tr><th>#</th><th>Número</th><th>Valor de la jugada</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>

    <div class="total">
      <span class="total-label">Total de la venta<span class="total-count">${itemCount}</span></span>
      <strong class="total-value">${escapeHtml(formatCordobas(sale.totalMiles))}</strong>
    </div>

    <div class="notice">Revise el número, el sorteo y el valor de cada jugada antes de retirarse.</div>
    <footer class="footer">
      ${footer}
      <div class="reference mono">Referencia: ${escapeHtml(sale.id)}</div>
    </footer>
  </main>
  <script>window.addEventListener("load",function(){window.focus();window.print();});</script>
</body>
</html>`;
}
