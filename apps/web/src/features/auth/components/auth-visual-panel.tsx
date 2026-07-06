"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

const messages = [
  {
    eyebrow: "Operación conectada",
    title: "Controla cada turno sin perder de vista los detalles.",
    description: "Vendedores, ventas y sorteos se mantienen sincronizados desde una sola sesión segura.",
  },
  {
    eyebrow: "Decisiones claras",
    title: "Convierte la operación diaria en información útil.",
    description: "Consulta resultados y movimientos con una interfaz diseñada para responder rápido.",
  },
  {
    eyebrow: "Trabajo continuo",
    title: "Opera en web y escritorio con el mismo contexto.",
    description: "Una experiencia consistente para que el equipo avance sin volver a aprender el sistema.",
  },
];

const capabilities = ["Accesos por rol", "Trazabilidad operativa", "Sesiones protegidas"];

export function AuthVisualPanel() {
  const reduceMotion = useReducedMotion();
  const [activeMessage, setActiveMessage] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setActiveMessage((current) => (current + 1) % messages.length);
    }, 6200);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  const message = messages[activeMessage];

  return (
    <aside className="relative m-2 hidden min-h-[calc(100vh-64px)] overflow-hidden rounded-3xl border border-border bg-[#e9e9e3] text-[#171717] lg:flex lg:flex-col lg:justify-between dark:bg-[#0a0a0a] dark:text-white">
      <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(rgba(23,23,23,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(23,23,23,0.045)_1px,transparent_1px)] [background-size:48px_48px] dark:hidden" />
      <div className="absolute inset-0 hidden opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.028)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.028)_1px,transparent_1px)] [background-size:48px_48px] dark:block" />
      <motion.div
        aria-hidden="true"
        className="absolute -right-[8%] top-[8%] h-[44vw] max-h-[620px] w-[44vw] max-w-[620px] rounded-full bg-[radial-gradient(circle,rgba(23,23,23,0.14),rgba(23,23,23,0.025)_48%,transparent_70%)] blur-2xl dark:bg-[radial-gradient(circle,rgba(255,255,255,0.18),rgba(255,255,255,0.03)_48%,transparent_70%)]"
        animate={reduceMotion ? undefined : { x: [0, -42, 18, 0], y: [0, 34, -20, 0], scale: [1, 1.08, 0.96, 1] }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute -bottom-[20%] -left-[8%] h-[36vw] max-h-[520px] w-[36vw] max-w-[520px] rounded-full bg-[radial-gradient(circle,rgba(23,23,23,0.1),transparent_68%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(255,255,255,0.09),transparent_68%)]"
        animate={reduceMotion ? undefined : { x: [0, 48, 0], y: [0, -34, 0] }}
        transition={{ duration: 17, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_8%,rgba(255,255,255,0.22)_52%,transparent_90%)] dark:bg-[linear-gradient(120deg,rgba(0,0,0,0.1),transparent_45%,rgba(0,0,0,0.58))]" />

      <div className="relative z-10 flex items-center gap-3 p-10">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/35 dark:border-white/12 dark:bg-white/5">
          <ShieldCheck className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-sm">MultiLot 360</p>
          <p className="text-xs opacity-50">Centro operativo seguro</p>
        </div>
      </div>

      <div className="relative z-10 px-10 xl:px-16">
        <div className="max-w-2xl" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMessage}
              initial={reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12, filter: "blur(7px)" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mb-5 text-xs uppercase tracking-[0.2em] opacity-50">{message.eyebrow}</p>
              <h2 className="font-serif text-4xl leading-[1.06] tracking-[-0.04em] xl:text-[52px]">
                {message.title.split(" ").map((word, index) => (
                  <motion.span
                    key={`${word}-${index}`}
                    className="mr-[0.24em] inline-block"
                    initial={reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: reduceMotion ? 0 : index * 0.035, duration: 0.45 }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h2>
              <p className="mt-6 max-w-xl text-[15px] leading-7 opacity-55">{message.description}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-9 flex flex-wrap gap-2.5">
            {capabilities.map((capability) => (
              <span key={capability} className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/25 px-3 py-1.5 text-xs opacity-70 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <Check className="h-3 w-3" />
                {capability}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between p-10 text-xs opacity-45">
        <div className="flex gap-1.5" aria-label={`Mensaje ${activeMessage + 1} de ${messages.length}`}>
          {messages.map((item, index) => (
            <button
              key={item.eyebrow}
              type="button"
              onClick={() => setActiveMessage(index)}
              className={`h-1.5 rounded-full transition-all ${index === activeMessage ? "w-7 bg-current" : "w-1.5 bg-current opacity-35 hover:opacity-70"}`}
              aria-label={`Mostrar: ${item.eyebrow}`}
              aria-current={index === activeMessage ? "true" : undefined}
            />
          ))}
        </div>
        <span>Seguridad · Claridad · Rendimiento</span>
      </div>
    </aside>
  );
}
