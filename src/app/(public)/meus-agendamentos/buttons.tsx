"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function CancelButton({ id }: { id: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Cancelar este horário?")) return
        start(async () => {
          const { error } = await createClient().rpc("cancel_appointment", { p_id: id })
          if (error) toast.error(error.message)
          else {
            toast.success("Horário cancelado.")
            router.refresh()
          }
        })
      }}
    >
      Cancelar
    </Button>
  )
}

export function SignOutButton() {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        await createClient().auth.signOut()
        router.push("/")
        router.refresh()
      }}
    >
      Sair
    </Button>
  )
}
