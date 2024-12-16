import { ModelName } from "../models/ModelNames";

export type TypeDescriptor<T> = {
    typeDescriptor: () => T;
}

export type Optional = {
    isOptional: true;
}

export type ModelPointer<T extends ModelName> = {
    modelPointerName: T;
    typeDescriptor: () => T;
}
