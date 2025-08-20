import { Router } from 'express'
import passport from 'passport'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const router = Router()
const prisma = new PrismaClient()

function issueToken(user: { id: string; email: string }) {
	return jwt.sign(
		{ userId: user.id, email: user.email },
		process.env.JWT_SECRET || 'fallback-secret',
		{ expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
	)
}

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get(
	'/google/callback',
	passport.authenticate('google', { session: false, failureRedirect: '/' }),
	async (req: any, res) => {
		const profile = req.user as { id: string; emails?: Array<{ value: string }> }
		const email = profile.emails?.[0]?.value
		if (!email) return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=email`)

		let user = await prisma.user.findUnique({ where: { email } })
		if (!user) {
			user = await prisma.user.create({ data: { email, passwordHash: '', googleId: profile.id } })
		} else if (!user.googleId) {
			await prisma.user.update({ where: { id: user.id }, data: { googleId: profile.id } })
		}

		const token = issueToken({ id: user.id, email: user.email })
		res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}`)
	}
)

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }))

router.get(
	'/github/callback',
	passport.authenticate('github', { session: false, failureRedirect: '/' }),
	async (req: any, res) => {
		const profile = req.user as { id: string; emails?: Array<{ value: string }> }
		const email = profile.emails?.[0]?.value
		if (!email) return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=email`)

		let user = await prisma.user.findUnique({ where: { email } })
		if (!user) {
			user = await prisma.user.create({ data: { email, passwordHash: '', githubId: profile.id } })
		} else if (!user.githubId) {
			await prisma.user.update({ where: { id: user.id }, data: { githubId: profile.id } })
		}

		const token = issueToken({ id: user.id, email: user.email })
		res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${token}`)
	}
)

export { router as oauthRoutes }
