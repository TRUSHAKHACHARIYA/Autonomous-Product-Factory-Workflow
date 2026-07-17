from pydantic import BaseModel, Field


class ColorToken(BaseModel):
    token: str
    value: str
    usage: str


class TypographyRole(BaseModel):
    role: str
    font: str
    size: str
    weight: str


class DesignSystem(BaseModel):
    color_tokens: list[ColorToken] = Field(min_length=1)
    typography: list[TypographyRole] = Field(min_length=1)
    spacing_scale: list[str] = Field(min_length=1)


class ComponentSpec(BaseModel):
    name: str
    variants: list[str]
    sizes: list[str] = Field(default_factory=list)
    states: list[str]
    notes: str = ""


class UserFlow(BaseModel):
    name: str
    steps: list[str]


class WireframePage(BaseModel):
    page_name: str
    elements: list[str]


class Agent06Output(BaseModel):
    design_system: DesignSystem
    component_specs: list[ComponentSpec] = Field(min_length=1)
    user_flows: list[UserFlow] = Field(min_length=1)
    wireframes: list[WireframePage] = Field(min_length=1)
    responsive_breakpoints: list[str] = Field(min_length=1)
    accessibility_guidelines: list[str] = Field(min_length=3)
