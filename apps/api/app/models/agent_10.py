from pydantic import BaseModel, Field, model_validator
from app.models.agent_07 import BoilerplateSetup


class BEModule(BaseModel):
    module_name: str          # "Auth Service", "User Module", ...
    endpoints: list[str]       # ["/auth/register", "/auth/login", ...] or ["/auth/*"] pattern
    dependencies: list[str] = Field(default_factory=list)


class MiddlewareChain(BaseModel):
    chain: list[str] = Field(min_length=1)   # ordered: ["CORS", "Helmet", "RateLimit", ...]


class ErrorStrategy(BaseModel):
    standard_response_shape: str   # raw JSON/code example of the error envelope
    error_codes: list[str] = Field(default_factory=list)   # e.g. ["VALIDATION_ERROR", "UNAUTHORIZED", ...]


class LoggingStrategy(BaseModel):
    tool: str
    log_levels: list[str]
    format_prod: str
    format_dev: str
    never_log: list[str] = Field(min_length=1)   # passwords, tokens, etc — always non-empty


class Agent10Output(BaseModel):
    module_plan: list[BEModule] = Field(min_length=1)
    middleware_chain: MiddlewareChain
    error_strategy: ErrorStrategy
    boilerplate_setup: BoilerplateSetup
    logging_strategy: LoggingStrategy

    @model_validator(mode="after")
    def auth_module_first_dependency(self):
        names = {m.module_name for m in self.module_plan}
        auth_like = any("auth" in n.lower() for n in names)
        if not auth_like:
            raise ValueError("module_plan must include an authentication-related module")
        return self
