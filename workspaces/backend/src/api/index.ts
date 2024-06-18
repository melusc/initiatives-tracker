import {Router} from 'express';
import {
	createUser,
	deleteUser,
	getAllUsers,
	getUser,
	patchUser,
} from './users.ts';
import {
	createInitiative,
	deleteInitiative,
	getAllInitiatives,
	getInitiative,
	initiativeAddOrganisation,
	initiativeAddSignature,
	initiativeRemoveOrganisation,
	initiativeRemoveSignature,
	patchInitiative,
} from './initiative.ts';
import {userContent} from './user-content.ts';
import {
	createOrganisation,
	deleteOrganisation,
	getAllOrganisations,
	getOrganisation,
	patchOrganisation,
} from './organisation.ts';

// eslint-disable-next-line new-cap
const router = Router();

router.use((request, response, next) => {
	if (request.method === 'GET') {
		next();
		return;
	}

	if (!response.locals.user.isAdmin) {
		response.status(403).json({
			type: 'error',
			readableError: 'Non-admins can only read resources.',
			error: 'not-an-admin',
		});
		return;
	}

	next();
});

router.get('/users', getAllUsers);
router.post('/user/create', createUser);
router.get('/user/:id', getUser);
router.delete('/user/:id', deleteUser);
router.patch('/user/:id', patchUser);

router.get('/initiatives', getAllInitiatives);
router.post('/initiative/create', createInitiative);
router.get('/initiative/:id', getInitiative);
router.delete('/initiative/:id', deleteInitiative);
router.patch('/initiative/:id', patchInitiative);

router.get('/organisations', getAllOrganisations);
router.post('/organisation/create', createOrganisation);
router.get('/organisation/:id', getOrganisation);
router.delete('/organisation/:id', deleteOrganisation);
router.patch('/organisation/:id', patchOrganisation);

router.put('/initiative/:initiativeId/sign/:userId', initiativeAddSignature);
router.delete(
	'/initiative/:initiativeId/sign/:userId',
	initiativeRemoveSignature,
);

router.put('/initiative/:initiativeId/organisation/:organisation', initiativeAddOrganisation)
router.delete('/initiative/:initiativeId/organisation/:organisation', initiativeRemoveOrganisation)

router.use('/user-content', userContent);

export {router as apiRouter};
