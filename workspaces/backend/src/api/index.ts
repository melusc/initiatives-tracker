import {Router} from 'express';

import {
	createInitiativeEndpoint,
	deleteInitiative,
	getAllInitiativesEndpoint,
	getInitiativeEndpoint,
	initiativeAddOrganisation,
	initiativeAddSignature,
	initiativeRemoveOrganisation,
	initiativeRemoveSignature,
	patchInitiativeEndpoint,
} from './initiative.ts';
import {
	createOrganisation,
	deleteOrganisation,
	getAllOrganisations,
	getOrganisation,
	patchOrganisation,
} from './organisation.ts';
import {userContent} from './user-content.ts';
import {
	createUser,
	deleteUser,
	getAllUsers,
	getUser,
	patchUser,
} from './users.ts';

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

router.get('/initiatives', getAllInitiativesEndpoint);
router.post('/initiative/create', createInitiativeEndpoint);
router.get('/initiative/:id', getInitiativeEndpoint);
router.delete('/initiative/:id', deleteInitiative);
router.patch('/initiative/:id', patchInitiativeEndpoint);

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

router.put(
	'/initiative/:initiativeId/organisation/:organisation',
	initiativeAddOrganisation,
);
router.delete(
	'/initiative/:initiativeId/organisation/:organisation',
	initiativeRemoveOrganisation,
);

router.use('/user-content', userContent);

export {router as apiRouter};
