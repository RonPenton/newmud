import { InferModel, registerModel } from "../types";

const registration = registerModel<{
    id: number;
    name: string;
    roomId: number;
}>()({
    name: 'actor',
    plural: 'actors',
    invariant: () => true
});

declare module "../Models" {
    interface Models extends InferModel<typeof registration> { }
}
