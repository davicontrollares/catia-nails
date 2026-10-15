export type Role = "owner" | "staff" | "client"
export type AppointmentStatus = "confirmed" | "completed" | "cancelled" | "no_show"
export type PaymentMethod = "pix" | "cash" | "credit" | "debit"

export type Settings = {
  id: number
  business_name: string
  tagline: string | null
  address: string | null
  whatsapp: string | null
  instagram: string | null
  facebook: string | null
  min_notice_hours: number
  max_days_ahead: number
  cancel_notice_hours: number
  slot_step_min: number
}

export type Service = {
  id: string
  name: string
  description: string | null
  category: string
  duration_min: number
  price: number
  active: boolean
  sort: number
}

export type Professional = {
  id: string
  name: string
  bio: string | null
  photo_url: string | null
  commission_pct: number
  active: boolean
}

export type WorkingHour = {
  id: string
  professional_id: string
  weekday: number
  start_time: string
  end_time: string
}

export type TimeOff = {
  id: string
  professional_id: string
  starts_at: string
  ends_at: string
  reason: string | null
}

export type Appointment = {
  id: string
  client_id: string | null
  client_name: string
  client_phone: string
  professional_id: string
  service_id: string
  service_label?: string | null
  starts_at: string
  ends_at: string
  status: AppointmentStatus
  price: number
  payment_method: PaymentMethod | null
  notes: string | null
  services?: { name: string } | null
  professionals?: { name: string } | null
}

export type Expense = {
  id: string
  category: string
  description: string | null
  amount: number
  spent_on: string
}

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Não compareceu",
}

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  pix: "Pix",
  cash: "Dinheiro",
  credit: "Crédito",
  debit: "Débito",
}

export const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
