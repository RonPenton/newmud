import { makeScript } from "../../extensibleLogic/types";

const script = makeScript('room', {
    canEnter: (_params, aggregate) => {
        return aggregate && true;
    }
});

export { script };