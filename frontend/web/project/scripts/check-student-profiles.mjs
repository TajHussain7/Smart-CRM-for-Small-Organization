import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'

const root = fileURLToPath(new URL('../', import.meta.url))
const server = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' })
try {
  for (const platform of ['web', 'mobile']) {
    const directory = platform === 'web'
      ? `${root}src/dashboard/`
      : fileURLToPath(new URL('../../../mobile/my-app/src/components/school/', import.meta.url))
    const extension = platform === 'web' ? 'js' : 'ts'
    const students = await server.ssrLoadModule(`${directory}students-store.${extension}`)
    const profiles = await server.ssrLoadModule(`${directory}profile-store.${extension}`)
    for (const id of ['S102', 'S105', 'S112', 'S098', 'S115']) {
      const profile = profiles.getProfileSnapshot(id)
      assert.equal(profile.student.id, id)
      assert.equal(profile.student.name, students.getStudent(id).name)
      assert.equal(profile.student.grade, students.getStudent(id).grade)
      assert.equal(profile.student.status, students.getStudent(id).status)
      assert.equal(profile.student.guardian, '')
    }
    const originalOther = profiles.getProfileSnapshot('S105')
    assert.equal(profiles.updateProfile('S102', { name: 'Alex Updated', grade: '11th', address: 'Test address', guardian: 'Test guardian', phone: '', email: '' }), true)
    assert.equal(students.getStudent('S102').name, 'Alex Updated')
    assert.equal(students.getStudent('S102').grade, '11th')
    assert.equal(profiles.getProfileSnapshot('S102').student.guardian, 'Test guardian')
    assert.deepEqual(profiles.getProfileSnapshot('S105'), originalOther)
    assert.equal(profiles.updateProfile('S102', { name: '', grade: '10th' }), false)
    assert.equal(students.addStudent({ id: 'NEW-123', name: 'New Student', grade: '9th', status: 'Pending' }), true)
    assert.equal(profiles.getProfileSnapshot('NEW-123').student.name, 'New Student')
    assert.equal(profiles.getProfileSnapshot('NEW-123').student.guardian, '')
    assert.equal(profiles.getProfileSnapshot('missing'), null)
    assert.equal(profiles.updateProfile('missing', { name: 'Missing', grade: '9th' }), false)
    console.log(`PASS ${platform}: selected identity, isolated edits, list synchronization, new student, invalid ID`)
  }
  const { default: Profile } = await server.ssrLoadModule('/src/dashboard/StudentProfile.jsx')
  const { default: Students } = await server.ssrLoadModule('/src/dashboard/Students.jsx')
  assert.match(renderToString(React.createElement(Students)), /href="#student\/S112"/)
  const html = renderToString(React.createElement(Profile, { studentId: 'S112' }))
  assert.match(html, /Marcus Chen/)
  assert.doesNotMatch(html, /Marcus Thompson|Sarah Williams/)
  assert.match(renderToString(React.createElement(Profile, { studentId: 'missing' })), /Student not found/)
  console.log('PASS web: clickable student link, selected profile rendering, not-found screen')
} finally {
  await server.close()
}
