import { registerComputeStat } from "../base/computeStat";

const registration = registerComputeStat('itemTemplate');

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

