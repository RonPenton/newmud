import { registerComputeStat } from "../base/computeStat";

const registration = registerComputeStat('area');

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

