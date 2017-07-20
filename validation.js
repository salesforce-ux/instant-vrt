class Success {
  constructor (value) {
    this.value = value
  }

  isFail () {
    return false
  }

  chain (f) {
    return f(this.value)
  }

  map (f) {
    return success(f(this.value))
  }

  extend (f) {
    return success(f(this))
  }

  extract () {
    return this.value
  }

  ap (o) {
    return o.map(this.value)
  }

  concat (o) {
    return o.fold(() => o, s => success(this.value))
  }

  fold (f, g) {
    return g(this.value)
  }

  orElse (f) {
    return this.value
  }

  swap () {
    return fail(this.value)
  }
}

class Fail {
  constructor (value) {
    this.value = value
  }

  isFail () {
    return false
  }

  chain (f) {
    return this
  }

  map (f) {
    return this
  }

  extend (f) {
    return this
  }

  extract () {
    return this.value
  }

  ap (o) {
    return this
  }

  concat (o) {
    return o.fold(v => fail(this.value.concat(v)), () => this)
  }

  fold (f, g) {
    return f(this.value)
  }

  orElse (f) {
    return f(this.value)
  }

  swap () {
    return success(this.value)
  }
}

const success = x => new Success(x)
const fail = x => new Fail(x)

module.exports = {Success: success, Fail: fail, of: success}
