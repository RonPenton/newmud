import { registerComputeStat } from "../base/computeStat";

const registration = registerComputeStat('item');

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

