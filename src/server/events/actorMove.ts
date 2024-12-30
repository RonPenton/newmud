import { Actor } from "../models";
import { Direction } from "../utils";

export type ActorMoveParameters = {
    actor: Actor;
    direction: Direction;
}

export type EventParameters = {

    /**
     * Whether or not the action is being forced by the engine.
     * The "can<Action>" checks will still be called and they are requested
     * to examine the force object to determine which actions to take in response, if any.
     */
    force?: {
        /**
         * In "requested" mode the caller would like to request the action be performed, but
         * if the script insists on denying the action, it can still be cancelled.
         * 
         * In "required" mode the caller is insisting that the action be performed, there is no
         * option to cancel the action, and scripts should take note of this.
         */
        mode: 'requested' | 'required';

        /**
         * A token that is supplied by the requestor of the action, used to determine
         * the method by which the action is being performed. This is a free-form string
         * so scripts will have to collaborate with each other to determine the meaning of
         * the token.
         */
        token: string;
    }
}

export type EventResult = {
    result: 'success' | 'failure';
    reason: string;
}

export function actorMove(parameters: ActorMoveParameters & EventParameters): EventResult {
    const { actor, direction } = parameters;
    const { room: startingRoom } = actor;
    const exit = startingRoom.exits[direction];

    if (!exit) {
        return {
            result: 'failure',
            reason: `There is no exit in the ${direction} direction.`
        };
    }

    const { room: destinationRoom } = exit;

    
}
