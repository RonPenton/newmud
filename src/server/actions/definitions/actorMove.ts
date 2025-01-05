import { RTTI } from "../../rtti";
import { Direction } from "../../utils/direction";
import { registerAction } from "../Actions";

const registration = registerAction({
    name: 'actorMove',
    parameters: RTTI.object({
        actor: RTTI.modelPointer('actor'),
        direction: RTTI.of<Direction>(),
    }),
    implementation: ({ universe, actor, direction }) => {
        const startingRoom = actor.room;
        const exit = startingRoom.exits[direction];
        if (!exit) { return; }

        const destinationRoom = exit.room;
        if (!destinationRoom) { return; }

        const params = {
            universe,
            actor,
            startingRoom,
            destinationRoom,
            direction,
            exit,
        };


        const canExit = startingRoom.logic.canExit(params);
        if(!canExit) { return; }

        const canEnter = destinationRoom.logic.canEnter(params);
        if(!canEnter) { return; }
        
        actor.room = destinationRoom;
    }
});


declare module "../Actions" {
    interface ActionRegistrations extends InferAction<typeof registration> { }
}
