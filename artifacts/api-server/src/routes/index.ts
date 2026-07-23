import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import leadsRouter from "./leads";
import clientsRouter from "./clients";
import projectsRouter from "./projects";
import tasksRouter from "./tasks";
import teamRouter from "./team";
import invoicesRouter from "./invoices";
import ticketsRouter from "./tickets";
import servicesRouter from "./services";
import portfolioRouter from "./portfolio";
import messagesRouter from "./messages";
import notificationsRouter from "./notifications";
import aiRouter from "./ai";
import imagekitRouter from "./imagekit";
import usersRouter from "./users";
import siteSettingsRouter from "./site-settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(leadsRouter);
router.use(clientsRouter);
router.use(projectsRouter);
router.use(tasksRouter);
router.use(teamRouter);
router.use(invoicesRouter);
router.use(ticketsRouter);
router.use(servicesRouter);
router.use(portfolioRouter);
router.use(messagesRouter);
router.use(notificationsRouter);
router.use(aiRouter);
router.use(imagekitRouter);
router.use(usersRouter);
router.use(siteSettingsRouter);

export default router;

