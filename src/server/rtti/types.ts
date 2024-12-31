import { ModelName } from "../models/ModelNames";

export type TypeDescriptor<T> = {
    typeDescriptor: () => T;
    defaultValue?: T;
}

export type FullTypeDescriptor<T> = TypeDescriptor<T> & Partial<
    Optional & Nullable & ReadOnly & ModelPointer<any> & IsObject & IsProperties & ModelEvents<any>
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

export type ModelEvents<T extends ModelName> = {
    modelEventsName: T
}

export type OwnedBy = {
    ownedBy: true;
}

export type TemplatedFrom = {
    templatedFrom: true;
}

export type IsObject = {
    object: ObjectDescriptor;
}

export type IsProperties = {
    properties: true;
}

export function isObject(obj: any): obj is IsObject {
    return !!obj && obj.object !== undefined && typeof obj.object === 'object';
}

export function isModelPointer(obj: any): obj is ModelPointer<any> {
    return !!obj && obj.modelPointerName !== undefined;
}

export function isOwnedBy(obj: any): obj is OwnedBy {
    return !!obj && obj.ownedBy !== undefined;
}

export function isTwoWayLink(obj: any): obj is OwnedBy & ModelPointer<any> {
    return !!obj && obj.ownedBy !== undefined && obj.modelPointerName !== undefined;
}
