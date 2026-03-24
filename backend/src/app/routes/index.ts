import { Router } from "express";

import { alertsRouter } from "../../modules/alerts/alerts.routes.js";
import { entriesRouter } from "../../modules/entries/entries.routes.js";
import { hospitalsRouter } from "../../modules/hospitals/hospitals.routes.js";
import { invoicesRouter } from "../../modules/invoices/invoices.routes.js";
import { paymentsRouter } from "../../modules/payments/payments.routes.js";

export const apiRouter = Router();

apiRouter.use("/alerts", alertsRouter);
apiRouter.use("/entries", entriesRouter);
apiRouter.use("/hospitals", hospitalsRouter);
apiRouter.use("/invoices", invoicesRouter);
apiRouter.use("/payments", paymentsRouter);
