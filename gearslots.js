// Symbols for slots
const UNDEFINED = undefined;
const SLOT_ARMOR_HEAD  = Symbol(`headslot`)         // (1)
const SLOT_ARMOR_CHEST = Symbol(`torsoslot`)        // (1)
const SLOT_ARMOR_HANDS = Symbol(`handslot`)         // (1)
const SLOT_ARMOR_LEGS  = Symbol(`legslot`)          // (1)
const SLOT_ARMOR_FEET  = Symbol(`feetslot`)         // (1)
const SLOT_RING        = Symbol(`ringslot`)         // (2)
const SLOT_NECKLACE    = Symbol(`neckslot`)         // (1)
const SLOT_BACK        = Symbol(`backslot`)         // (1)
const SLOT_WEAPON      = Symbol(`weaponslot`)       // Usually 2
const SLOT_AMMO        = Symbol(`ammoslot`)         // 1

// List of all gearlots types in the game
const allGearSlots = [
    SLOT_ARMOR_HEAD,
    SLOT_ARMOR_CHEST,
    SLOT_ARMOR_HANDS, 
    SLOT_ARMOR_LEGS,
    SLOT_ARMOR_FEET,
    SLOT_RING,
    SLOT_NECKLACE,
    SLOT_BACK,
    SLOT_WEAPON,
    SLOT_AMMO
];

const humanoidGearSlots = [
    SLOT_ARMOR_HEAD,
    SLOT_ARMOR_CHEST,
    SLOT_ARMOR_HANDS, 
    SLOT_ARMOR_LEGS,
    SLOT_ARMOR_FEET,
    SLOT_RING,SLOT_RING,
    SLOT_NECKLACE,
    SLOT_BACK,
    SLOT_WEAPON,SLOT_WEAPON,
    SLOT_AMMO
];

// Destroys existing slots and adds the specified to the entity
function addSlotsToEntity(entity, slotList) {
    entity.gearSlot = []; // Initialize the equipment property
    for (const slot of slotList) {
        entity.gearSlot.push({ slot, item: 'empty' });
    }
}

// equipGear()
// Returns a list of gear removed from those slots to insert the item
// item is just another entity

function equipGear(entity, slotType, item) {

    // Explicit check to see if the slot exists
    if (!entity.hasOwnProperty(entity.gearSlot[slotType])) {
        return []; // Slot doesn't exist
    }

    const oldItem = entity.gearSlot[slotType];

    // Check if the item is already equipped in the slot
    if (oldItem === item) {
      return []; // Item is already equipped, no need to change
    }

    // Check if the slot is compatible with the item
    if (!isItemCompatibleWithSlot(item, slot)) {
      return []; // Item is not compatible with the slot
    }

    // Change item's location to the entity
    item.location = entity;

    // Equip the item and return the old item
    entity.gearSlot[slotType] = item;
    return [oldItem];
}
