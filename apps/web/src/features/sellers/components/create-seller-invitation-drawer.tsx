"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Mail, X } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { useSellerMutations } from "../hooks/use-seller-mutations";
import {
  createSellerInvitationSchema,
  type CreateSellerInvitationFormInput,
  type CreateSellerInvitationInput,
} from "../schemas/seller-invitation.schema";
import { useSellerWorkspaceStore } from "../store/seller-workspace.store";

const defaultValues: CreateSellerInvitationFormInput = {
  sellerName: "",
  username: "",
  documentId: "",
  email: "",
  phone: undefined,
  address: undefined,
  roleName: "VENDEDOR",
};

export function CreateSellerInvitationDrawer({ context = "seller" }: { context?: "seller" | "user" }) {
  const open = useSellerWorkspaceStore((state) => state.createDrawerOpen);
  const close = useSellerWorkspaceStore((state) => state.closeCreateDrawer);
  const { createInvitation } = useSellerMutations();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<
    CreateSellerInvitationFormInput,
    unknown,
    CreateSellerInvitationInput
  >({
    resolver: zodResolver(createSellerInvitationSchema),
    defaultValues,
  });

  const closeDrawer = () => {
    if (!createInvitation.isPending) close();
  };

  const submit = handleSubmit(async (input) => {
    try {
      await createInvitation.mutateAsync(input);
      reset(defaultValues);
      close();
    } catch {
      // La mutación presenta el error y conserva el formulario para corregirlo.
    }
  });

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Cerrar formulario de invitación"
            className="fixed inset-0 z-40 cursor-default bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="seller-invitation-title"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-125 flex-col border-l border-border bg-background shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {context === "user" ? "Gestión de identidades" : "Acceso del equipo"}
                </p>
                <h2 id="seller-invitation-title" className="mt-1 text-base font-medium text-foreground">
                  {context === "user" ? "Crear acceso operativo" : "Invitar vendedor"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                disabled={createInvitation.isPending}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-40"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
                <div className="rounded-xl border border-primary/12 bg-primary/4 p-4">
                  <div className="flex gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                    <p className="text-xs leading-5 text-muted-foreground">
                      {context === "user" ? "La API creará el usuario operativo y enviará un código temporal para que active su acceso de forma segura." : "Enviaremos un código temporal y un enlace que abre la activación con los datos ya preparados."}
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sellerName">Nombre completo</Label>
                  <Input id="sellerName" placeholder="Carlos López" className="mt-2" {...register("sellerName")} />
                  <FieldError message={errors.sellerName?.message} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="username">Usuario</Label>
                    <Input id="username" placeholder="carlos.lopez" className="mt-2" autoCapitalize="none" {...register("username")} />
                    <FieldError message={errors.username?.message} />
                  </div>
                  <div>
                    <Label htmlFor="documentId">Cédula</Label>
                    <Input id="documentId" placeholder="001-010190-0001A" className="mt-2" {...register("documentId")} />
                    <FieldError message={errors.documentId?.message} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="sellerEmail">Correo</Label>
                  <Input id="sellerEmail" type="email" placeholder="vendedor@empresa.com" className="mt-2" autoCapitalize="none" {...register("email")} />
                  <FieldError message={errors.email?.message} />
                </div>

                <div>
                  <Label>Teléfono</Label>
                  <div className="mt-2">
                    <Controller
                      control={control}
                      name="phone"
                      render={({ field }) => (
                        <PhoneInput
                          name={field.name}
                          value={String(field.value ?? "")}
                          onChange={field.onChange}
                          error={Boolean(errors.phone)}
                        />
                      )}
                    />
                  </div>
                  <FieldError message={errors.phone?.message} />
                </div>

                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" placeholder="Managua, Nicaragua" className="mt-2" {...register("address")} />
                  <FieldError message={errors.address?.message} />
                </div>

                <div>
                  <Label htmlFor="roleName">Rol operativo</Label>
                  <select
                    id="roleName"
                    className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-foreground/25"
                    {...register("roleName")}
                  >
                    <option value="VENDEDOR">Vendedor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                  <FieldError message={errors.roleName?.message} />
                </div>
              </div>

              <footer className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
                <Button type="button" variant="secondary" onClick={closeDrawer} disabled={createInvitation.isPending}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createInvitation.isPending} className="gap-2">
                  {createInvitation.isPending ? "Enviando..." : context === "user" ? "Crear y enviar acceso" : "Enviar invitación"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </footer>
            </form>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
