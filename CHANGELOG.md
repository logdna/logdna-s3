## Changelog

## [2.1.3](https://github.com/logdna/logdna-s3/compare/v2.1.2...v2.1.3) (2024-04-05)


### Bug Fixes

* upagrade aws sdk (#36) [fd93a94](https://github.com/logdna/logdna-s3/commit/fd93a94c66586ac0a61c78e239ce5a101e0cbec9) - GitHub, closes: [#36](https://github.com/logdna/logdna-s3/issues/36)

## [2.1.2](https://github.com/logdna/logdna-s3/compare/v2.1.1...v2.1.2) (2023-11-16)


### Bug Fixes

* **ci**: update build agent definitions [da416bf](https://github.com/logdna/logdna-s3/commit/da416bf5caec935cfbc4f0d870de30ad10dcf898) - Mike Del Tito
* **ci**: use correct tap output file [ba759f6](https://github.com/logdna/logdna-s3/commit/ba759f6ae9d58dcbffda4ec559d263e54c4e8ffe) - Mike Del Tito


### Chores

* **deps**: update dependencies [b1ddb00](https://github.com/logdna/logdna-s3/commit/b1ddb00bc795fdf107411b14b577eede30ab119e) - Mike Del Tito


### Miscellaneous

* Update README.md with minimum runtime support [1e75f26](https://github.com/logdna/logdna-s3/commit/1e75f26237a69f579c042672e2995386814fe912) - Mike Del Tito

## [2.1.1](https://github.com/logdna/logdna-s3/compare/v2.1.0...v2.1.1) (2021-06-01)


### Bug Fixes

* **release**: ensure all files are included in release artifacts (#14) [204d1d4](https://github.com/logdna/logdna-s3/commit/204d1d4b1dcb43ee572b3eaa5b9fd1dcbc53522b) - GitHub, closes: [#14](https://github.com/logdna/logdna-s3/issues/14) [#12](https://github.com/logdna/logdna-s3/issues/12) [#13](https://github.com/logdna/logdna-s3/issues/13)

# [2.1.0](https://github.com/logdna/logdna-s3/compare/v2.0.0...v2.1.0) (2021-05-21)


### Features

* **stdlib**: use @logdna/stdlib for utilities [cd7608c](https://github.com/logdna/logdna-s3/commit/cd7608c8ff3c2abb0dce08152fc8e402981c1ff1) - Samir Musali

# [2.0.0](https://github.com/logdna/logdna-s3/compare/v1.0.0...v2.0.0) (2021-04-29)


### Code Refactoring

* **logger**: introduce @logdna/logger as a logger [ab7ce97](https://github.com/logdna/logdna-s3/commit/ab7ce9716408539feedaa611f5725e1c9f625b29) - Samir Musali, closes: [#2](https://github.com/logdna/logdna-s3/issues/2)
* restructure the implementation [37db8ea](https://github.com/logdna/logdna-s3/commit/37db8eafac9bf1c5df868d445d411938720d18df) - Samir Musali, closes: [#2](https://github.com/logdna/logdna-s3/issues/2)


### Continuous Integration

* replace CircleCI with Jenkins [9370e76](https://github.com/logdna/logdna-s3/commit/9370e76ad12db0e69f9ed654d08364ebdd7431a0) - Samir Musali, closes: [#4](https://github.com/logdna/logdna-s3/issues/4)


### Features

* **config**: use LogDNA's env-config package [f5f311f](https://github.com/logdna/logdna-s3/commit/f5f311f9cb476c70e5202a78dbe00aa2d6fade9c) - Samir Musali, closes: [#2](https://github.com/logdna/logdna-s3/issues/2)


### Miscellaneous

* update README and Contribution Guide and add Code of Conduct [e2a9398](https://github.com/logdna/logdna-s3/commit/e2a93980c313a6b1376fcdb45d84602064ed6908) - Samir Musali, closes: [#8](https://github.com/logdna/logdna-s3/issues/8)


### Tests

* add unit test coverage [d5719a7](https://github.com/logdna/logdna-s3/commit/d5719a71ae1a24c6884d71b44112fa1ae526aa03) - Samir Musali, closes: [#3](https://github.com/logdna/logdna-s3/issues/3)


### **BREAKING CHANGES**

* Environment variables have been removed/renamed

This removes CircleCI and goes with Jenkins and sets up for the
2.0.0 release

# CHANGELOG

This file documents all notable changes in the `LogDNA S3 Lambda Function`. The release numbering uses [semantic versioning](http://semver.org).

## Unreleased

## v2.0.0
* Refactor the implementation [#1](https://github.com/logdna/logdna-s3/pull/1)

## v1.0.0 - Released on January 24, 2020
* Initial Release

[Unreleased]: https://github.com/logdna/logdna-agent/compare/2.0.0...HEAD
[2.0.0]: https://github.com/logdna/logdna-agent/compare/1.0.0...2.0.0
[1.0.0]: https://github.com/logdna/logdna-agent/releases/tag/1.0.0
