// Runs against an isolated local MongoDB database; never reads production credentials.
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '../..');
const backend = path.join(root, 'backend');
const dbName = 'crm_student_test_' + Date.now();
process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/' + dbName;
process.env.JWT_SECRET = 'student-integration-test-only';
process.env.JWT_REFRESH_SECRET = 'student-integration-refresh-test-only';
require(path.join(backend, 'node_modules/tsx/dist/cjs/index.cjs'));
const mongoose = require(path.join(backend, 'node_modules/mongoose'));
const { build } = require(path.join(backend, 'node_modules/esbuild'));
const app = require(path.join(backend, 'src/app.ts')).default;
const memory = new Map();
global.localStorage = { getItem: k => memory.get(k) || null, setItem: (k, v) => memory.set(k, v), removeItem: k => memory.delete(k) };
global.window = { location: { hash: '' }, dispatchEvent() {} };
async function main() {
  let server;
  const originalFetch = global.fetch;
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    const base = 'http://127.0.0.1:' + server.address().port + '/api/v1';
    global.fetch = (url, options) => originalFetch(String(url).replace('http://localhost:5000/api/v1', base), options);
    const webRoot = path.join(root, 'frontend/web/project/src');
    const client = await import(pathToFileURL(path.join(webRoot, 'api/client.js')));
    const web = await import(pathToFileURL(path.join(webRoot, 'api/school.js')));
    const fields = await import(pathToFileURL(path.join(webRoot, 'dashboard/student-fields.js')));
    const notes = await import(pathToFileURL(path.join(webRoot, 'dashboard/student-notes.js')));
    const registration = await client.request('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Integration Test', email: 'student-test@example.com', password: 'LocalTest123!', businessName: 'Temporary Student Test' }) });
    client.setTokens(registration.accessToken, registration.refreshToken);
    assert.deepEqual(await web.getStudents(), []);
    const mobileRoot = path.join(root, 'frontend/mobile/my-app');
    const bundled = await build({ stdin: { contents: `export * as api from './src/api/students'; export * as client from './src/api/client'; export * as auth from './src/api/auth'; export * as admission from './src/components/school/admission-store'; export * as profile from './src/components/school/profile-store'; export * as store from './src/components/school/students-store';`, resolveDir: mobileRoot, loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false, define: { 'process.env.EXPO_PUBLIC_API_BASE_URL': JSON.stringify(base) }, plugins: [{ name: 'native-test-adapters', setup(build) { build.onResolve({ filter: /^(react-native|expo-secure-store)$/ }, args => ({ path: args.path, namespace: 'test' })); build.onLoad({ filter: /.*/, namespace: 'test' }, args => ({ contents: args.path === 'react-native' ? `export const Platform={OS:'android'};` : `const values=new Map(); export async function getItemAsync(k){return values.get(k)||null};export async function setItemAsync(k,v){values.set(k,v)};export async function deleteItemAsync(k){values.delete(k)};` })); } }] });
    const mobile = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
    await mobile.auth.authenticate({ email: 'student-test@example.com', password: 'LocalTest123!' }, false, true);
    assert.deepEqual(await mobile.api.listStudents(), []);
    const record = await mobile.admission.admitStudent({ id: 'STUDENT-TEST', name: 'Test Student', grade: '1st', section: 'Section A (Boys)', monthlyFee: '0', guardian: 'Test Guardian', phone: '03001234567', email: '', address: 'Test Address', birthDate: '2018-01-01', gender: 'Male', bloodGroup: 'O+', emergencyPhone: '03007654321' });
    assert.equal(record.section, 'A'); assert.equal(record.classLevel, 'ONE'); assert.equal(record.monthlyFee, 0);
    const fetched = await web.getStudentById(record._id);
    assert.equal(fetched.name, 'Test Student'); assert.equal(notes.readStudentNotes(fetched.notes).birthDate, '2018-01-01');
    assert.equal((await web.getStudents({ search: 'STUDENT-TEST', classLevel: 'ONE', section: 'A' })).length, 1);
    await assert.rejects(web.createStudent({ ...fetched, _id: undefined }), error => error.status === 409);
    const updated = await web.updateStudent(record._id, { name: 'Updated Student', grade: '2nd', classLevel: fields.studentClassLevel('2nd'), monthlyFee: 0, notes: notes.updateStudentAddress(fetched.notes, 'New Address') });
    mobile.store.addStudent(await mobile.api.getStudent(record._id));
    const profile = mobile.profile.getProfileSnapshot(record._id).student;
    assert.equal(profile.address, 'New Address'); assert.equal(profile.birthDate, '2018-01-01');
    await mobile.profile.updateProfile(record._id, { name: updated.name, grade: '3rd', section: 'B', monthlyFee: '1000', guardian: profile.guardian, phone: profile.phone, email: '', address: 'Mobile Updated Address' });
    const reloaded = await web.getStudentById(record.studentId);
    assert.equal(reloaded.classLevel, 'THREE'); assert.equal(reloaded.section, 'B'); assert.equal(reloaded.monthlyFee, 1000);
    assert.throws(() => fields.studentClassLevel('11th'));
    await assert.rejects(mobile.admission.admitStudent({ name: 'Bad', guardian: 'Guardian', phone: '03001234567', email: '', monthlyFee: '0', section: 'A', grade: 'KG I' }), /not supported/);
    client.setTokens('expired', registration.refreshToken);
    const results = await Promise.all([web.getStudents(), web.getStudentById(record._id)]);
    assert.equal(results[0].length, 1);
    await mobile.client.setSession('expired', registration.refreshToken, false);
    assert.equal((await mobile.api.listStudents()).length, 1);
    await mobile.api.deleteStudent(record._id);
    assert.deepEqual(await web.getStudents(), []);
    await assert.rejects(web.getStudentById(record._id), error => error.status === 404);
    client.setTokens('expired', 'invalid');
    const failed = await Promise.allSettled([web.getStudents(), web.getStudents()]);
    assert(failed.every(result => result.status === 'rejected'));
    assert.equal(client.getAccessToken(), null);
    await mobile.client.clearSession();
    await assert.rejects(mobile.api.listStudents(), error => error.status === 401);
    console.log('PASS: web/mobile student CRUD, cross-client persistence, filters, duplicate ID, class mapping, zero fee, notes preservation, refresh and logout.');
  } finally {
    global.fetch = originalFetch;
    if (server) await new Promise(resolve => server.close(resolve));
    if (mongoose.connection.readyState === 1) {
      assert.equal(mongoose.connection.name, dbName);
      await mongoose.connection.dropDatabase();
    }
    await mongoose.disconnect();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
