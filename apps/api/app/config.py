from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = {"env_file": ".env", "extra": "ignore"}

    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_ANON_KEY: str = ""
    DATABASE_URL: str = ""
    ANTHROPIC_API_KEY: str = ""
    REDIS_URL: str = "redis://redis:6379"

    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    FRONTEND_URL: str = "http://localhost:3000"

    E2B_API_KEY: str = ""

    SENTRY_DSN: str = ""
    ENVIRONMENT: str = "development"


settings = Settings()
