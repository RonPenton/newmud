import { registerComputeStat } from "../base/computeStat";

const registration = registerComputeStat('region');

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

