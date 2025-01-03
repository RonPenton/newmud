// import fs from 'fs';

// /**
//  * This function uses dymamic import to load all model files in the ./definitions directory,
//  * which has the effect of registering the models.
//  */
// export async function loadModelFiles() {
//     const files = fs.readdirSync(__dirname + '/definitions').filter(f => f.endsWith('.ts'));
//     for (const file of files) {
//         await import('./definitions/' + file);
//     }
// }
