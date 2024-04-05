interface IRequest {
  mode: string;
  token: string;
  challenge: string;
}

class VerifyWebhookUseCase {
  async execute({ mode, token, challenge }: IRequest): Promise<Boolean> {
    const verify_token = process.env.VERIFY_TOKEN;

    if (mode && token && challenge) {
      if (mode === 'subscribe' && token === verify_token) {
        console.log("WEBHOOK_VERIFIED");
        return true;
      } else {
        return false;
      }
    }
  }
}

export { VerifyWebhookUseCase };