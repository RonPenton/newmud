import { makeScript } from "../../extensibleLogic/types";

const script = makeScript('room', {
    canEnter: () => {
        return true;
    }
});

export { script };