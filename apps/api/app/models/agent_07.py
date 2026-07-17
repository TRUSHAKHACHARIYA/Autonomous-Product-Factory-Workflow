from pydantic import BaseModel, Field, model_validator


class FEModule(BaseModel):
    module_name: str
    files: list[str]
    dependencies: list[str] = Field(default_factory=list)


class ComponentContract(BaseModel):
    component_name: str
    props_interface: str


class BoilerplateSetup(BaseModel):
    setup_commands: list[str]
    key_dependencies: list[str]
    config_files: list[str]


class RouteEntry(BaseModel):
    path: str
    component: str
    protected: bool
    role_restriction: str | None = None


class StateStrategy(BaseModel):
    global_state_tool: str
    stores: list[str]
    server_state_tool: str
    form_state_tool: str


class Agent07Output(BaseModel):
    module_plan: list[FEModule] = Field(min_length=2, max_length=6)
    component_contracts: list[ComponentContract] = Field(min_length=1)
    boilerplate_setup: BoilerplateSetup
    routing_structure: list[RouteEntry] = Field(min_length=1)
    state_strategy: StateStrategy

    @model_validator(mode="after")
    def require_shared_components_module(self):
        names = {m.module_name for m in self.module_plan}
        if "Shared Components" not in names:
            raise ValueError(
                "module_plan must include a 'Shared Components' module"
                " — every other module depends on it"
            )
        return self
