"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function CancelButton({ id }: { id: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <ConfirmDialog
      title="Cancelar este horário?"
      description="O horário fica livre para outra cliente."
      confirmLabel="Cancelar horário"
      onConfirm={() => {
        start(async () => {
          const { error } = await createClient().rpc("cancel_appointment", { p_id: id })
          if (error) toast.error(error.message)
          else {
            toast.success("Horário cancelado.")
            router.refresh()
          }
        })
      }}
      trigger={(open) => (
        <Button
          variant="destructive"
          size="sm"
          disabled={pending}
          onClick={open}
        >
          Cancelar
        </Button>
      )}
    />
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
