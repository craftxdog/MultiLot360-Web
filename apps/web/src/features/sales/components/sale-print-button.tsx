"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Sale } from "../types/sales.types";
import { buildSaleReceiptHtml } from "../utils/sale-receipt";

export function SalePrintButton({ sale, className }: { sale: Sale; className?: string }) {
  const print = () => {
    const target = window.open("", "multilot-ticket", "width=420,height=720");
    if (!target) {
      window.print();
      return;
    }
    target.document.open();
    target.document.write(buildSaleReceiptHtml(sale));
    target.document.close();
  };

  return (
    <Button variant="secondary" className={className} onClick={print}>
      <Printer className="h-4 w-4" />
      Imprimir ticket
    </Button>
  );
}
