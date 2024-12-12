# Action System

The Action System is the system that defines what actions are possible in the game. For the most part they are imperative sentences
that describe an action that the player wants to perform. Examples:

- "Move to the North"
- "Attack the Troll"
- "Pick the lock on the door to the north"
- "Open the chest"

The Action System is responsible for defining the name of the action, the type of game objects the action can be performed on, and the logic of the action. 

## Models

The following models exist in the system:

- Actor - an actor is an animate object in the game, such as a player or a monster.
- Room - a room is a location in the game that can contain actors and items.
- Item - an item is an inanimate object in the game that can be picked up and used by actors.
- Exit - an exit is a connection between two rooms that can be traversed by actors.
- Portal - a portal is a more complicated version of an Exit that can be used to close a path, or perform logic upon traversal.
- Region - a region is a collection of rooms that are connected to each other.
- World - a world is a collection of regions that are connected to each other.

## Actions

Models will be referred to as <Model>, and actions will be referred to as {action}.

- Move: <Actor> <move> through the <Exit>.
- Look: <Actor> {looks} at (<Room>/<Item>/<Actor>/<Exit>)
- Take: <Actor> <take> <quantity>? <Item>.
- Drop: <Actor> {drops} (quantity)? <Item>.
- Attack: <Actor> {attacks} <Actor>.
- Give: <Actor> <give> <quantity>? (<Item> to <Player>)
