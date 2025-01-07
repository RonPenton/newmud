Stats are decimal values that determine various characteristics of a player or an object throughout the game. These play into the rules of the engine. 

The stats of an object or actor are affected in various ways. For example, as a character in the game your stats will be affected by: 

1. Your "template" stats, which are inherited from your "class" or "race". 
2. Your "base" stats, which are the raw values attached to your character itself. 
3. Your "equipment" stats, which are the values attached to the items you are wearing.
4. Your "inventory" stats, which are additional values attached to items that you are carrying (mostly curses and debuffs).
5. The "room" stats, which are the values attached to the room you are in. 
6. The "area" stats, which are the values attached to the world you are in.
7. The "region" stats, which are the values attached to the entire game world.
8. The "world" stats, which are the values attached to the server itself.
9. Your "effects" stats, which are temporary values attached to your character.

The vast majority of stats are attached directly to objects using a "stats" structure. However there will also be the ability to "compute" a stat via extensible logic. This allows advanced effects, like say allowing a sword to hit for more damage during a full moon. 

The majority of stats will be computed on actors, as actors perform actions and the stats govern the actions of those actors. There will, however, be an opportunity for stats to be computed on other resources as well. 

For example a "weight" stat could be used for items. The item will have the weight stat on it directly, but this stat could also be affected by the room containing the object. Perhaps there is a strong magnetic field in a room, embedded in the floor. The weight of any steel objects in that room then could be affected by a script attached to the room. When asking the item what its weight is, the item will consult the room, the room will consult the script, etc. 