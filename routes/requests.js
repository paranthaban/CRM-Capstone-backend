import express from 'express';
import { verifyRolePermission } from '../middleware/verifyRolePermission.js';
import { USER_ROLES } from '../config/user_Roles.js';
import { verifyAccessToken } from '../middleware/verifyAccessToken.js';
import { createRequest, getAllRequests, getRequests, updateRequest, updateSummary } from '../controllers/requestController.js';

const router = express.Router();

router.post('/get-requests', verifyAccessToken, getRequests )

router.post('/get-all-requests', verifyAccessToken,verifyRolePermission( USER_ROLES.Admin), getAllRequests )

router.post('/create-request', verifyAccessToken, 
verifyRolePermission(USER_ROLES.Customer, USER_ROLES.Engineer, USER_ROLES.Admin),  createRequest )

router.post('/update-status', verifyAccessToken, 
verifyRolePermission( USER_ROLES.Engineer, USER_ROLES.Admin),  updateRequest )

router.post('/update-summary', verifyAccessToken, 
verifyRolePermission( USER_ROLES.Engineer, USER_ROLES.Admin),  updateSummary )

export const requestRouter = router;