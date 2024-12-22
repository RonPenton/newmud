import { DbModelName } from "../models/ModelNames";
import { Storage } from '../models/types';
import { parse as losslessParse, stringify as losslessStringify } from 'lossless-json'
import Decimal from 'decimal.js'

function decimalReplacer(_key: string, value: any): any {
    if (value instanceof Decimal) {
        return { __type: 'Decimal', value: value.toString() };
    }
    return value;
}

function decimalReviver(_key: string, value: any): any {
    if (value && value.__type === 'Decimal') {
        return new Decimal(value.value);
    }
    return value;
}

function parseNumber(value: any) {
    return parseFloat(value)
}

export function parse<T extends DbModelName>(_type: T, obj: string): Storage<T> {
    return losslessParse(obj, decimalReviver, parseNumber) as Storage<T>;
}

export function stringify<T extends DbModelName>(obj: Storage<T>): string {
    return losslessStringify(obj, decimalReplacer) ?? '';
}
