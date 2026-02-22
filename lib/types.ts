export type UserRole = 'owner' | 'manager' | 'limited'
export type PermissionCategory =
  | 'kitchen' | 'living_room' | 'bedroom' | 'bathroom'
  | 'garage' | 'basement' | 'attic' | 'hvac'
  | 'electrical' | 'plumbing' | 'outdoor' | 'other'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed'
export type TaskSource = 'manual' | 'ai'
export type ServiceType = 'maintenance' | 'repair' | 'inspection' | 'replacement' | 'installation'
export type DocumentType = 'manual' | 'warranty' | 'receipt' | 'inspection' | 'photo' | 'other'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface Home {
  id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  year_built: number | null
  square_footage: number | null
  image_url: string | null
  owner_id: string
  created_at: string
  updated_at: string
}

export interface HomeWithStats extends Home {
  member_role: UserRole
  room_count: number
  appliance_count: number
  pending_tasks: number
}

export interface HomeMember {
  id: string
  home_id: string
  user_id: string
  role: UserRole
  role_template_id: string | null
  invited_by: string | null
  created_at: string
  profile?: Profile
}

export interface HomeMemberPermission {
  id: string
  home_member_id: string
  category: PermissionCategory
  can_view: boolean
  can_edit: boolean
  can_add_records: boolean
}

export interface Room {
  id: string
  home_id: string
  name: string
  category: PermissionCategory
  floor: number
  description: string | null
  created_at: string
  updated_at: string
}

export interface RoomWithStats extends Room {
  appliance_count: number
  pending_tasks: number
}

export interface Appliance {
  id: string
  room_id: string
  home_id: string
  name: string
  category: string | null
  brand: string | null
  model: string | null
  serial_number: string | null
  purchase_date: string | null
  installation_date: string | null
  purchase_price: number | null
  warranty_expiry: string | null
  warranty_provider: string | null
  warranty_contact: string | null
  notes: string | null
  disaster_plan: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface ApplianceWithStats extends Appliance {
  service_count: number
  last_service_date: string | null
  pending_tasks: number
  room?: Room
}

export interface ServiceRecord {
  id: string
  appliance_id: string
  home_id: string
  service_date: string
  service_type: ServiceType
  description: string
  cost: number | null
  provider: string | null
  provider_contact: string | null
  technician: string | null
  notes: string | null
  next_service_date: string | null
  created_at: string
  created_by: string | null
}

export interface Document {
  id: string
  home_id: string
  appliance_id: string | null
  service_record_id: string | null
  name: string
  file_url: string
  file_type: string | null
  file_size: number | null
  document_type: DocumentType
  description: string | null
  created_at: string
  created_by: string | null
}

export interface ScheduledTask {
  id: string
  home_id: string
  appliance_id: string | null
  title: string
  description: string | null
  due_date: string
  priority: TaskPriority
  status: TaskStatus
  source: TaskSource
  ai_reasoning: string | null
  completed_at: string | null
  completed_by: string | null
  notify_at_1_month: boolean
  notify_at_1_week: boolean
  notify_at_1_day: boolean
  custom_notify_days: number[] | null
  recurring: boolean
  recurring_interval: number | null
  created_at: string
  created_by: string | null
  appliance?: Appliance
}

export interface AISuggestion {
  title: string
  description: string
  due_date: string
  priority: TaskPriority
  reasoning: string
}

// Room category metadata for UI
export const ROOM_CATEGORIES: Record<PermissionCategory, {
  label: string
  color: string
  bgColor: string
  icon: string
}> = {
  kitchen: { label: 'Kitchen', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: '🍳' },
  living_room: { label: 'Living Room', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: '🛋️' },
  bedroom: { label: 'Bedroom', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: '🛏️' },
  bathroom: { label: 'Bathroom', color: 'text-cyan-700', bgColor: 'bg-cyan-100', icon: '🚿' },
  garage: { label: 'Garage', color: 'text-slate-700', bgColor: 'bg-slate-100', icon: '🚗' },
  basement: { label: 'Basement', color: 'text-stone-700', bgColor: 'bg-stone-100', icon: '📦' },
  attic: { label: 'Attic', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: '🏠' },
  hvac: { label: 'HVAC', color: 'text-sky-700', bgColor: 'bg-sky-100', icon: '❄️' },
  electrical: { label: 'Electrical', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: '⚡' },
  plumbing: { label: 'Plumbing', color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: '💧' },
  outdoor: { label: 'Outdoor', color: 'text-green-700', bgColor: 'bg-green-100', icon: '🌿' },
  other: { label: 'Other', color: 'text-gray-700', bgColor: 'bg-gray-100', icon: '📋' },
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  maintenance: 'Maintenance',
  repair: 'Repair',
  inspection: 'Inspection',
  replacement: 'Replacement',
  installation: 'Installation',
}

export const PRIORITY_LABELS: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'text-slate-600', bg: 'bg-slate-100' },
  medium: { label: 'Medium', color: 'text-blue-700', bg: 'bg-blue-100' },
  high: { label: 'High', color: 'text-amber-700', bg: 'bg-amber-100' },
  urgent: { label: 'Urgent', color: 'text-red-700', bg: 'bg-red-100' },
}
