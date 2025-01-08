import { registerCollectStats } from "../base/collectStats";

const registration = registerCollectStats('room');

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

