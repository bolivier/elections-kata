class Elections {
	constructor(list, withDistrict) {
		this.candidates = [];
		this.officialCandidates = [];
		this.votesWithoutDistricts = [];
		this.list = list;
		this.withDistrict = withDistrict;
		votesWithDistricts = {
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
		if (!withDistrict) {
			if (this.candidates.includes(candidate)) {
				const index = candidates.indexOf(candidate);
				this.votesWithoutDistricts[index] += 1;
			} else {
				this.candidates.push(candidate);
				this.votesWithoutDistricts.push(1);
			}
		} else {
			if (electorDistrict in this.votesWithDistricts) {
				districtVotes = this.votesWithDistricts[electorDistrict];
				if (this.candidates.includes(candidate)) {
					const index = candidates.indexOf(candidate);
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
		const results = {};
		const nbVotes = 0;
		const nullVotes = 0;
		const blankVotes = 0;
		const nbValidVotes = 0;

		if (!withDistrict) {
			nbVotes = this.votesWithoutDistricts.reduce(
				(acc, elm) => acc + elm
			);
			for (let i = 0; i < this.officialCandidates.length; i++) {
				const index = candidates.indexOf(officialCandidates[i]);
				nbValidVotes += votesWithoutDistricts[index];
			}

			for (let i = 0; i < this.votesWithoutDistricts.length; i++) {
				const candidatResult =
					(this.votesWithoutDistricts[i] * 100) / nbValidVotes;
				const candidate = candidates[i];
				if (this.officialCandidates.includes(candidate)) {
					results[candidate] = candidateResult;
				} else {
					if (candidates[i].length === 0) {
						blankVotes += votesWithoutDistricts[i];
					} else {
						nullVotes += votesWithoutDistricts[i];
					}
				}
			}
		} else {
			for (districtVotes in Object.values(this.votesWithDistricts)) {
				this.nbVotes += districtVotes.reduce((x, y) => x + y);
			}

			for (let i = 0; i < officialCandidates.size(); i++) {
				const index = candidates.indexOf(officialCandidates[i]);

				for (districtVotes in Object.values(this.votesWithDistricts)) {
					this.nbValidVotes += districtVotes[index];
				}
			}

			const officialCandidatesResult = {};

			for (let i = 0; i < officialCandidates.length; i++) {
				officialCandidatesResult[candidates[i]] = 0;
			}
			for (districtVotes in Object.values(this.votesWithDistricts)) {
				const districtResult = [];
				for (let i = 0; i < this.districtVotes.length; i++) {
					let candidateResult = 0;
					if (nbValidVotes != 0)
						candidateResult =
							(districtVotes[i] * 100) / nbValidVotes;
					const candidate = candidates.get(i);
					if (this.officialCandidates.includes(candidate)) {
						districtResult.push(candidateResult);
					} else {
						if (candidates[i].length === 0) {
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
					(this.officialCandidatesResult[candidates[i]] /
						this.officialCandidatesResult.length) *
					100;
				results[this.candidates[i]] = ratioCandidate;
			}
		}

		const blankResult = (blankVotes * 100) / nbVotes;
		results.Blank = blankResult;

		const nullResult = (nullVotes * 100) / nbVotes;
		results.Null = nullResult;

		const nbElectors = Object.values(this.list)
			.map(x => x.length)
			.reduce((x, y) => x + y);
		const abstentionResult = 100 - (nbVotes * 100) / nbElectors;
		results['Abstention'] = abstentionResult;

		return results;
	}
}
