import { registerCollectStats } from "../base/collectStats";

const registration = registerCollectStats('area');

declare module "../../Logic" { interface LogicRaw extends InferLogic<typeof registration> { } }

