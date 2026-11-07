import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler, notFound } from "./common/middleware/error.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);

export default app;