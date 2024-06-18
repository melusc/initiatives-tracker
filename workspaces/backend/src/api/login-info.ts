import type {LoginInfo} from '@lusc/initiatives-tracker-util/types.js';
import type {RequestHandler} from 'express';

export const getLoginInfo: RequestHandler = (_request, response) => {
	const {user} = response.locals;
	response.status(200).json({
		name: user.username,
		id: user.userId,
		isAdmin: user.isAdmin,
		icon: `/icon/${user.userId}`,
	} satisfies LoginInfo);
};
