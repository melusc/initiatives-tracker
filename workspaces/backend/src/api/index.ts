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
	createOrganisationEndpoint,
	deleteOrganisation,
	getAllOrganisationsEndpoint,
	getOrganisationEndpoint,
	patchOrganisation,
} from './organisation.ts';
import {userContent} from './user-content.ts';
import {
	createPersonEndpoint,
	deletePerson,
	getAllPeopleEndpoint,
	getPersonEndpoint,
	patchPerson,
} from './persons.ts';

// eslint-disable-next-line new-cap
const router = Router();

router.use((request, response, next) => {
	if (request.method === 'GET') {
		next();
		return;
	}

	if (!response.locals.login.isAdmin) {
		response.status(403).json({
			type: 'error',
			readableError: 'Non-admins can only read resources.',
			error: 'not-an-admin',
		});
		return;
	}

	next();
});

router.get('/people', getAllPeopleEndpoint);
router.post('/person/create', createPersonEndpoint);
router.get('/person/:id', getPersonEndpoint);
router.delete('/person/:id', deletePerson);
router.patch('/person/:id', patchPerson);

router.get('/initiatives', getAllInitiativesEndpoint);
router.post('/initiative/create', createInitiativeEndpoint);
router.get('/initiative/:id', getInitiativeEndpoint);
router.delete('/initiative/:id', deleteInitiative);
router.patch('/initiative/:id', patchInitiativeEndpoint);

router.get('/organisations', getAllOrganisationsEndpoint);
router.post('/organisation/create', createOrganisationEndpoint);
router.get('/organisation/:id', getOrganisationEndpoint);
router.delete('/organisation/:id', deleteOrganisation);
router.patch('/organisation/:id', patchOrganisation);

router.put('/initiative/:initiativeId/sign/:personId', initiativeAddSignature);
router.delete(
	'/initiative/:initiativeId/sign/:personId',
	initiativeRemoveSignature,
);

router.put(
	'/initiative/:initiativeId/organisation/:organisationId',
	initiativeAddOrganisation,
);
router.delete(
	'/initiative/:initiativeId/organisation/:organisationId',
	initiativeRemoveOrganisation,
);

router.use('/user-content', userContent);

export {router as apiRouter};
