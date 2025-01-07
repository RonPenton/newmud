import { registerComputeStat } from "../base/computeStat";

const registration = registerComputeStat('world');

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

