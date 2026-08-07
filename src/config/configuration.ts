export interface AppConfig {
  port: number;
  env: string;
}

export default (): AppConfig => ({
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV ?? 'development',
});
