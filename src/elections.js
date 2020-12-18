const numeral = require('numeral');
const R = require('ramda');

class Elections {
    constructor(list, withDistrict) {
        this.officialCandidates = new Set([]);
        this.state = generateInitialState(list);
        this.withDistrict = withDistrict;
        this.overVoters = 0;
    }

    addCandidate(candidate) {
        this.officialCandidates.add(candidate);
    }

    voteFor(elector, candidate, electorDistrict) {
        const electorLens = R.lensPath([electorDistrict, elector]);
        const isVotingInOwnDistrict =
            R.view(electorLens, this.state) !== undefined;

        if (isVotingInOwnDistrict) {
            this.state = R.set(electorLens, candidate, this.state);
        } else {
            this.state = R.set(electorLens, '', this.state);
            this.overVoters = this.overVoters + 1;
        }
    }

    results() {
        const emptyCandidateResults = getCandidates(this.officialCandidates);
        const blankResults = this.blankResults();
        const candidateResults = this.withDistrict
            ? this.withDistrictResults()
            : this.withoutDistrictResults();

        const results = [candidateResults, blankResults, emptyCandidateResults];
        return R.pipe(R.reduce(R.mergeWith(R.add)), R.map(format))(results);
    }

    // implementations

    withoutDistrictResults() {
        const isOfficialCandidate = candidate =>
            this.officialCandidates.has(candidate);

        const officialVotes = voteLengthFilteredBy(
            isOfficialCandidate,
            this.state
        );
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

    blankResults() {
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
        return {
            Blank: unofficialCandidateVotes / totalVotes,
            Null: nullVotes / totalVotes,
            Abstention:
                1 -
                (totalVotes - this.overVoters) /
                    (countElectors(this.state) - this.overVoters),
        };
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
