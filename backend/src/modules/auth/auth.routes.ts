import { Router } from "express";
import { body, validationResult } from "express-validator";
import { authRateLimiter } from "../../middleware/rateLimiter";
import { requireAuth, AuthedRequest } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import {
  AuthError,
  loginUser,
  logoutAllSessions,
  logoutSession,
  registerUser,
  rotateAccessToken,
} from "./auth.service";

const router = Router();

const REFRESH_COOKIE = "refreshToken";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth",
};

function validate(req: any, res: any) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }
  return true;
}

router.post(
  "/register",
  authRateLimiter,
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  body("firstName").notEmpty(),
  body("lastName").notEmpty(),
  asyncHandler(async (req, res) => {
    if (!validate(req, res)) return;

    try {
      const user = await registerUser(req.body);
      res.status(201).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return res.status(error.status).json({ error: error.message });
      }
      throw error;
    }
  })
);

router.post(
  "/login",
  authRateLimiter,
  body("email").isEmail(),
  body("password").notEmpty(),
  asyncHandler(async (req, res) => {
    if (!validate(req, res)) return;

    try {
      const { user, accessToken, refreshToken } = await loginUser({
        email: req.body.email,
        password: req.body.password,
        deviceInfo: req.headers["user-agent"],
        ip: req.ip,
      });

      res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTIONS);
      res.json({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error) {
      if (error instanceof AuthError) {
        return res.status(error.status).json({ error: error.message });
      }
      throw error;
    }
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) {
      return res.status(401).json({ error: "Missing refresh token" });
    }

    try {
      const accessToken = await rotateAccessToken(refreshToken);
      res.json({ accessToken });
    } catch (error) {
      if (error instanceof AuthError) {
        return res.status(error.status).json({ error: error.message });
      }
      throw error;
    }
  })
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    if (refreshToken) {
      await logoutSession(refreshToken);
    }
    res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTIONS);
    res.status(204).send();
  })
);

router.post(
  "/logout-all",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await logoutAllSessions(req.user!.id);
    res.clearCookie(REFRESH_COOKIE, REFRESH_COOKIE_OPTIONS);
    res.status(204).send();
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    res.json({ id: req.user!.id, role: req.user!.role });
  })
);

export default router;
