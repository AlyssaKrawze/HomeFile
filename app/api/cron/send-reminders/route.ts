import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)

const REMINDER_LABELS: Record<string, string> = {
  '1_month': 'Coming up in about a month',
  '1_week': 'Due next week',
  '1_day': 'Due tomorrow',
  'due_date': 'Due today',
}

const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: '#f1f5f9', text: '#475569', label: 'Low' },
  medium: { bg: '#dbeafe', text: '#1d4ed8', label: 'Medium' },
  high: { bg: '#fef3c7', text: '#b45309', label: 'High' },
  urgent: { bg: '#fee2e2', text: '#b91c1c', label: 'Urgent' },
}

function buildEmailHtml(params: {
  taskTitle: string
  taskDescription: string | null
  aiReasoning: string | null
  priority: string
  applianceName: string | null
  homeName: string
  homeId: string
  reminderType: string
  dueDate: string
}) {
  const { taskTitle, taskDescription, aiReasoning, priority, applianceName, homeName, homeId, reminderType, dueDate } = params
  const priorityMeta = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium
  const timeLabel = REMINDER_LABELS[reminderType] || 'Reminder'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://thehomepage.app'
  const calendarUrl = `${appUrl}/homes/${homeId}/calendar`

  const formattedDate = new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${taskTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:#F4F1EA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F4F1EA;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <!-- Header -->
          <tr>
            <td style="background-color:#5B6C8F;padding:20px 24px;border-radius:12px 12px 0 0;">
              <span style="color:#ffffff;font-size:18px;font-weight:600;letter-spacing:0.5px;">TheHomePage</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;border:1px solid #C8BFB2;border-top:none;padding:28px 24px;border-radius:0 0 12px 12px;">
              <!-- Time label -->
              <p style="margin:0 0 8px;font-size:13px;color:#5B6C8F;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
                ${timeLabel}
              </p>

              <!-- Task title -->
              <h1 style="margin:0 0 16px;font-size:20px;color:#2F3437;font-weight:700;line-height:1.3;">
                ${taskTitle}
              </h1>

              <!-- Meta row -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="padding-right:12px;">
                    <span style="display:inline-block;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;background-color:${priorityMeta.bg};color:${priorityMeta.text};">
                      ${priorityMeta.label} Priority
                    </span>
                  </td>
                  <td>
                    <span style="font-size:13px;color:#6b7280;">${formattedDate}</span>
                  </td>
                </tr>
              </table>

              ${applianceName ? `
              <p style="margin:0 0 16px;font-size:14px;color:#6b7280;">
                <strong style="color:#4b5563;">Appliance:</strong> ${applianceName}
              </p>
              ` : ''}

              ${taskDescription ? `
              <p style="margin:0 0 16px;font-size:14px;color:#4b5563;line-height:1.5;">
                ${taskDescription}
              </p>
              ` : ''}

              ${aiReasoning ? `
              <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#f0f4f8;border-radius:8px;padding:14px 16px;">
                    <p style="margin:0 0 4px;font-size:12px;color:#5B6C8F;font-weight:600;">Why this matters</p>
                    <p style="margin:0;font-size:13px;color:#4b5563;line-height:1.5;">${aiReasoning}</p>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-top:8px;">
                    <a href="${calendarUrl}" style="display:inline-block;padding:12px 28px;background-color:#5B6C8F;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
                      View Calendar
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                ${homeName} &middot; Sent by TheHomePage
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // Fetch due reminders with task, appliance, and home data
  const { data: reminders, error: fetchError } = await supabase
    .from('scheduled_reminders')
    .select(`
      id,
      task_id,
      user_id,
      home_id,
      reminder_date,
      reminder_type,
      scheduled_tasks (
        title,
        description,
        priority,
        ai_reasoning,
        appliance_id,
        appliances ( name )
      ),
      homes ( name )
    `)
    .eq('reminder_date', today)
    .eq('status', 'pending')

  if (fetchError) {
    console.error('Failed to fetch reminders:', fetchError)
    return NextResponse.json({ error: 'Failed to fetch reminders', details: fetchError.message, code: fetchError.code }, { status: 500 })
  }

  if (!reminders || reminders.length === 0) {
    return NextResponse.json({ sent: 0, errors: 0, message: 'No reminders due today' })
  }

  let sent = 0
  let errors = 0

  for (const reminder of reminders) {
    try {
      // Get user email via admin auth API
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(reminder.user_id)
      if (userError || !userData?.user?.email) {
        console.error(`No email for user ${reminder.user_id}:`, userError)
        errors++
        continue
      }

      const task = reminder.scheduled_tasks as unknown as {
        title: string
        description: string | null
        priority: string
        ai_reasoning: string | null
        appliance_id: string | null
        appliances: { name: string } | null
      }
      const home = reminder.homes as unknown as { name: string }

      const applianceName = task?.appliances?.name || null
      const homeName = home?.name || 'Your Home'

      const subjectPrefix = applianceName
        ? `Your ${applianceName} maintenance is due`
        : task?.title || 'Maintenance reminder'

      const html = buildEmailHtml({
        taskTitle: task?.title || 'Maintenance Task',
        taskDescription: task?.description || null,
        aiReasoning: task?.ai_reasoning || null,
        priority: task?.priority || 'medium',
        applianceName,
        homeName,
        homeId: reminder.home_id,
        reminderType: reminder.reminder_type,
        dueDate: reminder.reminder_date,
      })

      await resend.emails.send({
        from: 'TheHomePage <reminders@thehomepage.app>',
        to: userData.user.email,
        subject: `${subjectPrefix} — ${homeName}`,
        html,
      })

      // Mark as sent
      await supabase
        .from('scheduled_reminders')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', reminder.id)

      sent++
    } catch (err) {
      console.error(`Failed to send reminder ${reminder.id}:`, err)
      errors++
    }
  }

  return NextResponse.json({ sent, errors, total: reminders.length })
}
