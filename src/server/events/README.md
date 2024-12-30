Events are the basic "building blocks" of what is possible in the game. The scripting system will allow you to say "item.actor = player1", but this approach will not generally be the recommended approach. The reason being that an item for example can belong to a room or an actor already, and if any script can simply say "item.actor = player1" but forgets to also set "item.room = null", then there is a consistency bug. This might need to be rectified in the future regardless, but there's also more to the scenario that the events engine of the game will take care of. Consider the act of transferring an item from a room to a person. The following checks and actions will need to be performed:

1. Will the item allow itself to be moved?
2. Can the room relinquish the item?
3. Can the person accept the item?
4. Set the item.room to null
5. Set the item.actor to the person
6. Notify the room that it has lost the item.
7. Notify the item that it has been moved.
8. Notify the person that it has received the item.

This example illustrates the complex chain of events that occurs whenever an "atomic" action is taken in the game. These will be far better managed in discrete event methods rather than relying on the scripts to remember to perform this precise sequence of events every time their script wants to automate the transfer of an item. 

Events start with an event name, they contain a function that executes the logic, and there are various steps that may be executed during the event on the entities involved in the event. There are at least three types of event sub-steps: 

1. Information gathering - these allow scripts to fill in or change event information. 
2. Permission checks - these are checks on the entities asking if the event is allowed to happen.
3. Notification Messages - these are messages that are sent to the entities involved in the event to indicate that it has happened. 