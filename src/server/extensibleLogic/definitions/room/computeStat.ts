import { registerComputeStat } from "../base/computeStat";

const registration = registerComputeStat('room');

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

