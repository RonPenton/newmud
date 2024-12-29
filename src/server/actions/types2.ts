// Types of actions:
// 1. Move - <performer:actor> moves through one of <performer.room.exits>
// 2. Take - <performer:actor> takes one of <performer.room.items>
// 3. Drop - <performer:actor> drops one of <performer.items>
// 4. Give - <performer:actor> gives one of <performer.items> to one of <performer.room.actors>
// 5. Look - <performer:actor> looks at one of <performer.room.items> or <performer.items> or <performer.room.actors>
// 6. Attack - <performer:actor> attacks one of <performer.room.actors>
// 7. Equip - <performer:actor> equips one of <performer.items>
// 8. Unequip - <performer:actor> unequips one of <performer.equipped>
// 9. Drag - <performer:actor> drags one of <performer.room.actors> through one of <performer.room.exits>
// 10. Buy - <performer:actor> buys one of <performer.room.items> from one of <performer.room.actors>
// 11. Sell - <performer:actor> sells one of <performer.items> to one of <performer.room.actors>
// 12. Open - <performer:actor> opens one of <performer.room.exits>
// 13. Close - <performer:actor> closes one of <performer.room.exits>
// 14. Lock - <performer:actor> locks one of <performer.room.exits>
// 15. Unlock - <performer:actor> unlocks one of <performer.room.exits>
// 16. Talk - <performer:actor> talks to one of <performer.room.actors>



const move = {
    performer: Actions.Performer('actor'),


}