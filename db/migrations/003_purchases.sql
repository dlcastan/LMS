-- Precio por curso, en centavos de la moneda indicada.
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  ADD COLUMN IF NOT EXISTS currency    TEXT    NOT NULL DEFAULT 'ARS';

CREATE TABLE IF NOT EXISTS purchases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id         UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
  amount_cents      INTEGER NOT NULL CHECK (amount_cents > 0),
  currency          TEXT NOT NULL,
  mp_preference_id  TEXT,
  -- El mismo pago de Mercado Pago no puede asociarse a dos compras.
  mp_payment_id     TEXT UNIQUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS purchases_user_idx ON purchases (user_id);
