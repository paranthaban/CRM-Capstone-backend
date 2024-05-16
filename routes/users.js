import express from 'express';
import {accountActivation, authorizePwdReset, deleteOldPic, forgotPassword, handleLogin, 
    handleRegisterUser, resendActivation, resetPassword, updatePhone, updateProfilePic} from '../controllers/userController.js'
import { verifyAccessToken } from '../middleware/verifyAccessToken.js';

const router = express.Router();

router.post('/register', handleRegisterUser )  
router.post('/login', handleLogin )  
router.post('/activate/:id/:token', accountActivation )  
router.post('/activate-mail', resendActivation)
router.post('/forgotpwd', forgotPassword)
router.post('/forgotpwd/authorize/:id/:token', authorizePwdReset)
router.post('/reset-pwd/:id/:token', resetPassword)

router.put('/update-pic', verifyAccessToken, updateProfilePic)
router.put('/update-phone', verifyAccessToken, updatePhone)
router.delete('/delete-pic', verifyAccessToken, deleteOldPic)
export const userRouter = router;