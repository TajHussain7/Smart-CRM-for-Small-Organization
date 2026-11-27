export const classLevels = {
  'Play Group': 'PLAY_GROUP', Nursery: 'NURSERY', '1st': 'ONE', '2nd': 'TWO',
  '3rd': 'THREE', '4th': 'FOUR', '5th': 'FIVE', '6th': 'SIX', '7th': 'SEVEN',
  '8th': 'EIGHT', '9th': 'NINE', '10th': 'TEN',
}
export const studentGrades = Object.keys(classLevels)
export function studentClassLevel(grade) {
  const level = classLevels[grade]
  if (!level) throw new Error('This class is not supported by the backend. Select a supported class.')
  return level
}
