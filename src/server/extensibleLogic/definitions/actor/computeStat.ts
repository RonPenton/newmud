import { registerCollectStats } from "../base/collectStats";

const registration = registerCollectStats('actor');

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

