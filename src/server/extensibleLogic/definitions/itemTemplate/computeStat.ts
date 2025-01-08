import { registerCollectStats } from "../base/collectStats";

const registration = registerCollectStats('itemTemplate');

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

