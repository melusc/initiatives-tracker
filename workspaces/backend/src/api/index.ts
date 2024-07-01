import {Router} from 'express';

import {initiativeRouter} from './initiative.ts';
import {organisationRouter} from './organisation.ts';
import {personRouter} from './person.ts';
import {userContent} from './user-content.ts';

// eslint-disable-next-line new-cap
const router = Router();

router.use(organisationRouter);
router.use(initiativeRouter);
router.use(personRouter);
router.use('/user-content', userContent);

export {router as apiRouter};
