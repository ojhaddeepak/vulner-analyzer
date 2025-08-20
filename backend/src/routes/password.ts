import { Router } from 'express'
import { z } from 'zod'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { PrismaClient } from '@prisma/client'
import { createError } from '../middleware/errorHandler'

const router = Router()
const prisma = new PrismaClient()

const forgotSchema = z.object({
	email: z.string().email(),
})

const resetSchema = z.object({
	token: z.string().min(10),
	password: z.string().min(8),
})

function createTransport() {
	const host = process.env.SMTP_HOST
	const port = Number(process.env.SMTP_PORT || 587)
	const user = process.env.SMTP_USER
	const pass = process.env.SMTP_PASS
	if (!host || !user || !pass) throw new Error('Email not configured')
	return nodemailer.createTransport({
		host,
		port,
		secure: port === 465,
		auth: { user, pass },
	})
}

router.post('/forgot', async (req, res, next) => {
	try {
		const { email } = forgotSchema.parse(req.body)
		const user = await prisma.user.findUnique({ where: { email } })
		if (!user) return res.json({ message: 'If the email exists, a reset code was sent' })

		const token = crypto.randomInt(100000, 999999).toString() // 6-digit OTP
		const exp = new Date(Date.now() + 15 * 60 * 1000)

		await prisma.user.update({
			where: { id: user.id },
			data: { resetToken: token, resetTokenExp: exp },
		})

		const transporter = createTransport()
		await transporter.sendMail({
			from: process.env.SMTP_FROM || 'no-reply@security-tool.local',
			to: email,
			subject: 'Your password reset code',
			text: `Your OTP is ${token}. It expires in 15 minutes.`,
		})

		res.json({ message: 'If the email exists, a reset code was sent' })
	} catch (err) {
		next(err)
	}
})

router.post('/reset', async (req, res, next) => {
	try {
		const { token, password } = resetSchema.parse(req.body)
		const user = await prisma.user.findFirst({
			where: { resetToken: token, resetTokenExp: { gt: new Date() } },
		})
		if (!user) throw createError('Invalid or expired token', 400)

		const bcrypt = await import('bcryptjs')
		const passwordHash = await bcrypt.hash(password, 12)

		await prisma.user.update({
			where: { id: user.id },
			data: { passwordHash, resetToken: null, resetTokenExp: null },
		})

		res.json({ message: 'Password reset successful' })
	} catch (err) {
		next(err)
	}
})

export { router as passwordRoutes }
