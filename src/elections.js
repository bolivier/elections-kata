const numeral = require('numeral');
const R = require('ramda');

class Elections {
    constructor(list, withDistrict) {
        this.officialCandidates = new Set([]);
        this.state = generateInitialState(list);
        this.withDistrict = withDistrict;
    }

    addCandidate(candidate) {
        this.officialCandidates.add(candidate);
    }

    voteFor(elector, candidate, electorDistrict) {
        this.state = R.assocPath(
            [electorDistrict, elector],
            candidate,
            this.state
        );
    }

    withoutDistrictResults({ isOfficialCandidate, officialVotes }) {
        return R.pipe(
            getVotes,
            R.filter(isOfficialCandidate),
            R.groupBy(R.identity),
            R.map(x => x.length / officialVotes)
        )(this.state);
    }

    withDistrictResults() {
        const districtResults = R.pipe(
            districtVoteCounts,
            districtWinner,
            R.invert,
            R.map(R.length)
        )(this.state);

        const totalVotes = R.sum(R.values(districtResults));
        const asDistrictedResult = R.divide(R.__, totalVotes);
        return R.map(asDistrictedResult, districtResults);
    }

    results() {
        const candidates = getCandidates(this.officialCandidates);

        const isOfficialCandidate = candidate =>
            this.officialCandidates.has(candidate);

        const unofficialCandidateVotes = R.pipe(
            getVotes,
            R.reject(isOfficialCandidate),
            R.reject(R.isEmpty),
            R.reject(R.equals(null)),
            R.length
        )(this.state);

        const nullVotes = voteLengthFilteredBy(isNull, this.state);
        const totalVotes = voteLengthFilteredBy(
            R.compose(R.not, R.equals(null)),
            this.state
        );

        const officialVotes = voteLengthFilteredBy(
            isOfficialCandidate,
            this.state
        );

        const blankResults = {
            Blank: unofficialCandidateVotes / totalVotes,
            Null: nullVotes / totalVotes,
            Abstention: 1 - totalVotes / countElectors(this.state),
        };

        const results = this.withDistrict
            ? this.withDistrictResults()
            : this.withoutDistrictResults({
                  isOfficialCandidate,
                  officialVotes,
              });

        return R.map(
            format,
            R.reduce(R.mergeWith(R.add), {}, [
                results,
                blankResults,
                candidates,
            ])
        );
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
const countElectors = R.pipe(R.values, R.map(R.values), R.map(R.length), R.sum);
const districtVoteCounts = R.pipe(
    R.map(R.values),
    R.map(R.groupBy(R.identity)),
    R.map(R.map(R.length))
);

const districtWinner = R.pipe(
    R.map(R.toPairs),
    R.map(R.reduce(R.maxBy(R.nth(1)), ['', 0])),
    R.map(R.nth(0))
);

module.exports = {
    Elections,
};
