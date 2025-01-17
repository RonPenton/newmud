import { augmentMaterialBatch, registerMaterialBatch } from "../materials";

const registration = registerMaterialBatch({
    metal: { description: 'metal' },
    steel: { description: 'steel' },
    iron: { description: 'iron' },
    carbonSteel: { description: 'carbon steel' },
    wood: { description: 'wood' },
    hardwood: { description: 'hardwood' },
    softwood: { description: 'softwood' },
    oak: { description: 'oak' },
    ash: { description: 'ash' },
    pine: { description: 'pine' },
    maple: { description: 'maple' },
    cherry: { description: 'cherry' },
    birch: { description: 'birch' },
    mahogany: { description: 'mahogany' },
    walnut: { description: 'walnut' },
    teak: { description: 'teak' },
    ebony: { description: 'ebony' },
    rosewood: { description: 'rosewood' },
    bamboo: { description: 'bamboo' },
    leather: { description: 'leather' },
    hide: { description: 'hide' },
    fur: { description: 'fur' },
    cloth: { description: 'cloth' },
    silk: { description: 'silk' },
    wool: { description: 'wool' },
    cotton: { description: 'cotton' },
    linen: { description: 'linen' },
    hemp: { description: 'hemp' },
    gold: { description: 'gold' },
    silver: { description: 'silver' },
    copper: { description: 'copper' },
    bronze: { description: 'bronze' },
    brass: { description: 'brass' },
    aluminum: { description: 'aluminum' },
    titanium: { description: 'titanium' },
    platinum: { description: 'platinum' },
    nickel: { description: 'nickel' },
    cobalt: { description: 'cobalt' },
    tungsten: { description: 'tungsten' },
    lead: { description: 'lead' },
    zinc: { description: 'zinc' },
    tin: { description: 'tin' },

});

augmentMaterialBatch({
    steel: { parentMaterial: 'metal' },
    iron: { parentMaterial: 'metal' },
    carbonSteel: { parentMaterial: 'steel' },
    hardwood: { parentMaterial: 'wood' },
    softwood: { parentMaterial: 'wood' },
    oak: { parentMaterial: 'hardwood' },
    ash: { parentMaterial: 'hardwood' },
    pine: { parentMaterial: 'softwood' },
    maple: { parentMaterial: 'hardwood' },
    cherry: { parentMaterial: 'hardwood' },
    birch: { parentMaterial: 'hardwood' },
    mahogany: { parentMaterial: 'hardwood' },
    walnut: { parentMaterial: 'hardwood' },
    teak: { parentMaterial: 'hardwood' },
    ebony: { parentMaterial: 'hardwood' },
    rosewood: { parentMaterial: 'hardwood' },
    bamboo: { parentMaterial: 'softwood' },
    hide: { parentMaterial: 'leather' },
    fur: { parentMaterial: 'leather' },
    silk: { parentMaterial: 'cloth' },
    wool: { parentMaterial: 'cloth' },
    cotton: { parentMaterial: 'cloth' },
    linen: { parentMaterial: 'cloth' },
    hemp: { parentMaterial: 'cloth' },
    silver: { parentMaterial: 'metal' },
    copper: { parentMaterial: 'metal' },
    bronze: { parentMaterial: 'copper' },
    
})

declare module "../materials" { interface Materials extends InferMaterialBatch<typeof registration> { } }
