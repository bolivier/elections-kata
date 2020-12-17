const numeral = require('numeral');

class Elections {
    constructor(list, withDistrict) {
        this.candidates = [];
        this.officialCandidates = [];
        this.votesWithoutDistricts = [];
        this.list = list;
        this.withDistrict = withDistrict;
        this.votesWithDistricts = {
            'District 1': [],
            'District 2': [],
            'District 3': [],
        };
    }

    addCandidate(candidate) {
        this.officialCandidates.push(candidate);
        this.candidates.push(candidate);
        this.votesWithoutDistricts.push(0);
        this.votesWithDistricts['District 1'].push(0);
        this.votesWithDistricts['District 2'].push(0);
        this.votesWithDistricts['District 3'].push(0);
    }

    voteFor(elector, candidate, electorDistrict) {
        if (!this.withDistrict) {
            if (this.candidates.includes(candidate)) {
                const index = this.candidates.indexOf(candidate);
                this.votesWithoutDistricts[index] += 1;
            } else {
                this.candidates.push(candidate);
                this.votesWithoutDistricts.push(1);
            }
        } else {
            if (electorDistrict in this.votesWithDistricts) {
                this.districtVotes = this.votesWithDistricts[electorDistrict];
                if (this.candidates.includes(candidate)) {
                    const index = this.candidates.indexOf(candidate);
                    this.districtVotes[index] += 1;
                } else {
                    this.candidates.push(candidate);
                    this.votesWithDistricts.forEach(districtVotes => {
                        districtVotes.push(0);
                    });
                    this.districtVotes[this.candidates.length - 1] += 1;
                }
            }
        }
    }

    results() {
        let results = {};
        let nbVotes = 0;
        let nullVotes = 0;
        let blankVotes = 0;
        let nbValidVotes = 0;

        if (!this.withDistrict) {
            nbVotes = this.votesWithoutDistricts.reduce(
                (acc, elm) => acc + elm
            );
            for (let i = 0; i < this.officialCandidates.length; i++) {
                const index = this.candidates.indexOf(
                    this.officialCandidates[i]
                );
                nbValidVotes += this.votesWithoutDistricts[index];
            }

            for (let i = 0; i < this.votesWithoutDistricts.length; i++) {
                const candidateResult =
                    (this.votesWithoutDistricts[i] * 100) / nbValidVotes;
                const candidate = this.candidates[i];
                if (this.officialCandidates.includes(candidate)) {
                    results[candidate] = candidateResult;
                } else {
                    if (this.candidates[i].length === 0) {
                        blankVotes += this.votesWithoutDistricts[i];
                    } else {
                        nullVotes += this.votesWithoutDistricts[i];
                    }
                }
            }
        } else {
            for (let districtVotes in Object.values(this.votesWithDistricts)) {
                this.nbVotes += districtVotes.reduce((x, y) => x + y);
            }

            for (let i = 0; i < this.officialCandidates.size(); i++) {
                const index = this.candidates.indexOf(
                    this.officialCandidates[i]
                );

                for (let districtVotes in Object.values(
                    this.votesWithDistricts
                )) {
                    this.nbValidVotes += districtVotes[index];
                }
            }

            const officialCandidatesResult = {};

            for (let i = 0; i < this.officialCandidates.length; i++) {
                officialCandidatesResult[this.candidates[i]] = 0;
            }
            for (let districtVotes in Object.values(this.votesWithDistricts)) {
                const districtResult = [];
                for (let i = 0; i < districtVotes.length; i++) {
                    let candidateResult = 0;
                    if (nbValidVotes != 0)
                        candidateResult =
                            (districtVotes[i] * 100) / nbValidVotes;
                    const candidate = this.candidates.get(i);
                    if (this.officialCandidates.includes(candidate)) {
                        districtResult.push(candidateResult);
                    } else {
                        if (this.candidates[i].length === 0) {
                            blankVotes += districtVotes[i];
                        } else {
                            nullVotes += districtVotes[i];
                        }
                    }
                }
                let districtWinnerIndex = 0;
                for (let i = 1; i < districtResult.length; i++) {
                    if (
                        districtResult.get(districtWinnerIndex) <
                        districtResult[i]
                    )
                        districtWinnerIndex = i;
                }
                officialCandidatesResult[
                    this.candidates.get[districtWinnerIndex]
                ] += 1;
            }
            for (let i = 0; i < officialCandidatesResult.size(); i++) {
                let ratioCandidate =
                    (this.officialCandidatesResult[this.candidates[i]] /
                        this.officialCandidatesResult.length) *
                    100;
                results[this.candidates[i]] = ratioCandidate;
            }
        }

        const blankResult = blankVotes / nbVotes;
        results.Blank = numeral(blankResult).format('0.00%');

        const nullResult = nullVotes / nbVotes;
        results['Null'] = numeral(nullResult).format('0.00%');

        const nbElectors = Object.values(this.list)
            .map(x => x.length)
            .reduce((x, y) => x + y);
        const abstentionResult = 1 - nbVotes / nbElectors;
        results['Abstention'] = numeral(abstentionResult).format('0.00%');

        return results;
    }
}

module.exports = {
    Elections,
};
