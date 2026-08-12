import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type {
  TransferQueueItem,
  TransferQueues,
  TransferStatus,
} from "../types/billing.types";
import {
  buildObservedClients,
  primaryClientStatus,
  requestNextAction,
  requestProgress,
} from "./platform-control-model";

function movement(
  id: string,
  tenantId: string,
  status: TransferStatus,
  amountMinor: number,
  createdAt: string,
): TransferQueueItem {
  return {
    id,
    status,
    tenant: { id: tenantId, slug: tenantId, name: `Cliente ${tenantId}`, status: "ACTIVO" },
    invoice: {
      id: `invoice-${id}`,
      number: `AC-${id}`,
      bankReference: `BANK-${id}`,
      currency: "NIO",
      totalMinor: amountMinor,
      dueAt: createdAt,
    },
    bankAccount: {
      id: "bank",
      bank: "BANCO",
      holder: "ALPHABY",
      currency: "NIO",
      accountNumber: "0001",
    },
    amountMinor,
    currency: "NIO",
    declaredReference: id,
    transferredAt: createdAt,
    payerName: "Cliente QA",
    sourceLast4: "1234",
    riskFlags: [],
    createdAt,
    evidence: [],
  };
}

function queues(items: TransferQueueItem[]): TransferQueues {
  const result: TransferQueues = {
    PENDIENTE_EVIDENCIA: [],
    EN_REVISION: [],
    APROBADA: [],
    RECHAZADA: [],
    CANCELADA: [],
  };
  for (const item of items) result[item.status].push(item);
  return result;
}

describe("platform control model", () => {
  it("groups real movements by tenant and totals only approved payments", () => {
    const clients = buildObservedClients(
      queues([
        movement("review", "alpha", "EN_REVISION", 5000, "2026-08-12T10:00:00Z"),
        movement("paid", "alpha", "APROBADA", 290000, "2026-08-11T10:00:00Z"),
        movement("rejected", "beta", "RECHAZADA", 106500, "2026-08-10T10:00:00Z"),
      ]),
    );

    assert.equal(clients.length, 2);
    assert.equal(clients[0].slug, "alpha");
    assert.equal(clients[0].attentionCount, 1);
    assert.equal(clients[0].approvedTotals.NIO, 290000);
    assert.equal(clients[1].approvedTotals.NIO, 0);
  });

  it("prioritizes actionable client status over historical results", () => {
    const [client] = buildObservedClients(
      queues([
        movement("paid", "alpha", "APROBADA", 100, "2026-08-12T11:00:00Z"),
        movement("missing", "alpha", "PENDIENTE_EVIDENCIA", 100, "2026-08-12T10:00:00Z"),
      ]),
    );

    assert.equal(primaryClientStatus(client), "PENDIENTE_EVIDENCIA");
  });

  it("explains the responsible actor and next action for every status", () => {
    assert.equal(requestNextAction("PENDIENTE_EVIDENCIA").owner, "Cliente");
    assert.equal(requestNextAction("EN_REVISION").owner, "AlphaBy");
    assert.equal(requestNextAction("APROBADA").title, "Cliente activado");
    assert.match(requestNextAction("RECHAZADA").detail, /nueva declaración/);
    assert.match(requestNextAction("CANCELADA").detail, /historial/);
  });

  it("maps request states to the four-step operator journey", () => {
    assert.equal(requestProgress("PENDIENTE_EVIDENCIA"), 2);
    assert.equal(requestProgress("EN_REVISION"), 3);
    assert.equal(requestProgress("APROBADA"), 4);
    assert.equal(requestProgress("RECHAZADA"), 4);
  });
});
