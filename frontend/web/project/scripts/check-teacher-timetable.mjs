// The timetable is now backed by APIs. This check needs local MongoDB on port 27017.
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
const result = spawnSync(process.execPath, [fileURLToPath(new URL('../../../scripts/check-teacher-integration.cjs', import.meta.url))], { stdio: 'inherit' })
if (result.error) throw result.error
process.exitCode = result.status ?? 1
