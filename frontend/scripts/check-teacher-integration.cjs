// Runs against an isolated local MongoDB database; never reads production credentials.
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '../..');
const backend = path.join(root, 'backend');
const dbName = 'crm_teacher_test_' + Date.now();
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
    const store = await import(pathToFileURL(path.join(webRoot, 'dashboard/teachers-store.js')));
    const registration = await client.request('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Integration Test', email: 'teacher-test@example.com', password: 'LocalTest123!', businessName: 'Temporary Teacher Test' }) });
    client.setTokens(registration.accessToken, registration.refreshToken);
    assert.deepEqual(await web.getTeachers(), []);
    const mobileRoot = path.join(root, 'frontend/mobile/my-app');
    const bundled = await build({ stdin: { contents: `export * as api from './src/api/teachers'; export * as client from './src/api/client'; export * as auth from './src/api/auth'; export * as store from './src/components/school/teachers-store';`, resolveDir: mobileRoot, loader: 'ts' }, bundle: true, format: 'esm', platform: 'node', write: false, define: { 'process.env.EXPO_PUBLIC_API_BASE_URL': JSON.stringify(base) }, plugins: [{ name: 'native-test-adapters', setup(build) { build.onResolve({ filter: /^(react-native|expo-secure-store)$/ }, args => ({ path: args.path, namespace: 'test' })); build.onLoad({ filter: /.*/, namespace: 'test' }, args => ({ contents: args.path === 'react-native' ? `export const Platform={OS:'android'};` : `const values=new Map(); export async function getItemAsync(k){return values.get(k)||null};export async function setItemAsync(k,v){values.set(k,v)};export async function deleteItemAsync(k){values.delete(k)};` })); } }] });
    const mobile = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'));
    await mobile.auth.authenticate({ email: 'teacher-test@example.com', password: 'LocalTest123!' }, false, true);
    assert.deepEqual(await mobile.api.getTeachers(), []);
    const input = { name: 'Teacher One', email: 'one@example.com', subject: 'Math', phone: '03001234567' };
    const first = await web.createTeacher(input);
    store.addTeacher(first);
    assert.equal(store.getTeacherSnapshot().teachers[0].id, first._id);
    assert.equal((await mobile.api.getTeacher(first._id)).phone, input.phone);
    const second = await mobile.api.createTeacher({ ...input, name: 'Teacher Two', email: 'two@example.com' });
    assert.equal((await web.getTeachers('Teacher')).length, 2);
    await assert.rejects(web.createTeacher(input), error => error.status === 409);
    await mobile.api.updateTeacher(first._id, { ...input, name: 'Updated Teacher', subject: 'Physics' });
    assert.equal((await web.getTeacherById(first._id)).subject, 'Physics');
    await web.updateTeacher(second._id, { phone: '03007654321' });
    assert.equal((await mobile.api.getTeacher(second._id)).phone, '03007654321');
    await assert.rejects(web.updateTeacher(second._id, { email: input.email }), error => error.status === 409);
    const lesson = { teacherId: first._id, subject: 'Physics', classLevel: 'THREE', section: 'B', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00' };
    await web.createScheduleEntry(lesson);
    const schedule = await mobile.api.getSchedule();
    assert.equal(schedule[0].teacherId._id, first._id);
    assert.equal(schedule[0].classLevel, 'THREE'); assert.equal(schedule[0].section, 'B');
    store.setScheduleFromAPI(schedule); mobile.store.setScheduleFromAPI(schedule);
    for (const current of [store, mobile.store]) {
      const row = current.getTeacherSnapshot().lessons[0];
      assert.equal(row.teacherId, first._id);
      assert.equal(current.lessonStatus(row, new Date('2030-01-14T09:30:00'), '2030-01-14'), 'Ongoing');
      assert.equal(current.lessonStatus(row, new Date('2030-01-14T09:30:00'), '2030-01-21'), 'Upcoming');
      assert.equal(current.lessonStatus(row, new Date('2030-01-14T09:30:00'), '2030-01-07'), 'Completed');
    }
    assert.equal((await web.getScheduleByClass('THREE','B')).length, 1);
    assert.equal((await mobile.api.getScheduleByClass('THREE','A')).length, 0);
    await assert.rejects(mobile.api.createSchedule({ ...lesson, classLevel: 'FOUR', startTime: '09:30', endTime: '10:30' }), error => error.status === 409);
    await assert.rejects(mobile.api.createSchedule({ ...lesson, teacherId: second._id, startTime: '09:30', endTime: '10:30' }), error => error.status === 409);
    await assert.rejects(web.createScheduleEntry({ ...lesson, startTime: '11:00', endTime: '10:00' }), error => error.status === 400);
    await mobile.api.createSchedule({ ...lesson, startTime: '10:00', endTime: '11:00' });
    assert.equal((await web.getSchedule()).length, 2);
    const other = await client.request('/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Other Workspace', email: 'other@example.com', password: 'LocalTest123!', businessName: 'Other Test' }) });
    client.setTokens(other.accessToken, other.refreshToken);
    assert.deepEqual(await web.getTeachers(), []);
    assert.deepEqual(await web.getSchedule(), []);
    await assert.rejects(web.getTeacherById(first._id), error => error.status === 404);
    client.setTokens(registration.accessToken, registration.refreshToken);
    await mobile.api.deleteTeacher(first._id);
    await assert.rejects(web.getTeacherById(first._id), error => error.status === 404);
    const orphaned = await web.getSchedule();
    assert.equal(orphaned[0].teacherId, null);
    store.setScheduleFromAPI(orphaned); mobile.store.setScheduleFromAPI(orphaned);
    assert.equal(store.getTeacherSnapshot().lessons[0].teacherId, '');
    await web.deleteTeacher(second._id);
    assert.deepEqual(await mobile.api.getTeachers(), []);
    await mobile.client.clearSession();
    assert.deepEqual(mobile.store.getTeacherSnapshot(), { teachers: [], lessons: [] });
    console.log('PASS: teacher CRUD across web/mobile, search, duplicate email, weekly timetable, class/section filters, conflict validation, adjacent slots, workspace isolation and session cleanup.');

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
