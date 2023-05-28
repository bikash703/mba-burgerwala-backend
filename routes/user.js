import express from 'express';
import passport from 'passport';
import { getAdminStats, getAllUsers, logout, myprofile } from '../controllers/myProfile.js';
import { authorizeAdmin, isAuthenticated } from '../middelware/auth.js';

const router = express.Router()

router.get('/googleLogin',passport.authenticate("google",{
    scope:["profile"]
}))

router.get('/login',passport.authenticate("google",{
   successRedirect:process.env.FRONTED_URL,
}))


router.get('/me',isAuthenticated,myprofile)

//Add admin middleware

router.get('/logout',logout)

router.get("/admin/users",isAuthenticated,authorizeAdmin,getAllUsers)

router.get("/admin/stats",isAuthenticated,authorizeAdmin,getAdminStats)


export default router;