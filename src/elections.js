const numeral = require('numeral');
const R = require('ramda');

class Elections {
    constructor(list, withDistrict) {
        this.officialCandidates2 = new Set([]);
        this.list = R.map(
            R.reduce(
                (electors, elector) => ({ ...electors, [elector]: null }),
                {}
            ),
            list
        );
        this.withDistrict = withDistrict;
    }

    addCandidate(candidate) {
        this.officialCandidates2.add(candidate);
    }

    voteFor(elector, candidate, electorDistrict) {
        this.list = R.assocPath(
            [electorDistrict, elector],
            candidate,
            this.list
        );
    }

    results() {
        let results = {};

        const getVotes = R.pipe(
            R.values,
            R.map(R.values),
            R.reduce(R.concat, [])
        );
        const isOfficialCandidate = candidate =>
            this.officialCandidates2.has(candidate);
        const candidates = R.reduce(
            (acc, candidate) => ({ ...acc, [candidate]: 0 }),
            {},
            this.officialCandidates2
        );

        const blankVotes = R.pipe(
            getVotes,
            R.reject(isOfficialCandidate),
            R.reject(R.isEmpty),
            R.reject(R.equals(null)),
            R.length
        )(this.list);
        const nullVotes = R.pipe(
            getVotes,
            R.filter(isNull),
            R.length
        )(this.list);
        const nbVotes = R.pipe(
            getVotes,
            R.reject(R.equals(null)),
            R.length
        )(this.list);
        const nbValidVotes = R.pipe(
            getVotes,
            R.filter(isOfficialCandidate),
            R.length
        )(this.list);

        if (!this.withDistrict) {
            const winnerResults = R.pipe(
                getVotes,
                R.filter(isOfficialCandidate),
                R.groupBy(R.identity),
                R.map(x => numeral(x.length / nbValidVotes).format('0.00%'))
            )(this.list);

            Object.assign(
                results,
                R.map(() => '0.00%', candidates),
                winnerResults
            );
        } else {
            let officialCandidatesResult = R.reduce(
                (acc, elem) => {
                    acc[elem] = 0;
                    return acc;
                },
                {},
                this.officialCandidates2
            );

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
            )(this.list);

            officialCandidatesResult = R.mergeWith(
                R.add,
                districtResults,
                candidates
            );

            const asDistrictedResult = R.divide(
                R.__,
                R.length(R.keys(officialCandidatesResult))
            );

            const districtedResults = R.pipe(
                R.map(asDistrictedResult),
                R.map(ratioCandidate => numeral(ratioCandidate).format('0.00%'))
            )(officialCandidatesResult);

            results = R.merge(results, districtedResults);
        }

        const blankResult = blankVotes / nbVotes;
        results.Blank = numeral(blankResult).format('0.00%');

        const nullResult = nullVotes / nbVotes;
        results['Null'] = numeral(nullResult).format('0.00%');

        const nbElectors = R.pipe(
            R.values,
            R.map(R.values),
            R.map(R.length),
            R.sum
        )(this.list);

        const abstentionResult = 1 - nbVotes / nbElectors;
        results['Abstention'] = numeral(abstentionResult).format('0.00%');

        return results;
    }
}

const isNull = vote => vote === '';

module.exports = {
    Elections,
};
