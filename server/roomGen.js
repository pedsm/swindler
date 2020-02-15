function getRandomCharacter() {
  const number = Math.floor(Math.random()*26) + 65
  return String.fromCharCode(number)
}
function getRoomName() {
  const code = [1,2,3,4,5]
  return code.map(a => getRandomCharacter()).join("")
}

module.exports = {
  getRoomName
}