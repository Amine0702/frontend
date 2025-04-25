import { redirect } from "next/navigation"

export default function Home() {
  redirect("/landing") // Redirige vers /dashboard au lieu de la landing page
}
