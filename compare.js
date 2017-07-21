const Task = require('data.task')
const toTask = require('futurize').futurize(Task)
const readFile = toTask(require('fs').readFile)
const {List} = require('immutable-ext')
const Either = require('data.either')
const path = require('path')
const {Tuple, Tuple3} = require('fantasy-tuples')
const Validation = require('./validation')
const {Success, Fail} = Validation

const liftA2 = (f, x, y) => x.map(f).ap(y)

const parse_ = Either.try(JSON.parse)
const parse = x => parse_(x).fold(Task.rejected, Task.of)
const readJSON = x => readFile(x).chain(parse)

const empty = {markup: Success(List()), style: Success(List())}

const quickDiff = ({_1: ref, _2: candidate}) =>
  ref === candidate ? Success(empty) : Fail()

const removeIds = line =>
  line.replace(/(id)="(.*?)(\d+)"/, '')

// failIfNotEq :: String -> String -> a -> Validation (List a) Null
const failIfNotEq = (x, y, t) =>
  x === y
  ? Success()
  : Fail(List.of(t))

// diffIt :: [a] -> [a] -> ([a, a], Int) -> Validation (List b) Null
const diffIt = (refs, candidates, f) =>
  List(refs)
  .zip(List(candidates))
  .foldMap(f, Success())

// diffHtml :: Tuple [HTML] [HTML] -> Validation (List Int) Null
const diffHtml = ({_1: refs, _2: candidates}) =>
  diffIt(refs, candidates, ([r, c], i) =>
    failIfNotEq(removeIds(r), removeIds(c), i)
  ).map(List)

// diffCompStyle :: ([Style, Style], Int) -> Validation (List (Tuple Int String)) Null
const diffCompStyle = ([ref, candidate], i) =>
  List(Object.keys(ref))
  .foldMap(k =>
    failIfNotEq(ref[k], candidate[k], Tuple(i, k)))

// diffStyle :: Tuple [Style] [Style] -> Validation (List (Tuple Int String)) Null
const diffStyle = ({_1: refs, _2: candidates}) =>
  diffIt(refs, candidates, diffCompStyle)

const both = (f, {_1: x, _2: y}) =>
  Tuple(f(x), f(y))

const getDiff = pair =>
  quickDiff(both(r => JSON.stringify(r), pair))
  .map(o => empty)
  .orElse(() =>
    ({
      markup: diffHtml(both(r => r.html.split('\n'), pair)),
      style: diffStyle((both(r => r.style, pair)))
    }))

const findTest = (snapshotfile, testname) =>
  Either.fromNullable(snapshotfile[testname])

const runTest = (ref, test, testname) =>
  Either.of(x => y => Tuple(Tuple(x, y), getDiff(Tuple(x, y))))
  .ap(findTest(ref, testname))
  .ap(findTest(test, testname))

const prepareTest = (ref, test) =>
  List(Object.keys(test))
  .map(testname =>
    runTest(ref, test, testname)
    .map(({_1: parsed, _2: results}) => Tuple3(testname, parsed, results))
    .getOrElse(Tuple3(testname, {}, empty)))

module.exports = (refsnap, testsnap) =>
  Task.of(ref => test => prepareTest(ref, test))
  .ap(readJSON(refsnap))
  .ap(readJSON(testsnap))
  .fold(() => List.of(Tuple3('ALL', {}, empty)),
        x => x)
