import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { routes } from "@/config/routes";

export default function SignupPage() {
  redirect(routes.login);
}
export const metadata: Metadata = {
  title: "Acceso administrado | MultiLot 360",
};
