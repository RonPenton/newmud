import fs from 'fs';

/**
 * This function uses dymamic import to load all model files in the ./definitions directory,
 * which has the effect of registering the models.
 */
export async function loadLogicDefinitions() {
    // files are stored in subfolders so search recursively
    const files = fs.readdirSync(__dirname + '/definitions', { withFileTypes: true, recursive: true })
        .filter(f => f.isFile() && f.name.endsWith('.ts'));

    for (const file of files) {
        const fn = (`${file.parentPath}/${file.name}`).replace(__dirname, '.').replace('\\', '/');
        await import(fn);
    }
}
