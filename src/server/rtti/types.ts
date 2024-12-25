import { ModelName } from "../models/ModelNames";

export type TypeDescriptor<T> = {
    typeDescriptor: () => T;
    defaultValue?: T;
}

export type FullTypeDescriptor<T> = TypeDescriptor<T> & Partial<
    Optional & Nullable & ReadOnly & ModelPointer<any> & IsObject
>;

export type ObjectDescriptor = Record<string, FullTypeDescriptor<any>>;

export type DbObjectDescriptor = {
    id: TypeDescriptor<number> & ReadOnly;
    name: TypeDescriptor<string>;
} & Omit<ObjectDescriptor, 'id' | 'name'>;


export type Optional = {
    isOptional: true;
}

export type Nullable = {
    isNullable: true;
}

export type ReadOnly = {
    isReadOnly: true;
}

export type ModelPointer<T extends ModelName> = {
    modelPointerName: T;
}

export type IsObject = {
    object: ObjectDescriptor;
}

export function isObject(obj: any): obj is IsObject {
    return obj.object !== undefined && typeof obj.object === 'object';
}

export function isModelPointer(obj: any): obj is ModelPointer<any> {
    return obj.modelPointerName !== undefined;
}
