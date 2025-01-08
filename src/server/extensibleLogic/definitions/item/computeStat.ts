import { registerCollectStats } from "../base/collectStats";

const registration = registerCollectStats('item');

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

