import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// ── Palette ───────────────────────────────────────────────────────────────────

const TEAL        = '#0d9488'
const TEAL_DARK   = '#0f766e'
const TEAL_LIGHT  = '#ccfbf1'
const SLATE_900   = '#0f172a'
const SLATE_700   = '#334155'
const SLATE_500   = '#64748b'
const SLATE_200   = '#e2e8f0'
const SLATE_50    = '#f8fafc'
const WHITE       = '#ffffff'
const AMBER_500   = '#f59e0b'
const BLUE_600    = '#2563eb'
const PURPLE_600  = '#9333ea'

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // ─ Cover ─────────────────────────────────────────────
  coverPage: {
    fontFamily: 'Helvetica',
    padding: 0,
    backgroundColor: WHITE,
  },
  coverHero: {
    backgroundColor: TEAL,
    paddingTop: 72,
    paddingBottom: 56,
    paddingLeft: 56,
    paddingRight: 56,
  },
  coverLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  coverLogoBox: {
    width: 36,
    height: 36,
    backgroundColor: WHITE,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  coverLogoLetter: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: TEAL,
  },
  coverLogoName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    letterSpacing: 0.5,
  },
  coverEyebrow: {
    fontSize: 10,
    color: TEAL_LIGHT,
    letterSpacing: 2,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 12,
  },
  coverTitle: {
    fontSize: 40,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    lineHeight: 1.15,
    marginBottom: 16,
  },
  coverTagline: {
    fontSize: 14,
    color: TEAL_LIGHT,
    lineHeight: 1.5,
  },
  coverBody: {
    paddingTop: 40,
    paddingBottom: 56,
    paddingLeft: 56,
    paddingRight: 56,
  },
  coverIntro: {
    fontSize: 12,
    color: SLATE_700,
    lineHeight: 1.7,
    marginBottom: 32,
  },
  coverFeatureRow: {
    flexDirection: 'row',
    gap: 12,
  },
  coverFeatureChip: {
    backgroundColor: SLATE_50,
    borderWidth: 1,
    borderColor: SLATE_200,
    borderRadius: 20,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 12,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coverFeatureChipText: {
    fontSize: 9,
    color: SLATE_700,
    fontFamily: 'Helvetica-Bold',
  },
  coverFooter: {
    position: 'absolute',
    bottom: 32,
    left: 56,
    right: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: SLATE_200,
    paddingTop: 10,
  },
  coverFooterText: {
    fontSize: 8,
    color: SLATE_500,
  },

  // ─ Content pages ──────────────────────────────────────
  page: {
    fontFamily: 'Helvetica',
    paddingTop: 48,
    paddingBottom: 64,
    paddingLeft: 56,
    paddingRight: 56,
    backgroundColor: WHITE,
  },
  pageHeader: {
    borderBottomWidth: 1,
    borderBottomColor: SLATE_200,
    paddingBottom: 12,
    marginBottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: SLATE_900,
  },
  pageSub: {
    fontSize: 9,
    color: TEAL,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 56,
    right: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: SLATE_200,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 8,
    color: SLATE_500,
  },

  // ─ Steps ─────────────────────────────────────────────
  step: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: SLATE_200,
  },
  stepLast: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 0,
  },
  stepNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  stepNumText: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
  },
  stepBody: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: SLATE_900,
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 10,
    color: SLATE_700,
    lineHeight: 1.65,
    marginBottom: 10,
  },
  stepTipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  stepTipDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    flexShrink: 0,
  },
  stepTipText: {
    fontSize: 9,
    color: SLATE_500,
    lineHeight: 1.5,
    flex: 1,
  },

  // ─ Features ──────────────────────────────────────────
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  featureCard: {
    width: '47.5%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    borderColor: SLATE_200,
    backgroundColor: SLATE_50,
  },
  featureIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  featureTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: SLATE_900,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 9,
    color: SLATE_500,
    lineHeight: 1.55,
  },

  // ─ Tip box ───────────────────────────────────────────
  tipBox: {
    backgroundColor: TEAL_LIGHT,
    borderWidth: 1,
    borderColor: TEAL,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 14,
    flexShrink: 0,
    marginTop: 1,
  },
  tipBody: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: TEAL_DARK,
    marginBottom: 3,
  },
  tipText: {
    fontSize: 9,
    color: TEAL_DARK,
    lineHeight: 1.55,
  },
})

// ── Footer ────────────────────────────────────────────────────────────────────

function PageFooter({ label }: { label: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>HomeFile — Getting Started Guide</Text>
      <Text style={s.footerText}>{label}</Text>
    </View>
  )
}

// ── Step component ────────────────────────────────────────────────────────────

function Step({
  num,
  color,
  title,
  desc,
  tips,
  last,
}: {
  num: string
  color: string
  title: string
  desc: string
  tips: string[]
  last?: boolean
}) {
  return (
    <View style={last ? s.stepLast : s.step} wrap={false}>
      <View style={[s.stepNum, { backgroundColor: color }]}>
        <Text style={s.stepNumText}>{num}</Text>
      </View>
      <View style={s.stepBody}>
        <Text style={s.stepTitle}>{title}</Text>
        <Text style={s.stepDesc}>{desc}</Text>
        {tips.map((tip, i) => (
          <View key={i} style={s.stepTipRow}>
            <View style={[s.stepTipDot, { backgroundColor: color }]} />
            <Text style={s.stepTipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// ── Feature card ──────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View style={s.featureCard}>
      <Text style={s.featureIcon}>{icon}</Text>
      <Text style={s.featureTitle}>{title}</Text>
      <Text style={s.featureDesc}>{desc}</Text>
    </View>
  )
}

// ── Main PDF ──────────────────────────────────────────────────────────────────

export function GettingStartedPDF() {
  const year = new Date().getFullYear()

  return (
    <Document title="Getting Started with HomeFile" author="HomeFile" subject="User Guide">

      {/* ── COVER ─────────────────────────────────────────── */}
      <Page size="LETTER" style={s.coverPage}>

        {/* Hero */}
        <View style={s.coverHero}>
          <View style={s.coverLogo}>
            <View style={s.coverLogoBox}>
              <Text style={s.coverLogoLetter}>H</Text>
            </View>
            <Text style={s.coverLogoName}>HomeFile</Text>
          </View>
          <Text style={s.coverEyebrow}>GETTING STARTED GUIDE</Text>
          <Text style={s.coverTitle}>Your home,{'\n'}organized.</Text>
          <Text style={s.coverTagline}>Track every appliance. Schedule every service.{'\n'}Never miss a thing.</Text>
        </View>

        {/* Body */}
        <View style={s.coverBody}>
          <Text style={s.coverIntro}>
            HomeFile is a home management app that helps you track appliances, schedule preventive maintenance, store important documents, and generate a comprehensive Home Binder PDF — all in one place.{'\n\n'}
            This guide walks you through the three steps to get fully set up, and gives you a quick overview of every major feature.
          </Text>

          {/* Feature chips */}
          <View style={s.coverFeatureRow}>
            {['Appliance Tracking', 'AI Maintenance', 'Home Binder PDF', 'Seasonal Alerts'].map((label) => (
              <View key={label} style={s.coverFeatureChip}>
                <Text style={s.coverFeatureChipText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={s.coverFooter}>
          <Text style={s.coverFooterText}>© {year} HomeFile</Text>
          <Text style={s.coverFooterText}>homefile.app</Text>
        </View>
      </Page>

      {/* ── GETTING STARTED ───────────────────────────────── */}
      <Page size="LETTER" style={s.page}>
        <View style={s.pageHeader}>
          <Text style={s.pageTitle}>Getting Started</Text>
          <Text style={s.pageSub}>3 STEPS</Text>
        </View>

        <Step
          num="1"
          color={TEAL}
          title="Add Your Home"
          desc="Start by creating your home in HomeFile. Add a name, address, city, state, and year built. HomeFile uses your location to provide climate-specific maintenance alerts and tailor AI suggestions — a Wisconsin home gets freeze warnings, a Florida home gets hurricane prep reminders."
          tips={[
            'Name it anything — "The Johnson House", "Main Street", or just your address.',
            'Year built helps AI estimate appliance ages and flag older systems for inspection.',
            'You can add multiple homes — each gets its own inventory, calendar, and binder.',
          ]}
        />

        <Step
          num="2"
          color={BLUE_600}
          title="Add Rooms & Appliances"
          desc="Divide your home into rooms (Kitchen, HVAC, Garage, Basement, etc.), then add appliances to each one. For each appliance you can store the brand, model number, serial number, purchase and installation dates, warranty details, service history, and maintenance notes."
          tips={[
            'Use the "Look up product" button on the model number field — AI fetches specs and suggests a maintenance schedule automatically.',
            'Serial numbers help you quickly reference warranties and recall notices.',
            'Add a Disaster/Storm Plan to any appliance (e.g. "Shut off gas during ice storms") — these compile into your Home Binder\'s Emergency SOP section.',
          ]}
        />

        <Step
          num="3"
          color={PURPLE_600}
          title="Generate Your AI Maintenance Schedule"
          desc="Once appliances are added, tap Get AI suggestions on any appliance page. AI analyzes the appliance type, age, model, and your local climate to generate a prioritized list of upcoming maintenance tasks — filter replacements, annual inspections, seasonal prep, and more."
          tips={[
            'Tasks are added to your Maintenance Calendar automatically, sorted by due date.',
            'You can accept, edit, or delete any suggested task before saving.',
            'AI suggestions consider your location — cold-climate homes get winterization tasks, coastal homes get corrosion checks.',
          ]}
          last
        />

        <PageFooter label="Getting Started" />
      </Page>

      {/* ── KEY FEATURES ──────────────────────────────────── */}
      <Page size="LETTER" style={s.page}>
        <View style={s.pageHeader}>
          <Text style={s.pageTitle}>Key Features</Text>
          <Text style={s.pageSub}>FEATURE OVERVIEW</Text>
        </View>

        <View style={s.featureGrid}>
          <FeatureCard
            icon="📅"
            title="Maintenance Calendar"
            desc="A unified calendar showing all scheduled tasks across every appliance. Tasks are color-coded: overdue (red), due this month (amber), and upcoming (teal). Add tasks manually or accept AI-generated ones. Mark tasks complete directly from the calendar."
          />
          <FeatureCard
            icon="📄"
            title="Home Binder PDF"
            desc="Download a comprehensive PDF of your entire home at any time. Includes a table of contents, every appliance's specs and maintenance notes, a Disaster & Storm SOP section, and an A–Z index. Useful for insurance claims, home sales, or passing info to a house sitter."
          />
          <FeatureCard
            icon="📁"
            title="Document Storage"
            desc="Attach files to any appliance — owner's manuals, warranty documents, purchase receipts, inspection reports, or photos. Files are stored securely and accessible from the appliance detail page."
          />
          <FeatureCard
            icon="⚠️"
            title="Seasonal Alerts"
            desc="AI-powered alerts based on your home's location and the current time of year. Examples: pipe winterization reminders in October for cold-climate homes, hurricane prep checklists in June for Gulf Coast homes, wildfire defensible space tips in summer for Western homes."
          />
          <FeatureCard
            icon="🔧"
            title="Service History"
            desc="Log every repair, inspection, or maintenance visit for each appliance. Track cost, provider, technician, and notes. Service history feeds into AI suggestions, so it knows what's already been done and what's overdue."
          />
          <FeatureCard
            icon="👥"
            title="Shared Access"
            desc="Invite household members, property managers, or contractors to your home. Assign roles: Owner (full access), Manager (can add and edit), or Limited (view only). Each member sees only the rooms and appliances they're permitted to access."
          />
        </View>

        {/* Pro tip */}
        <View style={s.tipBox} wrap={false}>
          <Text style={s.tipIcon}>💡</Text>
          <View style={s.tipBody}>
            <Text style={s.tipTitle}>Pro tip: Start with the biggest-ticket items first</Text>
            <Text style={s.tipText}>
              HVAC systems, water heaters, and refrigerators are the most expensive appliances to replace unexpectedly. Add these first, use "Look up product" to pull in their maintenance schedules, and let AI build your first calendar. You'll have a real maintenance plan running in under 10 minutes.
            </Text>
          </View>
        </View>

        <PageFooter label="Key Features" />
      </Page>

    </Document>
  )
}
