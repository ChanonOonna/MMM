import { Router } from "express";
import { prisma } from "../../lib/prisma";

const router = Router();

router.get("/sports", async (_req, res) => {
  const sports = await prisma.sport.findMany({ orderBy: { name: "asc" } });
  res.json(sports);
});

router.get("/venues", async (_req, res) => {
  const venues = await prisma.venue.findMany({ orderBy: { name: "asc" } });
  res.json(venues);
});

export default router;
