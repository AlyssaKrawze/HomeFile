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
  include_in_binder: boolean
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
  include_in_binder: boolean
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
  assigned_to: string | null
  assignee?: { id: string; full_name: string | null; email: string | null; avatar_url: string | null }
  appliance?: Appliance
}

export interface TaskAssigneeMember {
  user_id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
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
  kitchen:     { label: 'Kitchen',     color: 'text-[#5a8a7d]', bgColor: 'bg-[#d6ede8]', icon: '🍳' },
  living_room: { label: 'Living Room', color: 'text-[#5a628a]', bgColor: 'bg-[#d6d9ee]', icon: '🛋️' },
  bedroom:     { label: 'Bedroom',     color: 'text-[#5a628a]', bgColor: 'bg-[#d6d9ee]', icon: '🛏️' },
  bathroom:    { label: 'Bathroom',    color: 'text-[#5a8a7d]', bgColor: 'bg-[#d6ede8]', icon: '🚿' },
  garage:      { label: 'Garage',      color: 'text-[#8a7a3a]', bgColor: 'bg-[#eee8cc]', icon: '🚗' },
  basement:    { label: 'Basement',    color: 'text-[#8a7a3a]', bgColor: 'bg-[#eee8cc]', icon: '📦' },
  attic:       { label: 'Attic',       color: 'text-[#8a7a3a]', bgColor: 'bg-[#eee8cc]', icon: '🏠' },
  hvac:        { label: 'HVAC',        color: 'text-[#5a628a]', bgColor: 'bg-[#d6d9ee]', icon: '❄️' },
  electrical:  { label: 'Electrical',  color: 'text-[#8a7a3a]', bgColor: 'bg-[#eee8cc]', icon: '⚡' },
  plumbing:    { label: 'Plumbing',    color: 'text-[#5a628a]', bgColor: 'bg-[#d6d9ee]', icon: '💧' },
  outdoor:     { label: 'Outdoor',     color: 'text-[#5a8a7d]', bgColor: 'bg-[#d6ede8]', icon: '🌳' },
  other:       { label: 'Other',       color: 'text-[#8a7a3a]', bgColor: 'bg-[#eee8cc]', icon: '📋' },
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  maintenance: 'Maintenance',
  repair: 'Repair',
  inspection: 'Inspection',
  replacement: 'Replacement',
  installation: 'Installation',
}

export type VaultCategory = 'wifi' | 'alarm' | 'garage' | 'gate' | 'custom'

export const VAULT_CATEGORY_META: Record<VaultCategory, { label: string }> = {
  wifi: { label: 'WiFi' },
  alarm: { label: 'Alarm Code' },
  garage: { label: 'Garage Code' },
  gate: { label: 'Gate Code' },
  custom: { label: 'Custom' },
}

export interface VaultEncryptedField {
  ciphertext: string
  iv: string
  authTag: string
}

export interface VaultEntryDecrypted {
  id: string
  home_id: string
  category: VaultCategory
  label: string
  notes: string | null
  created_at: string
  updated_at: string
  ssid?: string
  password?: string
  code?: string
  fieldLabel?: string
  fieldValue?: string
}

export const PRIORITY_LABELS: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  low: { label: 'Low', color: 'text-slate-600', bg: 'bg-slate-100' },
  medium: { label: 'Medium', color: 'text-blue-700', bg: 'bg-blue-100' },
  high: { label: 'High', color: 'text-amber-700', bg: 'bg-amber-100' },
  urgent: { label: 'Urgent', color: 'text-red-700', bg: 'bg-red-100' },
}

export interface ServiceProvider {
  id: string
  appliance_id: string
  home_id: string
  name: string
  company: string | null
  phone: string | null
  email: string | null
  notes: string | null
  created_at: string
}

export interface RoomAttachment {
  id: string
  room_id: string
  home_id: string
  name: string
  file_url: string
  file_type: string | null
  file_size: number | null
  description: string | null
  include_in_binder: boolean
  created_at: string
}

export type ProjectStatus = 'planned' | 'in_progress' | 'complete'
export type ProjectTaskStatus = 'pending' | 'in_progress' | 'completed'

export interface Project {
  id: string
  home_id: string
  name: string
  description: string | null
  status: ProjectStatus
  due_date: string | null
  created_at: string
  updated_at: string
  tasks?: ProjectTask[]
  room_count?: number
  appliance_count?: number
}

export interface ProjectTask {
  id: string
  project_id: string
  home_id: string
  title: string
  description: string | null
  status: ProjectTaskStatus
  assigned_to: string | null
  due_date: string | null
  created_at: string
  assignee?: { id: string; full_name: string | null; email: string | null }
}
