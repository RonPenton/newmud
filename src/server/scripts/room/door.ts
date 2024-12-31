import { makeScript } from "../../events/types";

const script = makeScript('room', {
    canEnter: async (params, aggregate) => {
        return aggregate && true;
    }
});

export { script };