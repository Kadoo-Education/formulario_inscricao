import snowflake from 'snowflake-sdk';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Decripta a chave P8 (PKCS8 encriptado) usando a senha do .env e retorna
// o PEM desencriptado -- formato que o snowflake-sdk espera em `privateKey`.
function getDecryptedPrivateKey(): string {
  const keyPath = path.resolve(process.cwd(), process.env.SF_P8_PATH!);
  const keyFile = fs.readFileSync(keyPath, 'utf8');
  const passphrase = process.env.SF_P8_PASSWORD;

  const privateKeyObject = crypto.createPrivateKey({
    key: keyFile,
    format: 'pem',
    ...(passphrase ? { passphrase } : {}),
  });

  return privateKeyObject.export({ format: 'pem', type: 'pkcs8' }) as string;
}

export function executeQuery<T = Record<string, unknown>>(
  sql: string,
  schema = process.env.SF_SCHEMA ?? 'EQTL_CORP',
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    let privateKey: string;
    try {
      privateKey = getDecryptedPrivateKey();
    } catch (e) {
      return reject(new Error('Erro ao ler a chave P8: ' + (e as Error).message));
    }

    const conn = snowflake.createConnection({
      account: process.env.SF_ACCOUNT!,
      username: process.env.SF_USER!,
      authenticator: 'SNOWFLAKE_JWT',
      privateKey,
      warehouse: process.env.SF_WAREHOUSE,
      database: process.env.SF_DATABASE,
      schema,
      role: process.env.SF_ROLE,
    });

    conn.connect((err) => {
      if (err) return reject(new Error('Erro ao conectar no Snowflake: ' + err.message));

      conn.execute({
        sqlText: sql,
        complete: (err, _stmt, rows) => {
          conn.destroy(() => {});
          if (err) return reject(new Error('Erro na query: ' + err.message));
          resolve((rows ?? []) as T[]);
        },
      });
    });
  });
}
