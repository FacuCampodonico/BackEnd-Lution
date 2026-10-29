export interface AppConfig {
  port: number;
  env: string;
}

export default () => ({
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV ?? 'development',
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME ?? 'lution_dsw',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  frontendUrl: (process.env.FRONTEND_URL || 'http://localhost:5173').replace(
    /\/$/,
    '',
  ),
  mercadoPago: {
    accessToken: process.env.MP_ACCESS_TOKEN ?? '',
    sandbox: process.env.MP_SANDBOX !== 'false',
  },
});
