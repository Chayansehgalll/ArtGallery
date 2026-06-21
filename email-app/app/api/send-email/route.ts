import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import type { Attachment } from 'nodemailer/lib/mailer'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let to: string
    let subject: string
    let emailBody: string
    let isHtml: boolean = true
    let attachments: Attachment[] = []

    // Handle multipart/form-data (with file uploads)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      to = formData.get('to') as string
      subject = formData.get('subject') as string
      emailBody = formData.get('body') as string
      isHtml = formData.get('isHtml') !== 'false'

      // Process file attachments
      const files = formData.getAll('attachments')
      for (const file of files) {
        if (file instanceof File) {
          const buffer = Buffer.from(await file.arrayBuffer())
          attachments.push({
            filename: file.name,
            content: buffer,
            contentType: file.type,
          })
        }
      }
    } 
    // Handle JSON (no file uploads)
    else {
      const body = await request.json()
      to = body.to
      subject = body.subject
      emailBody = body.body
      isHtml = body.isHtml !== undefined ? body.isHtml : true
      
      // Support base64 encoded attachments in JSON
      if (body.attachments && Array.isArray(body.attachments)) {
        attachments = body.attachments.map((att: any) => ({
          filename: att.filename,
          content: Buffer.from(att.content, 'base64'),
          contentType: att.contentType,
        }))
      }
    }

    // Validate required fields
    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: to, subject, and body are required' 
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email address' 
        },
        { status: 400 }
      )
    }

    // Send email using the singleton transporter
    const result = await sendEmail({
      to,
      subject,
      body: emailBody,
      isHtml,
      attachments: attachments.length > 0 ? attachments : undefined,
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
