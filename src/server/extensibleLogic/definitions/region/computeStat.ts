import { registerCollectStats } from "../base/collectStats";

const registration = registerCollectStats('region');

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

