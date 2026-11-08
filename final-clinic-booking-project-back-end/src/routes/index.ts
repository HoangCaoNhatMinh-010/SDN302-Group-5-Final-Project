import { Router } from "express";
import appointments from "./appointments";
import auth from "./auth";
import catalog from "./catalog";
import operations from "./operations";
import schedules from "./schedules";

const router = Router();

router.use("/auth", auth);
router.use("/", catalog);
router.use("/schedules", schedules);
router.use("/appointments", appointments);
router.use("/", operations);

export default router;
