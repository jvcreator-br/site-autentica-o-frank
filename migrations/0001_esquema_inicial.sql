-- IF NOT EXISTS preserva as tabelas de autenticação já existentes no D1.
-- Os campos correspondem aos INSERTs e SELECTs das Functions do site.
CREATE TABLE IF NOT EXISTS oauth_transactions (
  id_hash TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  state_hash TEXT NOT NULL,
  nonce TEXT,
  code_verifier TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS oauth_transactions_expiry
  ON oauth_transactions (expires_at);

CREATE TABLE IF NOT EXISTS sessions (
  id_hash TEXT PRIMARY KEY,
  issuer TEXT NOT NULL,
  subject TEXT NOT NULL,
  email TEXT,
  display_name TEXT,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions (expires_at);

-- Tabela separada para os exercícios da avaliação.
CREATE TABLE IF NOT EXISTS notas (
  id INTEGER PRIMARY KEY,
  aluno TEXT NOT NULL,
  nota REAL
);
