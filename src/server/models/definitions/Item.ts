import { InferModel, registerModel } from "../types";

const registration = registerModel<{
    id: number;
    name: string;
    roomId?: number;
    actorId?: number;
}>()({
    name: 'item',
    plural: 'items',
    invariant: () => true
});

declare module "../Models" {
    interface Models extends InferModel<typeof registration> { }
}
