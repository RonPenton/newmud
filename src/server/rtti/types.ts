import { ModelName } from "../models/ModelNames";

export type TypeDescriptor<T> = {
    typeDescriptor: () => T;
    defaultValue?: T;
}

export type FullTypeDescriptor<T> = TypeDescriptor<T> & Partial<
    Optional & Nullable & ReadOnly & ModelPointer<any> & IsObject
>;

export type ObjectDescriptor = Record<string, TypeDescriptor<any>>;

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
    typeDescriptor: () => T;
}

export type IsObject = {
    object: ObjectDescriptor;
}
