import Decimal from "decimal.js";
import { parse, stringify } from "../src/server/db/serialize";


describe('test', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('deserializes decimals', () => {
        const item = JSON.stringify({
            property: { __type: 'Decimal', value: '42526.4' },
            array: [
                { __type: 'Decimal', value: '42' },
                { __type: 'Decimal', value: '0.00000001' },
                { __type: 'Decimal', value: '1e2000' }
            ]
        });

        let x = parse('item', item) as any;

        expect((x.property as Decimal).eq(42526.4)).toEqual(true);
        expect((x.array[0] as Decimal).eq(42)).toEqual(true);
        expect((x.array[1] as Decimal).eq(0.00000001)).toEqual(true);
        expect((x.array[2] as Decimal).eq(new Decimal("1e2000"))).toEqual(true);
    });

    test('round trip', () => {
        const item = {
            native: 123,
            nativeStr: "12345",
            property: new Decimal(42526.4),
            array: [new Decimal(42), new Decimal(0.00000001), new Decimal("1e2000")],
            nested: {
                nest1: new Decimal("-97097204967029476092746029746924375026982606086123957295629"),
                nestArray: [{
                    nest2: new Decimal("-1.00000000000000000000000000000000000001")
                }, {
                    nest2: new Decimal("3.00000000000000000040000000000000000001")
                }]
            }
        } as any;

        const ser = stringify(item);
        console.log(ser);
        const des = parse('item', ser) as any;

        expect(des.native).toEqual(123);
        expect(des.nativeStr).toEqual("12345");
        expect((des.property as Decimal).eq(42526.4)).toBe(true);
        expect((des.array[0] as Decimal).eq(42)).toBe(true);
        expect((des.array[1] as Decimal).eq(0.00000001)).toBe(true);
        expect((des.array[2] as Decimal).eq(new Decimal("1e2000"))).toBe(true);
        expect((des.nested.nest1 as Decimal).eq(new Decimal("-97097204967029476092746029746924375026982606086123957295629"))).toBe(true);
        expect((des.nested.nestArray[0].nest2 as Decimal).eq(new Decimal("-1.00000000000000000000000000000000000001"))).toBe(true);
        expect((des.nested.nestArray[1].nest2 as Decimal).eq(new Decimal("3.00000000000000000040000000000000000001"))).toBe(true);
    });

});