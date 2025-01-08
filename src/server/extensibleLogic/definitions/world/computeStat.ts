import { registerCollectStats } from "../base/collectStats";

const registration = registerCollectStats('world');

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

