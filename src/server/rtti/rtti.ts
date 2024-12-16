import { ModelName } from "../models/ModelNames";
import { ModelPointer, Optional, ReadOnly, TypeDescriptor } from "./types";

export type RTTIType = {
    id: () => TypeDescriptor<number> & ReadOnly;
    of: <T>() => TypeDescriptor<T>;
    modelPointer: <T extends ModelName>(modelName: T) => ModelPointer<T>;
    optional: <T extends TypeDescriptor<any>>(descriptor: T) => T & Optional;
}

export const RTTI: RTTIType = {
    id: () => {
        return {
            typeDescriptor: () => { throw new Error('not implemented') },
            isReadOnly: true,
        };
    },
    
    of: () => {
        return {
            typeDescriptor: () => { throw new Error('not implemented') },
        };
    },

    modelPointer: (modelName) => {
        return {
            modelPointerName: modelName,
            typeDescriptor: () => { throw new Error('not implemented') },
        };
    },

    optional: (descriptor) => {
        return {
            ...descriptor,
            typeDescriptor: () => { throw new Error('not implemented') },
            isOptional: true,
        };
    },
}
