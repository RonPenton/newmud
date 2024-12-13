import { registerAction } from "../registry";
import { InferAction, Type } from "../action";
import { Direction } from "../../utils/direction";

const registration = registerAction({
    name: 'move',
    descriptor: {
        actor: Type.model('actor'),
        direction: Type.of<Direction>()
    },
    action: () => {}
});

registration.descriptor;

declare module "../Actions" {
    interface Models extends InferAction<typeof registration> { }
}
