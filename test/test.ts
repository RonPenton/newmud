import fs from 'fs';
import { loadScript } from '../src/server/scriptEngine/loadScript';
import path from 'path';
import assert from 'assert';

async function go() {

    fs.cpSync('./test/fixtures/script1.ts', './test/fixtures/script-temp.ts');

    const resolved = path.resolve('./test/fixtures/script-temp.ts');
    let script = await loadScript(resolved);
    let val = script();
    assert(val === 1);
    val = script();
    assert(val === 2);

    fs.rmSync('./test/fixtures/script-temp.ts', { force: true });
    fs.cpSync('./test/fixtures/script2.ts', './test/fixtures/script-temp.ts');

    let newScript = await loadScript(resolved, true);
    val = newScript();
    assert(val === 2);
    val = newScript();
    assert(val === 4);
    val = newScript();
    assert(val === 6);
    console.log('success');
    assert(val === 7);
};

void go();