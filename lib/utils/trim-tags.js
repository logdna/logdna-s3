'use strict'

module.exports = function trimTags(tags) {
  return tags.split(',').map((tag) => {
    return tag.trim()
  }).filter(Boolean).join(',')
}
