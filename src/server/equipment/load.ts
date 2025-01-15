import fs from 'fs';

export async function loadEquipment() {
    const files = fs.readdirSync(__dirname + '/definitions').filter(f => f.endsWith('.ts'));
    for (const file of files) {
        await import('./definitions/' + file);
    }
}
