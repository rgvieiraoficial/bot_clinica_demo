import { VerifyWebhookUseCase } from "./VerifyWebhookUseCase";
import { VerifyWebhookController } from "./VerifyWebhookController";

const verifyWebhookUseCase = new VerifyWebhookUseCase();
const verifyWebhookController = new VerifyWebhookController(verifyWebhookUseCase);

export { verifyWebhookController };