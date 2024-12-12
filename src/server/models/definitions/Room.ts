import { InferModel, registerModel } from "../types";

const registration = registerModel<{
    id: number;
    name: string;
    light: number;
    description: string;
}>()({
    name: 'room',
    plural: 'rooms',
    invariant: () => true
});

declare module "../Models" {
    interface Models extends InferModel<typeof registration> { }
}
