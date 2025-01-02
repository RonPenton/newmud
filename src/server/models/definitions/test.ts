function num() { return { tdef: (): number => 0 } }
function str() { return { tdef: (): string => '' } }
function bool() { return { tdef: (): boolean => false } }
function opt<T>(a: T) { return { ...a, optional: true } as const }

type Opt = { optional: true };

export type OptionalKeys<T extends TDef> = keyof {
    [K in keyof T as T[K] extends Opt ? K : never]: K;
}
export type NonOptionalKeys<T extends TDef> = keyof {
    [K in keyof T as T[K] extends Opt ? never : K]: K;
}

export type Leaf<T> =
    T extends PDef<infer U> ? U : never;

export type Rec<T extends TDef> = {
    [K in keyof T]: Leaf<T[K]>;
} 
//& {
//     [K in OptionalKeys<T>]: Leaf<T[K]>
// };

const roomdef = {
    id: num(),
    name: opt(str()),
}

const actordef = {
    id: num(),
    borp: str(),
}


interface Definitions {
    room: typeof roomdef,
    actor: typeof actordef,
}


type Names = keyof Definitions;

type PDef<T> = { tdef: () => T };

type TDef = Record<string, PDef<any>>;

type ProxyDef<T extends TDef> = Rec<T>;

type Proxy<M extends Names> = ProxyDef<Definitions[M]>;

type A = Proxy<'room'>;

type B = Proxy<'actor'>;

function test<N extends Names>(a: Proxy<N>) {
    let b: number = a.id;
    console.log(a.id);
    console.log(b);
}