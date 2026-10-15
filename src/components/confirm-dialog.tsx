"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

/** Substitui o confirm() do navegador por um diálogo no visual do app. */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Voltar",
  onConfirm,
}: {
  trigger: (open: () => void) => React.ReactNode
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      {trigger(() => setOpen(true))}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="gap-5 rounded-3xl p-6 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <DialogFooter className="-mx-6 -mb-6 rounded-b-3xl p-4 px-6">
            <Button variant="outline" className="h-11 sm:h-9" onClick={() => setOpen(false)}>
              {cancelLabel}
            </Button>
            <Button
              variant="destructive"
              className="h-11 sm:h-9"
              onClick={() => {
                setOpen(false)
                onConfirm()
              }}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
