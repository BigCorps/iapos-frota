// Environment variables for IAPOS
// No Manus dependencies - pure standalone configuration

export const ENV = {
  // Core
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "3000", 10),
  cookieSecret: process.env.JWT_SECRET ?? "your-secret-key-change-in-production",
  databaseUrl: process.env.DATABASE_URL ?? "",
  
  // Email
  emailProvider: process.env.EMAIL_PROVIDER ?? "sendgrid",
  emailApiKey: process.env.EMAIL_API_KEY ?? "",
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS ?? "noreply@iapos.com",
  
  // Payments
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  mercadoPagoAccessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN ?? "",
  
  // AWS S3
  awsRegion: process.env.AWS_REGION ?? "us-east-1",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  awsS3Bucket: process.env.AWS_S3_BUCKET ?? "iapos-storage",
  
  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
};
