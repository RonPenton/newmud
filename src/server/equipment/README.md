Equipment is a complex system of classifications about items. 

## Body Parts

First there are body parts, which define places on your body where you can wear an item. Examples: 

- Head
- Neck
- Torso
- Hands
- Legs
- Feet
- Ears
- Fingers
- Wrists
- Pockets

## Slots

An actor can have a collection of "slots", which are body parts that can hold an item. A slot for example can be defined as:

```
"head": {
  "bodyPart": "head"
}
```

This indicates that the actor has a slot named "head" which is a body part of "head". Actors can have multiple slots of the same body part as well, like fingers. 

```
"left ring finger": {
  "bodyPart": "finger"
},
"right ring finger": {
  "bodyPart": "finger"
}
```

This allows you to slot multiple "ring" type objects. 

Additionally, slots can be "linked" to another slot. For example:

```
"left hand": {
  "bodyPart": "hand",
  "linked": "right hand"
},
"right hand": {
  "bodyPart": "hand",
  "linked": "left hand"
}
```

This indicates to the game that larger items can be equipped across multiple slots, for example a two-handed sword. 

Lastly, slots can have an optional "capacity". The capacity allows the game to indicate that physically larger actors are capable of holding larger items. A hobbit can't hold a regular sword in one hand, for example, and a giant can hold a two-handed sword in one hand. 

```
const hobbit = {
    bodyParts = {
        "left hand": {
            "bodyPart": "hand",
            "linked": "right hand",
            "capacity": 0.5
        },
        "right hand": {
            "bodyPart": "hand",
            "linked": "left hand",
            "capacity": 0.5
        }
    }
},
const giant = {
    bodyParts = {
        "left hand": {
            "bodyPart": "hand",
            "linked": "right hand",
            "capacity": 2
        },
        "right hand": {
            "bodyPart": "hand",
            "linked": "left hand",
            "capacity": 2
        }
    }
}

const dagger = {
    "name": "dagger",
    "equipmentType": "weapon",
    "equipmentSize": 0.5
},
const treeTrunk = {
    "name": "tree trunk",
    "equipmentType": "weapon",
    "equipmentSize": 4
}
```

When equipping an item the game will check the capacity of the slot the item is being equipped to and either allow or disallow the action. 

## Equipment Types

Equipment Types define an overall "classification" of an item. These are inherently linked to a body part. Examples:

- weapon: hands
- helmet: head
- armor: torso
- ring: finger
- boots: feet
- gloves: hands
- pants: legs

etc.

## Equipment Characteristics

Characteristics are flags that can be combined to fully describe a piece of equipment. Examples:

- sword:
    - equipmentType: weapon
    - equipmentSize: 1
    - weaponType: sword
    - sharpness: sharp
    - material: steel
