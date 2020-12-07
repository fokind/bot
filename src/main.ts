import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./AppModule";
import * as dotenv from "dotenv";
import { join } from "path";

dotenv.config();
const port = process.env.PORT || 3000;

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.setGlobalPrefix("api");
    app.useStaticAssets(join(__dirname, "../client/webapp/"));
    await app.listen(port);
    console.log(`server started at http://localhost:${port}`);
}

bootstrap();
