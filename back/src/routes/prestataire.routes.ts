import { Hono } from 'hono'
import { PrestataireService } from '../services/prestataire.service.js'
import type { CreatePrestataireDto } from '../dto/createPrestataireDto.js'
import { guard } from '../middleware/auth.middleware.js'
import { getUserId } from '../utils/jwt.utils.js'
import type { UpdatePrestataireDto } from '../dto/UpdatePrestataireDto.js'

const prestataire = new Hono()
const prestataireService = new PrestataireService()

// Route pour récupérer le prestataire de l'utilisateur connecté
prestataire.get('/me', guard, async (c) => {
	const token = c.req.header('Authorization')

	if (!token) return c.json('Token is missing', 401)

	const userId = getUserId(token)

	try {
		const prestataireData = await prestataireService.getPrestataireById(Number(userId))
		if (!prestataireData) {
			return c.json({ success: false, message: 'Prestataire non trouvé' }, 404)
		}
		return c.json({ success: true, data: prestataireData })
	} catch (err) {
		console.error('Erreur récupération prestataire :', err)
		return c.json({ success: false, message: 'Erreur serveur.' }, 500)
	}
})

prestataire.post('/', guard, async (c) => {
	const token = c.req.header('Authorization')

	if (!token) return c.json('Token is missing', 401)

	const body = (await c.req.json()) as CreatePrestataireDto

	const userId = getUserId(token)

	body.id_users = Number(userId)

	try {
		const result = await prestataireService.createPrestataire(body)
		return c.json(
			{
				success: true,
				data: {
					id: result.id,
					token: result.token
				},
				message: 'Prestataire created successfully. New JWT token provided with updated role.'
			},
			201
		)
	} catch (err) {
		console.error('Erreur création prestataire :', err)
		return c.json({ success: false, message: 'Erreur serveur.' }, 500)
	}
})

prestataire.patch('/:id', guard, async (c) => {
	const token = c.req.header('Authorization')
	if (!token) return c.json({ error: 'Token is missing' }, 401)

	const id = Number(c.req.param('id'))
	const body = (await c.req.json()) as UpdatePrestataireDto

	try {
		await prestataireService.updatePrestataire(id, body)
		return c.json({ success: true })
	} catch (err) {
		console.error('Erreur update prestataire :', err)
		return c.json({ success: false, message: 'Erreur serveur.' }, 500)
	}
})

prestataire.get('/:id', guard, async (c) => {
	const id = c.req.param('id')

	const token = c.req.header('Authorization')

	if (!token) return c.json('Token is missing', 401)

	try {
		const prestataireData = await prestataireService.getPrestataireById(Number(id))
		if (!prestataireData) {
			return c.json({ success: false, message: 'Prestataire non trouvé' }, 404)
		}
		return c.json({ success: true, data: prestataireData })
	} catch (err) {
		console.error('Erreur récupération prestataire :', err)
		return c.json({ success: false, message: 'Erreur serveur.' }, 500)
	}
})

export default prestataire
