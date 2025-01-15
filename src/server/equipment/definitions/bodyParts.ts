import { registerBodyPart } from "../bodyParts";

const registrations = {
    hand: registerBodyPart({
        name: 'hand',
        description: 'Your hand.'
    }),
    head: registerBodyPart({
        name: 'head',
        description: 'Your head.'
    }),
} as const;

declare module "../bodyParts" { interface BodyParts extends InferBodyParts<typeof registrations> { } }
