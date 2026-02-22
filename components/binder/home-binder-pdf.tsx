import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// ── Types ────────────────────────────────────────────────────────────────────

export interface ApplianceForBinder {
  id: string
  name: string
  category: string | null
  brand: string | null
  model: string | null
  serial_number: string | null
  purchase_date: string | null
  installation_date: string | null
  warranty_expiry: string | null
  warranty_provider: string | null
  notes: string | null
  disaster_plan: string | null
  room_name: string
  last_service_date: string | null
}

export interface HomeForBinder {
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  year_built: number | null
}

// ── Palette ───────────────────────────────────────────────────────────────────

const TEAL = '#0d9488'
const SLATE_900 = '#0f172a'
const SLATE_700 = '#334155'
const SLATE_500 = '#64748b'
const SLATE_300 = '#cbd5e1'
const SLATE_100 = '#f1f5f9'
const AMBER_600 = '#d97706'
const AMBER_50 = '#fffbeb'
const AMBER_200 = '#fde68a'
const AMBER_900 = '#78350f'

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, color: SLATE_900, paddingTop: 48, paddingBottom: 56, paddingLeft: 48, paddingRight: 48 },

  // Cover
  coverAccent: { backgroundColor: TEAL, height: 8 },
  coverBody: { padding: 56, paddingTop: 80, flex: 1 },
  coverEyebrow: { fontSize: 10, color: TEAL, letterSpacing: 3, marginBottom: 10, fontFamily: 'Helvetica-Bold' },
  coverTitle: { fontSize: 34, fontFamily: 'Helvetica-Bold', color: SLATE_900, marginBottom: 8 },
  coverAddress: { fontSize: 12, color: SLATE_700, marginBottom: 3 },
  coverMeta: { fontSize: 10, color: SLATE_500, marginBottom: 3 },
  coverDivider: { borderBottomWidth: 1, borderBottomColor: SLATE_300, marginTop: 28, marginBottom: 24 },
  coverStat: { fontSize: 10, color: SLATE_500, marginBottom: 5 },
  coverFooter: { position: 'absolute', bottom: 48, left: 56, right: 56 },

  // Page chrome
  pageHeader: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: SLATE_300, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  pageTitle: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: SLATE_900 },
  pageSubtitle: { fontSize: 9, color: SLATE_500 },
  footer: { position: 'absolute', bottom: 24, left: 48, right: 48, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: SLATE_300, paddingTop: 6 },
  footerText: { fontSize: 8, color: SLATE_500 },

  // TOC
  tocGroup: { marginBottom: 14 },
  tocGroupTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: SLATE_700, backgroundColor: SLATE_100, paddingTop: 5, paddingBottom: 5, paddingLeft: 8, paddingRight: 8, marginBottom: 4 },
  tocRow: { flexDirection: 'row', paddingTop: 4, paddingBottom: 4, paddingLeft: 10, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  tocName: { flex: 1, fontSize: 10, color: SLATE_700 },
  tocDetail: { fontSize: 9, color: SLATE_500 },

  // Room header
  roomHeader: { backgroundColor: TEAL, paddingTop: 5, paddingBottom: 5, paddingLeft: 10, paddingRight: 10, marginTop: 16, marginBottom: 8 },
  roomHeaderText: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#ffffff' },

  // Appliance card
  appCard: { borderWidth: 1, borderColor: SLATE_300, marginBottom: 10, overflow: 'hidden' },
  appCardHead: { backgroundColor: SLATE_100, paddingTop: 5, paddingBottom: 5, paddingLeft: 10, paddingRight: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  appCardName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: SLATE_900 },
  appCardCategory: { fontSize: 8, color: SLATE_500, backgroundColor: '#e2e8f0', paddingTop: 2, paddingBottom: 2, paddingLeft: 6, paddingRight: 6 },
  appCardBody: { paddingTop: 8, paddingBottom: 8, paddingLeft: 10, paddingRight: 10 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 },
  infoCell: { width: '33.33%', marginBottom: 6 },
  infoLabel: { fontSize: 7, color: SLATE_500, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  infoValue: { fontSize: 9, color: SLATE_900 },
  notesLabel: { fontSize: 7, color: SLATE_500, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3, marginTop: 2 },
  notesText: { fontSize: 9, color: SLATE_700, lineHeight: 1.5 },
  disasterBox: { marginTop: 6, backgroundColor: AMBER_50, borderWidth: 1, borderColor: AMBER_200, paddingTop: 5, paddingBottom: 5, paddingLeft: 8, paddingRight: 8 },
  disasterBoxLabel: { fontSize: 7, color: AMBER_600, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  disasterBoxText: { fontSize: 9, color: AMBER_900, lineHeight: 1.5 },

  // Disaster SOP page
  sopIntro: { fontSize: 10, color: SLATE_500, marginBottom: 18, lineHeight: 1.5 },
  sopItem: { borderLeftWidth: 3, borderLeftColor: AMBER_600, paddingLeft: 12, marginBottom: 18 },
  sopName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: SLATE_900, marginBottom: 2 },
  sopRoom: { fontSize: 9, color: SLATE_500, marginBottom: 4 },
  sopText: { fontSize: 10, color: SLATE_700, lineHeight: 1.6 },

  // Index
  indexGroup: { marginBottom: 12 },
  indexLetter: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: TEAL, borderBottomWidth: 1, borderBottomColor: SLATE_300, paddingBottom: 2, marginBottom: 4 },
  indexRow: { flexDirection: 'row', paddingTop: 3, paddingBottom: 3, paddingLeft: 8, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
  indexName: { flex: 1, fontSize: 10, color: SLATE_700 },
  indexRoom: { fontSize: 9, color: SLATE_500 },
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(d: string | null): string {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.infoCell}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value || '—'}</Text>
    </View>
  )
}

function PageFooter({ homeName }: { homeName: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>{homeName} — Home Binder</Text>
      <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  )
}

// ── Main PDF component ─────────────────────────────────────────────────────────

export function HomeBinderPDF({ home, appliances }: { home: HomeForBinder; appliances: ApplianceForBinder[] }) {
  // Group appliances by room
  const roomOrder: string[] = []
  const byRoom = new Map<string, ApplianceForBinder[]>()
  for (const a of appliances) {
    if (!byRoom.has(a.room_name)) { byRoom.set(a.room_name, []); roomOrder.push(a.room_name) }
    byRoom.get(a.room_name)!.push(a)
  }

  const withPlan = appliances.filter(a => a.disaster_plan?.trim())

  const addressLine = [home.address, home.city, home.state, home.zip].filter(Boolean).join(', ')
  const generatedOn = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // Index: sorted A-Z
  const sorted = [...appliances].sort((a, b) => a.name.localeCompare(b.name))
  const letters = [...new Set(sorted.map(a => a.name[0]?.toUpperCase() ?? '#'))]

  return (
    <Document title={`${home.name} — Home Binder`} author="HomeFile">

      {/* ── COVER ── */}
      <Page size="LETTER" style={{ fontFamily: 'Helvetica', padding: 0 }}>
        <View style={s.coverAccent} />
        <View style={s.coverBody}>
          <Text style={s.coverEyebrow}>HOME BINDER</Text>
          <Text style={s.coverTitle}>{home.name}</Text>
          {addressLine ? <Text style={s.coverAddress}>{addressLine}</Text> : null}
          {home.year_built ? <Text style={s.coverMeta}>Built {home.year_built}</Text> : null}
          <View style={s.coverDivider} />
          <Text style={s.coverStat}>{appliances.length} item{appliances.length !== 1 ? 's' : ''} across {roomOrder.length} room{roomOrder.length !== 1 ? 's' : ''}</Text>
          {withPlan.length > 0 && (
            <Text style={s.coverStat}>{withPlan.length} appliance{withPlan.length !== 1 ? 's' : ''} with disaster / storm plans</Text>
          )}
        </View>
        <View style={s.coverFooter}>
          <Text style={s.coverMeta}>Generated {generatedOn}</Text>
        </View>
      </Page>

      {/* ── TABLE OF CONTENTS ── */}
      <Page size="LETTER" style={s.page}>
        <View style={s.pageHeader}>
          <Text style={s.pageTitle}>Table of Contents</Text>
        </View>

        {/* Appliances grouped by room */}
        {roomOrder.map(room => (
          <View key={room} style={s.tocGroup}>
            <Text style={s.tocGroupTitle}>{room}</Text>
            {byRoom.get(room)!.map(a => (
              <View key={a.id} style={s.tocRow}>
                <Text style={s.tocName}>{a.name}</Text>
                <Text style={s.tocDetail}>{[a.brand, a.model].filter(Boolean).join(' · ') || a.category || ''}</Text>
              </View>
            ))}
          </View>
        ))}

        {withPlan.length > 0 && (
          <View style={s.tocGroup}>
            <Text style={s.tocGroupTitle}>Disaster & Storm Procedures</Text>
            {withPlan.map(a => (
              <View key={a.id} style={s.tocRow}>
                <Text style={s.tocName}>{a.name}</Text>
                <Text style={s.tocDetail}>{a.room_name}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.tocGroup}>
          <Text style={s.tocGroupTitle}>Index</Text>
          <View style={s.tocRow}>
            <Text style={s.tocName}>Alphabetical listing — all appliances & equipment</Text>
          </View>
        </View>

        <PageFooter homeName={home.name} />
      </Page>

      {/* ── APPLIANCES ── */}
      <Page size="LETTER" style={s.page}>
        <View style={s.pageHeader}>
          <Text style={s.pageTitle}>Appliances & Equipment</Text>
          <Text style={s.pageSubtitle}>{appliances.length} item{appliances.length !== 1 ? 's' : ''}</Text>
        </View>

        {roomOrder.map(room => (
          <View key={room}>
            <View style={s.roomHeader}>
              <Text style={s.roomHeaderText}>{room}</Text>
            </View>

            {byRoom.get(room)!.map(a => (
              <View key={a.id} style={s.appCard} wrap={false}>
                <View style={s.appCardHead}>
                  <Text style={s.appCardName}>{a.name}</Text>
                  {a.category ? <Text style={s.appCardCategory}>{a.category}</Text> : null}
                </View>
                <View style={s.appCardBody}>
                  <View style={s.infoGrid}>
                    <InfoCell label="Brand" value={a.brand ?? ''} />
                    <InfoCell label="Model" value={a.model ?? ''} />
                    <InfoCell label="Serial Number" value={a.serial_number ?? ''} />
                    <InfoCell label="Purchase Date" value={fmt(a.purchase_date)} />
                    <InfoCell label="Installation Date" value={fmt(a.installation_date)} />
                    <InfoCell label="Last Serviced" value={fmt(a.last_service_date)} />
                    <InfoCell label="Warranty Expires" value={fmt(a.warranty_expiry)} />
                    <InfoCell label="Warranty Provider" value={a.warranty_provider ?? ''} />
                  </View>

                  {a.notes ? (
                    <>
                      <Text style={s.notesLabel}>Maintenance Notes / How to Use</Text>
                      <Text style={s.notesText}>{a.notes}</Text>
                    </>
                  ) : null}

                  {a.disaster_plan ? (
                    <View style={s.disasterBox}>
                      <Text style={s.disasterBoxLabel}>Disaster / Storm Plan</Text>
                      <Text style={s.disasterBoxText}>{a.disaster_plan}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        ))}

        <PageFooter homeName={home.name} />
      </Page>

      {/* ── DISASTER SOP (conditional) ── */}
      {withPlan.length > 0 && (
        <Page size="LETTER" style={s.page}>
          <View style={s.pageHeader}>
            <Text style={s.pageTitle}>Disaster & Storm Procedures</Text>
            <Text style={s.pageSubtitle}>{withPlan.length} appliance{withPlan.length !== 1 ? 's' : ''}</Text>
          </View>

          <Text style={s.sopIntro}>
            Follow the procedures below during emergencies, severe weather, extended power outages, or evacuations. Each entry applies to a specific appliance or system in the home.
          </Text>

          {withPlan.map(a => (
            <View key={a.id} style={s.sopItem} wrap={false}>
              <Text style={s.sopName}>{a.name}</Text>
              <Text style={s.sopRoom}>{a.room_name}{a.category ? ` · ${a.category}` : ''}</Text>
              <Text style={s.sopText}>{a.disaster_plan}</Text>
            </View>
          ))}

          <PageFooter homeName={home.name} />
        </Page>
      )}

      {/* ── INDEX ── */}
      <Page size="LETTER" style={s.page}>
        <View style={s.pageHeader}>
          <Text style={s.pageTitle}>Index</Text>
          <Text style={s.pageSubtitle}>All appliances A–Z</Text>
        </View>

        {letters.map(letter => (
          <View key={letter} style={s.indexGroup} wrap={false}>
            <Text style={s.indexLetter}>{letter}</Text>
            {sorted.filter(a => (a.name[0]?.toUpperCase() ?? '#') === letter).map(a => (
              <View key={a.id} style={s.indexRow}>
                <Text style={s.indexName}>{a.name}</Text>
                <Text style={s.indexRoom}>{a.room_name}</Text>
              </View>
            ))}
          </View>
        ))}

        <PageFooter homeName={home.name} />
      </Page>
    </Document>
  )
}
