const numeral = require('numeral');
const R = require('ramda');

class Elections {
    constructor(list, withDistrict) {
        this.officialCandidates2 = new Set([]);
        this.state = generateInitialState(list);
        this.withDistrict = withDistrict;
    }

    addCandidate(candidate) {
        this.officialCandidates2.add(candidate);
    }

    voteFor(elector, candidate, electorDistrict) {
        this.state = R.assocPath(
            [electorDistrict, elector],
            candidate,
            this.state
        );
    }

    results() {
        const candidates = getCandidates(this.officialCandidates2);

        let results = candidates;

        const isOfficialCandidate = candidate =>
            this.officialCandidates2.has(candidate);

        const blankVotes = R.pipe(
            getVotes,
            R.reject(isOfficialCandidate),
            R.reject(R.isEmpty),
            R.reject(R.equals(null)),
            R.length
        )(this.state);

        const nullVotes = voteLengthFilteredBy(isNull, this.state);
        const nbVotes = voteLengthFilteredBy(
            R.compose(R.not, R.equals(null)),
            this.state
        );

        const nbValidVotes = voteLengthFilteredBy(
            isOfficialCandidate,
            this.state
        );

        if (!this.withDistrict) {
            const winnerResults = R.pipe(
                getVotes,
                R.filter(isOfficialCandidate),
                R.groupBy(R.identity),
                R.map(x => x.length / nbValidVotes)
            )(this.state);

            Object.assign(results, winnerResults);
        } else {
            // this is pretty gnarly
            const districtResults = R.pipe(
                R.map(R.values),
                R.map(R.groupBy(R.identity)),
                R.map(R.map(R.length)),
                R.map(R.toPairs),
                R.map(R.reduce(R.maxBy(R.nth(1)), ['placeholder', 0])),
                R.map(R.nth(0)),
                R.invert,
                R.map(R.length)
            )(this.state);

            const asDistrictedResult = R.divide(
                R.__,
                R.pipe(R.values, R.sum)(districtResults)
            );

            const districtedResults = R.pipe(R.map(asDistrictedResult))(
                districtResults
            );

            Object.assign(results, districtedResults);
        }

        const blankResult = blankVotes / nbVotes;
        results.Blank = blankResult;

        const nullResult = nullVotes / nbVotes;
        results['Null'] = nullResult;

        const nbElectors = R.pipe(
            R.values,
            R.map(R.values),
            R.map(R.length),
            R.sum
        )(this.state);

        const abstentionResult = 1 - nbVotes / nbElectors;
        results['Abstention'] = abstentionResult;

        return R.map(format, results);
    }
}

const isNull = vote => vote === '';
const getVotes = R.pipe(R.values, R.map(R.values), R.reduce(R.concat, []));
const getCandidates = R.reduce(
    (acc, candidate) => ({ ...acc, [candidate]: 0 }),
    {}
);
const voteLengthFilteredBy = (f, coll) =>
    R.pipe(getVotes, R.filter(f), R.length)(coll);
const generateInitialState = R.map(
    R.reduce((electors, elector) => ({ ...electors, [elector]: null }), {})
);
const format = n => numeral(n).format('0.00%');

module.exports = {
    Elections,
};
