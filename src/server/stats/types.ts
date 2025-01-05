type Stat<N extends string> = {
    base: number;
    percents: Record<`tier${number}`, number>;
}

type hp = Stat<'hp'>;

let h: hp = {};

h.percents.tier0 = 10;