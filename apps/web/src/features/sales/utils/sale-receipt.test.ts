import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Sale } from "../types/sales.types";
import { buildSaleReceiptHtml } from "./sale-receipt";

function makeSale(overrides: Partial<Sale> = {}): Sale {
  return {
    id: "25fb274e-8ed0-4d70-9a38-c4db11fc93ee",
    seller: { id: "seller-1", name: "María Ulloa" },
    shift: {
      id: "shift-1",
      date: "2026-07-06",
      status: "ABIERTO",
      configuration: { id: "draw-1", code: "prueba2", time: "21:00:00" },
    },
    status: "ACTIVA",
    totalMiles: 40,
    details: [
      { id: "detail-1", number: "34", prizeMiles: 20, createdAt: "2026-07-06T18:59:00.000Z" },
      { id: "detail-2", number: "12", prizeMiles: 20, createdAt: "2026-07-06T18:59:00.000Z" },
    ],
    createdAt: "2026-07-06T18:59:00.000Z",
    voidedByUserId: null,
    voidedAt: null,
    voidReason: null,
    ...overrides,
  };
}

describe("sale receipt", () => {
  it("describes the purchased draw, plays and real currency value", () => {
    const html = buildSaleReceiptHtml(makeSale());

    assert.match(html, /Comprobante de venta/);
    assert.match(html, /TICKET VÁLIDO/);
    assert.match(html, /Sorteo seleccionado/);
    assert.match(html, /prueba2/);
    assert.match(html, /Jugadas compradas/);
    assert.match(html, /2 jugadas/);
    assert.match(html, /Valor de la jugada/);
    assert.match(html, /C\$ 20[,.]000/);
    assert.match(html, /C\$ 40[,.]000/);
    assert.match(html, /Total de la venta/);
    assert.match(html, /#25FB274E-8ED/);
  });

  it("marks voided tickets as unable to participate", () => {
    const html = buildSaleReceiptHtml(makeSale({ status: "ANULADA" }));

    assert.match(html, /TICKET ANULADO/);
    assert.match(html, /no participan en el sorteo/);
    assert.doesNotMatch(html, /TICKET VÁLIDO/);
  });

  it("escapes every API-provided label before writing the print document", () => {
    const html = buildSaleReceiptHtml(makeSale({
      seller: { id: "seller-1", name: '<img src=x onerror="alert(1)">' },
      shift: {
        id: "shift-1",
        date: "2026-07-06",
        status: "ABIERTO",
        configuration: { id: "draw-1", code: "<script>alert(2)</script>", time: "21:00:00" },
      },
      details: [{ id: "detail-1", number: "<1", prizeMiles: 1, createdAt: "2026-07-06T18:59:00.000Z" }],
    }));

    assert.doesNotMatch(html, /<img src=x/);
    assert.doesNotMatch(html, /<script>alert\(2\)<\/script>/);
    assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
    assert.match(html, /&lt;script&gt;alert\(2\)&lt;\/script&gt;/);
    assert.match(html, /&lt;1/);
  });
});
